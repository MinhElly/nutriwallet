import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import LandingPage from "../components/LandingPage/LandingPage";
import BudgetPage from "../pages/budget/BudgetPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ExpenseHistoryPage from "../pages/expense/ExpenseHistoryPage";
import MealHistoryPage from "../pages/meal/MealHistoryPage";
import ProfilePage from "../pages/profile/ProfilePage";
import ScanMealPage from "../pages/scanMeal/ScanMealPage";
import SettingsPage from "../pages/settings/SettingsPage";
import OnboardingPage from "../pages/onboarding/OnboardingPage";
import { ProtectedRoute, PublicOnlyRoute, AdminRoute } from "./route-guards";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },

  // Trang công khai — chỉ truy cập khi chưa đăng nhập
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/forgot-password",
        element: <Navigate to="/login" replace />,
      },
      {
        path: "/reset-password",
        element: <Navigate to="/login" replace />,
      },
    ],
  },

  // Trang bảo vệ — yêu cầu đăng nhập
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/onboarding",
        element: <OnboardingPage />,
      },
      {
        path: "/meal-history",
        element: <MealHistoryPage />,
      },
      {
        path: "/scan-meal",
        element: <ScanMealPage />,
      },
      {
        path: "/budget",
        element: <BudgetPage />,
      },
      {
        path: "/expense-history",
        element: <ExpenseHistoryPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      
    ],
  },

  // Trang admin — yêu cầu quyền ADMIN
  {
    element: <AdminRoute />,
    children: [
      {
        path: "/admin/dashboard",
        element: <AdminDashboardPage />,
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

