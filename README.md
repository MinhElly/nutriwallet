# NutriWallet

Monorepo gồm frontend React/Vite và backend Spring Boot cho ứng dụng theo dõi dinh dưỡng, chi tiêu ăn uống và ngân sách.

## Cấu trúc dự án

```text
nutriwallet/
├── nutriwallet_frontend/   # React 19, Vite, Tailwind CSS
└── nutriwallet_backend/    # Java 21, Spring Boot, MySQL
```

Backend được tách theo feature (`auth`, `user`, `meal`, `nutrition`, `expense`, `budget`, `ai`, `messenger`, `admin`, `setting`). Frontend hiện mới là khung Vite tối thiểu.

## Yêu cầu

- Node.js 20.19+ hoặc 22.12+
- npm
- JDK 21
- Docker Desktop và Docker Compose v2

## 1. Thiết lập môi trường

Không commit file `.env`. Chỉ commit `.env.example`.

Tại thư mục gốc của dự án:

```cmd
copy .env.example .env
```

File `.env` chung ở thư mục gốc:

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

Lưu ý:

- Biến frontend bắt buộc có tiền tố `VITE_`.
- `VITE_API_BASE_URL` sẽ xuất hiện trong bundle browser, nên không đặt secret ở đây.
- Backend local có thể đọc `.env` ở thư mục gốc thông qua `application-dev.yml`.

## 2. Chạy dự án ở chế độ phát triển

### Cách nhanh nhất

Từ thư mục gốc:

```cmd
run.cmd docker
```

Lần đầu script sẽ build image, các lần sau chỉ dựng lại container.

### Chạy local để sửa code

```cmd
run.cmd dev
```

Chế độ này:

- chạy MySQL và phpMyAdmin bằng Docker
- mở backend và frontend local trong 2 cửa sổ CMD riêng

Lệnh hỗ trợ:

```cmd
run.cmd stop
run.cmd logs
```

### Chạy thủ công

CMD 1 - database:

```cmd
docker compose up -d mysql phpmyadmin
```

CMD 2 - backend:

```cmd
cd nutriwallet_backend
mvnw.cmd spring-boot:run
```

Backend local tự đọc `.env` ở thư mục gốc, nên không cần `set` thủ công.

CMD 3 - frontend:

```cmd
cd nutriwallet_frontend
npm ci
npm run dev
```

### URL khi chạy local

| Thành phần | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8082 |
| Swagger UI | http://localhost:8082/swagger-ui/index.html |
| phpMyAdmin | http://localhost:8081 |

## 3. Chạy toàn bộ bằng Docker

```cmd
docker compose up -d --build
```

Sau lần build đầu tiên, bạn có thể chỉ cần:

```cmd
docker compose up -d
```

## 4. Kiểm tra trước khi commit

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

## 5. CI/CD với GitHub Actions + Docker

Repo đã có 2 workflow:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

### CI

Workflow `ci.yml` chạy tự động khi push lên `main` hoặc mở pull request:

- Backend: `./mvnw -B test`
- Frontend: `npm ci`, `npm run lint`, `npm run build`
- Docker: `docker compose config` và `docker compose build backend frontend`

### CD

Workflow `deploy.yml` deploy qua SSH. Khi bấm `Run workflow`, nhập:

- `app_dir`: đường dẫn repo trên server, mặc định `/opt/nutriwallet`
- `branch`: branch cần deploy, mặc định `main`

GitHub Secrets cần có:

- `SSH_HOST`
- `SSH_USER`
- `SSH_KEY`

Luồng deploy:

1. SSH vào server.
2. Vào thư mục repo.
3. `git pull --ff-only`.
4. `docker compose up -d --build --remove-orphans`.

### Yêu cầu tối thiểu trên server

- Đã cài Docker và Docker Compose
- Đã clone repo về server ít nhất một lần
- Đã tạo file `.env` ở root
- Mở các port cần thiết cho backend, frontend, MySQL và phpMyAdmin nếu dùng port mặc định

## 6. Dừng dịch vụ

Giữ dữ liệu MySQL:

```powershell
docker compose down
```

Xóa cả volume database:

```powershell
docker compose down -v
```

## 7. Các phần còn thiếu trước khi tích hợp sâu backend và frontend

- Cấu hình CORS cho `http://localhost:5173`
- Tạo API client ở frontend
- Hoàn thiện JWT service/filter
- Hoàn thiện Cloudinary và AI client hoặc bỏ các biến môi trường chưa dùng
- Thêm migration bằng Flyway/Liquibase và chuyển production sang `JPA_DDL_AUTO=validate`

## Bảng tổng hợp lệnh

Các lệnh dưới đây chạy bằng Windows CMD và bắt đầu từ thư mục gốc `nutriwallet`.

| Mục đích | Lệnh | Giải thích |
| --- | --- | --- |
| Đi vào backend | `cd nutriwallet_backend` | Chuyển CMD vào thư mục backend. |
| Đi vào frontend | `cd nutriwallet_frontend` | Chuyển CMD vào thư mục frontend. |
| Tạo `.env` chung | `copy .env.example .env` | Tạo cấu hình dùng chung cho toàn bộ dự án. |
| Chạy MySQL và phpMyAdmin | `docker compose up -d mysql phpmyadmin` | Khởi động database và công cụ quản trị database ở chế độ nền. |
| Chạy toàn bộ dự án bằng Docker | `docker compose up -d --build` | Build và chạy frontend, backend, MySQL và phpMyAdmin. |
| Chỉ build/chạy backend container | `docker compose up -d --build backend` | Chạy backend cùng database mà không cần nhập lệnh `set`. |
| Chỉ build/chạy frontend container | `docker compose up -d --build frontend` | Build frontend và phục vụ bằng Nginx. |
| Chạy backend trực tiếp | `cd nutriwallet_backend && mvnw.cmd spring-boot:run` | Chạy Spring Boot local và tự đọc `.env` ở thư mục gốc. |
| Cài package frontend | `cd nutriwallet_frontend && npm ci` | Cài đúng phiên bản dependency trong `package-lock.json`. |
| Chạy frontend | `cd nutriwallet_frontend && npm run dev` | Khởi động Vite development server tại `http://localhost:5173`. |
| Kiểm tra code frontend | `cd nutriwallet_frontend && npm run lint` | Chạy ESLint để tìm lỗi code và vi phạm convention. |
| Build frontend | `cd nutriwallet_frontend && npm run build` | Tạo bản production trong thư mục `dist`. |
| Test backend | `cd nutriwallet_backend && mvnw.cmd clean test` | Biên dịch và chạy test backend bằng H2. |
| Build backend | `cd nutriwallet_backend && mvnw.cmd clean package` | Chạy test và tạo file JAR trong thư mục `target`. |
| Xem trạng thái container | `docker compose ps` | Hiển thị trạng thái các service Docker. |
| Dừng Docker | `docker compose down` | Dừng container nhưng giữ dữ liệu MySQL. |
| Dừng và xóa database | `docker compose down -v` | Dừng container và xóa volume MySQL; dữ liệu local sẽ mất. |
