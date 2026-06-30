/**
 * auth.service.js
 *
 * Tầng service xử lý authentication.
 * Hiện tại dùng mock session — không gọi API thật.
 *
 * Sau này chỉ cần thay phần implementation:
 *   import axios from "axios";
 *   import { API_BASE_URL } from "../../config/env";
 *   const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
 */

const SESSION_KEY = "nw_session";

/** @typedef {{ id: number, fullName: string, email: string, avatarUrl: string, role: string, emailVerified: boolean, messengerPlatform: string, messengerLinkedAt: string, emailVerifiedAt: string }} MockUser */

/** @type {MockUser} */
const MOCK_USER = {
  id: 1,
  fullName: "Alex Nguyen",
  email: "alex.nguyen@email.com",
  avatarUrl: "https://i.pravatar.cc/100?img=12",
  role: "Người dùng",
  emailVerified: true,
  emailVerifiedAt: "10/02/2024 10:22 AM",
  messengerPlatform: "Messenger",
  messengerLinkedAt: "10/02/2024 10:25 AM",
};

const MOCK_ACCESS_TOKEN = "mock-jwt-token-nutriwallet-2026";

/**
 * Lưu session vào sessionStorage.
 * @param {MockUser} user
 * @param {string} token
 */
function persistSession(user, token) {
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ user, token }),
  );
}

/**
 * Xóa session khỏi sessionStorage.
 */
function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Đọc session hiện tại từ sessionStorage.
 * @returns {{ user: MockUser, token: string } | null}
 */
export function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Đăng nhập với mock credentials.
 * Bất kỳ email/password không rỗng đều thành công.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {{ user: MockUser, token: string }}
 */
export function login(credentials) {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new Error("Email và mật khẩu không được để trống.");
  }

  const session = { user: { ...MOCK_USER, email }, token: MOCK_ACCESS_TOKEN };
  persistSession(session.user, session.token);
  return session;
}

/**
 * Đăng ký tài khoản mới với mock data.
 *
 * @param {{ fullName: string, email: string, password: string }} data
 * @returns {{ user: MockUser, token: string }}
 */
export function register(data) {
  const { fullName, email, password } = data;

  if (!fullName || !email || !password) {
    throw new Error("Vui lòng điền đầy đủ thông tin.");
  }

  const newUser = { ...MOCK_USER, fullName, email };
  const session = { user: newUser, token: MOCK_ACCESS_TOKEN };
  persistSession(session.user, session.token);
  return session;
}

/**
 * Đăng xuất — xóa session hiện tại.
 */
export function logout() {
  clearSession();
}
