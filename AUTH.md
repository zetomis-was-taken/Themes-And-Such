# AUTH.md — Tài liệu hệ thống xác thực

Tài liệu mô tả input/output và tính năng của từng hàm trong hệ thống auth.

---

## Tổng quan kiến trúc

```
lib/
├── db/
│   ├── index.ts              ← Kết nối Drizzle + Neon
│   └── schema/
│       ├── timestamps.ts     ← Object timestamps dùng chung
│       ├── users.ts          ← Schema bảng users
│       └── index.ts          ← Barrel export
├── auth/
│   ├── session.ts            ← JWT session (server-only)
│   ├── actions.ts            ← Server Actions: register / login / logout / getCurrentUser
│   └── atom.ts               ← Jotai atom (client-side)
drizzle.config.ts             ← Cấu hình Drizzle Kit
```

### Stack
| Công nghệ | Vai trò |
|-----------|---------|
| **Neon** (PostgreSQL) | Database |
| **Drizzle ORM** | Schema + Query builder |
| **bcryptjs** | Hash password (salt 10) |
| **Jose** | JWT HS256 — mã hoá session |
| **Next.js cookies()** | Lưu session vào HttpOnly cookie |
| **Jotai** | Client-side state |

---

## Database Schema

### `timestamps` object — `lib/db/schema/timestamps.ts`

Object dùng chung, spread vào bất kỳ schema nào.

| Column | Type | Default | Ghi chú |
|--------|------|---------|---------|
| `created_at` | `timestamp with time zone` | `now()` | Tự set khi INSERT |
| `updated_at` | `timestamp with time zone` | `now()` | Tự cập nhật khi UPDATE |

**Cách dùng:**
```ts
import { timestamps } from "@/lib/db/schema/timestamps";

export const myTable = pgTable("my_table", {
  id: serial("id").primaryKey(),
  // ...fields khác
  ...timestamps,
});
```

---

### Bảng `users` — `lib/db/schema/users.ts`

| Column | Type | Constraint |
|--------|------|-----------|
| `id` | `serial` (int auto-increment) | PRIMARY KEY |
| `name` | `text` | NOT NULL, UNIQUE |
| `password` | `text` (bcrypt hash) | NOT NULL |
| `created_at` | `timestamp with time zone` | NOT NULL, default now() |
| `updated_at` | `timestamp with time zone` | NOT NULL, default now() |

**TypeScript types export:**
```ts
type User     // Toàn bộ row từ DB
type NewUser  // Dữ liệu để INSERT
type SafeUser // User không có password (an toàn trả về client)
```

---

## Session — `lib/auth/session.ts`

> ⚠️ File này dùng `"server-only"` — **không thể import ở client.**

### `encrypt(payload)` — Mã hoá JWT

| | |
|--|--|
| **Input** | `payload: { userId: number; expiresAt: Date }` |
| **Output** | `Promise<string>` — JWT string (HS256, hết hạn 7 ngày) |
| **Dùng khi** | Tạo session sau đăng nhập / đăng ký |

### `decrypt(token)` — Giải mã JWT

| | |
|--|--|
| **Input** | `token: string` — JWT string |
| **Output** | `Promise<SessionPayload \| null>` |
| **Ghi chú** | Trả về `null` nếu token hết hạn hoặc không hợp lệ |

### `createSession(userId)` — Tạo session cookie

| | |
|--|--|
| **Input** | `userId: number` |
| **Output** | `Promise<void>` |
| **Side effect** | Set cookie `session` (HttpOnly, SameSite=lax, 7 ngày) |
| **Dùng khi** | Sau khi đăng nhập / đăng ký thành công |

### `getSession()` — Đọc session hiện tại

| | |
|--|--|
| **Input** | _(không có)_ — đọc từ cookie request |
| **Output** | `Promise<SessionPayload \| null>` |
| **Ghi chú** | Trả về `null` nếu chưa đăng nhập hoặc token hết hạn |

### `deleteSession()` — Xoá session (logout)

| | |
|--|--|
| **Input** | _(không có)_ |
| **Output** | `Promise<void>` |
| **Side effect** | Xoá cookie `session` |

