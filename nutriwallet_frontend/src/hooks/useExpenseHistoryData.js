import { useMemo } from "react";
import { getExpenseHistory } from "../services/expense.service";

/**
 * useExpenseHistoryData — hook lấy dữ liệu lịch sử chi tiêu.
 *
 * Page không import mock trực tiếp.
 * Sau này service gọi API, hook không cần thay đổi.
 *
 * @returns {{
 *   expenses: ReturnType<typeof getExpenseHistory>["expenses"],
 *   categoryLabelMap: ReturnType<typeof getExpenseHistory>["categoryLabelMap"],
 * }}
 */
export function useExpenseHistoryData() {
  const { expenses, categoryLabelMap } = useMemo(
    () => getExpenseHistory(),
    [],
  );

  return { expenses, categoryLabelMap };
}
