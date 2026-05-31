"use server";

import { db } from "@/lib/db";
import {
  classes,
  DayOfWeek,
  schedules,
  subClasses,
  userClasses,
} from "@/lib/db/schema/classes";
import { classRules } from "@/lib/db/schema/grades";
import {
  SelectedClass,
  ClassData,
  SubClassData,
  ScheduleTime,
} from "@/lib/algo/types";
import { getSession } from "@/lib/auth/session";
import { and, eq } from "drizzle-orm";

async function getOrCreateSchedule(scheduleData: ScheduleTime) {
  const existing = await db.query.schedules.findFirst({
    where: and(
      eq(schedules.dayOfWeek, String(scheduleData.dayOfWeek) as DayOfWeek),
      eq(schedules.startPeriod, scheduleData.startPeriod),
      eq(schedules.endPeriod, scheduleData.endPeriod),
      eq(schedules.room, scheduleData.room || ""),
    ),
  });
  if (existing) return existing.id;

  const [newSched] = await db
    .insert(schedules)
    .values({
      dayOfWeek: String(scheduleData.dayOfWeek) as any,
      startPeriod: scheduleData.startPeriod,
      endPeriod: scheduleData.endPeriod,
      room: scheduleData.room || "",
    })
    .returning({ id: schedules.id });
  return newSched.id;
}

async function getOrCreateClass(classData: ClassData) {
  const existing = await db.query.classes.findFirst({
    where: and(
      eq(classes.courseCode, classData.courseCode),
      eq(classes.className, classData.className),
    ),
  });
  
  if (existing) {
    if (existing.credits !== classData.credits && classData.credits !== undefined) {
      await db.update(classes)
        .set({ credits: classData.credits })
        .where(eq(classes.id, existing.id));
    }
    return existing.id;
  }

  const scheduleId = await getOrCreateSchedule(classData.schedule);

  const [newClass] = await db
    .insert(classes)
    .values({
      className: classData.className,
      courseCode: classData.courseCode,
      courseName: classData.courseName,
      scheduleId: scheduleId,
      credits: classData.credits,
    })
    .returning({ id: classes.id });
  return newClass.id;
}

async function getOrCreateSubClass(
  classId: number,
  subClassData: SubClassData,
) {
  const existing = await db.query.subClasses.findFirst({
    where: and(
      eq(subClasses.classId, classId),
      eq(subClasses.groupCode, subClassData.groupCode),
    ),
  });
  if (existing) return existing.id;

  const scheduleId = await getOrCreateSchedule(subClassData.schedule);

  const [newSub] = await db
    .insert(subClasses)
    .values({
      classId: classId,
      groupCode: subClassData.groupCode,
      scheduleId: scheduleId,
    })
    .returning({ id: subClasses.id });
  return newSub.id;
}

export async function saveOfficialSchedule(selectedClasses: SelectedClass[]) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.userId;

  // Xóa toàn bộ userClasses cũ và các rule đã tạo
  await db.delete(userClasses).where(eq(userClasses.userId, userId));
  await db.delete(classRules).where(eq(classRules.userId, userId));

  for (const selected of selectedClasses) {
    const classId = await getOrCreateClass(selected.classData);
    let subClassId: number | undefined;

    if (selected.selectedSubClass) {
      subClassId = await getOrCreateSubClass(
        classId,
        selected.selectedSubClass,
      );
    }

    await db.insert(userClasses).values({
      userId,
      classId,
      subClassId,
    });
  }

  return { success: true };
}