---

## Server Actions — `lib/auth/actions.ts`

> File được đánh dấu `"use server"` — tất cả hàm là Server Actions của Next.js.

### `register(name, password)` — Đăng ký

| | |
|--|--|
| **Input** | `name: string`, `password: string` (plain-text) |
| **Output** | `Promise<AuthResult>` |
| **Thành công** | `{ success: true, user: SafeUser }` + tạo session cookie |
| **Thất bại** | `{ success: false, error: string }` |
| **Lỗi có thể** | `"Tên đăng nhập đã tồn tại."`, `"Không thể tạo tài khoản."` |

**Luồng xử lý:**
1. Kiểm tra `name` đã tồn tại trong DB chưa
2. Hash `password` với bcrypt (salt 10)
3. Insert user vào DB
4. Gọi `createSession(userId)` → set cookie
5. Trả về `SafeUser`

---

### `login(name, password)` — Đăng nhập

| | |
|--|--|
| **Input** | `name: string`, `password: string` (plain-text) |
| **Output** | `Promise<AuthResult>` |
| **Thành công** | `{ success: true, user: SafeUser }` + tạo session cookie |
| **Thất bại** | `{ success: false, error: string }` |
| **Lỗi có thể** | `"Tên đăng nhập hoặc mật khẩu không đúng."` |

**Luồng xử lý:**
1. Query DB tìm user theo `name`
2. So sánh `password` với hash bằng `bcrypt.compare`
3. Gọi `createSession(userId)` → set cookie
4. Trả về `SafeUser` (không kèm password)

> **Bảo mật:** Cả hai trường hợp (sai name / sai password) đều trả về cùng một thông báo lỗi để tránh user enumeration attack.

---

### `logout()` — Đăng xuất

| | |
|--|--|
| **Input** | _(không có)_ |
| **Output** | `Promise<void>` |
| **Side effect** | Xoá cookie `session` |

---

### `getCurrentUser()` — Lấy user hiện tại (Server)

| | |
|--|--|
| **Input** | _(không có)_ — đọc từ cookie request |
| **Output** | `Promise<SafeUser \| null>` |
| **Dùng khi** | Server Components, Server Actions, Route Handlers |
| **Ghi chú** | Luôn query DB để lấy dữ liệu mới nhất, không chỉ decode JWT |

**Luồng xử lý:**
1. Gọi `getSession()` → lấy `userId` từ JWT
2. Query DB lấy user theo `userId` (select không kèm password)
3. Trả về `SafeUser` hoặc `null`

---

## Jotai Atom — `lib/auth/atom.ts`

### `userAtom`

Atom client-side lưu user hiện tại.

| Giá trị | Ý nghĩa |
|---------|---------|
| `undefined` | Chưa khởi tạo (chưa fetch) |
| `null` | Đã fetch, không có user (chưa đăng nhập) |
| `SafeUser` | Đang đăng nhập |

**Cách dùng trong Client Component:**
```tsx
"use client";
import { useAtom } from "jotai";
import { userAtom } from "@/lib/auth/atom";

export function MyComponent() {
  const [user, setUser] = useAtom(userAtom);

  if (user === undefined) return <p>Loading...</p>;
  if (user === null) return <p>Chưa đăng nhập</p>;
  return <p>Xin chào, {user.name}</p>;
}
```

> **Lưu ý:** Atom này không tự fetch. Bạn cần tự set giá trị sau khi gọi `login()` / `register()` hoặc fetch từ một API route (`/api/me`).

---

## AuthResult type

```ts
type AuthResult =
  | { success: true;  user: SafeUser }
  | { success: false; error: string  }
```

---

## Biến môi trường (`.env`)

| Biến | Mô tả |
|------|-------|
| `DATABASE_URL` | Connection string của Neon PostgreSQL |
| `SESSION_SECRET` | Secret key 32 bytes (base64) để ký JWT |

---

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run db:push` | Đồng bộ schema lên DB (không tạo migration file) |
| `npm run db:generate` | Tạo migration SQL files |
| `npm run db:studio` | Mở Drizzle Studio UI xem/sửa dữ liệu |
