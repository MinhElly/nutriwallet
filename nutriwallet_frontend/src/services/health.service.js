/**
 * health.service.js
 * Service quản lý hồ sơ sức khoẻ người dùng.
 * Lưu trữ tại localStorage (nw_health_profile) — sẵn sàng swap sang API khi backend thêm endpoint.
 */

export const HEALTH_STORAGE_KEY = "nw_health_profile";

// ─── Preset Data ────────────────────────────────────────────────────────────

export const MEDICAL_CONDITIONS = [
  { id: "diabetes", label: "Tiểu đường", icon: "🩸", severity: "high" },
  { id: "hypertension", label: "Cao huyết áp", icon: "❤️‍🔥", severity: "high" },
  { id: "heart_disease", label: "Tim mạch", icon: "💓", severity: "high" },
  { id: "gout", label: "Gout / Axit uric cao", icon: "🦵", severity: "medium" },
  { id: "kidney_disease", label: "Bệnh thận", icon: "🫘", severity: "high" },
  { id: "obesity", label: "Béo phì", icon: "⚖️", severity: "medium" },
  { id: "high_cholesterol", label: "Mỡ máu cao", icon: "🧬", severity: "medium" },
  { id: "gastric", label: "Đau dạ dày / GERD", icon: "🫁", severity: "medium" },
  { id: "fatty_liver", label: "Gan nhiễm mỡ", icon: "🫀", severity: "medium" },
  { id: "celiac", label: "Bệnh Celiac", icon: "🌾", severity: "high" },
  { id: "ibs", label: "Hội chứng ruột kích thích", icon: "🔄", severity: "medium" },
  { id: "anemia", label: "Thiếu máu", icon: "🩺", severity: "medium" },
  { id: "cancer", label: "Ung thư (đang điều trị)", icon: "🎗️", severity: "high" },
  { id: "other", label: "Khác", icon: "📋", severity: "low" },
];

export const COMMON_ALLERGIES = [
  { id: "gluten", label: "Gluten (lúa mì, lúa mạch)", icon: "🌾", keywords: ["bánh mì", "mì", "pasta", "lúa mì", "bột mì", "wheat", "gluten"] },
  { id: "peanut", label: "Lạc / Đậu phộng", icon: "🥜", keywords: ["lạc", "đậu phộng", "peanut", "groundnut"] },
  { id: "seafood", label: "Hải sản", icon: "🦐", keywords: ["tôm", "cua", "mực", "sò", "nghêu", "hàu", "cá biển", "seafood", "shrimp", "crab"] },
  { id: "shellfish", label: "Động vật có vỏ", icon: "🦀", keywords: ["tôm", "cua", "sò", "nghêu", "hàu", "lobster"] },
  { id: "egg", label: "Trứng", icon: "🥚", keywords: ["trứng", "egg", "omelette", "trứng gà", "mayonnaise"] },
  { id: "dairy", label: "Sữa & chế phẩm từ sữa", icon: "🥛", keywords: ["sữa", "phô mai", "bơ", "kem", "cheese", "milk", "dairy", "yogurt", "sữa chua"] },
  { id: "soy", label: "Đậu nành", icon: "🫘", keywords: ["đậu nành", "đậu hũ", "tofu", "soy", "soya", "miso", "tempeh"] },
  { id: "tree_nuts", label: "Hạt cây (hạnh nhân, óc chó…)", icon: "🌰", keywords: ["hạnh nhân", "óc chó", "hạt điều", "macadamia", "almond", "walnut", "cashew", "pecan"] },
  { id: "sesame", label: "Mè / Vừng", icon: "🌿", keywords: ["mè", "vừng", "sesame", "tahini"] },
  { id: "fish", label: "Cá (fish)", icon: "🐟", keywords: ["cá", "fish", "salmon", "tuna", "cá hồi", "cá ngừ"] },
  { id: "sulphites", label: "Sulphites / Sulfites", icon: "🍷", keywords: ["wine", "sulphite", "sulfite", "vinegar"] },
  { id: "mustard", label: "Mù tạt", icon: "🌭", keywords: ["mù tạt", "mustard"] },
];

