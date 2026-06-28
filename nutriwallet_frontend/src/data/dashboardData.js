import { getInclusiveDayCount, getPeriodRange } from "../utils/date";

const currencyFormatter = new Intl.NumberFormat("en-US");

const monthlyBudgetValue = 6000000;
const warningThreshold = 20;

const mealTemplates = [
  {
    name: "Phở bò",
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=80&h=80&fit=crop",
    slot: "Bữa sáng",
    time: "08:30 AM",
    calories: 540,
    protein: 34,
    carb: 48,
    fat: 18,
  },
  {
    name: "Bánh mì bơ",
    image:
      "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=80&h=80&fit=crop",
    slot: "Bữa trưa",
    time: "12:45 PM",
    calories: 320,
    protein: 12,
    carb: 30,
    fat: 15,
  },
  {
    name: "Bún bò Huế",
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=80&h=80&fit=crop",
    slot: "Bữa tối",
    time: "07:15 PM",
    calories: 610,
    protein: 38,
    carb: 50,
    fat: 20,
  },
  {
    name: "Cơm tấm",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=80&h=80&fit=crop",
    slot: "Bữa trưa",
    time: "11:50 AM",
    calories: 720,
    protein: 40,
    carb: 80,
    fat: 22,
  },
  {
    name: "Salad gà",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=80&h=80&fit=crop",
    slot: "Bữa tối",
    time: "06:30 PM",
    calories: 430,
    protein: 28,
    carb: 20,
    fat: 16,
  },
  {
    name: "Sữa chua trái cây",
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=80&h=80&fit=crop",
    slot: "Bữa phụ",
    time: "03:20 PM",
    calories: 210,
    protein: 10,
    carb: 26,
    fat: 8,
  },
];

const expenseTemplates = [
  {
    category: "Tạp hóa",
    note: "Siêu thị",
    baseAmount: 120000,
    currency: "VND",
  },
  {
    category: "Ăn ngoài",
    note: "Ăn trưa",
    baseAmount: 90000,
    currency: "VND",
  },
  {
    category: "Di chuyển",
    note: "Xe buýt",
    baseAmount: 35000,
    currency: "VND",
  },
  {
    category: "Tạp hóa",
    note: "Mua rau củ",
    baseAmount: 140000,
    currency: "VND",
  },
  {
    category: "Ăn ngoài",
    note: "Ăn tối",
    baseAmount: 110000,
    currency: "VND",
  },
  {
    category: "Sức khỏe",
    note: "Vitamin",
    baseAmount: 80000,
    currency: "VND",
  },
];

export const userInfo = {
  name: "Alex Nguyen",
  role: "Người dùng",
  email: "alex.nguyen@email.com",
  avatar: "https://i.pravatar.cc/100?img=12",
  emailVerified: true,
  emailVerifiedAt: "10/02/2024 10:22 AM",
  messengerPlatform: "Messenger",
  messengerLinkedAt: "10/02/2024 10:25 AM",
};

export const dashboardMeta = {
  periodLabel: "1 tháng qua",
  description:
    "Đây là tổng quan sức khỏe, bữa ăn, chi tiêu và phân tích AI của bạn.",
};

export const aiRecommendations = [
  {
    id: "budget-milk-tea",
    icon: "budget",
    tone: "warning",
    content:
      "Bạn đang chi 30% ngân sách cho trà sữa. Cân nhắc giảm xuống 2 lần/tuần.",
  },
  {
    id: "protein-alert",
    icon: "nutrition",
    tone: "caution",
    content: "Hôm nay thiếu protein 15%. Thêm thịt hoặc đậu vào bữa tối nhé.",
  },
  {
    id: "water-streak",
    icon: "positive",
    tone: "success",
    content: "Tuyệt vời! Uống đủ nước và đạt streak 12 ngày liên tiếp.",
  },
  {
    id: "lunch-suggestion",
    icon: "suggestion",
    tone: "info",
    content: "Bữa trưa tối ưu: gỏi cuốn + nước dừa (180 kcal, 30k).",
  },
];

function formatVnd(value) {
  return `${currencyFormatter.format(value)} VND`;
}

function formatNumber(value) {
  return currencyFormatter.format(value);
}

