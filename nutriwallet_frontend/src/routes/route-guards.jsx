import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * ProtectedRoute — chỉ cho phép truy cập nếu đã đăng nhập.
 * Nếu chưa, chuyển hướng về /login.
 *
 * Sau này backend xác thực token, chỉ cần thay logic trong AuthContext
 * mà không cần sửa component này.
 *
 * Dùng như sau trong router:
 *   { element: <ProtectedRoute />, children: [...] }
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const { pathname } = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect admin users to their dashboard
  if (currentUser?.rawRole === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const hasCompletedOnboarding = currentUser?.onboardingCompleted ?? localStorage.getItem("nw_onboarding_completed") === "true";
  
  if (!hasCompletedOnboarding && pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (hasCompletedOnboarding && pathname === "/onboarding") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

/**
 * PublicOnlyRoute — chỉ cho phép truy cập nếu CHƯA đăng nhập.
 * Nếu đã đăng nhập, chuyển hướng về /dashboard hoặc /admin/dashboard.
 *
 * Dùng cho các trang login, register.
 */
export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading, currentUser } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    if (currentUser?.rawRole === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    const hasCompletedOnboarding = currentUser?.onboardingCompleted ?? localStorage.getItem("nw_onboarding_completed") === "true";
    return <Navigate to={hasCompletedOnboarding ? "/dashboard" : "/onboarding"} replace />;
  }

  return <Outlet />;
}

/**
 * AdminRoute — chỉ cho phép truy cập nếu là ADMIN.
 * Nếu chưa, chuyển hướng về /login. Nếu là USER thông thường, chuyển hướng về /dashboard.
 */
export function AdminRoute() {
  const { isAuthenticated, isLoading, currentUser } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser?.rawRole !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
