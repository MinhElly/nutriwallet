import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import BudgetPage from "../pages/budget/BudgetPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ExpenseHistoryPage from "../pages/expense/ExpenseHistoryPage";
import MealHistoryPage from "../pages/meal/MealHistoryPage";
import ProfilePage from "../pages/profile/ProfilePage";
import ScanMealPage from "../pages/scanMeal/ScanMealPage";
import SettingsPage from "../pages/settings/SettingsPage";
import { ProtectedRoute, PublicOnlyRoute } from "./route-guards";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
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

  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

