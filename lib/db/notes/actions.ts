"use server";

import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema/notes";
import { getSession } from "@/lib/auth/session";
import { and, eq } from "drizzle-orm";

export async function saveDailyNote(content: string, targetDate: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const existing = await db.query.notes.findFirst({
    where: and(
      eq(notes.userId, session.userId),
      eq(notes.targetDate, targetDate)
    )
  });

  if (existing) {
    await db.update(notes).set({ content }).where(eq(notes.id, existing.id));
  } else {
    await db.insert(notes).values({
      userId: session.userId,
      targetDate,
      content
    });
  }

  return { success: true };
}

export async function getDailyNote(targetDate: string) {
  const session = await getSession();
  if (!session) return "";

  const existing = await db.query.notes.findFirst({
    where: and(
      eq(notes.userId, session.userId),
      eq(notes.targetDate, targetDate)
    )
  });

  return existing?.content || "";
}
