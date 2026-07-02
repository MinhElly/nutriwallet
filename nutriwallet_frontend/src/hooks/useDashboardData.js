import { useEffect, useState } from "react";
import {
  fetchDashboardData,
  getAiRecommendations,
  getDashboardData,
} from "../services/dashboard.service";

export function useDashboardData() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedPeriod, setSelectedPeriod] = useState("1 tháng qua");
  const [snapshot, setSnapshot] = useState(() =>
    getDashboardData(new Date(), "1 tháng qua"),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    fetchDashboardData(selectedDate, selectedPeriod)
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
  }, [selectedDate, selectedPeriod]);

  const [aiRecommendations, setAiRecommendations] = useState([]);

  useEffect(() => {
    getAiRecommendations().then((recs) => setAiRecommendations(recs));
  }, []);

  function updateSelectedDate(nextDate) {
    setLoading(true);
    setSelectedDate(nextDate);
  }

  function updateSelectedPeriod(nextPeriod) {
    setLoading(true);
    setSelectedPeriod(nextPeriod);
  }

  return {
    selectedDate,
    setSelectedDate: updateSelectedDate,
    selectedPeriod,
    setSelectedPeriod: updateSelectedPeriod,
    snapshot,
    aiRecommendations,
    loading,
    error,
  };
}
