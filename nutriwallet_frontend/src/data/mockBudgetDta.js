/**
 * Mapper functions cho budget/expense API response.
 * Mock data đã được xóa — dữ liệu thực lấy từ backend.
 */

function unwrapBudgetPayload(response) {
  if (response?.data?.budget && Array.isArray(response?.data?.expenses)) {
    return response.data;
  }

  if (response?.budget && Array.isArray(response?.expenses)) {
    return response;
  }

  return {
    budget: null,
    expenses: [],
  };
}

function mapBudgetItem(budget) {
  if (!budget) {
    return null;
  }

  return {
    id: budget.id,
    amount: budget.amount,
    spentAmount: budget.spent_amount,
    remainingAmount: budget.remaining_amount,
    usagePercent: budget.usage_percent,
    period: budget.period,
    startDate: budget.start_date,
    endDate: budget.end_date,
    warningThresholdPercent: budget.warning_threshold_percent,
    currency: budget.currency,
  };
}

function mapExpenseItem(expense) {
  return {
    id: expense.id,
    date: expense.expense_date,
    category: expense.category,
    description: expense.description,
    amount: expense.amount,
    currency: expense.currency,
    note: expense.note,
  };
}

export function mapBudgetResponse(response) {
  const payload = unwrapBudgetPayload(response);

  return {
    budget: mapBudgetItem(payload.budget),
    expenses: Array.isArray(payload.expenses)
      ? payload.expenses.map(mapExpenseItem)
      : [],
  };
}

/** Empty fallback — hiển thị trạng thái trống khi API thất bại */
export const budgetData = {
  budget: {
    id: 0,
    amount: 0,
    spentAmount: 0,
    remainingAmount: 0,
    usagePercent: 0,
    period: "MONTHLY",
    startDate: null,
    endDate: null,
    warningThresholdPercent: 80,
    currency: "VND",
  },
  expenses: [],
};
