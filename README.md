# BrewLite
Ứng dụng đặt đồ uống không dùng tiền mặt.
## Công nghệ
- Frontend: Next.js, TypeScript, TailwindCSS (`apps/web`)
- Backend: NestJS, TypeScript, Prisma (`apps/api`)
- Cơ sở dữ liệu: PostgreSQL chạy bằng Docker
## Yêu cầu
- Node.js bản LTS (22 hoặc 24)
- Docker Desktop
## Chạy ở máy local
1. Tạo file `.env` từ file mẫu rồi đổi `change_me` thành mật khẩu của bạn (ở cả hai chỗ):

```
cp .env.example .env
```

2. Chạy cơ sở dữ liệu:

```
docker compose up -d
```

3. Chạy API (cổng 4000):

```
cd apps/api
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

4. Chạy web (cổng 3000). Tạo file `apps/web/.env.local` chứa `API_URL=http://localhost:4000`, rồi:

```
cd apps/web
npm install
npm run dev
```

Mở http://localhost:3000 để xem menu.

## Kiểm thử và build

```
cd apps/api
npm test
npm run lint
npm run build
```

```
cd apps/web
npm run lint
npm run build
```

## Cấu trúc thư mục

- `apps/api`: backend NestJS
- `apps/web`: frontend Next.js
- `docs`: tài liệu yêu cầu, kiến trúc
- `.github/workflows`: CI