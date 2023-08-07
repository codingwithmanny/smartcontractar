// Imports
// ========================================================
import { Kysely, sql } from "kysely";

// Migration Up
// ========================================================
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("notifications")
    .addColumn("id", "uuid", (col) =>
      col
        .defaultTo(sql`gen_random_uuid()`)
        .primaryKey()
        .notNull()
    )
    .addColumn("contractId", "uuid", (col) => col.references("contracts.id").onDelete('cascade').notNull())
    .addColumn("jobId", "varchar")
    .addColumn("status", "varchar", (col) => col.notNull())
    .addColumn("object", "varchar", (col) => col.notNull())
    .addColumn("operator", "varchar", (col) => col.notNull())
    .addColumn("value", "varchar", (col) => col.notNull())
    .addColumn("valueType", "varchar", (col) => col.notNull())
    .addColumn("email", "varchar", (col) => col.notNull())
    .addColumn("cron", "varchar", (col) => col.notNull())
    // type = 'intervals' | 'date'
    .addColumn("expirationType", "varchar", (col) => col.notNull())
    .addColumn("expirationValue", "varchar", (col) => col.notNull())
    .addColumn("retries", "numeric", (col) => col.notNull())
    .addColumn("failedAttempts", "numeric", (col) => col.defaultTo(0))
    .addColumn("lastCheckedAt", "timestamp")
    .addColumn("successfulAttempts", "numeric", (col) => col.defaultTo(0))
    .addColumn("createdAt", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();
}

// Migration Down
// ========================================================
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("notifications").execute();
}
