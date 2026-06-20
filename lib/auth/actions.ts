"use server";

import bcrypt from "bcryptjs";
import { eq, or, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, otps, type SafeUser } from "@/lib/db/schema";
import { sendOTP } from "@/lib/email";
import { createSession, deleteSession, getSession } from "./session";

export type AuthResult =
  | { success: true; user: SafeUser }
  | { success: false; error: string };

export async function sendRegistrationOtp(
  name: string,
  email: string,
): Promise<{ success: boolean; error?: string }> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.name, name), eq(users.email, email)))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, error: "Tên đăng nhập hoặc email đã tồn tại." };
  }

  const otp = Math.floor(10000000 + Math.random() * 90000000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db.insert(otps).values({ email, otp, expiresAt });

  try {
    await sendOTP(email, otp);
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
    return {
      success: false,
      error: "Không thể gửi email xác thực. Vui lòng thử lại.",
    };
  }

  return { success: true };
}

export async function verifyRegistrationOtp(
  name: string,
  email: string,
  password: string,
  otpCode: string,
): Promise<AuthResult> {
  const [record] = await db
    .select()
    .from(otps)
    .where(eq(otps.email, email))
    .orderBy(desc(otps.id))
    .limit(1);

  if (!record || record.otp !== otpCode) {
    return { success: false, error: "Mã OTP không hợp lệ." };
  }

  if (new Date() > record.expiresAt) {
    return { success: false, error: "Mã OTP đã hết hạn." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [newUser] = await db
    .insert(users)
    .values({ name, email, password: hashedPassword })
    .returning({
      id: users.id,
      name: users.name,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  if (!newUser) {
    return { success: false, error: "Không thể tạo tài khoản." };
  }

  await createSession(newUser.id);
  await db.delete(otps).where(eq(otps.email, email));

  return { success: true, user: newUser as SafeUser };
}

export async function login(
  name: string,
  password: string,
): Promise<AuthResult> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.name, name))
    .limit(1);

  if (!user) {
    return { success: false, error: "Tên đăng nhập hoặc mật khẩu không đúng." };
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return { success: false, error: "Tên đăng nhập hoặc mật khẩu không đúng." };
  }

  await createSession(user.id);

  const { password: _pw, ...safeUser } = user;
  return { success: true, user: safeUser };
}

export async function logout(): Promise<void> {
  await deleteSession();
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await getSession();
  if (!session) return null;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user ?? null;
}

export async function requireUserId(): Promise<number | null> {
  const session = await getSession();
  return session?.userId ?? null;
}

export async function updateName(
  newName: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Chưa đăng nhập." };

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.name, newName))
    .limit(1);

  if (existing.length > 0 && existing[0].id !== session.userId) {
    return { success: false, error: "Tên hiển thị này đã được sử dụng." };
  }

  await db
    .update(users)
    .set({ name: newName })
    .where(eq(users.id, session.userId));

  return { success: true };
}

export async function sendPasswordChangeOtp(): Promise<{
  success: boolean;
  error?: string;
  email?: string;
}> {
  const session = await getSession();
  if (!session) return { success: false, error: "Chưa đăng nhập." };

  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user || !user.email) {
    return { success: false, error: "Không tìm thấy thông tin email của tài khoản." };
  }

  const otp = Math.floor(10000000 + Math.random() * 90000000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db.insert(otps).values({ email: user.email, otp, expiresAt });

  try {
    await sendOTP(user.email, otp);
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
    return {
      success: false,
      error: "Không thể gửi email xác thực. Vui lòng thử lại.",
    };
  }

  return { success: true, email: user.email };
}

export async function verifyAndChangePassword(
  otpCode: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Chưa đăng nhập." };

  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user || !user.email) {
    return { success: false, error: "Không tìm thấy thông tin tài khoản." };
  }

  const [record] = await db
    .select()
    .from(otps)
    .where(eq(otps.email, user.email))
    .orderBy(desc(otps.id))
    .limit(1);

  if (!record || record.otp !== otpCode) {
    return { success: false, error: "Mã OTP không hợp lệ." };
  }

  if (new Date() > record.expiresAt) {
    return { success: false, error: "Mã OTP đã hết hạn." };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, session.userId));

  await db.delete(otps).where(eq(otps.email, user.email));

  return { success: true };
}
