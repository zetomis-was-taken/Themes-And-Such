# Authen - Ứng dụng Hỗ trợ Sinh viên

Dự án này là một ứng dụng Web được xây dựng bằng hệ sinh thái Next.js, cung cấp các công cụ và tiện ích hỗ trợ sinh viên trong quá trình học tập và tổ chức thời gian.

## 🚀 Các tính năng chính

1. **Xếp Lịch Học Thông Minh (Xử lý thuật toán)**
   - Sinh viên có thể tải lên danh sách các lớp mở trong học kỳ.
   - Hệ thống áp dụng thuật toán Quay lui (Backtracking) kết hợp thao tác Bitmask (`lib/algo/`) để tự động tính toán, lọc các lớp bị trùng lịch (collision) và đưa ra các danh sách lịch học tối ưu.
   - Đánh giá và chấm điểm các lịch học qua các chỉ số như: `leftmostScore`, `rightmostScore`, `balanceScore` (dựa trên mức độ phân bổ thời gian/độ khó), và `preferredScore`.

2. **Quản Lý Lịch Học Chính Thức**
   - Sinh viên có thể chọn một trong số những lịch học do hệ thống đề xuất để đặt làm lịch học chính thức.
   - Việc thiết lập lịch học chính thức là điều kiện để mở khóa và cá nhân hóa các tính năng khác trên hệ thống.

3. **Daily Note - Ghi chú Hàng ngày**
   - Cung cấp tính năng viết ghi chú (note) để sinh viên dễ dàng ghi lại nội dung bài học, deadline, hoặc lên kế hoạch làm việc mỗi ngày. 

4. **Tính Điểm GPA (Dự kiến/Đang phát triển)**
   - Hệ thống đã chuẩn bị sẵn Database Schema (`grades`), mục tiêu nhằm hỗ trợ tính điểm GPA dựa theo các quy tắc lớp học (class rules). *(Hiện tại tính năng này chưa được implement)*.

5. **Xác thực và Quản lý Người dùng**
   - Hỗ trợ luồng đăng nhập / đăng ký để lưu trữ dữ liệu an toàn cho từng sinh viên riêng biệt.

## 🛠 Công nghệ sử dụng

- **Core Framework:** [Next.js 16](https://nextjs.org) (App Router), React 19.
- **Styling & UI:** Tailwind CSS v4, [Radix UI](https://www.radix-ui.com/), Shadcn UI, Lucide React (Icons).
- **Database & ORM:** [Drizzle ORM](https://orm.drizzle.team/), kết nối với Neon Database (Serverless Postgres).
- **State Management:** [Jotai](https://jotai.org/).
- **Authentication & Security:** Custom authentication sử dụng `jose` (JWT) và `bcryptjs`.
- **Forms & Validation:** React Hook Form tích hợp với Zod.

## 📁 Cấu trúc thư mục nổi bật

- `app/`: Nơi chứa cấu trúc định tuyến (routes) chính của ứng dụng (`auth/`, `dashboard/`, `schedule/`).
- `components/`: Chứa các Component UI tái sử dụng được xây dựng theo kiến trúc Shadcn.
- `lib/algo/`: Core logic phục vụ việc tính toán và khởi tạo lịch học (`generator.ts`, `bitmask.ts`).
- `lib/db/`: Quản lý kết nối Database, khai báo Schema bằng Drizzle (gồm `classes`, `users`, `notes`, `grades`).

## ⚙️ Hướng dẫn cài đặt & Chạy dự án

Yêu cầu môi trường có cài đặt Node.js. Chú ý cấu hình file `.env` trước khi chạy.

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Tạo và Push cấu trúc dữ liệu lên database
npm run db:generate
npm run db:push

# 3. Khởi chạy server môi trường dev
npm run dev
```

Mở trình duyệt và truy cập vào [http://localhost:3000](http://localhost:3000) để trải nghiệm ứng dụng.
