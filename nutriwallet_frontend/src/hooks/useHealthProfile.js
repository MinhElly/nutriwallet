import { useState, useEffect, useCallback } from "react";
import {
  getHealthProfile as getLocalProfile,
  saveHealthProfile as persistLocalProfile,
  getHealthAlerts,
  isHealthProfileComplete,
  calcNextEvaluationDate,
  getEvaluationStatus,
  DEFAULT_HEALTH_PROFILE,
  MEDICAL_CONDITIONS,
  COMMON_ALLERGIES,
  HEALTH_STORAGE_KEY,
} from "../services/health.service";
import {
  getHealthProfile as getHealthProfileApi,
  updateHealthProfile as updateHealthProfileApi,
} from "../services/healthProfile.service";

// ─── API Mappers ─────────────────────────────────────────────────────────────

const CONDITION_MAP = {
  DIABETES: "diabetes",
  HYPERTENSION: "hypertension",
  CARDIOVASCULAR: "heart_disease",
  KIDNEY_DISEASE: "kidney_disease",
};

const REVERSE_CONDITION_MAP = {
  diabetes: "DIABETES",
  hypertension: "HYPERTENSION",
  heart_disease: "CARDIOVASCULAR",
  kidney_disease: "KIDNEY_DISEASE",
};

const ALLERGY_MAP = {
  PEANUT: "peanut",
  TREE_NUT: "tree_nuts",
  MILK: "dairy",
  EGG: "egg",
  SOY: "soy",
  WHEAT: "gluten",
  SESAME: "sesame",
};

const REVERSE_ALLERGY_MAP = {
  peanut: "PEANUT",
  tree_nuts: "TREE_NUT",
  dairy: "MILK",
  egg: "EGG",
  soy: "SOY",
  gluten: "WHEAT",
  sesame: "SESAME",
};

/**
 * Ánh xạ dữ liệu từ API response sang cấu trúc của frontend.
 */
function mapApiToLocal(apiProfile) {
  if (!apiProfile) return { ...DEFAULT_HEALTH_PROFILE };

  const medicalConditions = [];
  let customCondition = "";

  (apiProfile.conditions || []).forEach((c) => {
    if (CONDITION_MAP[c.type]) {
      medicalConditions.push(CONDITION_MAP[c.type]);
    } else if (c.type === "OTHER") {
      medicalConditions.push("other");
      customCondition = c.customValue || "";
    }
  });

  const allergies = [];
  (apiProfile.allergies || []).forEach((a) => {
    if (ALLERGY_MAP[a.type]) {
      allergies.push(ALLERGY_MAP[a.type]);
    } else if (a.type === "SEAFOOD") {
      allergies.push("seafood");
      if (a.customValue) {
        const parts = a.customValue.split(",").map((s) => s.trim());
        parts.forEach((p) => {
          if (p === "shellfish") allergies.push("shellfish");
          if (p === "fish") allergies.push("fish");
        });
      }
    } else if (a.type === "OTHER" && a.customValue) {
      const parts = a.customValue.split(",").map((s) => s.trim());
      parts.forEach((p) => {
        const matched = COMMON_ALLERGIES.find(
          (x) => x.label.toLowerCase() === p.toLowerCase() || x.id.toLowerCase() === p.toLowerCase()
        );
        if (matched) {
          allergies.push(matched.id);
        } else {
          allergies.push(p);
        }
      });
    }
  });

  // Khôi phục các giá trị chỉ lưu cục bộ ở frontend từ localStorage
  let userClassification = null;
  let evaluationScheduleId = "3_months";
  try {
    const local = JSON.parse(window.localStorage.getItem(HEALTH_STORAGE_KEY) || "{}");
    userClassification = local.userClassification || null;
    evaluationScheduleId = local.evaluationScheduleId || "3_months";
  } catch {
    // ignore
  }

  const nextEvaluationDate =
    evaluationScheduleId === "12_months"
      ? apiProfile.nextAnnualReviewAt
        ? apiProfile.nextAnnualReviewAt.slice(0, 10)
        : null
      : apiProfile.nextQuarterlyReviewAt
      ? apiProfile.nextQuarterlyReviewAt.slice(0, 10)
      : null;

  return {
    medicalConditions,
    customCondition,
    allergies,
    restrictedFoods: apiProfile.foodRestrictions || [],
    healthConsentGiven: Boolean(apiProfile.consentGiven),
    healthConsentDate: apiProfile.firstCompletedAt || apiProfile.lastReviewedAt || null,
    userClassification,
    evaluationScheduleId,
    nextEvaluationDate,
    lastUpdated: apiProfile.lastReviewedAt || null,
    profileVersion: apiProfile.profileVersion || 0,
  };
}

/**
 * Ánh xạ dữ liệu từ frontend sang payload gửi lên API.
 */
