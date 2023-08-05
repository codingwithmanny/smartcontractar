// Imports
// ========================================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OperandValueExpressionOrList } from "kysely";
import { db } from "@/db/kysely";
import { Database } from "@/db/types";
import cors from "@/libs/cors";

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
export const GET = async (
  _request: NextRequest,
  { params }: { params: { userId: string } }
) => {
  const userId = params.userId;

  try {
    const queryReadUser = await db
      .selectFrom("users")
      .select(["id", "email", "createdAt"])
      .where(
        "id",
        "=",
        userId as OperandValueExpressionOrList<Database, "users", "id">
      )
      .executeTakeFirstOrThrow();

    // Return
    return NextResponse.json(
      {
        data: queryReadUser,
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

/**
 * Update
 * @param request
 * @returns
 */
export const PUT = async (
  request: NextRequest,
  { params }: { params: { userId: string } }
) => {
  const userId = params.userId;

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

  // Validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
  if (!payload.email || !isEmailValid) {
    return NextResponse.json(
      {
        message: `Valid email required.`,
      },
      {
        status: 422,
      }
    );
  }

  try {
    const queryUpdateUser = await db
      .updateTable("users")
      .set({
        email: payload.email,
      })
      .returning(["id", "email", "createdAt"])
      .where(
        "id",
        "=",
        userId as OperandValueExpressionOrList<Database, "users", "id">
      )
      .executeTakeFirstOrThrow();

    // Return
    return NextResponse.json(
      {
        data: queryUpdateUser,
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

/**
 * Delete
 * @param request
 * @returns
 */
export const DELETE = async (
  _request: NextRequest,
  { params }: { params: { userId: string } }
) => {
  const userId = params.userId;

  await db
    .deleteFrom("users")
    .where(
      "id",
      "=",
      userId as OperandValueExpressionOrList<Database, "users", "id">
    )
    .executeTakeFirstOrThrow();

  // Return
  return NextResponse.json(
    {
      data: {
        ok: true,
      },
    },
    {
      status: 200,
    }
  );
};
