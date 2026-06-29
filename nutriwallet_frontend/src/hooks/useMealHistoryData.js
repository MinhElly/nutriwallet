import { useMemo } from "react";
import { getMealHistory } from "../services/meal.service";

/**
 * useMealHistoryData — hook lấy dữ liệu lịch sử bữa ăn.
 *
 * Page/component không import mock trực tiếp.
 * Sau này service gọi API, hook không cần thay đổi.
 *
 * @returns {{ meals: ReturnType<typeof getMealHistory> }}
 */
export function useMealHistoryData() {
  const meals = useMemo(() => getMealHistory(), []);

  return { meals };
}
