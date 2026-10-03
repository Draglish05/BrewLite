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
├─ backend/              # NestJS – REST API (cổng 4000)
├─ frontend/             # Next.js – giao diện (cổng 3000)
└─ docker-compose.yml    # chạy cả 3 phần: database, backend, frontend
```

## Yêu cầu cài đặt

- Node.js 20 trở lên
- Git
- Docker Desktop

## Cách 1: Chạy toàn bộ bằng Docker (1 lệnh)

Mở Docker Desktop, đợi khởi động xong, rồi tại thư mục gốc:

```bash
docker compose up --build
```

Lần đầu build mất vài phút. Khi terminal báo backend đã khởi động, mở:

- Giao diện: http://localhost:3000
- API: http://localhost:4000/products

Dừng: nhấn `Ctrl+C`, rồi `docker compose down` (dữ liệu database vẫn được giữ).

## Cách 2: Chạy từng phần (môi trường phát triển)


### 0. Database (PostgreSQL bằng Docker)

Mở Docker Desktop, rồi tại thư mục gốc chỉ bật database:

```bash
docker compose up -d db
```

PostgreSQL chạy ở cổng **5433** (user / mật khẩu / database: `brewlite`). Khi backend khởi động lần đầu, các bảng được tạo tự động và thêm 14 món mẫu.

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
| GET | `/orders/me` | Lịch sử đơn của tôi, đơn mới nhất ở trên. **Cần đăng nhập** |
| GET | `/orders/:id` | Chi tiết 1 đơn (mã đơn, trạng thái, các món). Chỉ chủ đơn xem được. **Cần đăng nhập** |

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
- [x] Task 8 – Thanh toán không tiền mặt
- [x] Task 9 – Xác nhận, lịch sử đơn & bàn giao
- [ ] Task 10 – Nghiệp vụ backend

## Kịch bản demo (từ đầu đến cuối)

1. Mở http://localhost:3000, bấm **đăng ký ngay**, tạo tài khoản (mật khẩu từ 6 ký tự). Đăng ký xong tự đăng nhập.
2. Ở menu, bấm một món, chọn size và topping (giá thay đổi theo lựa chọn), bấm **Thêm vào giỏ**.
3. Vào **Giỏ hàng**: tăng, giảm, xóa món; xem tổng số lượng và tổng tiền. Bấm **Thanh toán**.
4. Chọn **Ví** hoặc **Thẻ**:
   - Tick "Giả lập thanh toán lỗi" rồi xác nhận: báo lỗi, đơn thành `PAYMENT_FAILED`, giỏ hàng vẫn còn.
   - Bỏ tick rồi xác nhận lại: đơn thành `PAID`.
5. Màn hình **xác nhận** hiện mã đơn, trạng thái và các món đã đặt.
6. Bấm **Đơn của tôi** để xem lịch sử các đơn đã đặt.
