export function formatDateLabel(date) {
  return date.toLocaleDateString("vi-VN", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMonthYearLabel(date) {
  return date.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });
}

export function formatDateRangeLabel(startDate, endDate) {
  const formatShortDate = (date) =>
    date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
}

export function getCurrentDateLabel() {
  return formatDateLabel(new Date());
}

export function getCurrentGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return {
      text: "Chào buổi sáng",
      icon: "🌅",
    };
  }

  if (hour < 18) {
    return {
      text: "Chào buổi chiều",
      icon: "🌞",
    };
  }

  return {
    text: "Chào buổi tối",
    icon: "🌙",
  };
}

export function getWeekdayLabels() {
  return ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
}

export function isSameDay(firstDate, secondDate) {
  return (
    firstDate.getDate() === secondDate.getDate() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getFullYear() === secondDate.getFullYear()
  );
}

export function buildCalendarDays(viewDate) {
  const firstDayOfMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1,
  );
  const calendarStart = new Date(firstDayOfMonth);
  calendarStart.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);

    return {
      date,
      isCurrentMonth: date.getMonth() === viewDate.getMonth(),
    };
  });
}

export function getPeriodRange(selectedDate, selectedPeriod) {
  const endDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
  );
  const startDate = new Date(endDate);

  if (selectedPeriod === "7 ngày qua") {
    startDate.setDate(endDate.getDate() - 6);
    return { startDate, endDate };
  }

  if (selectedPeriod === "1 tháng qua") {
    startDate.setDate(endDate.getDate() - 29);
    return { startDate, endDate };
  }

  if (selectedPeriod === "3 tháng qua") {
    startDate.setDate(endDate.getDate() - 89);
    return { startDate, endDate };
  }

  return { startDate, endDate };
}

export function getInclusiveDayCount(startDate, endDate) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const normalizedStart = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  );
  const normalizedEnd = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  );

  return (
    Math.round((normalizedEnd.getTime() - normalizedStart.getTime()) / millisecondsPerDay) +
    1
  );
}
