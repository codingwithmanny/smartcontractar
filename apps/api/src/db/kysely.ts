// Imports
// ========================================================
import fs from "fs";
import { Database } from "./types"; // this is the Database interface we defined earlier
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { NeonDialect } from "kysely-neon";
import ws from "ws";

// Connection
// ========================================================
const dialect =
  process.env.NODE_ENV === "production"
    ? new NeonDialect({
        connectionString: process.env.DATABASE_URL,
        webSocketConstructor: ws,
      })
    : new PostgresDialect({
        pool: new Pool({
          connectionString: `${process.env.DATABASE_URL}`,
        }),
      });

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
  dialect,
});
