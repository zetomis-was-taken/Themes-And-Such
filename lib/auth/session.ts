import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// ─── Constants ────────────────────────────────────────────────────────────────

const COOKIE_NAME = "session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) throw new Error("SESSION_SECRET is not defined in .env");
const encodedKey = new TextEncoder().encode(secretKey);

// ─── Types ────────────────────────────────────────────────────────────────────

export type SessionPayload = {
  userId: number;
  expiresAt: Date;
};

// ─── Encrypt / Decrypt ────────────────────────────────────────────────────────

/**
 * Mã hoá payload thành JWT string (HS256, hết hạn sau 7 ngày).
 *
 * @param payload - { userId, expiresAt }
 * @returns JWT string
 */
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId, expiresAt: payload.expiresAt })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

/**
 * Giải mã JWT string thành payload.
 * Trả về `null` nếu token không hợp lệ hoặc đã hết hạn.
 *
 * @param token - JWT string
 * @returns SessionPayload | null
 */
export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return {
      userId: payload.userId as number,
      expiresAt: new Date(payload.expiresAt as string),
    };
  } catch {
    return null;
  }
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

/**
 * Tạo session JWT và lưu vào cookie HttpOnly (server-side).
 * Gọi sau khi đăng nhập / đăng ký thành công.
 *
 * @param userId - ID của user trong DB
 */
export async function createSession(userId: number): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const token = await encrypt({ userId, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/**
 * Đọc cookie session và giải mã thành payload.
 * Trả về `null` nếu không có session hoặc token không hợp lệ.
 *
 * @returns SessionPayload | null
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decrypt(token);
}

/**
 * Xoá cookie session (đăng xuất).
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
