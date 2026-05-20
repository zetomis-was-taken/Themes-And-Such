import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  classes,
  classRules,
  inputRecords,
  accumulateRecords,
  userClasses,
} from "../db/schema";
import { requireUserId } from "../auth/actions";

export type ClassGradeData = {
  classId: number;
  className: string;
  courseCode: string;
  courseName: string;
  credits: number;
  rules: {
    id: number;
    ruleName: string;
    ruleType: "INPUT" | "ACCUMULATE";
    weightPercent: number;
    inputValue: number | null;
    accumulateValue: number | null;
    inputId: number | null;
    accumulateId: number | null;
  }[];
};

export async function getUserClassesWithGrades(): Promise<ClassGradeData[]> {
  const userId = await requireUserId();
  if (!userId) return [];

  // 1. Fetch user's enrolled classes
  const userEnrolledClasses = await db
    .select({
      classId: classes.id,
      className: classes.className,
      courseCode: classes.courseCode,
      courseName: classes.courseName,
      credits: classes.credits,
    })
    .from(userClasses)
    .innerJoin(classes, eq(userClasses.classId, classes.id))
    .where(eq(userClasses.userId, userId));

  if (userEnrolledClasses.length === 0) return [];

  const classIds = userEnrolledClasses.map((c) => c.classId);

  // 2. Fetch rules for these classes created by the user
  const rules = await db
    .select()
    .from(classRules)
    .where(eq(classRules.userId, userId));

  const ruleIds = rules.map((r) => r.id);

  // 3. Fetch input and accumulate records for these rules
  const allInputRecords = await db.select().from(inputRecords);
  const allAccumulateRecords = await db.select().from(accumulateRecords);

  const inputsByRule = new Map(
    allInputRecords
      .filter((r) => ruleIds.includes(r.ruleId))
      .map((r) => [r.ruleId, r]),
  );

  const accumulatesByRule = new Map(
    allAccumulateRecords
      .filter((r) => ruleIds.includes(r.ruleId))
      .map((r) => [r.ruleId, r]),
  );

  const rulesByClass = new Map<number, ClassGradeData["rules"]>();
  for (const rule of rules) {
    const classId = rule.classId;
    if (!rulesByClass.has(classId)) {
      rulesByClass.set(classId, []);
    }

    const inputRec = inputsByRule.get(rule.id);
    const accRec = accumulatesByRule.get(rule.id);

    rulesByClass.get(classId)!.push({
      id: rule.id,
      ruleName: rule.ruleName,
      ruleType: rule.ruleType,
      weightPercent: Number(rule.weightPercent),
      inputValue: inputRec ? Number(inputRec.value) : null,
      inputId: inputRec ? inputRec.id : null,
      accumulateValue: accRec ? Number(accRec.value) : null,
      accumulateId: accRec ? accRec.id : null,
    });
  }

  // 4. Combine
  const result: ClassGradeData[] = userEnrolledClasses.map((c) => ({
    ...c,
    rules: rulesByClass.get(c.classId) || [],
  }));

  return result;
}
