// Imports
// ========================================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OrderByExpression, OperandValueExpressionOrList, OrderByDirectionExpression } from "kysely";
import { Database } from "@/db/types";
import { db } from "@/db/kysely";

// Functions
// ========================================================
/**
 * List
 * @param request
 * @returns
 */
export const GET = async (request: NextRequest, { params }: { params: { userId: string } }
  ) => {
    const userId = params.userId;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") as string;
  const limit = parseInt(searchParams.get("limit") as string, 0) || 10;
  const offset = parseInt(searchParams.get("offset") as string, 0) || 0;
  const order = ["id", "userId", "todo", "isComplete", "createdAt"].includes(
    searchParams.get("order") as string
  )
    ? (searchParams.get("order") as string)
    : "id";
  const sort = ["asc", "desc"].includes(searchParams.get("sort") as string)
    ? (searchParams.get("sort") as string)
    : "asc";

  // Query
  let queryTodos = db.selectFrom("todos");

  // Find
  if (search) {
    queryTodos = queryTodos.where("todo", "ilike", `%${search}%`);
  }
  queryTodos = queryTodos.where("userId", "=", userId as OperandValueExpressionOrList<Database, "todos", "userId">);

  // Limit
  queryTodos = queryTodos.limit(limit);

  // Offset
  queryTodos = queryTodos.offset(offset);

  // Sort
  queryTodos = queryTodos.orderBy(
    order as OrderByExpression<Database, "todos", {}>,
    sort as OrderByDirectionExpression
  );

  // Return
  return NextResponse.json(
    {
      data: await queryTodos.selectAll().execute(),
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
export const POST = async (request: NextRequest, { params }: { params: { userId: string } }
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
  if (!payload.todo) {
    return NextResponse.json(
      {
        message: `Valid 'todo' required.`,
      },
      {
        status: 422,
      }
    );
  }

  // Query
  try {
    const queryCreateTodo = await db
      .insertInto("todos")
      .values({
        ...payload,
        userId: userId as OperandValueExpressionOrList<Database, "todos", "userId">,
      })
      .returning(["id", "userId", "todo", "isComplete", "createdAt"])
      .executeTakeFirstOrThrow();

    // Success
    return NextResponse.json(
      {
        data: queryCreateTodo,
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
