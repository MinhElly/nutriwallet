import { useMemo } from "react";
import { getBudgetData } from "../services/budget.service";

/**
 * useBudgetData — hook lấy dữ liệu ngân sách.
 *
 * Page không import mock trực tiếp.
 * Sau này service gọi API, hook không cần thay đổi.
 *
 * @returns {{ budget: ReturnType<typeof getBudgetData>["budget"], expenses: ReturnType<typeof getBudgetData>["expenses"] }}
 */
export function useBudgetData() {
  const { budget, expenses } = useMemo(() => getBudgetData(), []);

  return { budget, expenses };
}
