/**
 * Mock response mô phỏng payload backend.
 * Sau này chỉ cần thay bằng:
 *
 * const response = await axios.get("/api/meals/history");
 * const mealHistoryData = mapMealHistoryResponse(response.data);
 */

export const mealHistoryResponse = {
  success: true,
  message: "Get meal history successfully",
  data: [
    {
      id: 1,
      meal_name: "Phở bò",
      description: "Món phở bò truyền thống Việt Nam",
      image_url: "/salad-hero.png",
      meal_type: "BREAKFAST",
      meal_time: "08:30",
      meal_date: "2026-06-28",
      nutrition: {
        calories: 540,
        protein: 34,
        carbs: 48,
        fat: 18,
      },
      ai: {
        status: "COMPLETED",
        model: "GPT-4o",
      },
    },
    {
      id: 2,
      meal_name: "Bánh mì bơ",
      description: "Bánh mì ăn kèm bơ",
      image_url: "/salad-hero.png",
      meal_type: "LUNCH",
      meal_time: "12:45",
      meal_date: "2026-06-28",
      nutrition: {
        calories: 320,
        protein: 12,
        carbs: 30,
        fat: 15,
      },
      ai: {
        status: "COMPLETED",
        model: "GPT-4o",
      },
    },
    {
      id: 3,
      meal_name: "Bún bò Huế",
      description: "Bún bò Huế cay đậm đà",
      image_url: "/salad-hero.png",
      meal_type: "DINNER",
      meal_time: "19:15",
      meal_date: "2026-06-28",
      nutrition: {
        calories: 610,
        protein: 38,
        carbs: 50,
        fat: 20,
      },
      ai: {
        status: "COMPLETED",
        model: "GPT-4o",
      },
    },
    {
      id: 4,
      meal_name: "Yến mạch với trái cây",
      description: "Yến mạch ăn cùng trái cây",
      image_url: "/salad-hero.png",
      meal_type: "BREAKFAST",
      meal_time: "07:45",
      meal_date: "2026-06-28",
      nutrition: {
        calories: 280,
        protein: 10,
        carbs: 45,
        fat: 6,
      },
      ai: {
        status: "COMPLETED",
        model: "GPT-4o",
      },
    },
    {
      id: 5,
      meal_name: "Ức gà nướng",
      description: "Ức gà nướng ăn kèm rau củ",
      image_url: "/salad-hero.png",
      meal_type: "LUNCH",
      meal_time: "12:20",
      meal_date: "2026-06-28",
      nutrition: {
        calories: 450,
        protein: 42,
        carbs: 20,
        fat: 12,
      },
      ai: {
        status: "COMPLETED",
        model: "GPT-4o",
      },
    },
  ],
};

const mealTypeMap = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
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
  };
}

export function mapMealHistoryResponse(response) {
  return unwrapMealHistoryPayload(response).map(mapMealRecord);
}

export const mealHistoryData = mapMealHistoryResponse(mealHistoryResponse);
