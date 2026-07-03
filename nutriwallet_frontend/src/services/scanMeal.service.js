import api, { createApiError, unwrapApiData } from "./api";
import { createMeal } from "./meal.service";
import { uploadImage } from "./storage.service";
import { createExpense } from "./expense.service";

const ANALYSIS_POLL_INTERVAL_MS = 1500;
const ANALYSIS_TIMEOUT_MS = 25000;

function delay(timeoutMs) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, timeoutMs);
  });
}

function formatDateTime(value) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toSafeNumber(value) {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function humanizeAnalysisStatus(status) {
  switch (status) {
    case "SUCCESS":
      return "Hoàn tất";
    case "FAILED":
      return "Thất bại";
    case "PROCESSING":
      return "Đang xử lý";
    case "PENDING":
    default:
      return "Đang chờ";
  }
}

function buildAnalysisMessage(analysis) {
  if (analysis?.status === "SUCCESS") {
    return "AI đã hoàn tất phân tích dinh dưỡng cho ảnh này.";
  }

  if (analysis?.status === "FAILED") {
    return analysis.message || "AI chưa thể phân tích ảnh này.";
  }

  return analysis?.message || "AI đang xử lý ảnh. Bạn vẫn có thể chỉnh sửa thủ công.";
}

function mapMealAnalysis(analysis, imageUrl) {
  return {
    analysisLogId: analysis?.analysisLogId ?? null,
    foodName: analysis?.foodName?.trim() || "Bữa ăn mới",
    imageUrl,
    mealType: analysis?.mealType ?? null,
    nutrition: {
      calories: toSafeNumber(analysis?.calories),
      protein: toSafeNumber(analysis?.proteinGram),
      carbs: toSafeNumber(analysis?.carbGram),
      fat: toSafeNumber(analysis?.fatGram),
    },
    estimatedPrice: toSafeNumber(analysis?.estimatedPriceVnd),
    currency: "VND",
    savedMealId: null,
    ai: {
      model: analysis?.modelName || "NutriWallet AI",
      inputType: "Image",
      status: humanizeAnalysisStatus(analysis?.status),
      statusCode: analysis?.status ?? "PENDING",
      confidence: analysis?.confidence ?? null,
      source: analysis?.source ?? null,
      message: buildAnalysisMessage(analysis),
      createdAt: formatDateTime(new Date()),
    },
  };
}

async function pollMealAnalysis(analysisLogId) {
  const startedAt = Date.now();
  let latestAnalysis = null;

  while (Date.now() - startedAt < ANALYSIS_TIMEOUT_MS) {
    await delay(ANALYSIS_POLL_INTERVAL_MS);

    latestAnalysis = unwrapApiData(
      await api.get(`/api/ai/analyses/${analysisLogId}`),
    );

    if (
      latestAnalysis?.status === "SUCCESS" ||
      latestAnalysis?.status === "FAILED"
    ) {
      return latestAnalysis;
    }
  }

  return latestAnalysis;
}

function buildMealDescription(result) {
  const sourceLabel = result.ai?.source
    ? `Nguồn: ${result.ai.source}. `
    : "";
  const statusLabel = result.ai?.status
    ? `Trạng thái AI: ${result.ai.status}.`
    : "";

  return `${sourceLabel}${statusLabel}`.trim() || "Bữa ăn được lưu từ ảnh tải lên.";
}

export async function analyzeMealImage(file) {
  try {
    const uploadedImage = await uploadImage(file);
    let analysis = unwrapApiData(
      await api.post("/api/ai/analyze-meal", {
        imageUrl: uploadedImage.url,
      }),
    );

    if (
      analysis?.analysisLogId &&
      analysis.status !== "SUCCESS" &&
      analysis.status !== "FAILED"
    ) {
      analysis = (await pollMealAnalysis(analysis.analysisLogId)) ?? analysis;
    }

    if (analysis?.status === "FAILED") {
      throw createApiError(
        { response: { data: { message: analysis.message } } },
        "Không thể phân tích ảnh bữa ăn.",
      );
    }

    return mapMealAnalysis(analysis, uploadedImage.url);
  } catch (error) {
    throw createApiError(error, "Không thể phân tích ảnh bữa ăn.");
  }
}

function getLocalIsoString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function getLocalDateFormat(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function saveAnalyzedMeal(result) {
  try {
    const savedMeal = await createMeal({
      mealName: result.foodName?.trim() || "Bữa ăn mới",
      description: buildMealDescription(result),
      imageUrl: result.imageUrl,
      mealTime: getLocalIsoString(),
      totalCalories: toSafeNumber(result.nutrition?.calories),
      proteinGram: toSafeNumber(result.nutrition?.protein),
      carbGram: toSafeNumber(result.nutrition?.carbs),
      fatGram: toSafeNumber(result.nutrition?.fat),
      aiEstimated: true,
      confirmedByUser: true,
    });

    const validCategories = new Set(["BREAKFAST", "LUNCH", "DINNER", "SNACK", "DRINK", "OTHER"]);
    let category = (result.mealType && validCategories.has(result.mealType.toUpperCase())) ? result.mealType.toUpperCase() : null;

    if (!category) {
      const hour = new Date().getHours();
      if (hour < 11) {
        category = "BREAKFAST";
      } else if (hour < 16) {
        category = "LUNCH";
      } else if (hour < 21) {
        category = "DINNER";
      } else {
        category = "OTHER";
      }
    }

    try {
      await createExpense({
        mealRecordId: savedMeal.id,
        amount: toSafeNumber(result.estimatedPrice),
        currency: result.currency || "VND",
        category,
        expenseDate: getLocalDateFormat(),
        note: `Tự động tạo từ quét bữa ăn: ${savedMeal.mealName}`,
      });
    } catch (expError) {
      console.error("Failed to automatically record expense:", expError);
    }

    return savedMeal;
  } catch (error) {
    throw createApiError(error, "Không thể lưu bữa ăn.");
  }
}
