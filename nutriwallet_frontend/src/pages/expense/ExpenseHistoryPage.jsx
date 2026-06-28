import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import {
  expenseCategoryLabelMap,
  expenseHistoryData,
} from "../../data/accountData";
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

function getDefaultRange() {
  const sortedDates = [...expenseHistoryData]
    .map((item) => item.expenseDate)
    .sort((firstDate, secondDate) => firstDate.localeCompare(secondDate));

  return {
    startDate: sortedDates[0] ?? "",
    endDate: sortedDates[sortedDates.length - 1] ?? "",
  };
}

export default function ExpenseHistoryPage() {
  const today = useMemo(() => new Date(), []);
  const defaultRange = useMemo(() => getDefaultRange(), []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState(defaultRange.startDate);
  const [selectedEndDate, setSelectedEndDate] = useState(defaultRange.endDate);
  const [draftStartDate, setDraftStartDate] = useState(defaultRange.startDate);
  const [draftEndDate, setDraftEndDate] = useState(defaultRange.endDate);
  const [viewDate, setViewDate] = useState(() => toDate(defaultRange.startDate) ?? today);
  const [activeDateField, setActiveDateField] = useState("start");
  const [openDropdown, setOpenDropdown] = useState(null);

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

  const dateRangeLabel = useMemo(
    () => formatDateRangeLabel(selectedStartDate, selectedEndDate),
    [selectedStartDate, selectedEndDate],
  );

  const monthYearLabel = useMemo(
    () => formatMonthYearLabel(viewDate),
    [viewDate],
  );

  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);

  const activeDateValue =
    activeDateField === "start" ? draftStartDate : draftEndDate;
  const activeDate = useMemo(
    () => toDate(activeDateValue) ?? today,
    [activeDateValue, today],
  );

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
  }, [searchQuery, selectedEndDate, selectedStartDate]);

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

  return (
    <AppShell pageLabel="Lịch sử chi tiêu">
      <div className="mb-6">
        <h1 className="text-3xl font-bold xl:text-4xl text-slate-950 dark:text-white">Lịch sử chi tiêu</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Xem chi tiết các khoản chi, tìm kiếm nhanh và lọc theo khoảng thời gian.
        </p>
      </div>

      <section
        ref={sectionRef}
        className="overflow-visible rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
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
              Hiển thị {filteredExpenses.length} khoản chi
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
                <th className="px-5 py-4">Ghi chú</th>
                <th className="px-5 py-4">Số tiền</th>
                <th className="px-5 py-4">Tiền tệ</th>
              </tr>
            </thead>

            <tbody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((record) => (
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
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{record.note}</td>
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-slate-100">
                      {formatMoney(record.amount)}
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{record.currency}</td>
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
      </section>
    </AppShell>
  );
}
