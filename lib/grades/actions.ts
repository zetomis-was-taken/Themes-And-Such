"use server";

import { and, eq } from "drizzle-orm";
import { requireUserId } from "../auth/actions";
import { db } from "../db";
import {
  AccumulateRecord,
  ClassRule,
  InputRecord,
  accumulateRecords,
  classRules,
  inputRecords,
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

export type DeleteResult = { success: boolean; error?: string };

async function getClassRulesTotalWeight(
  classId: number,
  userId: number,
): Promise<number> {
  const rules = await db
    .select({ weightPercent: classRules.weightPercent })
    .from(classRules)
    .where(and(eq(classRules.classId, classId), eq(classRules.userId, userId)));

  return rules.reduce((acc, cur) => acc + Number(cur.weightPercent), 0);
}

async function findRuleByIdAndUser(
  ruleId: number,
  userId: number,
): Promise<ClassRule | null> {
  const [rule] = await db
    .select()
    .from(classRules)
    .where(and(eq(classRules.id, ruleId), eq(classRules.userId, userId)))
    .limit(1);

  return rule ?? null;
}

async function findInputRecordByIdAndUser(
  recordId: number,
  userId: number,
): Promise<InputRecord | null> {
  const [row] = await db
    .select({ record: inputRecords })
    .from(inputRecords)
    .innerJoin(classRules, eq(classRules.id, inputRecords.ruleId))
    .where(and(eq(inputRecords.id, recordId), eq(classRules.userId, userId)))
    .limit(1);

  return row?.record ?? null;
}

async function findAccumulateRecordByIdAndUser(
  recordId: number,
  userId: number,
): Promise<AccumulateRecord | null> {
  const [row] = await db
    .select({ record: accumulateRecords })
    .from(accumulateRecords)
    .innerJoin(classRules, eq(classRules.id, accumulateRecords.ruleId))
    .where(
      and(eq(accumulateRecords.id, recordId), eq(classRules.userId, userId)),
    )
    .limit(1);

  return row?.record ?? null;
}

function isValidScore(value: number): boolean {
  return value >= 0 && value <= 10;
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

export async function getRuleById(ruleId: number): Promise<RuleResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  const rule = await findRuleByIdAndUser(ruleId, userId);
  if (!rule)
    return {
      success: false,
      error: "Không tìm thấy rule hoặc không có quyền.",
    };

  return { success: true, rule };
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
    return { success: false, error: "Tổng trọng số không thể vượt quá 100%." };
  }

  const [rule] = await db
    .insert(classRules)
    .values({
      userId,
      classId,
      ruleName: data.ruleName,
      ruleType: data.ruleType,
      weightPercent: String(currentWeightPercent),
    })
    .returning();

  return rule
    ? { success: true, rule }
    : { success: false, error: "Không thể tạo rule." };
}

export async function updateRule(
  ruleId: number,
  data: Partial<{
    ruleName: string;
    weightPercent: number;
  }>,
): Promise<RuleResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  if (
    data.weightPercent !== undefined &&
    (data.weightPercent < 0 || data.weightPercent > 100)
  ) {
    return { success: false, error: "Trọng số phải trong khoảng 0–100." };
  }

  const target = await findRuleByIdAndUser(ruleId, userId);
  if (!target)
    return {
      success: false,
      error: "Không tìm thấy rule hoặc không có quyền.",
    };

  if (data.weightPercent !== undefined) {
    const totalWeight = await getClassRulesTotalWeight(target.classId, userId);
    const newTotal =
      totalWeight - Number(target.weightPercent) + data.weightPercent;
    if (newTotal > 100) {
      return {
        success: false,
        error: "Tổng trọng số không thể vượt quá 100%.",
      };
    }
  }

  const update: Partial<typeof classRules.$inferInsert> = {};
  if (data.ruleName !== undefined) update.ruleName = data.ruleName;
  if (data.weightPercent !== undefined)
    update.weightPercent = String(data.weightPercent);

  if (Object.keys(update).length === 0)
    return { success: false, error: "Không có thay đổi nào được cung cấp." };

  const [rule] = await db
    .update(classRules)
    .set(update)
    .where(eq(classRules.id, target.id))
    .returning();

  return rule
    ? { success: true, rule }
    : { success: false, error: "Không thể cập nhật rule." };
}

