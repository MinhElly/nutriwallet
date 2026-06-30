import { useContext } from "react";
import { AuthContext } from "../context/auth-context";

/**
 * useAuth — hook để đọc AuthContext.
 *
 * Theo cùng pattern với useTheme.js để nhất quán.
 * Các component không truy cập AuthContext trực tiếp.
 *
 * @returns {{ currentUser, accessToken, isAuthenticated, isLoading, login, register, logout, replaceUser }}
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
