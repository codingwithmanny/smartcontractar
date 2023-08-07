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
    let response;
    // Check if data already exists
    const existingContract = await db
      .selectFrom("contracts")
      .select(["id", "contractId", "ownerAddress", "createdAt"])
      .where("contractId", "=", contractId)
      .execute();
    
    if (existingContract.length > 0) {
      response = existingContract[0];

      const transactionResponse = await fetch(
        `${WARP_GATEWAY}/v2/interactions-sort-key?contractId=${contractId}`,
        {
          cache: "no-cache",
          headers: {
            'cache-control': 'no-cache'
          }
        }
      );

      const transactionResponseJson = await transactionResponse.json();
      if (transactionResponse.status !== 200) {
        throw new Error(transactionResponseJson.message, {
          cause: transactionResponse.status,
        });
      }

      // Update contract transactions
      await db
      .updateTable("contracts")
      .set({
        totalTxs: transactionResponseJson.paging.total,
      })
      .where("id", "=", existingContract[0].id)
      .execute();

      // Sort transaction data by timestamp
      const txSorted =
        transactionResponseJson.interactions.sort(
          (a: any, b: any) =>
            a.interaction.block.timestamp - b.interaction.block.timestamp
        );

      let completed = 0;
      for (let i = 0; i < txSorted.length; i++) {
        const data = {
          contractId: existingContract[0].id,
          transactionId: txSorted[i].interaction.id,
          blockId: txSorted[i].interaction.block.id,
          blockHeight:
            txSorted[i].interaction.block.height,
          timestamp:
            txSorted[i].interaction.block.timestamp,
          ownerAddress:
            txSorted[i].interaction.owner.address,
          inputs: txSorted[i].interaction.tags.find(
            (tag: any) => tag.name === "Input"
          )?.value,
        };

        response = await db
          .insertInto("transactions")
          .values(data)
          .onConflict((oc) => oc.column("transactionId").doNothing())
          .returning(["id", "contractId", "transactionId", "createdAt"])
          .execute();
        completed++;
      }

      response = { completed };

      await db.updateTable("contracts").set({
        updatedAt: new Date() as any,
      }).where("id", "=", existingContract[0].id).execute();

      fetch(`${process.env.API_SERVICE_URL}/contracts/${contractId}/jobs`);
    }

    // Success
    return NextResponse.json(
      {
        data: response,
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
