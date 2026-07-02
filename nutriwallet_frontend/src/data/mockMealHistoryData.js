/**
 * Mapper functions cho meal history API response.
 * Mock data đã được xóa — dữ liệu thực lấy từ backend.
 */

const mealTypeMap = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snack",
  DRINK: "Drink",
};

function unwrapMealHistoryPayload(response) {
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
}

export function mapMealRecord(meal) {
  return {
    id: meal.id,
    mealName: meal.meal_name,
    description: meal.description,
    imageUrl: meal.image_url,
    mealType: mealTypeMap[meal.meal_type] ?? meal.meal_type,
    mealTime: meal.meal_time,
    mealDate: meal.meal_date,
    totalCalories: meal.nutrition?.calories ?? 0,
    proteinGram: meal.nutrition?.protein ?? 0,
    carbGram: meal.nutrition?.carbs ?? 0,
    fatGram: meal.nutrition?.fat ?? 0,
    aiStatus: meal.ai?.status ?? "UNKNOWN",
    modelName: meal.ai?.model ?? "N/A",
    source: meal.source || "WEB",
  };
}

export function mapMealHistoryResponse(response) {
  return unwrapMealHistoryPayload(response).map(mapMealRecord);
}

/** Empty fallback — hiển thị trạng thái trống khi API thất bại */
export const mealHistoryData = [];
