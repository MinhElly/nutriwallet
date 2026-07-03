import api, { createApiError, unwrapApiData } from "./api";

/**
 * Fetch all failed AI analysis logs (System errors)
 * Required Role: ADMIN
 */
export async function fetchAiFailedLogs() {
  try {
    const response = await api.get("/api/ai/logs/errors");
    return unwrapApiData(response);
  } catch (error) {
    throw createApiError(error, "Không thể lấy danh sách lỗi hệ thống AI.");
  }
}

/**
 * Fetch all AI error reports (user reported + system auto-logged reports)
 * Required Role: ADMIN
 */
export async function fetchAiErrorReports() {
  try {
    const response = await api.get("/api/ai/error-reports");
    return unwrapApiData(response);
  } catch (error) {
    throw createApiError(error, "Không thể lấy danh sách báo cáo lỗi AI.");
  }
}

/**
 * Submit a new AI error report (from scan meal or chatbot)
 * Required Role: Authenticated User
 */
export async function submitAiErrorReport(payload) {
  try {
    const response = await api.post("/api/ai/error-reports", payload);
    return unwrapApiData(response);
  } catch (error) {
    throw createApiError(error, "Không thể gửi báo cáo lỗi AI.");
  }
}

/**
 * Update the status of an AI error report
 * Required Role: ADMIN
 */
export async function updateAiErrorReportStatus(id, status) {
  try {
    const response = await api.patch(`/api/ai/error-reports/${id}/status`, { status });
    return unwrapApiData(response);
  } catch (error) {
    throw createApiError(error, "Không thể cập nhật trạng thái lỗi AI.");
  }
}

/**
 * Fetch stats for the AI Console
 * Required Role: ADMIN
 */
export async function fetchAiConsoleStats() {
  try {
    const response = await api.get("/api/ai/console/stats");
    return unwrapApiData(response);
  } catch (error) {
    throw createApiError(error, "Không thể lấy số liệu thống kê AI.");
  }
}

/**
 * Fetch daily performance (volume, accuracy) for the last 7 days
 * Required Role: ADMIN
 */
export async function fetchAiConsolePerformance() {
  try {
    const response = await api.get("/api/ai/console/performance");
    return unwrapApiData(response);
  } catch (error) {
    throw createApiError(error, "Không thể lấy dữ liệu hiệu suất AI.");
  }
}

/**
 * Fetch successful logs for review
 * Required Role: ADMIN
 */
export async function fetchAiConsoleLogs() {
  try {
    const response = await api.get("/api/ai/console/logs");
    return unwrapApiData(response);
  } catch (error) {
    throw createApiError(error, "Không thể lấy nhật ký nhận diện AI.");
  }
}

/**
 * Evaluate a successful log (CORRECT, INCORRECT, RETRAIN)
 * Required Role: ADMIN
 */
export async function updateAiLogEvaluation(id, evaluationStatus) {
  try {
    const response = await api.patch(`/api/ai/console/logs/${id}/evaluation`, { evaluationStatus });
    return unwrapApiData(response);
  } catch (error) {
    throw createApiError(error, "Không thể cập nhật đánh giá log AI.");
  }
}

/**
 * Trigger retraining of model (mock GPU session)
 * Required Role: ADMIN
 */
export async function triggerModelRetrain() {
  try {
    const response = await api.post("/api/ai/console/retrain");
    return unwrapApiData(response);
  } catch (error) {
    throw createApiError(error, "Không thể kích hoạt huấn luyện lại mô hình.");
  }
}
