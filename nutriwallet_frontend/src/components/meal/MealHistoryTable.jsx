import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  Download,
  Sun,
  Sunset,
} from "lucide-react";
import {
  buildCalendarDays,
  formatMonthYearLabel,
  getWeekdayLabels,
  isSameDay,
} from "../../utils/date";
import { useMealHistoryData } from "../../hooks/useMealHistoryData";
const mealTypeConfig = {
  all: {
    label: "Tất cả bữa ăn",
  },
  Breakfast: {
    label: "Bữa sáng",
    icon: CloudSun,
    iconClassName: "text-emerald-500",
  },
  Lunch: {
    label: "Bữa trưa",
    icon: Sun,
    iconClassName: "text-amber-400",
  },
  Dinner: {
    label: "Bữa tối",
    icon: Sunset,
    iconClassName: "text-orange-400",
  },
};

const rowsPerPage = 5;

const vietnameseDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function getSortedMealDates(meals) {
  return [...meals]
    .map((meal) => meal.mealDate)
    .sort((firstDate, secondDate) => firstDate.localeCompare(secondDate));
}

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const [year, month, day] = dateValue.split("-").map(Number);

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

function formatMealDate(dateValue) {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return vietnameseDateFormatter.format(parsedDate);
}

function formatDateRangeLabel(startDate, endDate) {
  if (!startDate || !endDate) {
    return "Chọn ngày";
  }

  if (startDate === endDate) {
    return formatMealDate(startDate);
  }

  return `${formatMealDate(startDate)} - ${formatMealDate(endDate)}`;
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

function getMealTypeMeta(mealType) {
  return (
    mealTypeConfig[mealType] ?? {
      label: mealType,
      icon: CloudSun,
      iconClassName: "text-slate-400",
    }
  );
}

function escapeCsvValue(value) {
  const stringValue = String(value ?? "");

  if (
    stringValue.includes(",") ||
    stringValue.includes("\"") ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replaceAll("\"", "\"\"")}"`;
  }

  return stringValue;
}

