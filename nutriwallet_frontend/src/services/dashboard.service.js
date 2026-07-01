import api, { extractApiMessage, unwrapApiData } from "./api";
import { fetchBudgetData } from "./budget.service";
import {
  expenseCategoryLabelMap,
  fetchExpenseHistory,
} from "./expense.service";
import { fetchMealHistory } from "./meal.service";
import { getDashboardSnapshot, aiRecommendations } from "../data/dashboardData";
import { getInclusiveDayCount, getPeriodRange } from "../utils/date";

const currencyFormatter = new Intl.NumberFormat("en-US");

const mealTypeLabelMap = {
  Breakfast: "Bữa sáng",
  Lunch: "Bữa trưa",
  Dinner: "Bữa tối",
};

function formatNumber(value) {
  return currencyFormatter.format(Math.max(Math.round(Number(value) || 0), 0));
}

function formatCurrency(value, currency = "VND") {
  return `${formatNumber(value)} ${currency}`;
}

function formatDisplayDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue ?? "");
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildDateRange(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

function filterMealsByRange(meals, startDateValue, endDateValue) {
  return meals.filter(
    (meal) => meal.mealDate >= startDateValue && meal.mealDate <= endDateValue,
  );
}

function filterExpensesByRange(expenses, startDateValue, endDateValue) {
  return expenses.filter(
    (expense) =>
      expense.expenseDate >= startDateValue && expense.expenseDate <= endDateValue,
  );
}

function buildTrendData(rangeDates, dataMap) {
  const useWeekdayLabel = rangeDates.length <= 7;

  return rangeDates.map((date) => {
    const key = toDateString(date);

    return {
      day: useWeekdayLabel
        ? date.toLocaleDateString("vi-VN", { weekday: "short" })
        : date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          }),
      value: dataMap.get(key) ?? 0,
    };
  });
}

function getBudgetRangeAmount(budget, selectedDayCount) {
  if (!budget?.amount || !budget?.startDate || !budget?.endDate) {
    return 0;
  }

  const totalBudgetDays = Math.max(
    getInclusiveDayCount(new Date(budget.startDate), new Date(budget.endDate)),
    1,
  );

  return Math.round((Number(budget.amount) * selectedDayCount) / totalBudgetDays);
}

