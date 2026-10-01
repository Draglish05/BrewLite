# BrewLite ☕

Ứng dụng đặt cà phê không dùng tiền mặt – Bài tập lớn môn Công nghệ Phần mềm.

## Công nghệ

| Phần | Công nghệ |
|---|---|
| Frontend | Next.js (React, TypeScript), TailwindCSS |
| Backend | NestJS (TypeScript), REST API |
| CSDL | PostgreSQL + TypeORM |
| DevOps | Docker Compose, Git |

## Cấu trúc thư mục

```
BrewLite/
├─ backend/    # NestJS – REST API (cổng 4000)
└─ frontend/   # Next.js – giao diện (cổng 3000)
```

## Yêu cầu cài đặt

- Node.js 20 trở lên
- Git
- Docker Desktop

## Chạy dự án (môi trường phát triển)

### 0. Database (PostgreSQL bằng Docker)

Mở Docker Desktop, rồi tại thư mục gốc:

```bash
docker compose up -d
```

PostgreSQL chạy ở cổng **5433** (user / mật khẩu / database: `brewlite`). Khi backend khởi động lần đầu, bảng `products` được tạo tự động và thêm 4 món mẫu.

### 1. Backend

```bash
cd backend
cp .env.example .env      # Windows PowerShell: copy .env.example .env
npm install
npm run start:dev
```

Mở http://localhost:4000/products → thấy danh sách món dạng JSON.

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local   # Windows PowerShell: copy .env.example .env.local
npm install
npm run dev
```

Mở http://localhost:3000.

## Tiến độ (Product Backlog)

- [x] Task 1 – Khởi tạo dự án và cấu trúc
- [x] Task 2 – API danh sách sản phẩm
- [ ] Task 3 – Trang Menu
- [ ] Task 4 – Chi tiết và tùy chọn sản phẩm
- [ ] Task 5 – Giỏ hàng
- [ ] Task 6 – API tạo đơn hàng
- [ ] Task 7 – Đăng ký / Đăng nhập (JWT)
- [ ] Task 8 – Thanh toán không tiền mặt
- [ ] Task 9 – Xác nhận, lịch sử đơn & bàn giao
- [ ] Task 10 – Nghiệp vụ backend
