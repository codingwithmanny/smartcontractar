// Imports
// ========================================================
import { Kysely, sql } from "kysely";

// Migration Up
// ========================================================
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("transactions")
    .addColumn("id", "uuid", (col) =>
      col
        .defaultTo(sql`gen_random_uuid()`)
        .primaryKey()
        .notNull()
    )
    .addColumn("contractId", "uuid", (col) => col.references("contracts.id").onDelete('cascade').notNull())
    .addColumn("transactionId", "varchar", (col) => col.unique().notNull())
    .addColumn("blockId", "varchar")
    .addColumn("blockHeight", "numeric")
    .addColumn("timestamp", "numeric")
    .addColumn("ownerAddress", "varchar")
    .addColumn("inputs", "json")
    .addColumn("before", "json")
    .addColumn("after", "json")
    .addColumn("error", "varchar")
    .addColumn("createdAt", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();
}

// Migration Down
// ========================================================
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("transactions").execute();
}
