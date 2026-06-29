export const mockAnalysisResult = {
  id: 1,
  foodName: "Bún Bò Huế",
  imageUrl:
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&h=600&fit=crop",

  nutrition: {
    calories: 540,
    protein: 34,
    carbs: 48,
    fat: 18,
  },

  estimatedPrice: 45000,
  currency: "VND",

  ai: {
    model: "GPT-4o",
    inputType: "Image",
    status: "Completed",
    confidence: 98,
    createdAt: "24/05/2024 08:31 AM",
  },
};
