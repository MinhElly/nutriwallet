# NutriCashAI Backend

Backend monolithic cho hệ thống theo dõi bữa ăn, dinh dưỡng, chi tiêu ăn uống,
ngân sách và chatbot Messenger.

## Công nghệ

- Java 21, Spring Boot 4
- Spring Web, Spring Data JPA, Hibernate ORM
- Spring Security, Validation, Lombok
- MySQL 8, phpMyAdmin
- Swagger/OpenAPI
- Docker và Docker Compose

## 1. Yêu cầu môi trường

### Chạy toàn bộ bằng Docker (khuyến nghị)

- Docker Desktop đang chạy
- Docker Compose v2 (`docker compose`)

### Chạy backend trực tiếp trên máy

- JDK 21
- Docker/MySQL 8

Kiểm tra công cụ:

```powershell
java -version
docker --version
docker compose version
```

## 2. Cấu hình biến môi trường

Tạo file `.env` từ file mẫu.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Mở `.env` và thay tối thiểu các giá trị sau:

```dotenv
MYSQL_DATABASE=nutricash_ai
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_USER=nutricash
MYSQL_PASSWORD=your_database_password
MYSQL_PORT=3306

PHPMYADMIN_PORT=8081
BACKEND_PORT=8080

JWT_SECRET=your_secure_secret_with_at_least_32_characters
```

Các biến Cloudinary và AI có thể để trống cho đến khi triển khai chức năng upload
ảnh và phân tích AI. Không commit file `.env` lên Git.

## 3. Chạy bằng Docker Compose

Tại thư mục chứa `docker-compose.yml`, chạy:

```bash
docker compose up -d --build
```

Kiểm tra trạng thái container:

```bash
docker compose ps
```

Theo dõi log backend:

```bash
docker compose logs -f backend
```

Khi MySQL healthy, backend sẽ kết nối tới database `nutricash_ai`. Hibernate tự
tạo hoặc cập nhật bảng vì môi trường MVP đang dùng `ddl-auto=update`.

## 4. Địa chỉ truy cập

| Thành phần | Địa chỉ |
| --- | --- |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui/index.html |
| OpenAPI JSON | http://localhost:8080/v3/api-docs |
| phpMyAdmin | http://localhost:8081 |
| MySQL | `localhost:3306` |

Đăng nhập phpMyAdmin bằng `MYSQL_USER` và `MYSQL_PASSWORD` trong `.env`. Có thể
dùng tài khoản `root` với `MYSQL_ROOT_PASSWORD` khi cần quyền quản trị.

Backend chưa có endpoint tại `/`, vì vậy truy cập trực tiếp
`http://localhost:8080` có thể trả về `401` hoặc `404`. Dùng Swagger UI để kiểm
tra API.

## 5. Chạy backend trực tiếp, database bằng Docker

Khởi động MySQL và phpMyAdmin:

```bash
docker compose up -d mysql phpmyadmin
```

Thiết lập biến môi trường trong PowerShell theo giá trị trong `.env`:

```powershell
$env:MYSQL_DATABASE="nutricash_ai"
$env:MYSQL_USER="nutricash"
$env:MYSQL_PASSWORD="your_database_password"
$env:MYSQL_PORT="3306"
$env:SERVER_PORT="8080"
```

Chạy backend:

```powershell
.\mvnw.cmd spring-boot:run
```

Trên macOS/Linux:

```bash
./mvnw spring-boot:run
```

## 6. Build và chạy test

Windows:

```powershell
.\mvnw.cmd clean test
.\mvnw.cmd clean package
```

macOS/Linux:

```bash
./mvnw clean test
./mvnw clean package
```

Test sử dụng H2 in-memory ở chế độ tương thích MySQL nên không cần bật MySQL.
File JAR sau khi build nằm trong thư mục `target/`.

## 7. Dừng hệ thống

Dừng container nhưng giữ dữ liệu MySQL:

```bash
docker compose down
```

Xóa cả container và dữ liệu MySQL:

```bash
docker compose down -v
```

> Lệnh `down -v` xóa volume `nutricash-mysql-data` và toàn bộ dữ liệu database.

## 8. Lệnh xử lý sự cố

Xem log tất cả service:

```bash
docker compose logs -f
```

Build lại backend sau khi sửa code:

```bash
docker compose up -d --build backend
```

Kiểm tra cấu hình Compose:

```bash
docker compose config
```

Nếu cổng `3306`, `8080` hoặc `8081` đã được sử dụng, thay `MYSQL_PORT`,
`BACKEND_PORT` hoặc `PHPMYADMIN_PORT` trong `.env`, sau đó chạy lại Compose.

## 9. Lưu ý database

- Charset: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`
- Timezone: `Asia/Ho_Chi_Minh`
- Database: `nutricash_ai`
- Dữ liệu MySQL được lưu trong volume `nutricash-mysql-data`

`ddl-auto=update` chỉ phù hợp giai đoạn MVP/dev. Khi triển khai production, nên
chuyển sang Flyway hoặc Liquibase và đổi Hibernate thành `ddl-auto=validate`.
