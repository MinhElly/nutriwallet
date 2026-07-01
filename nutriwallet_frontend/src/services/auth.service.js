/**
 * auth.service.js
 *
 * Tầng service xử lý authentication.
 */

import api from "../lib/axios";

const SESSION_KEY = "nw_session";

/**
 * Lưu session vào sessionStorage.
 * @param {object} user
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
 * @returns {{ user: object, token: string } | null}
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
 * Đăng nhập bằng email/password (Đã bị vô hiệu hóa).
 */
export function login() {
  throw new Error("Đăng nhập bằng tài khoản nội bộ đã bị vô hiệu hóa. Vui lòng đăng nhập qua Google hoặc Facebook.");
}

/**
 * Đăng ký tài khoản bằng email/password (Đã bị vô hiệu hóa).
 */
export function register() {
  throw new Error("Đăng ký tài khoản nội bộ đã bị vô hiệu hóa. Vui lòng đăng ký qua Google hoặc Facebook.");
}

/**
 * Đăng xuất — xóa session hiện tại.
 */
export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    console.error("Backend logout failed:", err);
  } finally {
    clearSession();
  }
}

/**
 * Yêu cầu đặt lại mật khẩu (Đã bị vô hiệu hóa).
 */
export async function requestPasswordReset() {
  throw new Error("Khôi phục mật khẩu nội bộ đã bị vô hiệu hóa.");
}

/**
 * Đặt lại mật khẩu mới (Đã bị vô hiệu hóa).
 */
export async function resetPassword() {
  throw new Error("Khôi phục mật khẩu nội bộ đã bị vô hiệu hóa.");
}

/**
 * Đăng nhập qua Google (Client-Verification Flow)
 * @param {string} idToken
 * @returns {Promise<{ user: MockUser, token: string }>}
 */
export async function loginWithGoogle(idToken) {
  const response = await api.post("/auth/google", { idToken });
  const authResponse = response.data.data;
  const mappedUser = {
    id: authResponse.user.id,
    fullName: authResponse.user.fullName,
    email: authResponse.user.email,
    avatarUrl: authResponse.user.avatarUrl || "https://i.pravatar.cc/100?img=12",
    role: authResponse.user.role === "ADMIN" ? "Admin" : "Người dùng",
    emailVerified: authResponse.user.status === "ACTIVE",
    emailVerifiedAt: new Date().toLocaleString(),
    messengerPlatform: null,
    messengerLinkedAt: null,
  };
  persistSession(mappedUser, authResponse.accessToken);
  return { user: mappedUser, token: authResponse.accessToken };
}

/**
 * Đăng nhập qua Facebook (Client-Verification Flow)
 * @param {string} accessToken
 * @returns {Promise<{ user: MockUser, token: string }>}
 */
export async function loginWithFacebook(accessToken) {
  const response = await api.post("/auth/facebook", { accessToken });
  const authResponse = response.data.data;
  const mappedUser = {
    id: authResponse.user.id,
    fullName: authResponse.user.fullName,
    email: authResponse.user.email,
    avatarUrl: authResponse.user.avatarUrl || "https://i.pravatar.cc/100?img=12",
    role: authResponse.user.role === "ADMIN" ? "Admin" : "Người dùng",
    emailVerified: authResponse.user.status === "ACTIVE",
    emailVerifiedAt: new Date().toLocaleString(),
    messengerPlatform: null,
    messengerLinkedAt: null,
  };
  persistSession(mappedUser, authResponse.accessToken);
  return { user: mappedUser, token: authResponse.accessToken };
}
