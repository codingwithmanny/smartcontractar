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
 * Read
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
    const result = await db
      .selectFrom("contracts")
      .select([
        "id",
        "contractId",
        "ownerAddress",
        "network",
        "sourceCode",
        "initState",
        "totalTxs",
        "data",
        "updatedAt",
        "createdAt",
      ])
      .where("contractId", "=", contractId)
      .execute();
    
    response = result?.[0];

    if (result.length === 0) {
      const contractResponse = await fetch(
        `${WARP_GATEWAY}/contract?txId=${contractId}`
      );

      const contractResponseJson = await contractResponse.json();
      if (contractResponse.status !== 200) {
        throw new Error(contractResponseJson.message, {
          cause: contractResponse.status,
        });
      }

      response = await db
        .insertInto("contracts")
        .values({
          contractId: contractResponseJson.txId,
          ownerAddress: contractResponseJson.owner,
          network: contractResponseJson.testnet ? "testnet" : "mainnet",
          sourceCode: contractResponseJson.src,
          initState: contractResponseJson.initState,
          data: contractResponseJson,
        })
        .returning([
          "id",
          "contractId",
          "ownerAddress",
          "network",
          "sourceCode",
          "initState",
          "totalTxs",
          "data",
          "updatedAt",
          "createdAt",
        ])
        .executeTakeFirstOrThrow();
    }

    // Return
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
        message: error.message,
      },
      {
        status: 404,
      }
    );
  }
};
