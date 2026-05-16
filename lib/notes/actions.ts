"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notes, type Note } from "@/lib/db/schema";
import { requireUserId } from "../auth/actions";

export type NoteResult =
  | { success: true; note: Note }
  | { success: false; error: string };

export async function getNotesByDate(
  targetDate: string,
  classId: number,
): Promise<NoteResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  const [note] = await db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.userId, userId),
        eq(notes.targetDate, targetDate),
        eq(notes.classId, classId),
      ),
    )
    .limit(1);

  return { success: true, note };
}

export async function saveNote(
  targetDate: string,
  content: string,
  classId: number,
): Promise<NoteResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  const [existing] = await db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.userId, userId),
        eq(notes.targetDate, targetDate),
        eq(notes.classId, classId),
      ),
    )
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(notes)
      .set({ content })
      .where(eq(notes.id, existing.id))
      .returning();

    return updated
      ? { success: true, note: updated }
      : { success: false, error: "Không thể cập nhật ghi chú." };
  }

  const [created] = await db
    .insert(notes)
    .values({
      userId,
      targetDate,
      content,
      classId,
    })
    .returning();

  return created
    ? { success: true, note: created }
    : { success: false, error: "Không thể tạo ghi chú." };
}

export async function deleteNote(
  noteId: number,
): Promise<{ success: boolean; error?: string }> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Chưa đăng nhập." };

  await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

  return { success: true };
}
