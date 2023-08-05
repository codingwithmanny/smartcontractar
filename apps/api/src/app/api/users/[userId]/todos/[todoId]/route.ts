// Imports
// ========================================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OperandValueExpressionOrList } from "kysely";
import { db } from "@/db/kysely";
import { Database } from "@/db/types";

// Functions
// ========================================================
/**
 * Read
 * @param request
 * @returns
 */
export const GET = async (
  _request: NextRequest,
  { params }: { params: { userId: string; todoId: string } }
) => {
  const userId = params.userId;
  const todoId = params.todoId;

  try {
    const queryReadTodo = await db
      .selectFrom("todos")
      .select(["id", "userId", "todo", "isComplete", "createdAt"])
      .where(
        "id",
        "=",
        todoId as OperandValueExpressionOrList<Database, "todos", "id">
      )
      .where("userId", "=", userId as OperandValueExpressionOrList<Database, "todos", "userId">)
      .executeTakeFirstOrThrow();

    // Return
    return NextResponse.json(
      {
        data: queryReadTodo,
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
  { params }: { params: { userId: string; todoId: string } }
) => {
  const userId = params.userId;
  const todoId = params.todoId;

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

  try {
    const queryUpdateTodo = await db
      .updateTable("todos")
      .set(payload)
      .returning(["id", "userId", "todo", "isComplete", "createdAt"])
      .where(
        "id",
        "=",
        todoId as OperandValueExpressionOrList<Database, "todos", "id">
      )
      .where("userId", "=", userId as OperandValueExpressionOrList<Database, "todos", "userId">)
      .executeTakeFirstOrThrow();

    // Return
    return NextResponse.json(
      {
        data: queryUpdateTodo,
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
  { params }: { params: { userId: string; todoId: string } }
) => {
  const userId = params.userId;
  const todoId = params.todoId;

  await db
    .deleteFrom("todos")
    .where(
      "id",
      "=",
      todoId as OperandValueExpressionOrList<Database, "todos", "id">
    )
    .where("userId", "=", userId as OperandValueExpressionOrList<Database, "todos", "userId">)
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
