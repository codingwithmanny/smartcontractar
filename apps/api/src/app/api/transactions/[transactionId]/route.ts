// Imports
// ========================================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/db/kysely";

// Functions
// ========================================================
/**
 * Read
 * @param request
 * @returns
 */
export const GET = async (
  _request: NextRequest,
  { params }: { params: { transactionId: string } }
) => {
  const { transactionId } = params;

  try {
    const queryTransaction = await db
      .selectFrom("transactions")
      .select([
        "id",
        "contractId",
        "transactionId",
        "inputs",
        "blockId",
        "blockHeight",
        "timestamp",
        "ownerAddress",
        "before",
        "after",
        "error",
      ])
      .where("transactionId", "=", transactionId)
      .executeTakeFirstOrThrow();

    // Return
    return NextResponse.json(
      {
        data: queryTransaction,
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
