// Imports
// ========================================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/db/kysely";

// Config
// ========================================================
// export const runtime = "edge";
const WARP_GATEWAY = "https://gateway.warp.cc/gateway";

// Functions
// ========================================================
/**
 * List
 * @param request
 * @returns
 */
export const GET = async (
  _request: NextRequest,
  { params }: { params: { contractId: string } }
) => {
  const { contractId } = params;
  try {
    const contract = await db
      .selectFrom("contracts")
      .select(["id", "initState", "sourceCode"])
      .where("contractId", "=", contractId)
      .executeTakeFirstOrThrow();

    const transactionsRemaning = await db
      .selectFrom("transactions")
      .select([
        "id",
        "contractId",
        "transactionId",
        "inputs",
        "timestamp",
        "ownerAddress",
        "before",
        "after",
      ])
      .where("contractId", "=", contract.id)
      // .where("before", "is", null)
      .orderBy("timestamp", "asc")
      .execute();

    const txRemainingFiltered = transactionsRemaning.filter(tx => tx.before === null)

    if (txRemainingFiltered.length === 0) {
      return NextResponse.json(
        {
          data: {
            jobs: 0,
          },
        },
        {
          status: 200,
        }
      );
    }

    console.log(transactionsRemaning)

    // TODO: refactor to handle larger data set with pagination
    const txNeedsState = transactionsRemaning.findIndex(
      (tx) => tx.before === null
    );
    const txBefore = transactionsRemaning[txNeedsState - 1];
    const prevState = txBefore ? txBefore.after : contract.initState;
    const contractEval = contract.sourceCode;
    const txInputs = transactionsRemaning[txNeedsState].inputs;
    const txOwnerAddress = transactionsRemaning[txNeedsState].ownerAddress;
    console.log({ txBefore });
    console.log({ prevState });

    // Eval
    let stateResult = prevState;
    let errorMessage = null;
    try {
      const contractError = `class ContractError extends Error {constructor(message) {super(message);this.name = 'ContractError';}}`;
      stateResult = eval(
        `${contractError}(${contractEval.replace(
          "export",
          ""
        )})(${JSON.stringify(prevState)}, { input: ${JSON.stringify(
          txInputs
        )}, caller: '${txOwnerAddress}' })`
      )?.state;
    } catch (error: any) {
      console.log({ error });
      errorMessage = error.toString();
    }

    console.log({ stateResult });

    const result = await db
      .updateTable("transactions")
      .set({
        before: prevState,
        after: stateResult,
        error: errorMessage,
      })
      .where("id", "=", transactionsRemaning[txNeedsState].id)
      .returning(["id", "before", "after", "error"])
      .execute();

    const remainingJobs =
    txRemainingFiltered.length - 1 === 0
        ? 0
        : txRemainingFiltered.length - 1;

    return NextResponse.json(
      {
        data: {
          jobs: remainingJobs,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    // Failure
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 400,
      }
    );
  }
};
