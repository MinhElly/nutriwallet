import Typewriter from "../common/Typewriter";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { dashboardMeta, userInfo } from "../../data/dashboardData";
import {
  buildCalendarDays,
  formatDateLabel,
  formatDateRangeLabel,
  formatMonthYearLabel,
  getCurrentGreeting,
  getPeriodRange,
  getWeekdayLabels,
  isSameDay,
} from "../../utils/date";

const periodOptions = [
  "Hôm nay",
  "7 ngày qua",
  "1 tháng qua",
  "3 tháng qua",
];

export default function DashboardHeader({
  selectedDate,
  onDateChange,
  selectedPeriod,
  onPeriodChange,
}) {
  const today = new Date();
  const greeting = getCurrentGreeting();
  const weekdayLabels = getWeekdayLabels();
  const defaultPeriod =
    periodOptions.find((option) => option === dashboardMeta.periodLabel) ??
    periodOptions[2];

  const [viewDate, setViewDate] = useState(selectedDate);
  const [localPeriod, setLocalPeriod] = useState(selectedPeriod ?? defaultPeriod);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);

  const effectivePeriod = selectedPeriod ?? localPeriod;
  const periodLabel = useMemo(() => effectivePeriod, [effectivePeriod]);
  const dateLabel = useMemo(
    () => formatDateLabel(selectedDate),
    [selectedDate],
  );
  const periodRangeLabel = useMemo(() => {
    const { startDate, endDate } = getPeriodRange(selectedDate, effectivePeriod);
    return formatDateRangeLabel(startDate, endDate);
  }, [selectedDate, effectivePeriod]);
  const monthYearLabel = useMemo(
    () => formatMonthYearLabel(viewDate),
    [viewDate],
  );
  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);

  const setPeriod = (nextPeriod) => {
    setLocalPeriod(nextPeriod);
    onPeriodChange?.(nextPeriod);
  };

  const openDatePicker = () => {
    setIsPeriodMenuOpen(false);
    setViewDate(selectedDate);
    setIsDatePickerOpen((current) => !current);
  };

  const changeMonth = (offset) => {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  return (
    <header className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <h2 className="overflow-hidden whitespace-nowrap text-[1.1rem] font-bold tracking-tight sm:text-[1.75rem] xl:text-[2rem]">
          <span className="text-slate-900 dark:text-white">
            <Typewriter
              text={`${greeting.icon} ${greeting.text}, `}
              speed={55}
              loop={false}
              showCursor={false}
            />
          </span>

          <span className="text-emerald-600 dark:text-emerald-400">
            <Typewriter
              text={userInfo.name}
              speed={55}
              initialDelay={800}
              loop={false}
              cursorChar="_"
              cursorClassName="ml-1 text-emerald-500"
            />
          </span>
        </h2>

        <p className="mt-1.5 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          {dashboardMeta.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative">
          <button
            type="button"
            onClick={openDatePicker}
            className="flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <CalendarDays size={16} strokeWidth={1.9} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{dateLabel}</span>
          </button>

          {isDatePickerOpen && (
            <>
              <button
                type="button"
                aria-label="Đóng chọn ngày"
                className="fixed inset-0 z-10 cursor-pointer bg-transparent"
                onClick={() => setIsDatePickerOpen(false)}
              />
              <div className="absolute left-0 top-full z-20 mt-2 w-[calc(100vw-2rem)] max-w-[320px] rounded-3xl border border-slate-200 bg-white p-4 shadow-xl sm:left-auto sm:right-0 sm:w-[320px] dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
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
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      <ChevronLeft size={16} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => changeMonth(1)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, today);

                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => {
                          onDateChange(date);
                          setViewDate(date);
                          setIsDatePickerOpen(false);
                        }}
                        className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl text-sm font-medium transition-all ${isSelected
                            ? "bg-emerald-600 text-white shadow-sm"
                            : isCurrentMonth
                              ? "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                              : "text-slate-300 hover:bg-slate-50 dark:text-slate-600 dark:hover:bg-slate-800"
                          } ${isToday && !isSelected ? "ring-1 ring-emerald-200 dark:ring-emerald-800" : ""}`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      onDateChange(today);
                      setViewDate(today);
                    }}
                    className="cursor-pointer text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    Hôm nay
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(false)}
                    className="cursor-pointer text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isPeriodMenuOpen}
            onClick={() => {
              setIsDatePickerOpen(false);
              setIsPeriodMenuOpen((current) => !current);
            }}
            className="flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {periodLabel}
            <ChevronDown
              size={14}
              strokeWidth={1.9}
              className={`transition-transform ${isPeriodMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isPeriodMenuOpen && (
            <>
              <button
                type="button"
                aria-label="Đóng chọn thời gian"
                className="fixed inset-0 z-10 cursor-pointer bg-transparent"
                onClick={() => setIsPeriodMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                {periodOptions.map((option) => {
                  const isActive = option === effectivePeriod;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setPeriod(option);
                        setIsPeriodMenuOpen(false);
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${isActive
                          ? "bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                    >
                      <span>{option}</span>
                      {isActive && <Check size={15} strokeWidth={2} />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 shadow-sm sm:text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          {periodRangeLabel}
        </div>
      </div>
    </header>
  );
}
