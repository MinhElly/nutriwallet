# NutriWallet

Monorepo gồm frontend React/Vite và backend Spring Boot phục vụ ứng dụng theo dõi dinh dưỡng, chi tiêu ăn uống và ngân sách.

## Cấu trúc dự án

```text
nutriwallet/
├── nutriwallet_frontend/   # React 19, Vite, Tailwind CSS
└── nutriwallet_backend/    # Java 21, Spring Boot, MySQL
```

Backend được tổ chức theo feature (`auth`, `user`, `meal`, `nutrition`, `expense`, `budget`, `ai`, `messenger`, `admin`, `setting`) và mỗi feature tách controller/service/repository/entity/dto. Cấu trúc này phù hợp với modular monolith ở giai đoạn hiện tại.

Frontend hiện mới là khung Vite tối thiểu. Khi phát triển tiếp nên tạo các thư mục `src/api`, `src/components`, `src/features`, `src/pages`, `src/routes` và `src/hooks`; không nên dồn logic vào `App.jsx`.

## Yêu cầu

- Node.js 20.19+ hoặc 22.12+ (Vite 8 yêu cầu phiên bản này)
- npm
- JDK 21
- Docker Desktop và Docker Compose v2

## 1. Thiết lập biến môi trường

Không commit file `.env`. Chỉ commit `.env.example`.

Windows CMD hoặc PowerShell, chạy tại thư mục gốc:

```cmd
copy .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

File `.env` chung tại thư mục gốc:

```dotenv
MYSQL_DATABASE=nutricash_ai
MYSQL_ROOT_PASSWORD=change_me_root_password
MYSQL_USER=nutricash
MYSQL_PASSWORD=change_me_database_password
MYSQL_PORT=3306

PHPMYADMIN_PORT=8081
BACKEND_PORT=8082
FRONTEND_PORT=5173
VITE_API_BASE_URL=http://localhost:8082/api

JWT_SECRET=replace_with_a_random_secret_of_at_least_32_characters

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

AI_PROVIDER=GEMINI
AI_API_KEY=

JPA_DDL_AUTO=update
JPA_SHOW_SQL=false
```

Lưu ý: biến phía frontend bắt buộc có tiền tố `VITE_` và sẽ xuất hiện trong bundle trình duyệt, vì vậy không đặt secret/API key vào frontend. Các biến JWT, Cloudinary và AI đã được dự trù nhưng code hiện tại vẫn là placeholder, chưa thực sự đọc các giá trị này.

## 2. Chạy dự án ở chế độ phát triển

### Chạy nhanh bằng một lệnh

Tại thư mục gốc, chọn một trong hai chế độ:

```cmd
run.cmd docker
```

Chạy toàn bộ frontend, backend, MySQL và phpMyAdmin bằng Docker. Script tự build ở lần đầu; các lần sau chỉ khởi động lại image hiện có.

```cmd
run.cmd dev
```

Chạy MySQL/phpMyAdmin bằng Docker, sau đó mở backend và frontend local trong hai cửa sổ CMD riêng. Chế độ này phù hợp khi đang sửa code vì không phải build lại image.

Các lệnh hỗ trợ:

```cmd
run.cmd logs
run.cmd stop
```

### Cách khuyến nghị: database bằng Docker, backend và frontend chạy local

Mở CMD tại thư mục gốc của dự án.

CMD 1 — MySQL và phpMyAdmin:

```cmd
docker compose up -d mysql phpmyadmin
```

CMD 2 — backend:

```cmd
cd nutriwallet_backend
mvnw.cmd spring-boot:run
```

Profile `dev` tự nạp file `.env` tại thư mục gốc, vì vậy không cần chạy các lệnh `set`. MySQL phải được khởi động trước.

CMD 3 — frontend:

```cmd
cd nutriwallet_frontend
npm ci
npm run dev
```

Truy cập:

| Thành phần | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8082 |
| Swagger UI | http://localhost:8082/swagger-ui/index.html |
| phpMyAdmin | http://localhost:8081 |

### Chạy toàn bộ dự án bằng Docker

```cmd
docker compose up -d --build
```

Lệnh này chạy frontend, backend, MySQL và phpMyAdmin. Compose tự đọc `.env` tại thư mục gốc.

## 3. Kiểm tra trước khi commit

Backend:

```powershell
Set-Location nutriwallet_backend
./mvnw.cmd clean test
```

Frontend:

```powershell
Set-Location nutriwallet_frontend
npm ci
npm run lint
npm run build
```

## 4. Dừng dịch vụ

Giữ dữ liệu MySQL:

```powershell
docker compose down
```

Xóa cả volume database (mất toàn bộ dữ liệu local):

```powershell
docker compose down -v
```

## Các việc còn thiếu trước khi tích hợp frontend–backend

- Cấu hình CORS cho `http://localhost:5173`; `CorsConfig` hiện chỉ là placeholder.
- Tạo API client ở frontend sử dụng `import.meta.env.VITE_API_BASE_URL`.
- Hoàn thiện JWT service/filter; cấu hình security hiện yêu cầu xác thực nhưng JWT implementation chưa có.
- Hoàn thiện Cloudinary và AI clients hoặc bỏ các biến môi trường chưa dùng.
- Thêm migration bằng Flyway/Liquibase và chuyển production sang `JPA_DDL_AUTO=validate`.

