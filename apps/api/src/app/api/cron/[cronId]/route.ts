// Imports
// ========================================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OperandValueExpressionOrList } from "kysely";
import { db } from "@/db/kysely";
import { Database } from "@/db/types";
import mailer from "@/email/mailer";

// Functions
// ========================================================
/**
 * Read
 * @param request
 * @returns
 */
export const GET = async (
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

    // 0 - Check if already complete
    if (queryReadCron.status === "COMPLETE") {
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
    console.log({ eval: `currentState?.${queryReadCron.object} ${
        queryReadCron.operator
      } ${parseType(queryReadCron.value, queryReadCron.valueType)}` });
    console.log({ currentState });
    console.log({ result });

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
            <p><a href="http://localhost:5173/contract/${queryReadCron.contractId}/notifications" target="_blank">http://localhost:5173/contract/${queryReadCron.contractId}/notifications</a></p>
            <pre><code>${queryReadCron.object} ${queryReadCron.operator} ${parseType(queryReadCron.value, queryReadCron.valueType)}</code></pre>
        </div>`,
      });
    }

    // 3 - Close job
    // @TODO - upstash

    // 4 - Update database
    // @TODO - fix increment integers
    const updateValues = {
      status: result ? "COMPLETED" : "RUNNING",
      successfulAttempts: result
        ? (queryReadCron?.successfulAttempts ?? 0) + 1
        : queryReadCron?.successfulAttempts ?? 0,
      failedAttempts: !result
        ? (queryReadCron?.failedAttempts ?? 0) + 1
        : queryReadCron?.failedAttempts ?? 0,
      lastCheckedAt: new Date() as any,
    };

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
    console.log(error)
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
