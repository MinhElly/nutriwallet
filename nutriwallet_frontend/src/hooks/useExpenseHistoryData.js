import { useEffect, useState, useCallback } from "react";
import {
  fetchExpenseHistory,
  getExpenseHistory,
  createExpense as createExpenseApi,
  updateExpense as updateExpenseApi,
  deleteExpense as deleteExpenseApi,
} from "../services/expense.service";

export function useExpenseHistoryData() {
  const fallback = getExpenseHistory();
  const [expenses, setExpenses] = useState(() => fallback.expenses);
  const [categoryLabelMap, setCategoryLabelMap] = useState(
    () => fallback.categoryLabelMap,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchExpenseHistory();
      setExpenses(result.data.expenses);
      setCategoryLabelMap(result.data.categoryLabelMap);
      setError(result.error ?? "");
    } catch (err) {
      setError("Không thể tải chi tiêu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const addExpense = useCallback(async (payload) => {
    const nextExpense = await createExpenseApi(payload);
    setExpenses((current) =>
      [nextExpense, ...current].sort((a, b) => b.expenseDate.localeCompare(a.expenseDate))
    );
    return nextExpense;
  }, []);

  const updateExpense = useCallback(async (id, payload) => {
    const updated = await updateExpenseApi(id, payload);
    setExpenses((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    return updated;
  }, []);

  const deleteExpense = useCallback(async (id) => {
    await deleteExpenseApi(id);
    setExpenses((current) => current.filter((item) => item.id !== id));
  }, []);

  return {
    expenses,
    categoryLabelMap,
    loading,
    error,
    refetch: loadExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
