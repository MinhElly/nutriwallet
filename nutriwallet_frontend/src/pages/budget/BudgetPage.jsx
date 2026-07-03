import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PieChart as PieChartIcon,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AppShell from "../../components/layout/AppShell";
import { useBudgetData } from "../../hooks/useBudgetData";
import {
  buildCalendarDays,
  formatMonthYearLabel,
  getInclusiveDayCount,
  getWeekdayLabels,
  isSameDay,
} from "../../utils/date";

const categoryLabelMap = {
  BREAKFAST: "Bữa sáng",
  LUNCH: "Bữa trưa",
  DINNER: "Bữa tối",
  SNACK: "Bữa phụ",
  DRINK: "Đồ uống",
  OTHER: "Khác",
};

const categoryColorMap = {
  BREAKFAST: "#f59e0b",
  LUNCH: "#3b82f6",
  DINNER: "#6366f1",
  SNACK: "#ec4899",
  DRINK: "#06b6d4",
  OTHER: "#64748b",
};

const categoryOptions = [
  { value: "BREAKFAST", label: "Bữa sáng" },
  { value: "LUNCH", label: "Bữa trưa" },
  { value: "DINNER", label: "Bữa tối" },
  { value: "SNACK", label: "Bữa phụ" },
  { value: "DRINK", label: "Đồ uống" },
  { value: "OTHER", label: "Khác" },
];

const periodLabelMap = {
  MONTH: "Theo tháng",
};

const vietnameseDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});



