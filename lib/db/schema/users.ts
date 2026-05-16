import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { timestamps } from "./timestamps";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  password: text("password").notNull(),
  ...timestamps,
});

export type User = typeof users.$inferSelect;

export type NewUser = typeof users.$inferInsert;

export type SafeUser = Omit<User, "password">;