function mapLocalToApi(localProfile) {
  const conditions = [];
  const otherConditions = [];

  (localProfile.medicalConditions || []).forEach((c) => {
    if (REVERSE_CONDITION_MAP[c]) {
      conditions.push({ type: REVERSE_CONDITION_MAP[c], customValue: null });
    } else if (c === "other") {
      // Bỏ qua, xử lý ở dưới cùng customCondition
    } else {
      const matched = MEDICAL_CONDITIONS.find((m) => m.id === c);
      if (matched) otherConditions.push(matched.label);
    }
  });

  if (localProfile.customCondition) {
    otherConditions.push(localProfile.customCondition);
  }

  if (otherConditions.length > 0) {
    conditions.push({ type: "OTHER", customValue: otherConditions.join(", ") });
  }

  const allergies = [];
  const otherAllergies = [];
  let hasSeafood = false;
  const seafoodExtras = [];

  (localProfile.allergies || []).forEach((a) => {
    if (REVERSE_ALLERGY_MAP[a]) {
      allergies.push({ type: REVERSE_ALLERGY_MAP[a], customValue: a === "gluten" ? "gluten" : null });
    } else if (a === "seafood") {
      hasSeafood = true;
    } else if (a === "shellfish") {
      hasSeafood = true;
      seafoodExtras.push("shellfish");
    } else if (a === "fish") {
      hasSeafood = true;
      seafoodExtras.push("fish");
    } else {
      const matched = COMMON_ALLERGIES.find((x) => x.id === a);
      if (matched) otherAllergies.push(matched.label);
      else otherAllergies.push(a);
    }
  });

  if (hasSeafood) {
    allergies.push({
      type: "SEAFOOD",
      customValue: seafoodExtras.length > 0 ? seafoodExtras.join(", ") : null,
    });
  }

  if (otherAllergies.length > 0) {
    allergies.push({ type: "OTHER", customValue: otherAllergies.join(", ") });
  }

  return {
    consentGiven: Boolean(localProfile.healthConsentGiven),
    conditions,
    allergies,
    foodRestrictions: localProfile.restrictedFoods || [],
    profileVersion: localProfile.profileVersion || 0,
  };
}

// ─── useHealthProfile Hook ───────────────────────────────────────────────────

/**
 * useHealthProfile
 * Custom hook quản lý hồ sơ sức khỏe người dùng từ API Backend.
 */
export function useHealthProfile() {
  const [healthProfile, setHealthProfile] = useState(() => getLocalProfile());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch từ API khi mount
  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const apiProfile = await getHealthProfileApi();
        if (active) {
          const localMapped = mapApiToLocal(apiProfile);
          setHealthProfile(localMapped);
          // Đồng bộ ngược lại localStorage
          persistLocalProfile(localMapped);
        }
      } catch (err) {
        console.error("Failed to load health profile from API:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  // Reload khi localStorage thay đổi từ tab khác
  useEffect(() => {
    const handler = (e) => {
      if (e.key === HEALTH_STORAGE_KEY) {
        setHealthProfile(getLocalProfile());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const saveHealthProfile = useCallback(async (updates) => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const current = getLocalProfile();
      const scheduleChanged =
        updates.evaluationScheduleId &&
        updates.evaluationScheduleId !== current.evaluationScheduleId;

      const nextLocalDraft = {
        ...current,
        ...updates,
        ...(scheduleChanged
          ? { nextEvaluationDate: calcNextEvaluationDate(updates.evaluationScheduleId) }
          : {}),
        ...(updates.healthConsentGiven && !current.healthConsentGiven
          ? { healthConsentDate: new Date().toISOString() }
          : {}),
      };

      // Gọi API gửi dữ liệu lên Backend
      const apiPayload = mapLocalToApi(nextLocalDraft);
      const apiResponse = await updateHealthProfileApi(apiPayload);

      // Nhận response và lưu cục bộ
      const finalLocal = {
        ...mapApiToLocal(apiResponse),
        // Giữ lại các trường frontend-only từ nextLocalDraft
        userClassification: nextLocalDraft.userClassification,
        evaluationScheduleId: nextLocalDraft.evaluationScheduleId,
        nextEvaluationDate: nextLocalDraft.nextEvaluationDate,
      };

      // Lưu cục bộ và cập nhật state
      persistLocalProfile(finalLocal);
      setHealthProfile(finalLocal);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return { success: true, data: finalLocal };
    } catch (err) {
      const msg = err?.message || "Không thể lưu hồ sơ sức khỏe.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSaving(false);
    }
  }, []);

  /**
   * Lấy danh sách cảnh báo cho một món ăn cụ thể.
   * @param {{foodName: string, description?: string, ingredients?: string[]}} mealInfo
   */
  const getAlertsForMeal = useCallback(
    (mealInfo) => {
      if (!healthProfile?.healthConsentGiven) return [];
      return getHealthAlerts(mealInfo, healthProfile);
    },
    [healthProfile],
  );

  const isComplete = isHealthProfileComplete(healthProfile);
  const evaluationStatus = getEvaluationStatus(healthProfile?.nextEvaluationDate);

  return {
    healthProfile,
    saveHealthProfile,
    getAlertsForMeal,
    isComplete,
    evaluationStatus,
    isLoading,
    isSaving,
    error,
    saveSuccess,
    DEFAULT_HEALTH_PROFILE,
  };
}