function formatDateDisplay(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function getDaysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function generateMealsForDate(date) {
  const day = date.getDate();
  const count = 2 + (day % 3);

  return Array.from({ length: count }, (_, index) => {
    const template = mealTemplates[(day + index) % mealTemplates.length];
    const caloriesValue = template.calories + ((day + index * 2) % 4) * 25;
    const proteinValue = template.protein + ((day + index) % 3) * 2;
    const carbValue = template.carb + ((day + index * 3) % 4) * 3;
    const fatValue = template.fat + ((day + index) % 2) * 2;

    return {
      name: template.name,
      image: template.image,
      time: `${template.slot}\n${template.time}`,
      date: formatDateDisplay(date),
      calories: `${caloriesValue} kcal`,
      caloriesValue,
      protein: `${proteinValue} g`,
      carb: `${carbValue} g`,
      fat: `${fatValue} g`,
    };
  });
}

function generateExpensesForDate(date) {
  const day = date.getDate();
  const count = 2 + (day % 2);

  return Array.from({ length: count }, (_, index) => {
    const template =
      expenseTemplates[(day * 2 + index) % expenseTemplates.length];
    const amountValue =
      template.baseAmount + (((day + 3) * (index + 2) * 6000) % 35000);

    return {
      category: template.category,
      amount: formatNumber(amountValue),
      amountValue,
      currency: template.currency,
      date: formatDateDisplay(date),
      note: template.note,
    };
  });
}

function getDatesInRange(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function buildDailyTrend(rangeDates, valueBuilder) {
  const dayCount = rangeDates.length;
  const useWeekdayLabel = dayCount <= 7;
  const trendData = rangeDates.map((date) => ({
    day: useWeekdayLabel
      ? date.toLocaleDateString("vi-VN", { weekday: "short" })
      : date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
    value: valueBuilder(date),
  }));

  if (trendData.length === 1) {
    return [
      { ...trendData[0], day: "Đầu ngày" },
      { ...trendData[0], day: "Cuối ngày" },
    ];
  }

  return trendData;
}

function getAllocatedBudgetValue(selectedDate, selectedPeriod, rangeDayCount) {
  if (selectedPeriod === "3 tháng qua") {
    return monthlyBudgetValue * 3;
  }

  if (selectedPeriod === "1 tháng qua") {
    return monthlyBudgetValue;
  }

  const dailyBudget = monthlyBudgetValue / getDaysInMonth(selectedDate);

  return Math.round(dailyBudget * rangeDayCount);
}

export function getDashboardSnapshot(selectedDate, selectedPeriod) {
  const { startDate, endDate } = getPeriodRange(selectedDate, selectedPeriod);
  const rangeDates = getDatesInRange(startDate, endDate);
  const rangeDayCount = getInclusiveDayCount(startDate, endDate);

  const meals = rangeDates.flatMap((date) => generateMealsForDate(date)).reverse();
  const expenses = rangeDates
    .flatMap((date) => generateExpensesForDate(date))
    .reverse();

  const totalExpenseValue = expenses.reduce(
    (sum, item) => sum + item.amountValue,
    0,
  );
  const allocatedBudgetValue = getAllocatedBudgetValue(
    selectedDate,
    selectedPeriod,
    rangeDayCount,
  );
  const remainingBudgetValue = Math.max(
    allocatedBudgetValue - totalExpenseValue,
    0,
  );
  const usedPercentValue = Math.min(
    Math.round((totalExpenseValue / allocatedBudgetValue) * 100),
    100,
  );
  const totalCaloriesValue = meals.reduce(
    (sum, meal) => sum + meal.caloriesValue,
    0,
  );

  const mealTrend = buildDailyTrend(rangeDates, (date) =>
    generateMealsForDate(date).reduce((sum, meal) => sum + meal.caloriesValue, 0),
  );
  const expenseTrend = buildDailyTrend(rangeDates, (date) =>
    generateExpensesForDate(date).reduce((sum, item) => sum + item.amountValue, 0),
  );

  return {
    budgetSummary: {
      amount: formatVnd(allocatedBudgetValue),
      period: selectedPeriod,
      duration: `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`,
      warningThreshold,
      usedPercent: usedPercentValue,
      spent: formatVnd(totalExpenseValue),
      remaining: formatVnd(remainingBudgetValue),
    },
    budgetUsage: [
      {
        name: "Đã dùng",
        value: usedPercentValue,
        fill: "#059669",
      },
    ],
    mealSummary: {
      totalMeals: meals.length,
      totalCalories: `${formatNumber(totalCaloriesValue)} kcal`,
      helperText:
        selectedPeriod === "Hôm nay"
          ? "Bữa ăn trong ngày đã chọn"
          : `Bữa ăn trong ${selectedPeriod.toLowerCase()}`,
    },
    expenseSummary: {
      totalExpenses: expenses.length,
      totalAmount: formatVnd(totalExpenseValue),
      helperText:
        selectedPeriod === "Hôm nay"
          ? "Khoản chi trong ngày đã chọn"
          : `Khoản chi trong ${selectedPeriod.toLowerCase()}`,
    },
    mealTrend,
    expenseTrend,
    meals,
    expenses,
  };
}
