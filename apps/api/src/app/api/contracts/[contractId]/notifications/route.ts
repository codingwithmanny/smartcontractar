// Imports
// ========================================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OrderByExpression, OrderByDirectionExpression } from "kysely";
import { db } from "@/db/kysely";
import { Database } from "@/db/types";
import cors from "@/libs/cors";
import { Client, PublishJsonRequest } from "@upstash/qstash";

// Config
// ========================================================
const client = new Client({
  token: `${process.env.QSTASH_TOKEN}`,
});

// Functions
// ========================================================
/**
 * Cors options
 * @param request
 * @returns
 */
export const OPTIONS = async (request: NextRequest) => {
  return cors(
    request,
    new Response(null, {
      status: 204,
    })
  );
};

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

  // Temporary obfuscation
  const results = (await queryNotifications.selectAll().execute()).map(
    (row) => ({
      ...row,
      email: `${row.email.slice(0, 3)}${"*".repeat(row.email.length - 3)}`,
    })
  );

  // Return
  return NextResponse.json(
    {
      data: await results,
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
export const POST = async (
  request: NextRequest,
  { params }: { params: { contractId: string } }
) => {
  const { contractId } = params;

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
    .where("contractId", "=", contractId)
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
      .values({
        ...payload,
        value: payload?.value ?? "",
        status: "PENDING",
        contractId: contract.id,
        cron: "* * * * *",
        expirationType: "intervals",
        expirationValue: "10",
        retries: 3,
      })
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

    const publisJSONOptions: PublishJsonRequest = {
      url: `${process.env.API_SERVICE_URL}/cron/${queryCreateNotification.id}`,
      body: {},
      headers: {},
      cron: '* * * * *' // Every minute
    };

    // @TODO: Add cron validation
    // const cronRegex = /^((\*|[0-5]?\d)(,\s*|\s+)){4}(\*|[0-6]?\d)$/;
    //   if (!cronRegex.test(input.duration)) throw new Error('Invalid cron expression');
    //   publisJSONOptions.cron = input.duration;

    const res = await client.publishJSON(publisJSONOptions) as { messageId?: string, scheduleId?: string };
    const messageId = res?.messageId ?? res.scheduleId;
    await db.updateTable("notifications").set({ jobId: messageId }).where("id", "=", queryCreateNotification.id).execute();
    // Create CRON Job with qStash
    // @TODO add ability for local cronjob service

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
