import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { timestamps } from "./timestamps";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  password: text("password").notNull(),
  ...timestamps,
});

// ─── Types ────────────────────────────────────────────────────────────────────

/** Row được select từ DB (đầy đủ fields) */
export type User = typeof users.$inferSelect;

/** Row để insert vào DB */
export type NewUser = typeof users.$inferInsert;

/** User an toàn để trả về client (không có password) */
export type SafeUser = Omit<User, "password">;
