import api, { unwrapApiData } from "./api";

/**
 * Lấy dữ liệu cài đặt người dùng từ API backend.
 */
export async function getUserSettings() {
  const userSettings = unwrapApiData(await api.get("/api/settings/user"));
  const currentUser = unwrapApiData(await api.get("/api/users/me"));

  return {
    ...userSettings,
    display_name: currentUser.fullName,
  };
}

/**
 * Lưu cài đặt mới lên API backend.
 *
 * @param {Record<string, unknown>} settings
 */
export async function saveUserSettings(settings) {
  // Cập nhật tên hiển thị nếu có thay đổi
  if (settings.display_name !== undefined) {
    await api.patch("/api/users/me", { fullName: settings.display_name });
  }

  // Chuẩn hóa dữ liệu cập nhật
  const payload = {
    gender: settings.gender || null,
    weight: settings.weight ? parseFloat(settings.weight) : null,
    height: settings.height ? parseFloat(settings.height) : null,
    goal: settings.goal || null,
    age: settings.age ? parseInt(settings.age, 10) : null,
    diet: settings.diet || null,
    activityLevel: settings.activityLevel || null,
    monthlyBudget: settings.monthlyBudget ? parseFloat(settings.monthlyBudget) : null,
    language: settings.language || "vi",
    emailAnalysisReady: settings.email_analysis_ready !== undefined ? settings.email_analysis_ready : true,
    budgetWarningPush: settings.budget_warning_push !== undefined ? settings.budget_warning_push : true,
    autoCreateExpense: settings.auto_create_expense !== undefined ? settings.auto_create_expense : false,
    theme: settings.theme || "light",
  };

  return unwrapApiData(await api.patch("/api/settings/user", payload));
}