const formatMoney = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(Math.max(value, 0))}đ`;

const formatPercent = (value) => `${Math.max(value, 0)}%`;

function toDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const [year, month, day] = String(dateValue).split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateValue) {
  const date = toDate(dateValue);

  if (!date) {
    return String(dateValue ?? "");
  }

  return vietnameseDateFormatter.format(date);
}

function formatShortDate(dateValue) {
  const date = toDate(dateValue);

  if (!date) {
    return String(dateValue ?? "");
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatDateRangeLabel(startDate, endDate) {
  if (!startDate || !endDate) {
    return "Chọn ngày";
  }

  if (startDate === endDate) {
    return formatDate(startDate);
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function normalizeDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return {
      startDate: startDate || endDate,
      endDate: endDate || startDate,
    };
  }

  return startDate <= endDate
    ? { startDate, endDate }
    : { startDate: endDate, endDate: startDate };
}

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isDateOutsideRange(dateValue, minDateValue, maxDateValue) {
  return dateValue < minDateValue || dateValue > maxDateValue;
}

function normalizeBudgetExpense(expense) {
  return {
    ...expense,
    date: expense.date ?? expense.expenseDate,
  };
}

function BudgetPage() {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeDateField, setActiveDateField] = useState("start");
  const [categoryPeriod, setCategoryPeriod] = useState("month");
  const { budget, expenses, loading, error, addExpense } = useBudgetData();
  const sectionRef = useRef(null);
  const [allExpenses, setAllExpenses] = useState(() =>
    expenses.map(normalizeBudgetExpense),
  );
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [formError, setFormError] = useState("");

  const [selectedStartDate, setSelectedStartDate] = useState(budget.startDate);
  const [selectedEndDate, setSelectedEndDate] = useState(budget.endDate);
  const [draftStartDate, setDraftStartDate] = useState(budget.startDate);
  const [draftEndDate, setDraftEndDate] = useState(budget.endDate);
  const [viewDate, setViewDate] = useState(
    () => toDate(budget.startDate) ?? new Date(),
  );
  const [expenseForm, setExpenseForm] = useState({
    date: budget.endDate,
    category: categoryOptions[0].value,
    description: "",
    amount: "",
    note: "",
  });

  const weekdayLabels = useMemo(() => getWeekdayLabels(), []);
  const minSelectableDate = useMemo(
    () => toDate(budget.startDate) ?? new Date(),
    [budget.startDate],
  );
  const maxSelectableDate = useMemo(
    () => toDate(budget.endDate) ?? new Date(),
    [budget.endDate],
  );
  const minSelectableDateValue = budget.startDate;
  const maxSelectableDateValue = budget.endDate;
  const monthYearLabel = useMemo(() => formatMonthYearLabel(viewDate), [viewDate]);
  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const normalizedSelectedRange = useMemo(
    () => normalizeDateRange(selectedStartDate, selectedEndDate),
    [selectedEndDate, selectedStartDate],
  );
  const normalizedDraftRange = useMemo(
    () => normalizeDateRange(draftStartDate, draftEndDate),
    [draftEndDate, draftStartDate],
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (sectionRef.current && !sectionRef.current.contains(event.target)) {
        setOpenDropdown(null);
        setDraftStartDate(selectedStartDate);
        setDraftEndDate(selectedEndDate);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedEndDate, selectedStartDate]);

  useEffect(() => {
    queueMicrotask(() => {
      setAllExpenses(expenses.map(normalizeBudgetExpense));
    });
  }, [expenses]);

  useEffect(() => {
    queueMicrotask(() => {
      setSelectedStartDate(budget.startDate);
      setSelectedEndDate(budget.endDate);
      setDraftStartDate(budget.startDate);
      setDraftEndDate(budget.endDate);
      setViewDate(toDate(budget.startDate) ?? new Date());
      setExpenseForm((current) => ({
        ...current,
        date: budget.endDate,
      }));
    });
  }, [budget.endDate, budget.startDate]);

  const dateRangeLabel = formatDateRangeLabel(
    normalizedSelectedRange.startDate,
    normalizedSelectedRange.endDate,
  );

  const filteredExpenses = useMemo(
    () =>
      allExpenses.filter(
        (expense) =>
          expense.date >= normalizedSelectedRange.startDate &&
          expense.date <= normalizedSelectedRange.endDate,
      ),
    [
      allExpenses,
      normalizedSelectedRange.endDate,
      normalizedSelectedRange.startDate,
    ],
  );

  const analytics = useMemo(() => {
    const totalBudgetDays = getInclusiveDayCount(
      minSelectableDate,
      maxSelectableDate,
    );
    const rangeStartDate = toDate(normalizedSelectedRange.startDate) ?? minSelectableDate;
    const rangeEndDate = toDate(normalizedSelectedRange.endDate) ?? maxSelectableDate;
    const selectedDayCount = getInclusiveDayCount(rangeStartDate, rangeEndDate);
    const rangeBudgetAmount = Math.round(
      (budget.amount * selectedDayCount) / totalBudgetDays,
    );
    const totalSpent = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
    const remaining = rangeBudgetAmount - totalSpent;
    const usedPercent =
      rangeBudgetAmount > 0
        ? Math.min(100, Math.round((totalSpent / rangeBudgetAmount) * 100))
        : 0;
    const remainingPercent = Math.max(0, 100 - usedPercent);
    const warningAmount = Math.round(
      (rangeBudgetAmount * budget.warningThresholdPercent) / 100,
    );

    const groupedByDate = filteredExpenses.reduce((result, item) => {
      result[item.date] = (result[item.date] || 0) + item.amount;
      return result;
    }, {});

    const dailySpendingData = Object.entries(groupedByDate)
      .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
      .map(([date, amount]) => ({
        date,
        label: formatShortDate(date),
        amount,
      }));

    // Category calculation with period filters (Day/Week/Month)
    const filteredForCategory = filteredExpenses.filter((expense) => {
      const expenseDateObj = toDate(expense.date);
      if (!expenseDateObj) return true;
      const today = new Date();
      
      if (categoryPeriod === "day") {
        return isSameDay(expenseDateObj, today);
      } else if (categoryPeriod === "week") {
        const sevenDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
        return expenseDateObj >= sevenDaysAgo;
      }
      return true;
    });

    const categoryTotals = filteredForCategory.reduce((result, item) => {
      result[item.category] = (result[item.category] || 0) + item.amount;
      return result;
    }, {});

    const categoryTotalSpent = Object.values(categoryTotals).reduce((sum, amt) => sum + amt, 0);

    const categoryData = Object.entries(categoryTotals).map(
      ([category, amount]) => ({
        key: category,
        name: categoryLabelMap[category] ?? category,
        amount,
        percent: categoryTotalSpent > 0 ? Math.round((amount / categoryTotalSpent) * 100) : 0,
        color: categoryColorMap[category] ?? "#cbd5e1",
      }),
    );

    return {
      totalSpent,
      remaining,
      usedPercent,
      remainingPercent,
      warningAmount,
      rangeBudgetAmount,
      selectedDayCount,
      dailySpendingData,
      categoryData,
      categoryTotalSpent,
    };
  }, [
    budget.amount,
    budget.warningThresholdPercent,
    filteredExpenses,
    maxSelectableDate,
    minSelectableDate,
    normalizedSelectedRange.endDate,
    normalizedSelectedRange.startDate,
    categoryPeriod,
  ]);

  const {
    totalSpent,
    remaining,
    usedPercent,
    remainingPercent,
    warningAmount,
    rangeBudgetAmount,
    selectedDayCount,
    dailySpendingData,
    categoryData,
    categoryTotalSpent,
  } = analytics;

  const canGoPrevMonth =
    getMonthStart(viewDate).getTime() > getMonthStart(minSelectableDate).getTime();
  const canGoNextMonth =
    getMonthStart(viewDate).getTime() < getMonthStart(maxSelectableDate).getTime();

  function openDatePicker() {
    setOpenDropdown((current) => {
      const nextDropdown = current === "dateRange" ? null : "dateRange";

      if (nextDropdown === "dateRange") {
        setDraftStartDate(normalizedSelectedRange.startDate);
        setDraftEndDate(normalizedSelectedRange.endDate);
        setViewDate(toDate(normalizedSelectedRange.startDate) ?? minSelectableDate);
        setActiveDateField("start");
      }

      return nextDropdown;
    });
  }

  function changeMonth(offset) {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  function handleSelectCalendarDate(date) {
    const nextDateValue = toDateString(date);

    if (
      isDateOutsideRange(
        nextDateValue,
        minSelectableDateValue,
        maxSelectableDateValue,
      )
    ) {
      return;
    }

    if (activeDateField === "start") {
      setDraftStartDate(nextDateValue);
      if (!draftEndDate) {
        setDraftEndDate(nextDateValue);
      }
      setActiveDateField("end");
      return;
    }

    setDraftEndDate(nextDateValue);
  }

  function handleApplyDateRange() {
    const normalizedRange = normalizeDateRange(draftStartDate, draftEndDate);

    setSelectedStartDate(normalizedRange.startDate);
    setSelectedEndDate(normalizedRange.endDate);
    setDraftStartDate(normalizedRange.startDate);
    setDraftEndDate(normalizedRange.endDate);
    setOpenDropdown(null);
  }

  function handleResetBudgetRange() {
    setSelectedStartDate(budget.startDate);
    setSelectedEndDate(budget.endDate);
    setDraftStartDate(budget.startDate);
    setDraftEndDate(budget.endDate);
    setViewDate(toDate(budget.startDate) ?? new Date());
    setActiveDateField("start");
    setOpenDropdown(null);
  }

  function resetExpenseForm(nextDate = normalizedSelectedRange.endDate) {
    setExpenseForm({
      date: nextDate,
      category: categoryOptions[0].value,
      description: "",
      amount: "",
      note: "",
    });
    setFormError("");
  }

  function handleOpenAddExpense() {
    setOpenDropdown(null);
    resetExpenseForm(normalizedSelectedRange.endDate);
    setIsAddExpenseOpen(true);
  }

  function handleCloseAddExpense() {
    setIsAddExpenseOpen(false);
    setFormError("");
  }

  function handleExpenseFormChange(event) {
    const { name, value } = event.target;

    setExpenseForm((current) => {
      const updated = { ...current, [name]: value };
      if (name === "note") {
        updated.description = value;
      }
      return updated;
    });
  }

  async function handleAddExpenseSubmit(event) {
    event.preventDefault();

    const trimmedDescription = expenseForm.description.trim();
    const trimmedNote = expenseForm.note.trim();
    const amount = Number(expenseForm.amount);

    if (!expenseForm.date || !trimmedDescription || !Number.isFinite(amount)) {
      setFormError("Vui lòng nhập đầy đủ ngày, mô tả và số tiền hợp lệ.");
      return;
    }

    if (amount <= 0) {
      setFormError("Số tiền phải lớn hơn 0.");
      return;
    }

    if (
      isDateOutsideRange(
        expenseForm.date,
        minSelectableDateValue,
        maxSelectableDateValue,
      )
    ) {
      setFormError("Ngày chi tiêu phải nằm trong kỳ ngân sách hiện tại.");
      return;
    }

    setIsSavingExpense(true);

    try {
      await addExpense({
        date: expenseForm.date,
        expenseDate: expenseForm.date,
        category: expenseForm.category,
        description: trimmedDescription,
        amount,
        currency: budget.currency,
        note: trimmedNote,
      });
      setIsAddExpenseOpen(false);
      resetExpenseForm(expenseForm.date);
      return;
    } catch (submitError) {
      console.error(
        "Failed to save budget expense via API, using local fallback.",
        submitError,
      );
    } finally {
      setIsSavingExpense(false);
    }

    const nextExpense = {
      id: allExpenses.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
      date: expenseForm.date,
      category: expenseForm.category,
      description: trimmedDescription,
      amount,
      currency: budget.currency,
      note: trimmedNote || "Không có ghi chú",
    };

    setAllExpenses((current) =>
      [...current, nextExpense].sort((firstItem, secondItem) =>
        secondItem.date.localeCompare(firstItem.date),
      ),
    );
    setIsAddExpenseOpen(false);
    resetExpenseForm(expenseForm.date);
  }

  return (
    <AppShell pageLabel="Ngân sách">
      {isAddExpenseOpen && (
        <AddExpenseModal
          budget={budget}
          expenseForm={expenseForm}
          formError={formError}
          isSubmitting={isSavingExpense}
          minDate={minSelectableDateValue}
          maxDate={maxSelectableDateValue}
          onChange={handleExpenseFormChange}
          onClose={handleCloseAddExpense}
          onSubmit={handleAddExpenseSubmit}
        />
      )}

      <div
        ref={sectionRef}
        className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold xl:text-4xl text-slate-950 dark:text-white">Tổng quan ngân sách</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Theo dõi ngân sách, khoản chi và xu hướng sử dụng tiền của bạn.
          </p>
          {(loading || error) && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {loading ? "Đang tải dữ liệu ngân sách..." : error}
            </p>
          )}
        </div>

            <div className="relative w-full sm:w-auto">
              <button
                type="button"
                onClick={openDatePicker}
                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm transition-colors hover:bg-slate-50 sm:min-w-[280px] sm:justify-between dark:border-slate-800 dark:bg-slate-850 dark:text-slate-250 dark:hover:bg-slate-800"
              >
                <span className="flex items-center gap-3">
                  <CalendarDays size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{dateRangeLabel}</span>
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    openDropdown === "dateRange" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openDropdown === "dateRange" && (
                <>
                  <button
                    type="button"
                    aria-label="Đóng chọn ngày"
                    className="fixed inset-0 z-10 cursor-pointer bg-transparent"
                    onClick={() => setOpenDropdown(null)}
                  />
                  <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-[calc(100vw-2rem)] max-w-[340px] rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-1 dark:bg-slate-800">
                      <button
                        type="button"
                        onClick={() => setActiveDateField("start")}
                        className={`flex-1 rounded-2xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                          activeDateField === "start"
                            ? "bg-white text-slate-900 shadow-sm shadow-slate-200/60 dark:bg-slate-700 dark:text-white dark:shadow-none"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        <span className="block text-[11px] uppercase tracking-wide text-slate-400">
                          Từ ngày
                        </span>
                        <span className="mt-1 block text-sm font-semibold">
                          {formatDate(draftStartDate)}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveDateField("end")}
                        className={`flex-1 rounded-2xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                          activeDateField === "end"
                            ? "bg-white text-slate-900 shadow-sm shadow-slate-200/60 dark:bg-slate-700 dark:text-white dark:shadow-none"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        <span className="block text-[11px] uppercase tracking-wide text-slate-400">
                          Đến ngày
                        </span>
                        <span className="mt-1 block text-sm font-semibold">
                          {formatDate(draftEndDate)}
                        </span>
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Chọn ngày
                        </p>
                        <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                          {monthYearLabel}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => changeMonth(-1)}
                          disabled={!canGoPrevMonth}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-350"
                        >
                          <ChevronLeft size={16} strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => changeMonth(1)}
                          disabled={!canGoNextMonth}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-350"
                        >
                          <ChevronRight size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-7 gap-1 text-center">
                      {weekdayLabels.map((label) => (
                        <span
                          key={label}
                          className="py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                        >
                          {label}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 grid grid-cols-7 gap-1">
                      {calendarDays.map(({ date, isCurrentMonth }) => {
                        const dateValue = toDateString(date);
                        const isSelectedStart = draftStartDate === dateValue;
                        const isSelectedEnd = draftEndDate === dateValue;
                        const isWithinPreviewRange =
                          normalizedDraftRange.startDate &&
                          normalizedDraftRange.endDate &&
                          dateValue >= normalizedDraftRange.startDate &&
                          dateValue <= normalizedDraftRange.endDate;
                        const isToday = isSameDay(date, new Date());
                        const isOutOfBounds = isDateOutsideRange(
                          dateValue,
                          minSelectableDateValue,
                          maxSelectableDateValue,
                        );

                        return (
                          <button
                            key={date.toISOString()}
                            type="button"
                            disabled={isOutOfBounds}
                            onClick={() => handleSelectCalendarDate(date)}
                            className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl text-sm font-medium transition-all ${
                              isSelectedStart || isSelectedEnd
                                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200 dark:shadow-none"
                                : isWithinPreviewRange
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                                  : isCurrentMonth
                                    ? "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
                                    : "text-slate-300 hover:bg-slate-50 dark:text-slate-650 dark:hover:bg-slate-800"
                            } ${
                              isToday && !isSelectedStart && !isSelectedEnd
                                ? "ring-1 ring-emerald-200 dark:ring-emerald-800"
                                : ""
                            } ${
                              isOutOfBounds
                                ? "cursor-not-allowed opacity-35 hover:bg-transparent"
                                : ""
                            }`}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={handleResetBudgetRange}
                        className="cursor-pointer text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400"
                      >
                        Toàn bộ kỳ
                      </button>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setOpenDropdown(null)}
                          className="cursor-pointer text-sm font-medium text-slate-500 transition-colors hover:text-slate-750 dark:text-slate-400"
                        >
                          Đóng
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyDateRange}
                          className="cursor-pointer rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                        >
                          Áp dụng
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <section className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
            <SummaryCard
              icon={<Wallet />}
              title="Ngân sách trong khoảng chọn"
              value={formatMoney(rangeBudgetAmount)}
              subtitle={`${periodLabelMap[budget.period] ?? budget.period}: ${dateRangeLabel}`}
              bg="bg-emerald-100 text-emerald-700"
              badge={`${selectedDayCount} ngày`}
            />

            <SummaryCard
              icon={<TrendingUp />}
              title="Đã chi"
              value={formatMoney(totalSpent)}
              subtitle={`${formatPercent(usedPercent)} ngân sách đã dùng`}
              bg="bg-blue-100 text-blue-700"
              progress={usedPercent}
            />

            <SummaryCard
              icon={<PieChartIcon />}
              title="Còn lại"
              value={formatMoney(remaining)}
              subtitle={`${formatPercent(remainingPercent)} ngân sách còn lại`}
              bg="bg-orange-100 text-orange-700"
              badge={remaining >= 0 ? "Đang ổn" : "Vượt ngân sách"}
            />

            <SummaryCard
              icon={<AlertTriangle />}
              title="Ngưỡng cảnh báo"
              value={formatMoney(warningAmount)}
              subtitle={`${budget.warningThresholdPercent}% của khoảng ngân sách này`}
              bg="bg-purple-100 text-purple-700"
            />
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ChartCard title="Chi tiêu theo ngày">
              <DailySpendingChart data={dailySpendingData} />
            </ChartCard>

            <ChartCard
              title="Chi tiêu theo danh mục"
              extra={
                <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setCategoryPeriod("day")}
                    className={`rounded-md px-2.5 py-1 transition-colors ${
                      categoryPeriod === "day"
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                    }`}
                  >
                    Ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryPeriod("week")}
                    className={`rounded-md px-2.5 py-1 transition-colors ${
                      categoryPeriod === "week"
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                    }`}
                  >
                    Tuần
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryPeriod("month")}
                    className={`rounded-md px-2.5 py-1 transition-colors ${
                      categoryPeriod === "month"
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                    }`}
                  >
                    Tháng
                  </button>
                </div>
              }
            >
              <CategoryChart totalSpent={categoryTotalSpent} categoryData={categoryData} />
            </ChartCard>
          </section>

          <section className="mt-6">
            <RecentExpenses
              expenses={filteredExpenses}
              onAddExpense={handleOpenAddExpense}
              onViewAllExpenses={() => navigate("/expense-history")}
            />
          </section>
    </AppShell>
  );
}

