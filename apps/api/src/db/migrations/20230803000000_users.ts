// Imports
// ========================================================
import { Kysely, sql } from "kysely";

// Migration Up
// ========================================================
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("users")
    .addColumn("id", "uuid", (col) =>
      col
        .defaultTo(sql`gen_random_uuid()`)
        .primaryKey()
        .notNull()
    )
    .addColumn("email", "varchar", (col) => col.unique().notNull())
    .addColumn("createdAt", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();
}

// Migration Down
// ========================================================
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("users").execute();
}
