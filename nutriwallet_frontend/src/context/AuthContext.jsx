import { useState, useCallback } from "react";
import { AuthContext } from "./auth-context";
import {
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  readSession,
  loginWithGoogle as authLoginWithGoogle,
  loginWithFacebook as authLoginWithFacebook,
} from "../services/auth.service";

/**
 * AuthProvider — cung cấp trạng thái xác thực cho toàn bộ ứng dụng.
 *
 * Hiện tại dùng mock session (sessionStorage).
 * Sau này chỉ cần thay service calls để gọi API thật.
 *
 * Context value:
 *   - currentUser: thông tin người dùng đang đăng nhập (hoặc null)
 *   - accessToken: JWT token (hoặc null)
 *   - isAuthenticated: boolean
 *   - isLoading: boolean (dành cho async sau này)
 *   - login(credentials): đăng nhập
 *   - register(data): đăng ký
 *   - logout(): đăng xuất
 *   - replaceUser(user): cập nhật thông tin user (dùng sau khi edit profile)
 */
export function AuthProvider({ children }) {
  const [session] = useState(() => readSession());

  const [currentUser, setCurrentUser] = useState(
    () => session?.user ?? null,
  );
  const [accessToken, setAccessToken] = useState(
    () => session?.token ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = currentUser !== null && accessToken !== null;

  const login = useCallback((credentials) => {
    setIsLoading(true);
    try {
      const result = authLogin(credentials);
      setCurrentUser(result.user);
      setAccessToken(result.token);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    setIsLoading(true);
    try {
      const result = await authLoginWithGoogle(idToken);
      setCurrentUser(result.user);
      setAccessToken(result.token);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithFacebook = useCallback(async (accessToken) => {
    setIsLoading(true);
    try {
      const result = await authLoginWithFacebook(accessToken);
      setCurrentUser(result.user);
      setAccessToken(result.token);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback((data) => {
    setIsLoading(true);
    try {
      const result = authRegister(data);
      setCurrentUser(result.user);
      setAccessToken(result.token);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setCurrentUser(null);
    setAccessToken(null);
  }, []);

  const replaceUser = useCallback((user) => {
    setCurrentUser(user);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        accessToken,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        replaceUser,
        loginWithGoogle,
        loginWithFacebook,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
