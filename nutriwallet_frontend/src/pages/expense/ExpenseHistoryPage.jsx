import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Pencil,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import { useExpenseHistoryData } from "../../hooks/useExpenseHistoryData";
import {
  buildCalendarDays,
  formatMonthYearLabel,
  getWeekdayLabels,
  isSameDay,
} from "../../utils/date";

const currencyFormatter = new Intl.NumberFormat("vi-VN");
const vietnameseDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const categoryOptions = [
  { value: "BREAKFAST", label: "Bữa sáng" },
  { value: "LUNCH", label: "Bữa trưa" },
  { value: "DINNER", label: "Bữa tối" },
  { value: "SNACK", label: "Bữa phụ" },
  { value: "DRINK", label: "Đồ uống" },
  { value: "OTHER", label: "Khác" },
];

function formatMoney(value) {
  return `${currencyFormatter.format(Math.max(value, 0))}đ`;
}

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

function formatExpenseDate(dateValue) {
  const parsedDate = toDate(dateValue);

  if (!parsedDate) {
    return String(dateValue ?? "");
  }

  return vietnameseDateFormatter.format(parsedDate);
}

function formatDateRangeLabel(startDate, endDate) {
  if (!startDate || !endDate) {
    return "Chọn ngày";
  }

  if (startDate === endDate) {
    return formatExpenseDate(startDate);
  }

  return `${formatExpenseDate(startDate)} - ${formatExpenseDate(endDate)}`;
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

function getDefaultRange(expenses = []) {
  const sortedDates = [...expenses]
    .map((item) => item.expenseDate)
    .sort((firstDate, secondDate) => firstDate.localeCompare(secondDate));

  return {
    startDate: sortedDates[0] ?? "",
    endDate: sortedDates[sortedDates.length - 1] ?? "",
  };
}

export default function ExpenseHistoryPage() {
  const {
    expenses: expenseHistoryData,
    categoryLabelMap: expenseCategoryLabelMap,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useExpenseHistoryData();
  const today = useMemo(() => new Date(), []);
  const defaultRange = useMemo(() => getDefaultRange(expenseHistoryData), [expenseHistoryData]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState(defaultRange.startDate);
  const [selectedEndDate, setSelectedEndDate] = useState(defaultRange.endDate);
  const [draftStartDate, setDraftStartDate] = useState(defaultRange.startDate);
  const [draftEndDate, setDraftEndDate] = useState(defaultRange.endDate);
  const [viewDate, setViewDate] = useState(() => toDate(defaultRange.startDate) ?? today);
  const [activeDateField, setActiveDateField] = useState("start");
  const [openDropdown, setOpenDropdown] = useState(null);

  // CRUD States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sectionRef = useRef(null);
  const weekdayLabels = getWeekdayLabels();

  useEffect(() => {
    function handleClickOutside(event) {
      if (sectionRef.current && !sectionRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setSelectedStartDate(defaultRange.startDate);
      setSelectedEndDate(defaultRange.endDate);
      setDraftStartDate(defaultRange.startDate);
      setDraftEndDate(defaultRange.endDate);
      setViewDate(toDate(defaultRange.startDate) ?? today);
      setCurrentPage(1);
    });
  }, [defaultRange.endDate, defaultRange.startDate, today]);

  const dateRangeLabel = useMemo(
    () => formatDateRangeLabel(selectedStartDate, selectedEndDate),
    [selectedStartDate, selectedEndDate],
  );

  const monthYearLabel = useMemo(
    () => formatMonthYearLabel(viewDate),
    [viewDate],
  );

  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);

  const filteredExpenses = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    return expenseHistoryData.filter((record) => {
      const isAfterStart =
        !selectedStartDate || record.expenseDate >= selectedStartDate;
      const isBeforeEnd =
        !selectedEndDate || record.expenseDate <= selectedEndDate;
      const matchesDate = isAfterStart && isBeforeEnd;

      if (!matchesDate) {
        return false;
      }

      if (!trimmedQuery) {
        return true;
      }

      const categoryLabel = (
        expenseCategoryLabelMap[record.category] ?? record.category
      ).toLowerCase();
      const description = record.description.toLowerCase();
      const note = record.note.toLowerCase();
      const formattedDate = formatExpenseDate(record.expenseDate).toLowerCase();

      return (
        description.includes(trimmedQuery) ||
        note.includes(trimmedQuery) ||
        categoryLabel.includes(trimmedQuery) ||
        formattedDate.includes(trimmedQuery)
      );
    });
  }, [searchQuery, selectedEndDate, selectedStartDate, expenseHistoryData, expenseCategoryLabelMap]);

  // Reset page when search or filters change
  useEffect(() => {
    queueMicrotask(() => {
      setCurrentPage(1);
    });
  }, [searchQuery, selectedStartDate, selectedEndDate]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = useMemo(() => {
    return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExpenses, startIndex]);

  const startItem = filteredExpenses.length === 0 ? 0 : startIndex + 1;
  const endItem = filteredExpenses.length === 0 ? 0 : Math.min(startIndex + itemsPerPage, filteredExpenses.length);
  const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1);

  function openDatePicker() {
    setOpenDropdown((current) => {
      const nextDropdown = current === "dateRange" ? null : "dateRange";

      if (nextDropdown === "dateRange") {
        setDraftStartDate(selectedStartDate);
        setDraftEndDate(selectedEndDate);
        setViewDate(toDate(selectedStartDate) ?? today);
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

    if (activeDateField === "start") {
      setDraftStartDate(nextDateValue);
      if (!draftEndDate || draftEndDate < nextDateValue) {
        setDraftEndDate(nextDateValue);
      }
      setActiveDateField("end");
      return;
    }

    if (draftStartDate && nextDateValue < draftStartDate) {
      setDraftStartDate(nextDateValue);
      setDraftEndDate(nextDateValue);
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

  function handleResetFilters() {
    setSelectedStartDate(defaultRange.startDate);
    setSelectedEndDate(defaultRange.endDate);
    setDraftStartDate(defaultRange.startDate);
    setDraftEndDate(defaultRange.endDate);
    setSearchQuery("");
    setViewDate(toDate(defaultRange.startDate) ?? today);
    setActiveDateField("start");
    setOpenDropdown(null);
  }

  function handleOpenAdd() {
    setEditingExpense(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(expense) {
    setEditingExpense(expense);
    setIsModalOpen(true);
  }

  async function handleDelete(id) {
    if (window.confirm("Bạn có chắc chắn muốn xóa khoản chi này?")) {
      try {
        await deleteExpense(id);
      } catch (err) {
        alert(err.message || "Không thể xóa khoản chi.");
      }
    }
  }

  async function handleModalSubmit(payload) {
    if (editingExpense) {
      await updateExpense(editingExpense.id, payload);
    } else {
      await addExpense(payload);
    }
  }

  return (
    <AppShell pageLabel="Lịch sử chi tiêu">
      {isModalOpen && (
        <ManageExpenseModal
          expense={editingExpense}
          categoryOptions={categoryOptions}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold xl:text-4xl text-slate-950 dark:text-white">Lịch sử chi tiêu</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Xem chi tiết các khoản chi, tìm kiếm nhanh và lọc theo khoảng thời gian.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-800 transition-colors"
        >
          <Plus size={18} />
          Thêm khoản chi
        </button>
      </div>

      <section
        ref={sectionRef}
        className="overflow-visible rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          {(loading || error) && (
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              {loading ? "Đang tải lịch sử chi tiêu..." : error}
            </p>
          )}

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-[420px]">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm theo mô tả, ghi chú, danh mục..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="relative w-full xl:w-auto">
              <button
                type="button"
                onClick={openDatePicker}
                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm transition-colors hover:bg-slate-50 xl:min-w-[320px] dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <CalendarDays size={18} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-left text-slate-700 dark:text-slate-200">{dateRangeLabel}</span>
                <ChevronDown
                  size={16}
                  className={`ml-auto transition-transform ${
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
                  <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-[calc(100vw-2rem)] max-w-[340px] rounded-3xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-1 dark:bg-slate-800">
                      <button
                        type="button"
                        onClick={() => setActiveDateField("start")}
                        className={`flex-1 rounded-2xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                          activeDateField === "start"
                            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        <span className="block text-[11px] uppercase tracking-wide text-slate-400">
                          Từ ngày
                        </span>
                        <span className="mt-1 block text-sm font-semibold">
                          {formatExpenseDate(draftStartDate)}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveDateField("end")}
                        className={`flex-1 rounded-2xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                          activeDateField === "end"
                            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        <span className="block text-[11px] uppercase tracking-wide text-slate-400">
                          Đến ngày
                        </span>
                        <span className="mt-1 block text-sm font-semibold">
                          {formatExpenseDate(draftEndDate)}
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
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          <ChevronLeft size={16} strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => changeMonth(1)}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
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
                        const dateString = toDateString(date);
                        const isSelectedStart = dateString === draftStartDate;
                        const isSelectedEnd = dateString === draftEndDate;
                        const isInRange =
                          draftStartDate &&
                          draftEndDate &&
                          dateString >= draftStartDate &&
                          dateString <= draftEndDate;
                        const isToday = isSameDay(date, today);

                        return (
                          <button
                            key={date.toISOString()}
                            type="button"
                            onClick={() => handleSelectCalendarDate(date)}
                            className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl text-sm font-medium transition-all ${
                              isSelectedStart || isSelectedEnd
                                ? "bg-emerald-600 text-white shadow-sm"
                                : isInRange
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                                  : isCurrentMonth
                                    ? "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    : "text-slate-300 hover:bg-slate-50 dark:text-slate-600"
                            } ${
                              isToday && !isSelectedStart && !isSelectedEnd
                                ? "ring-1 ring-emerald-200 dark:ring-emerald-800"
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
                        onClick={handleResetFilters}
                        className="cursor-pointer text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400"
                      >
                        Toàn bộ kỳ
                      </button>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setOpenDropdown(null)}
                          className="cursor-pointer text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400"
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

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Đang hiển thị {startItem} đến {endItem} trong {filteredExpenses.length} khoản chi
            </p>

            <button
              type="button"
              onClick={handleResetFilters}
              className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4">Ngày chi</th>
                <th className="px-5 py-4">Danh mục</th>
                <th className="px-5 py-4">Mô tả</th>
                <th className="px-5 py-4">Số tiền</th>
                <th className="px-5 py-4">Tiền tệ</th>
                <th className="px-5 py-4 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {paginatedExpenses.length > 0 ? (
                paginatedExpenses.map((record) => (
                  <tr key={record.id} className="border-t border-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {formatExpenseDate(record.expenseDate)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {expenseCategoryLabelMap[record.category] ?? record.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                      {record.description}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-slate-100">
                      {formatMoney(record.amount)}
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{record.currency}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(record)}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
                          title="Sửa"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(record.id)}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/40 dark:text-red-400 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    Không có khoản chi nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Đang hiển thị {startItem} đến {endItem} trong {filteredExpenses.length} khoản chi
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-400"
              >
                <ChevronLeft size={16} />
              </button>

              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-bold ${
                    currentPage === pageNumber
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-300"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}

function ManageExpenseModal({ expense, onClose, onSubmit, categoryOptions }) {
  const [formState, setFormState] = useState({
    date: expense?.expenseDate || toDateString(new Date()),
    category: expense?.category || categoryOptions[0]?.value || "LUNCH",
    amount: expense?.amount || "",
    description: expense?.description || "",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amountNum = Number(formState.amount);
    if (!formState.date || !formState.description.trim() || isNaN(amountNum) || amountNum <= 0) {
      setError("Vui lòng điền đầy đủ và đúng định dạng các trường.");
      return;
    }
    setIsSaving(true);
    try {
      await onSubmit({
        expenseDate: formState.date,
        date: formState.date,
        category: formState.category,
        amount: amountNum,
        description: formState.description.trim(),
        note: formState.description.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi lưu khoản chi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/35 p-0 backdrop-blur-[1px] dark:bg-slate-950/60 sm:items-center sm:justify-center sm:p-4">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />

      <div className="relative z-10 w-full rounded-t-[28px] bg-white p-5 shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900 sm:max-w-xl sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {expense ? "Sửa khoản chi" : "Thêm khoản chi"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Ngày chi tiêu
              </span>
              <input
                type="date"
                name="date"
                value={formState.date}
                onChange={handleChange}
                className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Danh mục / Bữa ăn
              </span>
              <select
                name="category"
                value={formState.category}
                onChange={handleChange}
                className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
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
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Số tiền (VND)
            </span>
            <input
              type="number"
              min="0"
              step="1000"
              name="amount"
              value={formState.amount}
              onChange={handleChange}
              placeholder="Ví dụ: 150000"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Mô tả
            </span>
            <textarea
              name="description"
              rows="3"
              value={formState.description}
              onChange={handleChange}
              placeholder="Ví dụ: Ăn trưa phở bò, Mua sắm siêu thị..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="cursor-pointer rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-emerald-300"
            >
              {isSaving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
