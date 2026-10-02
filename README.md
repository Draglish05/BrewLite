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

## API

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/products` | Danh sách món |
| GET | `/products/:id` | Chi tiết 1 món |
| POST | `/auth/register` | Đăng ký (email, password tối thiểu 6 ký tự), mật khẩu được băm bằng bcrypt |
| POST | `/auth/login` | Đăng nhập, trả `accessToken` (JWT) |
| POST | `/payments` | Thanh toán đơn bằng Ví (`WALLET`) hoặc Thẻ (`CARD`): thành công `PAID`, lỗi `PAYMENT_FAILED`. **Cần đăng nhập** |
| POST | `/orders` | Tạo đơn từ giỏ hàng (trạng thái `PENDING`), trả mã đơn. **Cần đăng nhập** |

`POST /orders` cần header `Authorization: Bearer <accessToken>` lấy từ `/auth/login`.

Ví dụ body `POST /orders`:

```json
{ "items": [ { "productId": 3, "size": "L", "toppings": ["Kem"], "qty": 2 } ] }
```

## Tiến độ (Product Backlog)

- [x] Task 1 – Khởi tạo dự án và cấu trúc
- [x] Task 2 – API danh sách sản phẩm
- [x] Task 3 – Trang Menu
- [x] Task 4 – Chi tiết và tùy chọn sản phẩm
- [x] Task 5 – Giỏ hàng
- [x] Task 6 – API tạo đơn hàng
- [x] Task 7 – Đăng ký / Đăng nhập (JWT)
- [ ] Task 8 – Thanh toán không tiền mặt
- [ ] Task 9 – Xác nhận, lịch sử đơn & bàn giao
- [ ] Task 10 – Nghiệp vụ backend
