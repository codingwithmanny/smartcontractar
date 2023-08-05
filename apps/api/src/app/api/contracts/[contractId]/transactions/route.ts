// Imports
// ========================================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OrderByExpression, OrderByDirectionExpression } from "kysely";
import { db } from "@/db/kysely";
import { Database } from "@/db/types";

// Functions
// ========================================================
/**
 * List
 * @param request
 * @returns
 */
export const GET = async (
  request: NextRequest,
  { params }: { params: { contractId: string } }
) => {
  const { contractId } = params;
  const contract = await db
    .selectFrom("contracts")
    .select(["id", "contractId"])
    .where("contractId", "=", contractId)
    .executeTakeFirstOrThrow();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") as string;
  const limit = parseInt(searchParams.get("limit") as string, 0) || 10;
  const offset = parseInt(searchParams.get("offset") as string, 0) || 0;
  const order = [
    "id",
    "transactionId",
    "blockId",
    "blockHeight",
    "timestamp",
    "ownerAddress",
    "inputs",
    "before",
    "after",
    "error",
    "createdAt",
  ].includes(searchParams.get("order") as string)
    ? (searchParams.get("order") as string)
    : "id";
  const sort = ["asc", "desc"].includes(searchParams.get("sort") as string)
    ? (searchParams.get("sort") as string)
    : "asc";

  // Query
  let queryTransactions = db.selectFrom("transactions");

  // Find
  if (search) {
    queryTransactions = queryTransactions.where(
      "before",
      "ilike",
      `%${search}%`
    );
  }
  queryTransactions = queryTransactions.where("contractId", "=", contract.id);

  // Limit
  queryTransactions = queryTransactions.limit(limit);

  // Offset
  queryTransactions = queryTransactions.offset(offset);

  // Sort
  queryTransactions = queryTransactions.orderBy(
    order as OrderByExpression<Database, "transactions", {}>,
    sort as OrderByDirectionExpression
  );

  // Return
  return NextResponse.json(
    {
      data: await queryTransactions.selectAll().execute(),
    },
    {
      status: 200,
    }
  );
};
