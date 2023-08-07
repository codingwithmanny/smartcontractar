// Imports
// ========================================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OperandValueExpressionOrList } from "kysely";
import { db } from "@/db/kysely";
import { Database } from "@/db/types";
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
export const DELETE = async (
  _request: NextRequest,
  { params }: { params: { notificationId: string } }
) => {
  const { notificationId } = params;

  try {
    const queryNotification = await db
      .selectFrom("notifications")
      .select(["id", "jobId"])
      .where(
        "id",
        "=",
        notificationId as OperandValueExpressionOrList<
          Database,
          "notifications",
          "id"
        >
      )
      .executeTakeFirstOrThrow();

    // Delete job if exists
    if (queryNotification.jobId) {
      await client.schedules.delete({
        id: queryNotification.jobId as string,
      });
    }

    // Delete notification
    await db
      .deleteFrom("notifications")
      .where(
        "id",
        "=",
        notificationId as OperandValueExpressionOrList<
          Database,
          "notifications",
          "id"
        >
      )
      .execute();

    // Return
    return NextResponse.json(
      {
        data: { ok: true },
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
