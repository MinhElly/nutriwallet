import { useEffect, useState } from "react";
import {
  fetchExpenseHistory,
  getExpenseHistory,
} from "../services/expense.service";

export function useExpenseHistoryData() {
  const fallback = getExpenseHistory();
  const [expenses, setExpenses] = useState(() => fallback.expenses);
  const [categoryLabelMap, setCategoryLabelMap] = useState(
    () => fallback.categoryLabelMap,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    fetchExpenseHistory()
      .then((result) => {
        if (ignore) {
          return;
        }

        setExpenses(result.data.expenses);
        setCategoryLabelMap(result.data.categoryLabelMap);
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
  }, []);

  return { expenses, categoryLabelMap, loading, error };
}