function AddExpenseModal({
  budget,
  expenseForm,
  formError,
  isSubmitting,
  minDate,
  maxDate,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/35 p-0 backdrop-blur-[1px] sm:items-center sm:justify-center sm:p-4">
      <button
        type="button"
        aria-label="Đóng thêm khoản chi"
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />

      <div className="relative z-10 w-full rounded-t-[28px] bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Thêm khoản chi</h2>
            <p className="mt-2 text-sm text-slate-500">
              Khoản chi mới sẽ được thêm vào kỳ ngân sách{" "}
              {formatDate(budget.startDate)} - {formatDate(budget.endDate)}.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Ngày chi tiêu
              </span>
              <input
                type="date"
                name="date"
                min={minDate}
                max={maxDate}
                value={expenseForm.date}
                onChange={onChange}
                className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Bữa ăn
              </span>
              <select
                name="category"
                value={expenseForm.category}
                onChange={onChange}
                className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Số tiền ({budget.currency})
            </span>
            <input
              type="number"
              min="0"
              step="1000"
              name="amount"
              value={expenseForm.amount}
              onChange={onChange}
              placeholder="Ví dụ: 150000"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Mô tả chi tiết / Ghi chú
            </span>
            <textarea
              name="note"
              rows="3"
              value={expenseForm.note}
              onChange={onChange}
              placeholder="Ví dụ: Ăn trưa với nhóm, mua phở bò..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500"
            />
          </label>

          {formError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {formError}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Lưu khoản chi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value, subtitle, bg, progress, badge }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${bg} sm:h-12 sm:w-12 dark:bg-slate-800 dark:text-emerald-400`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500 sm:text-sm dark:text-slate-400">{title}</p>
          <h2 className="mt-2 break-words text-2xl font-bold leading-tight sm:text-3xl dark:text-white">
            {value}
          </h2>
          <p className="mt-3 text-xs leading-5 text-slate-500 sm:mt-4 sm:text-sm dark:text-slate-400">
            {subtitle}
          </p>

          {progress !== undefined && (
            <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {badge && (
            <span className="mt-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 sm:px-4 sm:text-sm dark:bg-emerald-950/60 dark:text-emerald-400">
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, extra, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold dark:text-white">{title}</h2>
        {extra}
      </div>
      {children}
    </div>
  );
}

function EmptyChartState({ message }) {
  return (
    <div className="flex h-[280px] items-center justify-center rounded-2xl bg-slate-50 px-6 text-center text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
      {message}
    </div>
  );
}

function ChartTooltip({ active, payload, label, formatter = formatMoney }) {
  if (!active || !payload?.length) {
    return null;
  }

  const displayLabel = label ?? payload[0]?.name ?? payload[0]?.payload?.name;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      {displayLabel && (
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{displayLabel}</p>
      )}
      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
        {formatter(payload[0].value)}
      </p>
    </div>
  );
}

function DailySpendingChart({ data }) {
  if (data.length === 0) {
    return <EmptyChartState message="Chưa có khoản chi trong khoảng ngày này." />;
  }

  return (
    <div className="h-[280px] w-full overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="dailyBudgetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis
            tickFormatter={(value) => `${Math.round(value / 1000)}k`}
            tickLine={false}
            axisLine={false}
            width={58}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#047857"
            strokeWidth={3}
            fill="url(#dailyBudgetGradient)"
            activeDot={{ r: 6, fill: "#047857", stroke: "#ffffff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function CategoryChart({ totalSpent, categoryData }) {
  if (categoryData.length === 0) {
    return <EmptyChartState message="Chưa có dữ liệu danh mục để hiển thị." />;
  }

  return (
    <div className="flex flex-col items-center gap-8 lg:flex-row">
      <div className="h-56 w-full max-w-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="amount"
              nameKey="name"
              innerRadius={62}
              outerRadius={94}
              paddingAngle={2}
            >
              {categoryData.map((item) => (
                <Cell key={item.key} fill={item.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip formatter={formatMoney} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full flex-1 space-y-4">
        <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
          <p className="text-sm text-slate-500 dark:text-slate-400">Tổng chi tiêu</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {formatMoney(totalSpent)}
          </p>
        </div>

        {categoryData.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 px-4 py-3 dark:border-slate-800"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.name}</span>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{item.percent}%</span>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {formatMoney(item.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentExpenses({ expenses, onAddExpense, onViewAllExpenses }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold dark:text-white">Khoản chi gần đây</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onAddExpense}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow-md transition-colors hover:bg-emerald-800"
          >
            <Plus size={16} />
            Thêm khoản chi
          </button>
          <button
            type="button"
            onClick={onViewAllExpenses}
            className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Xem tất cả khoản chi
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3">Danh mục</th>
              <th className="px-4 py-3">Mô tả</th>
              <th className="px-4 py-3">Số tiền</th>
              <th className="px-4 py-3">Tiền tệ</th>
            </tr>
          </thead>

          <tbody>
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <tr key={expense.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{formatDate(expense.date)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                    {categoryLabelMap[expense.category] ?? expense.category}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{expense.description}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                    {formatMoney(expense.amount)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{expense.currency}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  Không có khoản chi nào trong khoảng ngày đang chọn.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}



export default BudgetPage;
