import { useEffect, useState } from "react";
import { fetchMealHistory, getMealHistory } from "../services/meal.service";

export function useMealHistoryData() {
  const [meals, setMeals] = useState(() => getMealHistory());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    fetchMealHistory()
      .then((result) => {
        if (ignore) {
          return;
        }

        setMeals(result.data);
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

  return { meals, loading, error };
}
