/**
 * expense.service.js
 *
 * Tầng service cho dữ liệu lịch sử chi tiêu.
 * Hiện tại trả về mock data — không gọi API.
 *
 * Sau này thay bằng:
 *   const response = await axios.get(`${API_BASE_URL}/expenses`);
 *   return mapExpenseHistoryResponse(response.data);
 */

import {
  expenseHistoryData,
  expenseCategoryLabelMap,
} from "../data/accountData";

/**
 * Lấy danh sách lịch sử chi tiêu.
 *
 * @returns {{ expenses: typeof expenseHistoryData, categoryLabelMap: typeof expenseCategoryLabelMap }}
 */
export function getExpenseHistory() {
  return {
    expenses: expenseHistoryData,
    categoryLabelMap: expenseCategoryLabelMap,
  };
}
