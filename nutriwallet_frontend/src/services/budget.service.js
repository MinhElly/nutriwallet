/**
 * budget.service.js
 *
 * Tầng service cho dữ liệu ngân sách.
 * Hiện tại trả về mock data — không gọi API.
 *
 * Sau này thay bằng:
 *   const response = await axios.get(`${API_BASE_URL}/budget`);
 *   return mapBudgetResponse(response.data);
 */

import { budgetData } from "../data/mockBudgetDta";

/**
 * Lấy dữ liệu ngân sách hiện tại.
 *
 * @returns {typeof budgetData}
 */
export function getBudgetData() {
  return budgetData;
}
