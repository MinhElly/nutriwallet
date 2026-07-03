import api, { createApiError, extractApiMessage, unwrapApiData } from "./api";

function formatMealDate(value) {
  if (!value) {
    return "";
  }

  if (value.includes("T")) {
    return value.slice(0, 10);
  }

  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return String(value).slice(0, 10);
  }
}

function formatMealTime(value) {
  if (!value) {
    return "";
  }

  if (value.includes("T")) {
    return value.slice(11, 16);
  }

  try {
    return new Date(value).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function inferMealType(mealTime) {
  let hour = 12;

  if (mealTime && mealTime.includes("T")) {
    hour = parseInt(mealTime.slice(11, 13), 10);
  } else if (mealTime) {
    try {
      hour = new Date(mealTime).getHours();
    } catch {
      hour = 12;
    }
  }

  if (hour < 11) {
    return "Breakfast";
  }

  if (hour < 16) {
    return "Lunch";
  }

  return "Dinner";
}

export function mapMealRecord(meal) {
  return {
    id: meal.id,
    mealName: meal.mealName ?? "Bữa ăn",
    description: meal.description ?? "Chưa có mô tả",
    imageUrl: meal.imageUrl || "/salad-hero.png",
    mealType: inferMealType(meal.mealTime),
    mealTime: formatMealTime(meal.mealTime),
    mealDate: formatMealDate(meal.mealTime),
    totalCalories: Number(meal.totalCalories ?? 0),
    proteinGram: Number(meal.proteinGram ?? 0),
    carbGram: Number(meal.carbGram ?? 0),
    fatGram: Number(meal.fatGram ?? 0),
    aiStatus: meal.aiEstimated ? "ESTIMATED" : "COMPLETED",
    modelName: meal.aiEstimated ? "AI Estimate" : "NutriWallet",
    source: meal.source || "WEB",
  };
}

export function getMealHistory() {
  return [];
}

export async function fetchMealHistory() {
  try {
    const meals = unwrapApiData(await api.get("/api/meals"));

    return {
      data: Array.isArray(meals) ? meals.map(mapMealRecord) : [],
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error: extractApiMessage(error, "Không thể tải lịch sử bữa ăn."),
    };
  }
}

export async function createMeal(payload) {
  try {
    const meal = unwrapApiData(await api.post("/api/meals", payload));
    return mapMealRecord(meal);
  } catch (error) {
    throw createApiError(error, "Không thể tạo bữa ăn.");
  }
}

export async function updateMeal(id, payload) {
  try {
    const meal = unwrapApiData(await api.patch(`/api/meals/${id}`, payload));
    return mapMealRecord(meal);
  } catch (error) {
    throw createApiError(error, "Không thể cập nhật bữa ăn.");
  }
}

export async function deleteMeal(id) {
  try {
    await api.delete(`/api/meals/${id}`);
  } catch (error) {
    throw createApiError(error, "Không thể xóa bữa ăn.");
  }
}
