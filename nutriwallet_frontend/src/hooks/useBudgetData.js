import { useCallback, useEffect, useState } from "react";
import { fetchBudgetData, getBudgetData } from "../services/budget.service";
import { createExpense } from "../services/expense.service";

export function useBudgetData() {
  const fallback = getBudgetData();
  const [budget, setBudget] = useState(() => fallback.budget);
  const [expenses, setExpenses] = useState(() => fallback.expenses);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    fetchBudgetData()
      .then((result) => {
        if (ignore) {
          return;
        }

        setBudget(result.data.budget);
        setExpenses(result.data.expenses);
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

  const addExpense = useCallback(async (payload) => {
    const nextExpense = await createExpense(payload);

    setExpenses((current) =>
      [...current, nextExpense].sort((firstItem, secondItem) =>
        secondItem.expenseDate.localeCompare(firstItem.expenseDate),
      ),
    );

    return nextExpense;
  }, []);

  return { budget, expenses, loading, error, addExpense };
}
