# NutriWallet

Ứng dụng theo dõi dinh dưỡng, chi tiêu ăn uống và ngân sách.

**Tech stack:**

- Frontend: React 19, Vite, Tailwind CSS
- Backend: Java 21, Spring Boot, MySQL

## Yêu cầu

- Node.js 20+
- JDK 21
- Docker & Docker Compose

## Setup

Tại thư mục gốc:

```cmd
copy .env.example .env
```

Chỉnh sửa `.env` theo nhu cầu của bạn.

## Chạy dự án

### Docker (nhanh nhất)

```cmd
docker compose up -d --build
```

### Local development

**Database:**

```cmd
docker compose up -d mysql phpmyadmin
```

**Backend (CMD 2):**

```cmd
cd nutriwallet_backend
mvnw.cmd spring-boot:run
```

**Frontend (CMD 3):**

```cmd
cd nutriwallet_frontend
npm ci
npm run dev
```

### URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:8082
- phpMyAdmin: http://localhost:8081
- Swagger: http://localhost:8082/swagger-ui/index.html

## Test & Build

```cmd
# Backend
cd nutriwallet_backend
mvnw.cmd clean test

# Frontend
cd nutriwallet_frontend
npm ci && npm run lint && npm run build
```

## Dừng dịch vụ

```cmd
# Giữ dữ liệu database
docker compose down

# Xóa tất cả (kể database)
docker compose down -v
```
