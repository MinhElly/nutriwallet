/**
 * Cấu hình môi trường ứng dụng.
 *
 * Sau này chỉ cần khai báo biến trong .env:
 *   VITE_API_BASE_URL=https://api.nutriwallet.app
 *
 * Hiện tại chưa dùng để gọi API — chỉ chuẩn bị sẵn.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "";