function buildDashboardSnapshotFromApi({
  selectedDate,
  selectedPeriod,
  summary,
  meals,
  expenses,
  budget,
}) {
  const { startDate, endDate } = getPeriodRange(selectedDate, selectedPeriod);
  const startDateValue = toDateString(startDate);
  const endDateValue = toDateString(endDate);
  const rangeDates = buildDateRange(startDate, endDate);
  const selectedDayCount = getInclusiveDayCount(startDate, endDate);
  const filteredMeals = filterMealsByRange(meals, startDateValue, endDateValue);
  const filteredExpenses = filterExpensesByRange(
    expenses,
    startDateValue,
    endDateValue,
  );

  const totalCaloriesValue =
    summary?.totalCalories !== undefined
      ? Number(summary.totalCalories)
      : filteredMeals.reduce((sum, meal) => sum + Number(meal.totalCalories || 0), 0);
  const totalExpenseValue =
    summary?.totalExpense !== undefined
      ? Number(summary.totalExpense)
      : filteredExpenses.reduce(
          (sum, expense) => sum + Number(expense.amount || 0),
          0,
        );
  const mealCount = summary?.mealCount ?? filteredMeals.length;
  const expenseCount = summary?.expenseCount ?? filteredExpenses.length;
  const rangeBudgetAmount = getBudgetRangeAmount(budget, selectedDayCount);
  const usedPercent =
    rangeBudgetAmount > 0
      ? Math.min(Math.round((totalExpenseValue / rangeBudgetAmount) * 100), 100)
      : 0;
  const remainingBudgetValue = Math.max(rangeBudgetAmount - totalExpenseValue, 0);
  const currency = budget?.currency ?? filteredExpenses[0]?.currency ?? "VND";

  const mealDailyMap = filteredMeals.reduce((result, meal) => {
    result.set(
      meal.mealDate,
      (result.get(meal.mealDate) ?? 0) + Number(meal.totalCalories || 0),
    );
    return result;
  }, new Map());
  const expenseDailyMap = filteredExpenses.reduce((result, expense) => {
    result.set(
      expense.expenseDate,
      (result.get(expense.expenseDate) ?? 0) + Number(expense.amount || 0),
    );
    return result;
  }, new Map());

  return {
    budgetSummary: {
      amount: formatCurrency(rangeBudgetAmount, currency),
      period: selectedPeriod,
      duration: `${formatDisplayDate(startDateValue)} - ${formatDisplayDate(endDateValue)}`,
      warningThreshold: budget?.warningThresholdPercent ?? 80,
      usedPercent,
      spent: formatCurrency(totalExpenseValue, currency),
      remaining: formatCurrency(remainingBudgetValue, currency),
    },
    budgetUsage: [
      {
        name: "Đã dùng",
        value: usedPercent,
        fill: "#059669",
      },
    ],
    mealSummary: {
      totalMeals: mealCount,
      totalCalories: `${formatNumber(totalCaloriesValue)} kcal`,
      helperText:
        selectedPeriod === "Hôm nay"
          ? "Bữa ăn trong ngày đã chọn"
          : `Bữa ăn trong ${selectedPeriod.toLowerCase()}`,
    },
    expenseSummary: {
      totalExpenses: expenseCount,
      totalAmount: formatCurrency(totalExpenseValue, currency),
      helperText:
        selectedPeriod === "Hôm nay"
          ? "Khoản chi trong ngày đã chọn"
          : `Khoản chi trong ${selectedPeriod.toLowerCase()}`,
    },
    mealTrend: buildTrendData(rangeDates, mealDailyMap),
    expenseTrend: buildTrendData(rangeDates, expenseDailyMap),
    meals: filteredMeals.map((meal) => ({
      name: meal.mealName,
      image: meal.imageUrl,
      time: `${mealTypeLabelMap[meal.mealType] ?? meal.mealType}\n${meal.mealTime}`,
      date: formatDisplayDate(meal.mealDate),
      calories: `${formatNumber(meal.totalCalories)} kcal`,
      caloriesValue: meal.totalCalories,
      protein: `${meal.proteinGram} g`,
      carb: `${meal.carbGram} g`,
      fat: `${meal.fatGram} g`,
    })),
    expenses: filteredExpenses.map((expense) => ({
      category: expenseCategoryLabelMap[expense.category] ?? expense.category,
      amount: formatNumber(expense.amount),
      amountValue: expense.amount,
      currency: expense.currency,
      date: formatDisplayDate(expense.expenseDate),
      note: expense.note,
    })),
  };
}

async function fetchDashboardSummary(selectedPeriod) {
  const endpoint =
    selectedPeriod === "Hôm nay"
      ? "/api/dashboard/today"
      : selectedPeriod === "1 tháng qua"
        ? "/api/dashboard/month"
        : null;

  if (!endpoint) {
    return {
      data: null,
      error: null,
    };
  }

  try {
    return {
      data: unwrapApiData(await api.get(endpoint)),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: extractApiMessage(error, "Không thể tải tổng quan dashboard."),
    };
  }
}

export function getDashboardData(selectedDate, selectedPeriod) {
  return getDashboardSnapshot(selectedDate, selectedPeriod);
}

export async function fetchDashboardData(selectedDate, selectedPeriod) {
  const fallback = getDashboardData(selectedDate, selectedPeriod);
  const [summaryResult, mealResult, expenseResult, budgetResult] =
    await Promise.all([
      fetchDashboardSummary(selectedPeriod),
      fetchMealHistory(),
      fetchExpenseHistory(),
      fetchBudgetData(),
    ]);

  try {
    return {
      data: buildDashboardSnapshotFromApi({
        selectedDate,
        selectedPeriod,
        summary: summaryResult.data,
        meals: mealResult.data,
        expenses: expenseResult.data.expenses,
        budget: budgetResult.data.budget,
      }),
      error:
        summaryResult.error ||
        mealResult.error ||
        expenseResult.error ||
        budgetResult.error,
    };
  } catch {
    return {
      data: fallback,
      error:
        summaryResult.error ||
        mealResult.error ||
        expenseResult.error ||
        budgetResult.error ||
        "Không thể tải dashboard. Đang dùng dữ liệu mẫu.",
    };
  }
}

export function getAiRecommendations() {
  return aiRecommendations;
}