export const USER_CLASSIFICATIONS = [
  {
    id: "BEGINNER",
    icon: "🌱",
    label: "Người mới bắt đầu",
    desc: "Mới theo dõi dinh dưỡng, đang hình thành thói quen",
    color: "border-emerald-400 bg-emerald-50/60 ring-emerald-400",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "INTERMEDIATE",
    icon: "📈",
    label: "Đang tiến bộ",
    desc: "Đã theo dõi 1-3 tháng, có mục tiêu cụ thể",
    color: "border-sky-400 bg-sky-50/60 ring-sky-400",
    badge: "bg-sky-100 text-sky-700",
  },
  {
    id: "ADVANCED",
    icon: "🏆",
    label: "Nâng cao",
    desc: "Theo dõi 6+ tháng, hiểu rõ dinh dưỡng cá nhân",
    color: "border-violet-400 bg-violet-50/60 ring-violet-400",
    badge: "bg-violet-100 text-violet-700",
  },
  {
    id: "ATHLETE",
    icon: "⚡",
    label: "Vận động viên",
    desc: "Tập luyện cường độ cao, cần dinh dưỡng tối ưu",
    color: "border-orange-400 bg-orange-50/60 ring-orange-400",
    badge: "bg-orange-100 text-orange-700",
  },
  {
    id: "MEDICAL",
    icon: "🏥",
    label: "Theo dõi y tế",
    desc: "Có bệnh lý cần giám sát dinh dưỡng chặt chẽ",
    color: "border-rose-400 bg-rose-50/60 ring-rose-400",
    badge: "bg-rose-100 text-rose-700",
  },
];

export const EVALUATION_SCHEDULES = [
  { id: "1_month", label: "1 tháng", desc: "Đánh giá lại mỗi tháng", months: 1, icon: "🗓️" },
  { id: "3_months", label: "3 tháng", desc: "Đánh giá mỗi quý", months: 3, icon: "📅" },
  { id: "6_months", label: "6 tháng", desc: "Đánh giá nửa năm", months: 6, icon: "📆" },
  { id: "12_months", label: "1 năm", desc: "Đánh giá hàng năm", months: 12, icon: "🎯" },
];

// ─── Default Profile ─────────────────────────────────────────────────────────

export const DEFAULT_HEALTH_PROFILE = {
  medicalConditions: [],
  customCondition: "",
  allergies: [],
  restrictedFoods: [],
  healthConsentGiven: false,
  healthConsentDate: null,
  userClassification: null,
  evaluationScheduleId: "3_months",
  nextEvaluationDate: null,
  lastUpdated: null,
};

// ─── Storage Helpers ─────────────────────────────────────────────────────────

/**
 * Đọc health profile từ localStorage.
 * @returns {typeof DEFAULT_HEALTH_PROFILE}
 */
export function getHealthProfile() {
  if (typeof window === "undefined") return { ...DEFAULT_HEALTH_PROFILE };
  try {
    const raw = window.localStorage.getItem(HEALTH_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_HEALTH_PROFILE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_HEALTH_PROFILE, ...parsed };
  } catch {
    return { ...DEFAULT_HEALTH_PROFILE };
  }
}

/**
 * Lưu health profile vào localStorage.
 * @param {Partial<typeof DEFAULT_HEALTH_PROFILE>} updates
 * @returns {typeof DEFAULT_HEALTH_PROFILE}
 */
