import React from "react";
import { db } from "@/lib/db";
import {
  userClasses,
  classes,
  schedules,
  subClasses,
} from "@/lib/db/schema/classes";
import { getSession } from "@/lib/auth/session";
import { eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { MarkdownNote } from "@/components/dashboard/MarkdownNote";
import { getDailyNote, getNotesDates } from "@/lib/db/notes/actions";
import { ClockAndClasses } from "@/components/dashboard/ClockAndClasses";
import { HistoryCalendar } from "@/components/dashboard/HistoryCalendar";

async function getTodaysClasses() {
  const session = await getSession();
  if (!session) return [];

  const userEnrolledClasses = await db
    .select({
      classId: classes.id,
      className: classes.className,
      courseName: classes.courseName,
      classScheduleId: classes.scheduleId,
      subClassGroup: subClasses.groupCode,
      subClassScheduleId: subClasses.scheduleId,
    })
    .from(userClasses)
    .innerJoin(classes, eq(userClasses.classId, classes.id))
    .leftJoin(subClasses, eq(userClasses.subClassId, subClasses.id))
    .where(eq(userClasses.userId, session.userId));

  const scheduleIds = new Set<number>();
  userEnrolledClasses.forEach((c) => {
    scheduleIds.add(c.classScheduleId);
    if (c.subClassScheduleId) scheduleIds.add(c.subClassScheduleId);
  });

  if (scheduleIds.size === 0) return [];

  const schedulesData = await db
    .select()
    .from(schedules)
    .where(inArray(schedules.id, Array.from(scheduleIds)));

  const schedulesMap = new Map(schedulesData.map((s) => [s.id, s]));

  const allItems: any[] = [];
  userEnrolledClasses.forEach((c) => {
    const mainSched = schedulesMap.get(c.classScheduleId);
    if (mainSched) {
      allItems.push({
        courseName: c.courseName,
        className: c.className,
        room: mainSched.room,
        startPeriod: mainSched.startPeriod,
        endPeriod: mainSched.endPeriod,
        dayOfWeek: mainSched.dayOfWeek,
        type: "Lý thuyết",
      });
    }

    if (c.subClassScheduleId) {
      const subSched = schedulesMap.get(c.subClassScheduleId);
      if (subSched) {
        allItems.push({
          courseName: c.courseName,
          className: `${c.className} (Nhóm ${c.subClassGroup})`,
          room: subSched.room,
          startPeriod: subSched.startPeriod,
          endPeriod: subSched.endPeriod,
          dayOfWeek: subSched.dayOfWeek,
          type: "TH/BT",
        });
      }
    }
  });

  return allItems;
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const allUserClasses = await getTodaysClasses();

  const today = new Date();
  const offset = 7 * 60 * 60 * 1000;
  const localDate = new Date(today.getTime() + offset);
  const targetDateStr = localDate.toISOString().split("T")[0];

  const initialNote = await getDailyNote(targetDateStr);
  const notesDates = await getNotesDates();

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Tổng quan lịch học và ghi chú cá nhân của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8">
        <div className="space-y-8">
          <ClockAndClasses allClasses={allUserClasses} />
        </div>

        <div className="space-y-8">
          <MarkdownNote
            initialContent={initialNote}
            targetDate={targetDateStr}
          />
          <HistoryCalendar
            notesDates={notesDates}
            allClasses={allUserClasses}
          />
        </div>
      </div>
    </div>
  );
}
