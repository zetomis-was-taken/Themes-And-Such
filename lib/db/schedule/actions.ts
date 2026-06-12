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
import { and, eq, inArray } from "drizzle-orm";

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

  const incomingIds: { classId: number; subClassId: number | null }[] = [];
  
  for (const selected of selectedClasses) {
    const classId = await getOrCreateClass(selected.classData);
    let subClassId: number | null = null;

    if (selected.selectedSubClass) {
      subClassId = await getOrCreateSubClass(
        classId,
        selected.selectedSubClass,
      );
    }
    incomingIds.push({ classId, subClassId });
  }

  const existingClasses = await db.query.userClasses.findMany({
    where: eq(userClasses.userId, userId),
  });

  const toDelete = existingClasses.filter((existing) => {
    return !incomingIds.some(
      (incoming) =>
        incoming.classId === existing.classId &&
        (incoming.subClassId === existing.subClassId || 
        (incoming.subClassId === null && existing.subClassId === null))
    );
  });

  for (const del of toDelete) {
    await db.delete(userClasses).where(eq(userClasses.id, del.id));

    // Only delete rules if the entire class (all its subclasses) is removed
    const stillHasIncomingForClass = incomingIds.some(
      (c) => c.classId === del.classId
    );
    if (!stillHasIncomingForClass) {
      await db.delete(classRules).where(
        and(
          eq(classRules.userId, userId),
          eq(classRules.classId, del.classId)
        )
      );
    }
  }

  const toInsert = incomingIds.filter((incoming) => {
    return !existingClasses.some(
      (existing) =>
        existing.classId === incoming.classId &&
        (existing.subClassId === incoming.subClassId || 
        (incoming.subClassId === null && existing.subClassId === null))
    );
  });

  for (const ins of toInsert) {
    await db.insert(userClasses).values({
      userId,
      classId: ins.classId,
      subClassId: ins.subClassId ?? undefined,
    });
  }

  return { success: true };
}

export async function getOfficialSchedule(): Promise<SelectedClass[]> {
  const session = await getSession();
  if (!session) return [];

  const userId = session.userId;

  const userEnrolledClasses = await db
    .select({
      classData: classes,
      subClassData: subClasses,
    })
    .from(userClasses)
    .innerJoin(classes, eq(userClasses.classId, classes.id))
    .leftJoin(subClasses, eq(userClasses.subClassId, subClasses.id))
    .where(eq(userClasses.userId, userId));

  if (userEnrolledClasses.length === 0) return [];

  const scheduleIds = new Set<number>();
  userEnrolledClasses.forEach((c) => {
    scheduleIds.add(c.classData.scheduleId);
    if (c.subClassData?.scheduleId) scheduleIds.add(c.subClassData.scheduleId);
  });

  const schedulesData = await db
    .select()
    .from(schedules)
    .where(inArray(schedules.id, Array.from(scheduleIds)));

  const schedulesMap = new Map(schedulesData.map((s) => [s.id, s]));

  const result: SelectedClass[] = [];
  userEnrolledClasses.forEach((c) => {
    const mainSched = schedulesMap.get(c.classData.scheduleId);
    if (!mainSched) return;

    const classData: ClassData = {
      className: c.classData.className,
      courseCode: c.classData.courseCode,
      courseName: c.classData.courseName,
      credits: c.classData.credits || 3,
      schedule: {
        dayOfWeek: parseInt(mainSched.dayOfWeek) || 2,
        startPeriod: mainSched.startPeriod,
        endPeriod: mainSched.endPeriod,
        room: mainSched.room || "",
      },
      subClasses: [], 
    };

    let selectedSubClass: SubClassData | undefined = undefined;
    if (c.subClassData) {
      const subSched = schedulesMap.get(c.subClassData.scheduleId);
      if (subSched) {
        selectedSubClass = {
          type: "practical", 
          groupCode: c.subClassData.groupCode,
          schedule: {
            dayOfWeek: parseInt(subSched.dayOfWeek) || 2,
            startPeriod: subSched.startPeriod,
            endPeriod: subSched.endPeriod,
            room: subSched.room || "",
          },
        };
      }
    }

    result.push({
      classData,
      selectedSubClass,
    });
  });

  return result;
}

export async function addOfficialClass(selected: SelectedClass) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  const userId = session.userId;

  const classId = await getOrCreateClass(selected.classData);
  let subClassId: number | undefined;

  if (selected.selectedSubClass) {
    subClassId = await getOrCreateSubClass(classId, selected.selectedSubClass);
  }

  // Check if user already has this exact user_class entry
  const existing = await db.query.userClasses.findFirst({
    where: and(
      eq(userClasses.userId, userId),
      eq(userClasses.classId, classId),
      subClassId ? eq(userClasses.subClassId, subClassId) : undefined
    )
  });

  if (!existing) {
    await db.insert(userClasses).values({
      userId,
      classId,
      subClassId,
    });
  }

  return { success: true };
}

export async function removeOfficialClass(courseCode: string, groupCode?: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  const userId = session.userId;

  // Find the class by courseCode
  const clazz = await db.query.classes.findFirst({
    where: eq(classes.courseCode, courseCode)
  });
  
  if (!clazz) return { success: false };

  let subClassId: number | undefined = undefined;
  if (groupCode) {
    const subClass = await db.query.subClasses.findFirst({
      where: and(
        eq(subClasses.classId, clazz.id),
        eq(subClasses.groupCode, groupCode)
      )
    });
    if (subClass) subClassId = subClass.id;
  }

  if (groupCode && !subClassId) {
    return { success: false }; // specified subclass not found
  }

  if (subClassId) {
    await db.delete(userClasses).where(
      and(
        eq(userClasses.userId, userId),
        eq(userClasses.classId, clazz.id),
        eq(userClasses.subClassId, subClassId)
      )
    );
  } else {
    // If no subclass specified, delete all userClasses matching this class
    await db.delete(userClasses).where(
      and(
        eq(userClasses.userId, userId),
        eq(userClasses.classId, clazz.id)
      )
    );
  }

  return { success: true };
}
