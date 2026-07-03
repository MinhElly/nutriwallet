import api, { createApiError, extractApiMessage, unwrapApiData } from "./api";
import { fetchExpenseHistory, getExpenseHistory } from "./expense.service";

function getEmptyBudget() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    id: 0,
    amount: 0,
    spentAmount: 0,
    remainingAmount: 0,
    usagePercent: 0,
    period: "MONTHLY",
    startDate: startOfMonth.toISOString().slice(0, 10),
    endDate: endOfMonth.toISOString().slice(0, 10),
    warningThresholdPercent: 80,
    currency: "VND",
    active: false,
  };
}

function isExpenseWithinBudget(expense, budget) {
  return (
    expense.expenseDate >= budget.startDate &&
    expense.expenseDate <= budget.endDate
  );
}

function mapBudgetRecord(apiPayload, expenses) {
  const rawBudget = apiPayload?.budget || apiPayload;

  if (!rawBudget) {
    return getEmptyBudget();
  }

  const startDateRaw = rawBudget.startDate ?? rawBudget.start_date;
  const endDateRaw = rawBudget.endDate ?? rawBudget.end_date;
  const amountRaw = rawBudget.amount;
  const warningRaw =
    rawBudget.warningThresholdPercent ?? rawBudget.warning_threshold_percent;

  const startDateStr = startDateRaw ? String(startDateRaw).slice(0, 10) : "";
  const endDateStr = endDateRaw ? String(endDateRaw).slice(0, 10) : "";

  const relatedExpenses = expenses.filter((expense) => {
    if (!startDateStr || !endDateStr) return true;
    return isExpenseWithinBudget(expense, {
      startDate: startDateStr,
      endDate: endDateStr,
    });
  });

  const amount = Number(amountRaw ?? 0);
  const spentAmount = relatedExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount ?? 0),
    0,
  );
  const remainingAmount = Math.max(amount - spentAmount, 0);
  const usagePercent =
    amount > 0 ? Math.round((spentAmount / amount) * 100) : 0;

  return {
    id: rawBudget.id ?? 0,
    amount,
    spentAmount,
    remainingAmount,
    usagePercent,
    period: rawBudget.period ?? "MONTHLY",
    startDate: startDateStr,
    endDate: endDateStr,
    warningThresholdPercent: warningRaw ?? 80,
    currency: rawBudget.currency ?? relatedExpenses[0]?.currency ?? "VND",
    active: rawBudget.active ?? true,
  };
}

export function getBudgetData() {
  return { budget: getEmptyBudget(), expenses: [] };
}

export async function fetchBudgetData() {
  try {
    const [budgetResponse, expenseResult] = await Promise.all([
      api.get("/api/budgets/current"),
      fetchExpenseHistory(),
    ]);
    const budget = unwrapApiData(budgetResponse);
    const expenses =
      expenseResult.data?.expenses ?? getExpenseHistory().expenses;

    return {
      data: {
        budget: mapBudgetRecord(budget, expenses),
        expenses,
      },
      error: expenseResult.error,
    };
  } catch (error) {
    return {
      data: { budget: getEmptyBudget(), expenses: [] },
      error: extractApiMessage(error, "Không thể tải ngân sách."),
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
