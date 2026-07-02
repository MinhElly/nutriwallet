import { useCallback, useEffect, useState } from "react";
import { fetchBudgetData, getBudgetData, createBudget, updateBudget } from "../services/budget.service";
import { createExpense } from "../services/expense.service";

export function useBudgetData() {
  const fallback = getBudgetData();
  const [budget, setBudget] = useState(() => fallback.budget);
  const [expenses, setExpenses] = useState(() => fallback.expenses);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshBudget = useCallback(async () => {
    try {
      const result = await fetchBudgetData();
      setBudget(result.data.budget);
      setExpenses(result.data.expenses);
      setError(result.error ?? "");
    } catch (err) {
      console.error(err);
    }
  }, []);

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

    // Refresh budget numbers after adding expense
    await refreshBudget();

    return nextExpense;
  }, [refreshBudget]);

  const updateBudgetData = useCallback(async (payload) => {
    let nextBudget;
    if (budget && budget.id !== 0) {
      nextBudget = await updateBudget(budget.id, payload);
    } else {
      nextBudget = await createBudget(payload);
    }
    await refreshBudget();
    return nextBudget;
  }, [budget, refreshBudget]);

  return { budget, expenses, loading, error, addExpense, updateBudgetData };
}
