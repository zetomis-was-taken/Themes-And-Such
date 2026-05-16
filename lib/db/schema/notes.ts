import {
  pgTable,
  serial,
  text,
  integer,
  date,
} from "drizzle-orm/pg-core";
import { timestamps } from "./timestamps";
import { users } from "./users";
import { classes } from "./classes";

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  classId: integer("class_id").references(() => classes.id),
  targetDate: date("target_date").notNull(),
  content: text("content").notNull().default(""),
  ...timestamps,
});

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
