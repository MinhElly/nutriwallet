/**
 * dashboard.service.js
 *
 * Tầng service cho dữ liệu dashboard.
 * Hiện tại trả về mock data — không gọi API.
 *
 * Sau này thay bằng:
 *   const response = await axios.get(`${API_BASE_URL}/dashboard`, { params: { date, period } });
 *   return mapDashboardResponse(response.data);
 */

import { getDashboardSnapshot, aiRecommendations } from "../data/dashboardData";

/**
 * Lấy snapshot dữ liệu dashboard theo ngày và kỳ được chọn.
 *
 * @param {Date} selectedDate
 * @param {string} selectedPeriod
 * @returns {ReturnType<typeof getDashboardSnapshot>}
 */
export function getDashboardData(selectedDate, selectedPeriod) {
  return getDashboardSnapshot(selectedDate, selectedPeriod);
}

/**
 * Lấy danh sách gợi ý AI.
 *
 * @returns {typeof aiRecommendations}
 */
export function getAiRecommendations() {
  return aiRecommendations;
}
