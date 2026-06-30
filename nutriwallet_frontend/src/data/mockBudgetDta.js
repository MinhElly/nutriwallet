/**
 * Mock response mô phỏng payload backend.
 * Sau này chỉ cần thay bằng:
 *
 * const response = await axios.get("/api/budget");
 * const budgetData = mapBudgetResponse(response.data);
 */

export const budgetResponse = {
  success: true,
  message: "Get budget successfully",
  data: {
    budget: {
      id: 1,
      amount: 3200000,
      spent_amount: 1145000,
      remaining_amount: 2055000,
      usage_percent: 35.78,
      period: "MONTH",
      start_date: "2024-10-01",
      end_date: "2024-10-31",
      warning_threshold_percent: 95,
      currency: "VND",
    },
    expenses: [
      {
        id: 1,
        expense_date: "2024-10-24",
        category: "GROCERIES",
        description: "Big C - Weekly groceries",
        amount: 450000,
        currency: "VND",
        note: "Vegetables, fruits, meat",
      },
      {
        id: 2,
        expense_date: "2024-10-23",
        category: "DINING_OUT",
        description: "Lunch with team",
        amount: 180000,
        currency: "VND",
        note: "Restaurant",
      },
      {
        id: 3,
        expense_date: "2024-10-23",
        category: "HEALTH",
        description: "Gym membership",
        amount: 300000,
        currency: "VND",
        note: "Monthly fee",
      },
      {
        id: 4,
        expense_date: "2024-10-22",
        category: "TRANSPORTATION",
        description: "Grab transportation",
        amount: 65000,
        currency: "VND",
        note: "Ride to office",
      },
      {
        id: 5,
        expense_date: "2024-10-21",
        category: "GROCERIES",
        description: "VinMart - Snacks",
        amount: 150000,
        currency: "VND",
        note: "Snacks & drinks",
      },
    ],
  },
};

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

export const budgetData = mapBudgetResponse(budgetResponse);
