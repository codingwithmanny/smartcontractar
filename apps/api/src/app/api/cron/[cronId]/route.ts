// Imports
// ========================================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OperandValueExpressionOrList } from "kysely";
import { db } from "@/db/kysely";
import { Database } from "@/db/types";
import mailer from "@/email/mailer";
import cors from "@/libs/cors";
import { Client } from "@upstash/qstash";

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
 * Read
 * @param request
 * @returns
 */
export const POST = async (
  _request: NextRequest,
  { params }: { params: { cronId: string } }
) => {
  const { cronId } = params;

  try {
    const queryReadCron = await db
      .selectFrom("notifications")
      .select([
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
      .where(
        "id",
        "=",
        cronId as OperandValueExpressionOrList<Database, "notifications", "id">
      )
      .executeTakeFirstOrThrow();

    const expirationValue = parseInt(queryReadCron.expirationValue, 0);
    const attempts =
      typeof queryReadCron.failedAttempts === "number"
        ? queryReadCron.failedAttempts
        : parseInt(queryReadCron.failedAttempts as unknown as string, 0);

    // 0 - Check if already completed
    if (queryReadCron.status === "COMPLETED" || attempts >= expirationValue) {
      if (queryReadCron.status !== "COMPLETED" && attempts >= expirationValue) {
        // Close the cron job
        try {
          await db
            .updateTable("notifications")
            .set({
              status: "COMPLETED",
            })
            .where("id", "=", queryReadCron.id)
            .execute();
          await client.schedules.delete({
            id: queryReadCron.jobId as string,
          });
        } catch (error) {
          // Do nothing
        }
      }

      // Return
      return NextResponse.json(
        {
          data: queryReadCron,
        },
        {
          status: 200,
        }
      );
    }

    // 1 - Get current state
    const latestTransaction = await db
      .selectFrom("transactions")
      .select(["id", "before", "after"])
      .where("contractId", "=", queryReadCron.contractId)
      .orderBy("timestamp", "desc")
      .executeTakeFirstOrThrow();

    // Keep - needed for eval
    const currentState: { [key: string]: any } =
      (latestTransaction?.after as unknown) ?? {};

    // Eval object
    const parseType = (value: string, type: string) => {
      switch (type) {
        case "string":
          return `"${value}"`;
        default:
          return value;
      }
    };
    const result = eval(
      `currentState?.${queryReadCron.object} ${
        queryReadCron.operator
      } ${parseType(queryReadCron.value, queryReadCron.valueType)}`
    );

    // 2 - Send email
    if (result) {
      await mailer.sendMail({
        from: `${process.env.EMAIL_FROM}`,
        to: `${queryReadCron.email}`,
        subject: `SmartContractAR Notifcation - Contract: ${queryReadCron.contractId}`,
        html: `<div>
            <h1>SmartContractAR Notification</h1>
            <p>Notification ID: ${queryReadCron.id}</p>
            <p>Contract ID: ${queryReadCron.contractId}</p>
            <p><a href="${process.env.DOMAIN_URL}/contract/${
          queryReadCron.contractId
        }/notifications" target="_blank">${process.env.DOMAIN_URL}/contract/${
          queryReadCron.contractId
        }/notifications</a></p>
            <pre><code>${queryReadCron.object} ${
          queryReadCron.operator
        } ${parseType(
          queryReadCron.value,
          queryReadCron.valueType
        )}</code></pre>
        </div>`,
      });
    }

    // 3 - Close job
    if (result && queryReadCron.jobId) {
      await client.schedules.delete({
        id: queryReadCron.jobId as string,
      });
    }

    // 4 - Update database
    const successfulAttempts =
      typeof queryReadCron?.successfulAttempts === "string"
        ? parseInt(queryReadCron?.successfulAttempts, 0)
        : queryReadCron?.successfulAttempts ?? 0;

    const failedAttempts =
      typeof queryReadCron?.failedAttempts === "string"
        ? parseInt(queryReadCron?.failedAttempts, 0)
        : queryReadCron?.failedAttempts ?? 0;
    const updateValues = {
      status: result ? "COMPLETED" : "RUNNING",
      successfulAttempts: result ? successfulAttempts + 1 : successfulAttempts,
      failedAttempts: !result ? failedAttempts + 1 : failedAttempts,
      lastCheckedAt: new Date() as any,
    };

    // 5 - Pull latest transactions
    const contract = await db
      .selectFrom("contracts")
      .select(["id", "contractId"])
      .where(
        "id",
        "=",
        queryReadCron.contractId as OperandValueExpressionOrList<
          Database,
          "contracts",
          "id"
        >
      )
      .execute();
    fetch(
      `${process.env.API_SERVICE_URL}/contracts/${contract?.[0]?.contractId}/transactions/pull`
    );

    const notification = await db
      .updateTable("notifications")
      .set(updateValues)
      .where("id", "=", queryReadCron.id)
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

    // Return
    return NextResponse.json(
      {
        // data: queryReadCron,
        data: notification,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.log(error);
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