## Bảng tổng hợp lệnh

Các lệnh dưới đây chạy bằng Windows CMD và bắt đầu từ thư mục gốc `nutriwallet`.

| Mục đích | Lệnh | Giải thích |
| --- | --- | --- |
| Đi vào backend | `cd nutriwallet_backend` | Chuyển CMD vào thư mục backend. |
| Đi vào frontend | `cd nutriwallet_frontend` | Chuyển CMD vào thư mục frontend. |
| Tạo `.env` chung | `copy .env.example .env` | Tạo cấu hình dùng chung cho toàn bộ dự án. |
| Chạy MySQL và phpMyAdmin | `docker compose up -d mysql phpmyadmin` | Khởi động database và công cụ quản trị database ở chế độ nền. |
| Chạy toàn bộ dự án bằng Docker | `docker compose up -d --build` | Build và chạy frontend, backend, MySQL và phpMyAdmin; Compose tự đọc `.env`. |
| Chỉ build/chạy backend container | `docker compose up -d --build backend` | Chạy backend cùng database mà không cần nhập các lệnh `set`. |
| Chỉ build/chạy frontend container | `docker compose up -d --build frontend` | Build frontend và phục vụ bằng Nginx. |
| Chạy backend trực tiếp | `cd nutriwallet_backend && mvnw.cmd spring-boot:run` | Chạy Spring Boot trên máy và tự đọc `.env` ở thư mục gốc; MySQL phải đang chạy. |
| Cài package frontend | `cd nutriwallet_frontend && npm ci` | Cài đúng phiên bản dependency trong `package-lock.json`. |
| Chạy frontend | `cd nutriwallet_frontend && npm run dev` | Khởi động Vite development server tại `http://localhost:5173`. |
| Kiểm tra code frontend | `cd nutriwallet_frontend && npm run lint` | Chạy ESLint để tìm lỗi code và vi phạm convention. |
| Build frontend | `cd nutriwallet_frontend && npm run build` | Tạo bản production trong thư mục `dist`. |
| Test backend | `cd nutriwallet_backend && mvnw.cmd clean test` | Biên dịch và chạy test backend bằng H2; không cần bật MySQL. |
| Build backend | `cd nutriwallet_backend && mvnw.cmd clean package` | Chạy test và tạo file JAR trong thư mục `target`. |
| Xem trạng thái container | `docker compose ps` | Hiển thị trạng thái các service Docker. |
| Dừng Docker | `docker compose down` | Dừng container nhưng giữ dữ liệu MySQL. |
| Dừng và xóa database | `docker compose down -v` | Dừng container và xóa volume MySQL; toàn bộ dữ liệu local sẽ mất. |
