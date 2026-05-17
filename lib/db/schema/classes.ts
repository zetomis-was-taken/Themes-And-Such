import {
  pgTable,
  serial,
  text,
  integer,
  pgEnum,
  real,
} from "drizzle-orm/pg-core";
import { timestamps } from "./timestamps";
import { users } from "./users";

export const dayOfWeekEnum = pgEnum("day_of_week", [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
]);
export type DayOfWeek = (typeof dayOfWeekEnum.enumValues)[number];

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
  startPeriod: real("start_period").notNull(),
  endPeriod: real("end_period").notNull(),
  room: text("room"),
});

export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = typeof schedules.$inferInsert;

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  className: text("class_name").notNull(),
  courseCode: text("course_code").notNull(),
  courseName: text("course_name").notNull(),
  scheduleId: integer("schedule_id")
    .notNull()
    .references(() => schedules.id),
  credits: integer("credits").notNull(),
});

export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;

export const subClasses = pgTable("sub_classes", {
  id: serial("id").primaryKey(),
  classId: integer("class_id")
    .notNull()
    .references(() => classes.id),
  groupCode: text("group_code").notNull(),
  scheduleId: integer("schedule_id")
    .notNull()
    .references(() => schedules.id),
});

export type SubClass = typeof subClasses.$inferSelect;
export type NewSubClass = typeof subClasses.$inferInsert;

export const userClasses = pgTable("user_classes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  classId: integer("class_id")
    .notNull()
    .references(() => classes.id),
  subClassId: integer("sub_class_id").references(() => subClasses.id),
  ...timestamps,
});

export type UserClass = typeof userClasses.$inferSelect;
export type NewUserClass = typeof userClasses.$inferInsert;
