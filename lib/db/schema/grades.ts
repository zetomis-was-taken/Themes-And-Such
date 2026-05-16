import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";
import { timestamps } from "./timestamps";
import { users } from "./users";
import { classes } from "./classes";

export const ruleTypeEnum = pgEnum("rule_type", ["INPUT", "ACCUMULATE"]);

export const classRules = pgTable("class_rules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  classId: integer("class_id")
    .notNull()
    .references(() => classes.id),
  ruleName: text("rule_name").notNull(),
  ruleType: ruleTypeEnum("rule_type").notNull(),
  weightPercent: numeric("weight_percent", { precision: 5, scale: 2 }).notNull(),
  maxValue: numeric("max_value", { precision: 5, scale: 2 }).notNull(),
  ...timestamps,
});

export type ClassRule = typeof classRules.$inferSelect;
export type NewClassRule = typeof classRules.$inferInsert;

export const inputRecords = pgTable("input_records", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id")
    .notNull()
    .references(() => classRules.id),
  value: numeric("value", { precision: 5, scale: 2 }).notNull(),
  ...timestamps,
});

export type InputRecord = typeof inputRecords.$inferSelect;
export type NewInputRecord = typeof inputRecords.$inferInsert;

export const accumulateRecords = pgTable("accumulate_records", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id")
    .notNull()
    .references(() => classRules.id),
  value: numeric("value", { precision: 5, scale: 2 }).notNull(),
  ...timestamps,
});

export type AccumulateRecord = typeof accumulateRecords.$inferSelect;
export type NewAccumulateRecord = typeof accumulateRecords.$inferInsert;
