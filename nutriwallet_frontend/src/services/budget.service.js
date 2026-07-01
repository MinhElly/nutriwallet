import api, { createApiError, extractApiMessage, unwrapApiData } from "./api";
import { fetchExpenseHistory, getExpenseHistory } from "./expense.service";
import { budgetData as fallbackBudgetData } from "../data/mockBudgetDta";

function getFallbackBudgetData() {
  return {
    budget: {
      ...fallbackBudgetData.budget,
    },
    expenses: [...fallbackBudgetData.expenses],
  };
}

function isExpenseWithinBudget(expense, budget) {
  return (
    expense.expenseDate >= budget.startDate && expense.expenseDate <= budget.endDate
  );
}

function mapBudgetRecord(budget, expenses) {
  const relatedExpenses = expenses.filter((expense) =>
    isExpenseWithinBudget(expense, {
      startDate: String(budget.startDate).slice(0, 10),
      endDate: String(budget.endDate).slice(0, 10),
    }),
  );
  const amount = Number(budget.amount ?? 0);
  const spentAmount = relatedExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount ?? 0),
    0,
  );
  const remainingAmount = Math.max(amount - spentAmount, 0);
  const usagePercent = amount > 0 ? Math.round((spentAmount / amount) * 100) : 0;

  return {
    id: budget.id,
    amount,
    spentAmount,
    remainingAmount,
    usagePercent,
    period: budget.period,
    startDate: String(budget.startDate).slice(0, 10),
    endDate: String(budget.endDate).slice(0, 10),
    warningThresholdPercent: budget.warningThresholdPercent ?? 80,
    currency: relatedExpenses[0]?.currency ?? "VND",
    active: budget.active ?? true,
  };
}

export function getBudgetData() {
  return getFallbackBudgetData();
}

export async function fetchBudgetData() {
  const fallback = getBudgetData();

  try {
    const [budgetResponse, expenseResult] = await Promise.all([
      api.get("/api/budgets/current"),
      fetchExpenseHistory(),
    ]);
    const budget = unwrapApiData(budgetResponse);
    const expenses = expenseResult.data?.expenses ?? getExpenseHistory().expenses;

    return {
      data: {
        budget: mapBudgetRecord(budget, expenses),
        expenses,
      },
      error: expenseResult.error,
    };
  } catch (error) {
    return {
      data: fallback,
      error: extractApiMessage(
        error,
        "Không thể tải ngân sách. Đang dùng dữ liệu mẫu.",
      ),
    };
  }
}

export async function createBudget(payload) {
  try {
    return unwrapApiData(await api.post("/api/budgets", payload));
  } catch (error) {
    throw createApiError(error, "Không thể tạo ngân sách.");
  }
}

export async function updateBudget(id, payload) {
  try {
    return unwrapApiData(await api.patch(`/api/budgets/${id}`, payload));
  } catch (error) {
    throw createApiError(error, "Không thể cập nhật ngân sách.");
  }
}
