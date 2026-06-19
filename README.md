# Portal Helper

Ứng dụng này là một dự án demo/đồ án portal học tập, bao gồm:

- giao diện dashboard, lịch học, điểm số, ghi chú
- đăng nhập và session
- lưu trữ dữ liệu bằng Drizzle ORM + PostgreSQL/Neon
- các tính năng export, đồ thị, markdown note

## Yêu cầu

- Node.js >= 18
- npm hoặc pnpm
- PostgreSQL hoặc Neon (hoặc bất kỳ database Postgres nào tương thích)
- Biến môi trường cấu hình trong file `.env`

## Cài đặt

```bash
npm install
```

## Biến môi trường cần thiết

Tạo file `.env` ở gốc dự án với ít nhất các biến sau:

```env
DATABASE_URL=postgres://user:password@host:port/database
SESSION_SECRET=your_long_secret_here
NODE_ENV=development
```

- `DATABASE_URL`: chuỗi kết nối PostgreSQL / Neon
- `SESSION_SECRET`: khóa dùng để ký JWT session
- `NODE_ENV`: `development` hoặc `production`

## Các lệnh thường dùng

```bash
npm run dev       # Chạy app ở chế độ phát triển
npm run build     # Build ứng dụng Next.js
npm run start     # Chạy ứng dụng sau khi build
npm run lint      # Kiểm tra lint
npm run db:push   # Đẩy schema Drizzle lên database
npm run db:generate # Sinh mã Drizzle từ schema
npm run db:studio # Mở Drizzle Studio
npm run db:seed   # Tạo dữ liệu demo
```

## Thiết lập database

1. Đảm bảo `DATABASE_URL` đã có trong `.env`
2. Chạy schema Drizzle:

```bash
npm run db:push
```

3. Tạo dữ liệu mẫu:

```bash
npm run db:seed
```

> Lệnh `db:seed` sử dụng `scripts/seed.ts` để tạo dữ liệu mẫu cho:
> users, schedules, classes, subClasses, userClasses, điểm, ghi chú.

## Cấu trúc chính

- `app/`: code Next.js App Router
- `components/`: các component riêng cho dashboard, grades, schedule, UI
- `lib/db/schema/`: định nghĩa schema Drizzle
- `lib/auth/`: logic session và JWT
- `scripts/seed.ts`: seed dữ liệu demo

## Auth và bảo mật

- Ứng dụng dùng `jose` để tạo/giải JWT session và lưu cookie `httpOnly`
- `bcryptjs` dùng để hash mật khẩu trong seed demo

> Vì đây là đồ án/demo, `bcryptjs` là lựa chọn chấp nhận được. Nếu phát triển thêm cho môi trường thực tế, có thể cân nhắc chuyển sang `argon2` hoặc `bcrypt` native.

## Chạy ứng dụng

```bash
npm run dev
```

Mở trình duyệt và truy cập: `http://localhost:3000`

## Gợi ý demo

- Đăng nhập với tài khoản mẫu nếu có dữ liệu seed
- Kiểm tra các màn hình: dashboard, lịch học, điểm số, ghi chú
- Thử tính năng export hoặc screenshot nếu app hỗ trợ

## Lưu ý quan trọng

- `README` này dành cho mục đích demo/đồ án
- Nếu triển khai production, nên bổ sung:
  - cơ chế tạo và xác thực người dùng thực tế
  - xử lý revoke session / logout an toàn
  - kiểm thử tự động và kiểm tra bảo mật
  - audit dependency và CVE

## Tài liệu thêm

- Next.js: https://nextjs.org
- Tailwind CSS: https://tailwindcss.com
- Drizzle ORM: https://drizzle.team
- Neon DB: https://neon.tech