export default function MealHistoryTable({ searchQuery = "" }) {
  const {
    meals: mealHistoryData,
    loading,
    error,
  } = useMealHistoryData();
  const minMealDate = useMemo(() => {
    const sortedDates = getSortedMealDates(mealHistoryData);
    return sortedDates[0] ?? "";
  }, [mealHistoryData]);
  const [liveTodayDate, setLiveTodayDate] = useState(getTodayDateString);
  const [isUsingLiveToday, setIsUsingLiveToday] = useState(true);
  const [selectedMealType, setSelectedMealType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeDateField, setActiveDateField] = useState("start");
  const [selectedStartDate, setSelectedStartDate] = useState(getTodayDateString);
  const [selectedEndDate, setSelectedEndDate] = useState(getTodayDateString);
  const [draftStartDate, setDraftStartDate] = useState(getTodayDateString);
  const [draftEndDate, setDraftEndDate] = useState(getTodayDateString);
  const [viewDate, setViewDate] = useState(() => toDate(getTodayDateString()) ?? new Date());
  const sectionRef = useRef(null);

  const today = useMemo(() => toDate(liveTodayDate) ?? new Date(), [liveTodayDate]);
  const weekdayLabels = useMemo(() => getWeekdayLabels(), []);
  const monthYearLabel = useMemo(() => formatMonthYearLabel(viewDate), [viewDate]);
  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const normalizedDraftRange = useMemo(
    () => normalizeDateRange(draftStartDate, draftEndDate),
    [draftEndDate, draftStartDate],
  );

  useEffect(() => {
    const timerId = window.setInterval(() => {
      const nextTodayDate = getTodayDateString();

      setLiveTodayDate((currentDate) =>
        currentDate === nextTodayDate ? currentDate : nextTodayDate,
      );
    }, 60000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    if (!isUsingLiveToday) {
      return;
    }

    queueMicrotask(() => {
      setSelectedStartDate(liveTodayDate);
      setSelectedEndDate(liveTodayDate);
      setDraftStartDate(liveTodayDate);
      setDraftEndDate(liveTodayDate);
      setViewDate(toDate(liveTodayDate) ?? new Date());
    });
  }, [isUsingLiveToday, liveTodayDate]);

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

  const dateRangeLabel = isUsingLiveToday
    ? `Hôm nay • ${formatMealDate(liveTodayDate)}`
    : formatDateRangeLabel(selectedStartDate, selectedEndDate);

  const filteredMeals = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    return mealHistoryData.filter((meal) => {
      const matchesDate =
        (!selectedStartDate || meal.mealDate >= selectedStartDate) &&
        (!selectedEndDate || meal.mealDate <= selectedEndDate);
      const matchesMealType =
        selectedMealType === "all" || meal.mealType === selectedMealType;
      const mealTypeLabel = getMealTypeMeta(meal.mealType).label.toLowerCase();
      const matchesSearch =
        normalizedSearchQuery.length === 0 ||
        meal.mealName.toLowerCase().includes(normalizedSearchQuery) ||
        meal.description.toLowerCase().includes(normalizedSearchQuery) ||
        mealTypeLabel.includes(normalizedSearchQuery);

      return matchesDate && matchesMealType && matchesSearch;
    });
  }, [searchQuery, selectedEndDate, selectedMealType, selectedStartDate, mealHistoryData]);

  const totalPages = Math.max(1, Math.ceil(filteredMeals.length / rowsPerPage));

  const [prevFilterKey, setPrevFilterKey] = useState("");
  const currentFilterKey = `${searchQuery}_${selectedStartDate}_${selectedEndDate}_${selectedMealType}`;

  if (prevFilterKey !== currentFilterKey) {
    setPrevFilterKey(currentFilterKey);
    setCurrentPage(1);
  } else if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  const paginatedMeals = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredMeals.slice(startIndex, startIndex + rowsPerPage);
  }, [currentPage, filteredMeals]);

  const startItem =
    filteredMeals.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem =
    filteredMeals.length === 0
      ? 0
      : Math.min(currentPage * rowsPerPage, filteredMeals.length);

  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1);

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
    setIsUsingLiveToday(
      normalizedRange.startDate === liveTodayDate &&
        normalizedRange.endDate === liveTodayDate,
    );
    setOpenDropdown(null);
  }

  function handleResetToToday() {
    setIsUsingLiveToday(true);
    setSelectedStartDate(liveTodayDate);
    setSelectedEndDate(liveTodayDate);
    setDraftStartDate(liveTodayDate);
    setDraftEndDate(liveTodayDate);
    setViewDate(toDate(liveTodayDate) ?? new Date());
    setActiveDateField("start");
    setOpenDropdown(null);
  }

  function handleExportMeals() {
    if (filteredMeals.length === 0) {
      return;
    }

    const csvRows = [
      [
        "Món ăn",
        "Mô tả",
        "Loại bữa ăn",
        "Thời gian",
        "Ngày",
        "Calo",
        "Protein (g)",
        "Tinh bột (g)",
        "Chất béo (g)",
        "Trạng thái AI",
        "Mô hình AI",
      ],
      ...filteredMeals.map((meal) => [
        meal.mealName,
        meal.description,
        getMealTypeMeta(meal.mealType).label,
        meal.mealTime,
        formatMealDate(meal.mealDate),
        meal.totalCalories,
        meal.proteinGram,
        meal.carbGram,
        meal.fatGram,
        "Hoàn tất",
        meal.modelName,
      ]),
    ];

    const csvContent = csvRows
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = `lich-su-bua-an-${selectedStartDate || "tu-ngay"}-${selectedEndDate || "den-ngay"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }

  return (
    <section
      ref={sectionRef}
      className="overflow-visible rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={openDatePicker}
              className="flex min-w-[290px] cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              <CalendarDays
                size={16}
                strokeWidth={1.9}
                className="text-emerald-600 dark:text-emerald-400"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {dateRangeLabel}
              </span>
              <ChevronDown
                size={14}
                strokeWidth={1.9}
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
                <div className="absolute left-0 top-full z-20 mt-2 w-[calc(100vw-2rem)] max-w-[340px] rounded-3xl border border-slate-200 bg-white p-4 shadow-xl sm:left-auto sm:right-0 sm:w-[340px] dark:border-slate-800 dark:bg-slate-900">
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
                        {formatMealDate(draftStartDate)}
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
                        {formatMealDate(draftEndDate)}
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
                      const dateValue = toDateString(date);
                      const isSelectedStart = draftStartDate === dateValue;
                      const isSelectedEnd = draftEndDate === dateValue;
                      const isWithinPreviewRange =
                        normalizedDraftRange.startDate &&
                        normalizedDraftRange.endDate &&
                        dateValue >= normalizedDraftRange.startDate &&
                        dateValue <= normalizedDraftRange.endDate;
                      const isToday = isSameDay(date, today);
                      const isOutOfBounds = dateValue < minMealDate;

                      return (
                        <button
                          key={date.toISOString()}
                          type="button"
                          disabled={isOutOfBounds}
                          onClick={() => handleSelectCalendarDate(date)}
                          className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl text-sm font-medium transition-all ${
                            isSelectedStart || isSelectedEnd
                              ? "bg-emerald-600 text-white shadow-sm"
                              : isWithinPreviewRange
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                                : isCurrentMonth
                                  ? "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                  : "text-slate-300 hover:bg-slate-50 dark:text-slate-600"
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
                      onClick={handleResetToToday}
                      className="cursor-pointer text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400"
                    >
                      Hôm nay
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

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenDropdown((current) =>
                  current === "mealType" ? null : "mealType",
                )
              }
              className="flex min-w-[200px] cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <span className="flex items-center gap-3">
                {selectedMealType !== "all" && (() => {
                  const selectedMealTypeMeta = getMealTypeMeta(selectedMealType);
                  const SelectedMealTypeIcon = selectedMealTypeMeta.icon;

                  return (
                    <SelectedMealTypeIcon
                      size={16}
                      className={selectedMealTypeMeta.iconClassName}
                    />
                  );
                })()}
                {mealTypeConfig[selectedMealType].label}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  openDropdown === "mealType" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "mealType" && (
              <>
                <button
                  type="button"
                  aria-label="Đóng chọn loại bữa ăn"
                  className="fixed inset-0 z-10 cursor-pointer bg-transparent"
                  onClick={() => setOpenDropdown(null)}
                />
                <div className="absolute left-0 top-[calc(100%+8px)] z-20 min-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  {Object.entries(mealTypeConfig).map(([mealType, option]) => {
                    const OptionIcon = option.icon;

                    return (
                      <button
                        key={mealType}
                        type="button"
                        onClick={() => {
                          setSelectedMealType(mealType);
                          setOpenDropdown(null);
                        }}
                        className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                          selectedMealType === mealType
                            ? "bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {OptionIcon ? (
                          <OptionIcon size={16} className={option.iconClassName} />
                        ) : (
                          <div className="h-4 w-4" />
                        )}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportMeals}
          disabled={filteredMeals.length === 0}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-400 dark:hover:bg-emerald-950/40 dark:disabled:border-slate-800 dark:disabled:bg-slate-900 dark:disabled:text-slate-600"
        >
          <Download size={17} />
          Xuất file
        </button>
      </div>

      {(loading || error) && (
        <div className="border-b border-slate-100 px-5 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {loading ? "Đang tải lịch sử bữa ăn..." : error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <th className="px-5 py-4">Món ăn</th>
              <th className="px-5 py-4">Thời gian bữa ăn</th>
              <th className="px-5 py-4">Calo</th>
              <th className="px-5 py-4">Protein</th>
              <th className="px-5 py-4">Tinh bột</th>
              <th className="px-5 py-4">Chất béo</th>
              <th className="px-5 py-4">Trạng thái AI</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>

          <tbody>
            {paginatedMeals.length > 0 ? (
              paginatedMeals.map((meal) => {
                const mealTypeMeta = getMealTypeMeta(meal.mealType);
                const MealTypeIcon = mealTypeMeta.icon;

                return (
                  <tr
                    key={meal.id}
                    className="border-b border-slate-100 last:border-b-0 dark:border-slate-800 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={meal.imageUrl}
                          alt={meal.mealName}
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                        <div>
                          <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                            {meal.mealName}
                          </h3>
                          <p className="mt-1 max-w-[220px] text-sm leading-5 text-slate-500 dark:text-slate-400">
                            {meal.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        <MealTypeIcon
                          size={16}
                          strokeWidth={2}
                          className={mealTypeMeta.iconClassName}
                        />
                        <span>{mealTypeMeta.label}</span>
                      </div>
                      <p className="mt-1 text-base font-bold text-slate-950 dark:text-white">
                        {meal.mealTime}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatMealDate(meal.mealDate)}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="text-xl font-bold text-slate-950 dark:text-white">
                        {meal.totalCalories}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">kcal</p>
                    </td>

                    <td className="px-5 py-5 text-base font-semibold text-slate-700 dark:text-slate-300">
                      {meal.proteinGram} g
                    </td>

                    <td className="px-5 py-5 text-base font-semibold text-slate-700 dark:text-slate-300">
                      {meal.carbGram} g
                    </td>

                    <td className="px-5 py-5 text-base font-semibold text-slate-700 dark:text-slate-300">
                      {meal.fatGram} g
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle size={17} />
                        Hoàn tất
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-400">
                        {meal.modelName}
                      </p>
                    </td>

                    <td className="px-5 py-5 text-right">
                      <button className="cursor-pointer rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400">
                        <ArrowRight size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  Không có bữa ăn nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Đang hiển thị {startItem} đến {endItem} trong {filteredMeals.length} bữa ăn
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
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage === totalPages}
            className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
