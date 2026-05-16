"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, type SafeUser } from "@/lib/db/schema";
import { createSession, deleteSession, getSession } from "./session";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthResult =
  | { success: true; user: SafeUser }
  | { success: false; error: string };

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Đăng ký tài khoản mới.
 * - Hash password bằng bcrypt (salt 10)
 * - Lưu user vào DB
 * - Tạo session cookie
 *
 * @param name     - Tên đăng nhập (unique)
 * @param password - Mật khẩu plain-text
 * @returns AuthResult — { success: true, user: SafeUser } hoặc { success: false, error }
 */
export async function register(
  name: string,
  password: string
): Promise<AuthResult> {
  // Kiểm tra name đã tồn tại chưa
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.name, name))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, error: "Tên đăng nhập đã tồn tại." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [newUser] = await db
    .insert(users)
    .values({ name, password: hashedPassword })
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

  return { success: true, user: newUser };
}

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Đăng nhập bằng name + password.
 * - Tìm user theo name
 * - So sánh password với hash trong DB
 * - Tạo session cookie nếu đúng
 *
 * @param name     - Tên đăng nhập
 * @param password - Mật khẩu plain-text
 * @returns AuthResult — { success: true, user: SafeUser } hoặc { success: false, error }
 */
export async function login(
  name: string,
  password: string
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

  // Trả về user không kèm password
  const { password: _pw, ...safeUser } = user;
  return { success: true, user: safeUser };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Đăng xuất — xoá session cookie.
 */
export async function logout(): Promise<void> {
  await deleteSession();
}

// ─── Get Current User (Server) ────────────────────────────────────────────────

/**
 * Lấy thông tin user hiện tại từ session cookie (dùng trong Server Components / Server Actions).
 * Validate session token → query DB lấy user mới nhất.
 *
 * @returns SafeUser | null
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await getSession();
  if (!session) return null;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user ?? null;
}
