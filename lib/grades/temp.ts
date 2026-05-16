"use server";

import { and, eq } from "drizzle-orm";
import { requireUserId } from "../auth/actions";
import { db } from "../db";
import {
  AccumulateRecord,
  ClassRule,
  classRules,
  InputRecord,
  inputRecords,
  NewClassRule,
} from "../db/schema";

export type GetRulesByClassResult =
  | { success: true; rules: ClassRule[] }
  | { success: false; error: string };

export type RuleResult =
  | { success: true; rule: ClassRule }
  | { success: false; error: string };

export type RecordsResult<T> =
  | { success: true; records: T[] }
  | { success: false; error: string };

export type InputRecordResult =
  | { success: true; record: InputRecord }
  | { success: false; error: string };

export type AccumulateRecordResult =
  | { success: true; record: AccumulateRecord }
  | { success: false; error: string };

async function getClassRulesTotalWeight(
  classId: number,
  userId: number,
): Promise<number> {
  const rules = await db
    .select()
    .from(classRules)
    .where(and(eq(classRules.classId, classId), eq(classRules.userId, userId)));

  const totalWeight = rules.reduce(
    (acc, cur) => acc + Number(cur.weightPercent),
    0,
  );

  return totalWeight;
}

export async function getRulesByClass(
  classId: number,
): Promise<GetRulesByClassResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  const rules = await db
    .select()
    .from(classRules)
    .where(and(eq(classRules.classId, classId), eq(classRules.userId, userId)));

  return { success: true, rules };
}

export async function createRule(
  classId: number,
  data: {
    ruleName: string;
    ruleType: "INPUT" | "ACCUMULATE";
    weightPercent: number;
  },
): Promise<RuleResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  const currentWeightPercent = Number(data.weightPercent);
  if (currentWeightPercent < 0 || currentWeightPercent > 100) {
    return { success: false, error: "Trọng số phải trong khoảng 0–100." };
  }

  const totalWeight = await getClassRulesTotalWeight(classId, userId);

  if (totalWeight + currentWeightPercent > 100) {
    return { success: false, error: "Tổng trọng số không thể vượt quá 100%" };
  }

  const [rule] = await db
    .insert(classRules)
    .values({
      userId,
      classId,
      ruleName: data.ruleName,
      ruleType: data.ruleType,
      weightPercent: String(data.weightPercent),
    })
    .returning();

  return rule
    ? { success: true, rule }
    : { success: false, error: "Không thể tạo rule." };
}

export async function updateRule(
  classId: number,
  data: Partial<{
    ruleName: string;
    weightPercent: number;
  }>,
): Promise<RuleResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  if (
    data.weightPercent &&
    (data.weightPercent < 0 || data.weightPercent > 100)
  ) {
    return { success: false, error: "Trọng số phải trong khoảng 0–100." };
  }

  const [target] = await db
    .select()
    .from(classRules)
    .where(and(eq(classRules.classId, classId), eq(classRules.userId, userId)))
    .limit(1);

  if (!target)
    return {
      success: false,
      error: "Không tìm thấy rule hoặc không có quyền.",
    };

  if (data.weightPercent) {
    const totalWeight = await getClassRulesTotalWeight(classId, userId);
    if (totalWeight - Number(target.weightPercent) + data.weightPercent > 100) {
      return {
        success: false,
        error: "Tổng trọng số không thể vượt quá 100%",
      };
    }
  }

  const update: Record<string, unknown> = {};
  if (data.ruleName) update.ruleName = data.ruleName;
  if (data.weightPercent) update.weightPercent = String(data.weightPercent);

  const [rule] = await db
    .update(classRules)
    .set(update)
    .where(eq(classRules.id, target.id))
    .returning();

  return rule
    ? { success: true, rule }
    : { success: false, error: "Không tìm thấy rule hoặc không có quyền." };
}

export async function deleteRule(
  ruleId: number,
): Promise<{ success: boolean; error?: string }> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  const [existing] = await db
    .select({ id: classRules.id })
    .from(classRules)
    .where(and(eq(classRules.id, ruleId), eq(classRules.userId, userId)))
    .limit(1);

  if (!existing)
    return {
      success: false,
      error: "Không tìm thấy rule hoặc không có quyền.",
    };

  await db.delete(classRules).where(eq(classRules.id, existing.id));

  return { success: true };
}

export async function getInputRecords(
  ruleId: number,
): Promise<RecordsResult<InputRecord>> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  const records = await db
    .select()
    .from(inputRecords)
    .where(eq(inputRecords.ruleId, ruleId));

  return { success: true, records };
}

export async function createInputRecord(
  ruleId: number,
  value: number,
): Promise<InputRecordResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  const [rule] = await db
    .select()
    .from(classRules)
    .where(and(eq(classRules.id, ruleId), eq(classRules.userId, userId)))
    .limit(1);

  if (!rule)
    return {
      success: false,
      error: "Không tìm thấy rule hoặc không có quyền.",
    };

  const [record] = await db
    .insert(inputRecords)
    .values({ ruleId, value: String(value) })
    .returning();

  return record
    ? { success: true, record }
    : { success: false, error: "Không thể lưu điểm." };
}

export async function updateInputRecord(recordId: number, value: number) {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  const [existing] = await db
    .select()
    .from(inputRecords)
    .innerJoin(classRules, eq(classRules.id, inputRecords.ruleId))
    .where(and(eq(inputRecords.id, recordId), eq(classRules.userId, userId)))
    .limit(1);

  if (!existing)
    return {
      success: false,
      error: "Không tìm thấy rule hoặc không có quyền.",
    };

  const [record] = await db
    .update(inputRecords)
    .set({ value: String(value) })
    .where(eq(inputRecords.id, recordId))
    .returning();

  return record
    ? { success: true, record }
    : { success: false, error: "Không thể cập nhật điểm." };
}

export async function deleteInputRecord() {}

export async function getAccumulateRecords() {}

export async function updateAccumulateRecords() {}

export async function deleteAccumulateRecords() {}