export async function deleteRule(ruleId: number): Promise<DeleteResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  const existing = await findRuleByIdAndUser(ruleId, userId);
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

  const rule = await findRuleByIdAndUser(ruleId, userId);
  if (!rule)
    return {
      success: false,
      error: "Không tìm thấy rule hoặc không có quyền.",
    };

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

  if (!isValidScore(value))
    return { success: false, error: "Điểm phải trong khoảng 0–10." };

  const rule = await findRuleByIdAndUser(ruleId, userId);
  if (!rule)
    return {
      success: false,
      error: "Không tìm thấy rule hoặc không có quyền.",
    };

  if (rule.ruleType !== "INPUT")
    return {
      success: false,
      error: "Rule này không phải loại INPUT.",
    };

  const [record] = await db
    .insert(inputRecords)
    .values({ ruleId, value: String(value) })
    .returning();

  return record
    ? { success: true, record }
    : { success: false, error: "Không thể lưu điểm." };
}

export async function updateInputRecord(
  recordId: number,
  value: number,
): Promise<InputRecordResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  if (!isValidScore(value))
    return { success: false, error: "Điểm phải trong khoảng 0–10." };

  const existing = await findInputRecordByIdAndUser(recordId, userId);
  if (!existing)
    return {
      success: false,
      error: "Không tìm thấy record hoặc không có quyền.",
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

export async function deleteInputRecord(
  recordId: number,
): Promise<DeleteResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  const existing = await findInputRecordByIdAndUser(recordId, userId);
  if (!existing)
    return {
      success: false,
      error: "Không tìm thấy record hoặc không có quyền.",
    };

  await db.delete(inputRecords).where(eq(inputRecords.id, recordId));

  return { success: true };
}

export async function getAccumulateRecords(
  ruleId: number,
): Promise<RecordsResult<AccumulateRecord>> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  const rule = await findRuleByIdAndUser(ruleId, userId);
  if (!rule)
    return {
      success: false,
      error: "Không tìm thấy rule hoặc không có quyền.",
    };

  const records = await db
    .select()
    .from(accumulateRecords)
    .where(eq(accumulateRecords.ruleId, ruleId));

  return { success: true, records };
}

export async function createAccumulateRecord(
  ruleId: number,
  value: number,
): Promise<AccumulateRecordResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  if (!isValidScore(value))
    return { success: false, error: "Điểm phải trong khoảng 0–10." };

  const rule = await findRuleByIdAndUser(ruleId, userId);
  if (!rule)
    return {
      success: false,
      error: "Không tìm thấy rule hoặc không có quyền.",
    };

  if (rule.ruleType !== "ACCUMULATE")
    return {
      success: false,
      error: "Rule này không phải loại ACCUMULATE.",
    };

  const [record] = await db
    .insert(accumulateRecords)
    .values({ ruleId, value: String(value) })
    .returning();

  return record
    ? { success: true, record }
    : { success: false, error: "Không thể lưu điểm tích lũy." };
}

export async function updateAccumulateRecord(
  recordId: number,
  value: number,
): Promise<AccumulateRecordResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  if (!isValidScore(value))
    return { success: false, error: "Điểm phải trong khoảng 0–10." };

  const existing = await findAccumulateRecordByIdAndUser(recordId, userId);
  if (!existing)
    return {
      success: false,
      error: "Không tìm thấy record hoặc không có quyền.",
    };

  const [record] = await db
    .update(accumulateRecords)
    .set({ value: String(value) })
    .where(eq(accumulateRecords.id, recordId))
    .returning();

  return record
    ? { success: true, record }
    : { success: false, error: "Không thể cập nhật điểm tích lũy." };
}

export async function deleteAccumulateRecord(
  recordId: number,
): Promise<DeleteResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  const existing = await findAccumulateRecordByIdAndUser(recordId, userId);
  if (!existing)
    return {
      success: false,
      error: "Không tìm thấy record hoặc không có quyền.",
    };

  await db.delete(accumulateRecords).where(eq(accumulateRecords.id, recordId));

  return { success: true };
}
