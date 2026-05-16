import { atom } from "jotai";
import type { SafeUser } from "@/lib/db/schema";

/**
 * Jotai atom lưu thông tin user đang đăng nhập phía client.
 *
 * Giá trị:
 * - `undefined` — chưa khởi tạo (chưa fetch)
 * - `null`      — đã fetch, không có user (chưa đăng nhập)
 * - `SafeUser`  — đã đăng nhập
 *
 * Cách dùng trong Client Component:
 * ```ts
 * const [user, setUser] = useAtom(userAtom);
 *
 * // Khởi tạo sau khi mount (ví dụ fetch từ API route /api/me)
 * useEffect(() => {
 *   fetch("/api/me")
 *     .then((r) => r.json())
 *     .then((data) => setUser(data.user ?? null));
 * }, []);
 * ```
 */
export const userAtom = atom<SafeUser | null | undefined>(undefined);
