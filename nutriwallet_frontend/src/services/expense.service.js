import api, { createApiError, extractApiMessage, unwrapApiData } from "./api";
import { mapMealRecord } from "./meal.service";
import {
  expenseCategoryLabelMap,
  expenseHistoryData as fallbackExpenseHistoryData,
} from "../data/accountData";

export { expenseCategoryLabelMap };

function getFallbackExpenseHistory() {
  return {
    expenses: [...fallbackExpenseHistoryData],
    categoryLabelMap: expenseCategoryLabelMap,
  };
}

function formatExpenseDate(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}

function buildExpenseDescription(expense, mealsById) {
  const linkedMeal = expense.mealRecordId
    ? mealsById.get(expense.mealRecordId)
    : null;

  return (
    linkedMeal?.mealName ??
    expenseCategoryLabelMap[expense.category] ??
    expense.category ??
    "Chi tiêu"
  );
}

export function mapExpenseRecord(expense, mealsById = new Map()) {
  const expenseDate = formatExpenseDate(expense.expenseDate);
  const description = buildExpenseDescription(expense, mealsById);
  const note = expense.note?.trim() || "Không có ghi chú";

  return {
    id: expense.id,
    userId: 1,
    mealRecordId: expense.mealRecordId ?? null,
    mealName: expense.mealRecordId
      ? mealsById.get(expense.mealRecordId)?.mealName ?? null
      : null,
    amount: Number(expense.amount ?? 0),
    currency: expense.currency || "VND",
    category: expense.category,
    expenseDate,
    description,
    note,
    createdAt: `${expenseDate}T00:00:00`,
    updatedAt: `${expenseDate}T00:00:00`,
  };
}

export function getExpenseHistory() {
  return getFallbackExpenseHistory();
}

export async function fetchExpenseHistory() {
  const fallback = getExpenseHistory();

  try {
    const [expensesResponse, mealsResponse] = await Promise.all([
      api.get("/api/expenses"),
      api.get("/api/meals").catch(() => null),
    ]);
    const expenses = unwrapApiData(expensesResponse);
    const meals = mealsResponse ? unwrapApiData(mealsResponse) : [];
    const mealsById = new Map(
      (Array.isArray(meals) ? meals : [])
        .map(mapMealRecord)
        .map((meal) => [meal.id, meal]),
    );

    return {
      data: {
        expenses: Array.isArray(expenses)
          ? expenses.map((expense) => mapExpenseRecord(expense, mealsById))
          : fallback.expenses,
        categoryLabelMap: expenseCategoryLabelMap,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: fallback,
      error: extractApiMessage(
        error,
        "Không thể tải chi tiêu. Đang dùng dữ liệu mẫu.",
      ),
    };
  }
}

export async function createExpense(payload) {
  const requestBody = {
    mealRecordId: payload.mealRecordId ?? null,
    amount: Number(payload.amount ?? 0),
    currency: payload.currency ?? "VND",
    category: payload.category,
    expenseDate: payload.expenseDate ?? payload.date,
    note: payload.note?.trim() || payload.description?.trim() || "",
  };

  try {
    const expense = unwrapApiData(await api.post("/api/expenses", requestBody));
    const mappedExpense = mapExpenseRecord(expense);

    return {
      ...mappedExpense,
      description: payload.description?.trim() || mappedExpense.description,
      note: payload.note?.trim() || mappedExpense.note,
    };
  } catch (error) {
    throw createApiError(error, "Không thể tạo khoản chi.");
  }
}

export async function updateExpense(id, payload) {
  const requestBody = {
    mealRecordId: payload.mealRecordId ?? null,
    amount:
      payload.amount !== undefined && payload.amount !== null
        ? Number(payload.amount)
        : undefined,
    currency: payload.currency,
    category: payload.category,
    expenseDate: payload.expenseDate ?? payload.date,
    note: payload.note?.trim() || payload.description?.trim() || "",
  };

  try {
    const expense = unwrapApiData(
      await api.patch(`/api/expenses/${id}`, requestBody),
    );
    const mappedExpense = mapExpenseRecord(expense);

    return {
      ...mappedExpense,
      description: payload.description?.trim() || mappedExpense.description,
      note: payload.note?.trim() || mappedExpense.note,
    };
  } catch (error) {
    throw createApiError(error, "Không thể cập nhật khoản chi.");
  }
}

export async function deleteExpense(id) {
  try {
    await api.delete(`/api/expenses/${id}`);
  } catch (error) {
    throw createApiError(error, "Không thể xóa khoản chi.");
  }
}
