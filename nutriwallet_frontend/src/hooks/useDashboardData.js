import { useEffect, useState } from "react";
import {
  fetchDashboardData,
  getAiRecommendations,
  getDashboardData,
} from "../services/dashboard.service";

export function useDashboardData() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedPeriod, setSelectedPeriod] = useState("Tháng này");
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [snapshot, setSnapshot] = useState(() =>
    getDashboardData(new Date(), "Tháng này"),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    if (selectedPeriod === "Tùy chọn" && (!customStartDate || !customEndDate)) {
      setLoading(false);
      return;
    }

    fetchDashboardData(selectedDate, selectedPeriod, customStartDate, customEndDate)
      .then((result) => {
        if (ignore) {
          return;
        }

        setSnapshot(result.data);
        setError(result.error ?? "");
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [selectedDate, selectedPeriod, customStartDate, customEndDate]);

  const [aiRecommendations, setAiRecommendations] = useState([]);

  useEffect(() => {
    getAiRecommendations().then((recs) => setAiRecommendations(recs));
  }, []);

  function updateSelectedDate(nextDate) {
    setLoading(true);
    setSelectedDate(nextDate);
  }

  function updateSelectedPeriod(nextPeriod) {
    if (nextPeriod === "Tùy chọn" && (!customStartDate || !customEndDate)) {
      setSelectedPeriod(nextPeriod);
      setLoading(false);
    } else {
      setLoading(true);
      setSelectedPeriod(nextPeriod);
    }
  }

  function updateCustomRange(start, end) {
    setLoading(true);
    setCustomStartDate(start);
    setCustomEndDate(end);
    setSelectedPeriod("Tùy chọn");
  }

  return {
    selectedDate,
    setSelectedDate: updateSelectedDate,
    selectedPeriod,
    setSelectedPeriod: updateSelectedPeriod,
    customStartDate,
    customEndDate,
    setCustomRange: updateCustomRange,
    snapshot,
    aiRecommendations,
    loading,
    error,
  };
}
