// Imports
// ========================================================
import { Kysely, sql } from "kysely";

// Migration Up
// ========================================================
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("todos")
    .addColumn("id", "uuid", (col) =>
      col
        .defaultTo(sql`gen_random_uuid()`)
        .primaryKey()
        .notNull()
    )
    .addColumn("userId", "uuid", (col) => col.references("users.id").onDelete('cascade').notNull())
    .addColumn("todo", "varchar", (col) => col.notNull())
    .addColumn("isComplete", "boolean", (col) => col.defaultTo(false).notNull())
    .addColumn("createdAt", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();
}

// Migration Down
// ========================================================
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("todos").execute();
}
