import { useState, useEffect, useCallback } from "react";
import { getUserSettings, saveUserSettings } from "../services/settings.service";

/**
 * Custom hook quản lý trạng thái lấy/lưu cài đặt người dùng qua API.
 */
export function useSettingsData() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserSettings();
      const mapped = {
        gender: data.gender || "",
        weight: data.weight || "",
        height: data.height || "",
        goal: data.goal || "",
        age: data.age || "",
        diet: data.diet || "",
        activityLevel: data.activityLevel || "SEDENTARY",
        monthlyBudget: data.monthlyBudget || 0,
        display_name: data.display_name || "",
        language: data.language || "vi",
        email_analysis_ready: data.emailAnalysisReady !== false,
        budget_warning_push: data.budgetWarningPush !== false,
        auto_create_expense: data.autoCreateExpense === true,
        theme: data.theme || "light",
      };
      setSettings(mapped);
      setError(null);
    } catch (err) {
      setError(err.message || "Không thể tải cài đặt");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSettings();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSettings]);

  const saveSettings = useCallback(async (state) => {
    try {
      setLoading(true);
      await saveUserSettings(state);
      setSettings(state);
      setError(null);
      return { success: true };
    } catch (err) {
      setError(err.message || "Không thể lưu cài đặt");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { settings, loading, error, saveSettings, refetch: fetchSettings };
}