export function saveHealthProfile(updates) {
  const current = getHealthProfile();
  const next = {
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(HEALTH_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

/**
 * Xoá toàn bộ health profile.
 */
export function clearHealthProfile() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(HEALTH_STORAGE_KEY);
  }
}

// ─── Evaluation Date Helpers ─────────────────────────────────────────────────

/**
 * Tính ngày đánh giá tiếp theo từ hôm nay.
 * @param {string} scheduleId
 * @returns {string} ISO date string
 */
export function calcNextEvaluationDate(scheduleId) {
  const schedule = EVALUATION_SCHEDULES.find((s) => s.id === scheduleId);
  const months = schedule?.months ?? 3;
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

/**
 * Kiểm tra xem có đến hoặc quá ngày đánh giá không.
 * @param {string|null} nextEvaluationDate
 * @returns {"overdue"|"due_soon"|"ok"|null}
 */
export function getEvaluationStatus(nextEvaluationDate) {
  if (!nextEvaluationDate) return null;
  const now = new Date();
  const evalDate = new Date(nextEvaluationDate);
  const diffDays = Math.ceil((evalDate - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "overdue";
  if (diffDays <= 14) return "due_soon";
  return "ok";
}

// ─── Health Alert Engine ─────────────────────────────────────────────────────

/**
 * Phân tích xem một món ăn có vi phạm hồ sơ sức khỏe không.
 *
 * @param {{foodName: string, description?: string, ingredients?: string[]}} mealInfo
 * @param {typeof DEFAULT_HEALTH_PROFILE} healthProfile
 * @returns {Array<{type: "allergy"|"restriction"|"condition", severity: "danger"|"warning"|"info", title: string, detail: string, icon: string}>}
 */
export function getHealthAlerts(mealInfo, healthProfile) {
  if (!healthProfile) return [];
  const alerts = [];
  const { foodName = "", description = "", ingredients = [] } = mealInfo;

  // Tất cả text để match
  const searchText = [foodName, description, ...ingredients]
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // bỏ dấu để match dễ hơn

  // 1. Kiểm tra dị ứng
  if (Array.isArray(healthProfile.allergies)) {
    for (const allergyId of healthProfile.allergies) {
      const allergyInfo = COMMON_ALLERGIES.find((a) => a.id === allergyId);
      if (!allergyInfo) continue;

      const matched = allergyInfo.keywords.some((kw) => {
        const kwNorm = kw
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return searchText.includes(kwNorm);
      });

      if (matched) {
        alerts.push({
          id: `allergy_${allergyId}`,
          type: "allergy",
          severity: "danger",
          icon: allergyInfo.icon,
          title: `Cảnh báo dị ứng: ${allergyInfo.label}`,
          detail: `Món ăn này có thể chứa thành phần gây dị ứng ${allergyInfo.label} của bạn. Hãy kiểm tra kỹ nguyên liệu.`,
        });
      }
    }
  }

  // 2. Kiểm tra thực phẩm hạn chế
  if (Array.isArray(healthProfile.restrictedFoods)) {
    for (const food of healthProfile.restrictedFoods) {
      const foodNorm = food
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (searchText.includes(foodNorm)) {
        alerts.push({
          id: `restriction_${food}`,
          type: "restriction",
          severity: "warning",
          icon: "🚫",
          title: `Thực phẩm hạn chế: ${food}`,
          detail: `Bạn đã đặt hạn chế với "${food}". Cân nhắc kỹ trước khi dùng.`,
        });
      }
    }
  }

  // 3. Cảnh báo theo bệnh nền (rule-based)
  if (Array.isArray(healthProfile.medicalConditions)) {
    const CONDITION_RULES = {
      diabetes: {
        keywords: ["đường", "bánh ngọt", "nước ngọt", "kẹo", "chè", "kem", "cơm trắng", "bún", "miến", "bánh mì trắng"],
        title: "Lưu ý bệnh tiểu đường",
        detail: "Món này có thể có hàm lượng đường hoặc tinh bột cao — ảnh hưởng đến đường huyết.",
        icon: "🩸",
        severity: "warning",
      },
      hypertension: {
        keywords: ["muối", "mắm", "nước tương", "sốt cà chua", "khoai tây chiên", "fast food", "đồ hộp", "xúc xích", "lạp xưởng"],
        title: "Lưu ý cao huyết áp",
        detail: "Món này có thể chứa natri cao — không tốt cho người bị cao huyết áp.",
        icon: "❤️‍🔥",
        severity: "warning",
      },
      gout: {
        keywords: ["nội tạng", "tim", "gan", "thận", "lòng", "hải sản", "tôm", "cua", "bia", "rượu", "thịt đỏ", "bò", "heo", "nấm"],
        title: "Lưu ý bệnh Gout",
        detail: "Món này có thể giàu purine — có thể kích phát cơn gout.",
        icon: "🦵",
        severity: "warning",
      },
      kidney_disease: {
        keywords: ["kali", "muối", "phô mai", "thịt đỏ", "thận", "đạm cao"],
        title: "Lưu ý bệnh thận",
        detail: "Người bệnh thận cần hạn chế protein, kali và natri. Hãy tham khảo bác sĩ.",
        icon: "🫘",
        severity: "danger",
      },
      high_cholesterol: {
        keywords: ["chiên", "nội tạng", "bơ", "kem", "mỡ", "trứng", "phô mai", "fast food", "xúc xích"],
        title: "Lưu ý mỡ máu cao",
        detail: "Món này có thể giàu chất béo bão hoà — không tốt cho người mỡ máu cao.",
        icon: "🧬",
        severity: "warning",
      },
    };

    for (const conditionId of healthProfile.medicalConditions) {
      const rule = CONDITION_RULES[conditionId];
      if (!rule) continue;

      const matched = rule.keywords.some((kw) => {
        const kwNorm = kw
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return searchText.includes(kwNorm);
      });

      if (matched) {
        alerts.push({
          id: `condition_${conditionId}`,
          type: "condition",
          severity: rule.severity,
          icon: rule.icon,
          title: rule.title,
          detail: rule.detail,
        });
      }
    }
  }

  return alerts;
}

/**
 * Kiểm tra nhanh xem health profile có đủ dữ liệu để hiển thị không.
 * @param {typeof DEFAULT_HEALTH_PROFILE} profile
 * @returns {boolean}
 */
export function isHealthProfileComplete(profile) {
  return !!(
    profile &&
    profile.healthConsentGiven &&
    profile.userClassification
  );
}
