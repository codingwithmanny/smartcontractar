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
export const GET = async (request: NextRequest) => {
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

/**
 * Create
 * @param request
 * @returns
 */
export const POST = async (request: NextRequest
  ) => {
  // Validate Content Type
  const contentType = request.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return NextResponse.json(
      {
        message: `Invalid 'Content-Type' header, expected 'application/json'.`,
      },
      {
        status: 400,
      }
    );
  }

  // Get Payload
  const payload = await request.json();

  const contract = await db
  .selectFrom("contracts")
  .select(["id", "contractId"])
  .where("contractId", "=", payload.contractId)
  .executeTakeFirstOrThrow();

  // Validation
  // @TODO validate contractId
  // @TODO: Add validation
  //   if (!payload.todo || !payload.userId) {
  //     return NextResponse.json(
  //       {
  //         message: `Valid 'todo' and 'userId' required.`,
  //       },
  //       {
  //         status: 422,
  //       }
  //     );
  //   }

  // Query
  try {
    const queryCreateNotification = await db
      .insertInto("notifications")
      .values({ ...payload, status: "PENDING", contractId: contract.id })
      .returning([
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
      ])
      .executeTakeFirstOrThrow();

    // Success
    return NextResponse.json(
      {
        data: queryCreateNotification,
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
        status: 400,
      }
    );
  }
};
