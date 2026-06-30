/**
 * meal.service.js
 *
 * Tầng service cho dữ liệu lịch sử bữa ăn.
 * Hiện tại trả về mock data — không gọi API.
 *
 * Sau này thay bằng:
 *   const response = await axios.get(`${API_BASE_URL}/meals/history`);
 *   return mapMealHistoryResponse(response.data);
 */

import { mealHistoryData } from "../data/mockMealHistoryData";

/**
 * Lấy danh sách lịch sử bữa ăn.
 *
 * @returns {typeof mealHistoryData}
 */
export function getMealHistory() {
  return mealHistoryData;
}
