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
export const GET = async (request: NextRequest,
    { params }: { params: { contractId: string } }
  ) => {
    const { contractId } = params;

    const contract = await db
        .selectFrom("contracts")
        .select(["id", "contractId"])
        .where("contractId", "=", contractId)
        .executeTakeFirstOrThrow();

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") as string, 0) || 10;
  const offset = parseInt(searchParams.get("offset") as string, 0) || 0;
  const order = [
    "id",
    "contractId",
    "jobId",
    "status",
    "object",
    "operator",
    "value",
    "valueType",
    "email",
    "cron",
    "expirationType",
    "expirationValue",
    "retries",
    "failedAttempts",
    "lastCheckedAt",
    "successfulAttempts",
    "createdAt",
  ].includes(searchParams.get("order") as string)
    ? (searchParams.get("order") as string)
    : "createdAt";
  const sort = ["asc", "desc"].includes(searchParams.get("sort") as string)
    ? (searchParams.get("sort") as string)
    : "asc";

  // Query
  let queryNotifications = db.selectFrom("notifications");

  // Find
  //   if (search) {
  //     queryNotifications = queryNotifications.where("todo", "ilike", `%${search}%`);
  //   }
  queryNotifications = queryNotifications.where("contractId", "=", contract.id);

  // Limit
  queryNotifications = queryNotifications.limit(limit);

  // Offset
  queryNotifications = queryNotifications.offset(offset);

  // Sort
  queryNotifications = queryNotifications.orderBy(
    order as OrderByExpression<Database, "notifications", {}>,
    sort as OrderByDirectionExpression
  );

  // Return
  return NextResponse.json(
    {
      data: await queryNotifications.selectAll().execute(),
    },
    {
      status: 200,
    }
  );
};