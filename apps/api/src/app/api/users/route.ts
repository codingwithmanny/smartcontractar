// Imports
// ========================================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OrderByExpression, OrderByDirectionExpression } from "kysely";
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
 * List
 * @param request
 * @returns
 */
export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") as string;
  const limit = parseInt(searchParams.get("limit") as string, 0) || 10;
  const offset = parseInt(searchParams.get("offset") as string, 0) || 0;
  const order = ["id", "email", "createdAt"].includes(
    searchParams.get("order") as string
  )
    ? (searchParams.get("order") as string)
    : "id";
  const sort = ["asc", "desc"].includes(searchParams.get("sort") as string)
    ? (searchParams.get("sort") as string)
    : "asc";

  // Query
  let queryUsers = db.selectFrom("users");

  // Find
  if (search) {
    queryUsers = queryUsers.where("email", "ilike", `%${search}%`);
  }

  // Limit
  queryUsers = queryUsers.limit(limit);

  // Offset
  queryUsers = queryUsers.offset(offset);

  // Sort
  queryUsers = queryUsers.orderBy(
    order as OrderByExpression<Database, "users", {}>,
    sort as OrderByDirectionExpression
  );

  // Return
  return NextResponse.json(
    {
      data: await queryUsers.selectAll().execute(),
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
export const POST = async (request: NextRequest) => {
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

  console.log({ payload });

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

  // Query
  try {
    const queryCreateUser = await db
      .insertInto("users")
      .values({
        email: payload.email,
      })
      .returning(["id", "email", "createdAt"])
      .executeTakeFirstOrThrow();

    // Success
    return NextResponse.json(
      {
        data: queryCreateUser,
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
