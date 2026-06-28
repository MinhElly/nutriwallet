import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ScanMealPage from "../pages/scanMeal/ScanMealPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
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
    path: "/scan-meal",
    element: <ScanMealPage />,
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
