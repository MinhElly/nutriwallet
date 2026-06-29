import { useMemo, useState } from "react";
import {
  getDashboardData,
  getAiRecommendations,
} from "../services/dashboard.service";

/**
 * useDashboardData — hook quản lý toàn bộ dữ liệu dashboard.
 *
 * Page chỉ cần dùng hook này — không import mock trực tiếp.
 * Sau này service sẽ gọi API, hook không cần thay đổi.
 *
 * @returns {{
 *   selectedDate: Date,
 *   setSelectedDate: (date: Date) => void,
 *   selectedPeriod: string,
 *   setSelectedPeriod: (period: string) => void,
 *   snapshot: ReturnType<typeof getDashboardData>,
 *   aiRecommendations: ReturnType<typeof getAiRecommendations>,
 * }}
 */
export function useDashboardData() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedPeriod, setSelectedPeriod] = useState("1 tháng qua");

  const snapshot = useMemo(
    () => getDashboardData(selectedDate, selectedPeriod),
    [selectedDate, selectedPeriod],
  );

  const aiRecommendations = useMemo(() => getAiRecommendations(), []);

  return {
    selectedDate,
    setSelectedDate,
    selectedPeriod,
    setSelectedPeriod,
    snapshot,
    aiRecommendations,
  };
}
