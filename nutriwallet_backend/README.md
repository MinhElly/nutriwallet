# NutriWallet Backend

Backend Spring Boot của NutriWallet. Hướng dẫn thiết lập `.env`, Docker Compose và chạy toàn bộ dự án nằm tại [README gốc](../README.md).

Chạy backend trực tiếp trên Windows sau khi MySQL đã được khởi động:

```cmd
mvnw.cmd spring-boot:run
```

Chạy test:

```cmd
mvnw.cmd clean test
```

Lưu ý: Docker Compose và `.env.example` được quản lý tại thư mục gốc của repository, không đặt trong thư mục backend.
