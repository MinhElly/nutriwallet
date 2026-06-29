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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
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
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
