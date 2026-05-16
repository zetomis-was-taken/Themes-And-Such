import { timestamp } from "drizzle-orm/pg-core";

/**
 * Timestamps object dùng chung cho mọi schema.
 * Spread object này vào table definition để tự động có created_at và updated_at.
 *
 * @example
 * export const myTable = pgTable("my_table", {
 *   id: serial("id").primaryKey(),
 *   ...timestamps,
 * });
 */
export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
