// Imports
// ========================================================
import { Kysely, sql } from "kysely";

// Migration Up
// ========================================================
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("contracts")
    .addColumn("id", "uuid", (col) =>
      col
        .defaultTo(sql`gen_random_uuid()`)
        .primaryKey()
        .notNull()
    )
    .addColumn("contractId", "varchar", (col) => col.unique().notNull())
    .addColumn("ownerAddress", "varchar", (col) => col.notNull())
    .addColumn("network", "varchar", (col) => col.notNull())
    .addColumn("sourceCode", "text", (col) => col.notNull())
    .addColumn("initState", "json", (col) => col.notNull())
    .addColumn("data", "json", (col) => col.notNull())
    .addColumn("totalTxs", "numeric")
    .addColumn("createdAt", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();
}

// Migration Down
// ========================================================
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("contracts").execute();
}
