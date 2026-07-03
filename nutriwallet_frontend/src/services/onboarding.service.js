import api, { unwrapApiData } from "./api";

/**
 * Gửi dữ liệu onboarding lên backend
 * @param {Object} data Dữ liệu từ form onboarding
 * @returns {Promise<Object>} Thông tin user/profile mới nhất
 */
export async function saveOnboarding(data) {
  const genderMap = {
    "Nam": "MALE",
    "Nữ": "FEMALE",
    "Khác": "OTHER"
  };
  const activityMap = {
    "sedentary": "SEDENTARY",
    "light": "LIGHTLY_ACTIVE",
    "moderate": "MODERATELY_ACTIVE",
    "active": "VERY_ACTIVE"
  };

  let monthlyBudget = 0;
  if (data.budget === "saving") monthlyBudget = 30000 * 30;
  else if (data.budget === "normal") monthlyBudget = 75000 * 30;
  else if (data.budget === "comfortable") monthlyBudget = 150000 * 30;
  else if (data.budget === "premium") monthlyBudget = 300000 * 30;
  else if (data.budget === "custom" && data.customBudgetRaw) {
    monthlyBudget = parseFloat(data.customBudgetRaw) * 30;
  }

  const goalStr = Array.isArray(data.selectedGoals) ? data.selectedGoals.join(",") : "";

  const payload = {
    gender: genderMap[data.gender] || data.gender || null,
    weight: data.weight ? parseFloat(data.weight) : null,
    height: data.height ? parseFloat(data.height) : null,
    goal: goalStr || null,
    age: data.age ? parseInt(data.age, 10) : null,
    diet: data.diet || null,
    activityLevel: activityMap[data.activity] || data.activity || null,
    monthlyBudget: monthlyBudget,
    language: "vi",
    emailAnalysisReady: data.selectedNotifs?.includes("ai_suggest") ?? true,
    budgetWarningPush: data.selectedNotifs?.includes("budget_alert") ?? true,
    autoCreateExpense: data.selectedNotifs?.includes("meal_reminder") ?? false,
    theme: "light",
  };

  const response = await api.patch("/api/settings/user", payload);
  const userSettings = unwrapApiData(response);

  return {
    success: true,
    message: "Lưu thông tin thành công",
    user: {
      ...userSettings,
      onboardingCompleted: true,
    }
  };
}
