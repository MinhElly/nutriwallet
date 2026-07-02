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
