import { useState, useEffect, useCallback } from "react";
import {
  getHealthProfile,
  saveHealthProfile as persistHealthProfile,
  getHealthAlerts,
  isHealthProfileComplete,
  calcNextEvaluationDate,
  getEvaluationStatus,
  DEFAULT_HEALTH_PROFILE,
} from "../services/health.service";

/**
 * useHealthProfile
 * Custom hook quản lý hồ sơ sức khỏe người dùng từ localStorage.
 */
export function useHealthProfile() {
  const [healthProfile, setHealthProfile] = useState(() => getHealthProfile());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Reload khi localStorage thay đổi từ tab khác
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "nw_health_profile") {
        setHealthProfile(getHealthProfile());
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
      // Nếu có thay đổi evaluation schedule → tính lại ngày tiếp theo
      const current = getHealthProfile();
      const scheduleChanged =
        updates.evaluationScheduleId &&
        updates.evaluationScheduleId !== current.evaluationScheduleId;

      const payload = {
        ...updates,
        ...(scheduleChanged
          ? { nextEvaluationDate: calcNextEvaluationDate(updates.evaluationScheduleId) }
          : {}),
        // Đảm bảo có consent date khi consent được grant lần đầu
        ...(updates.healthConsentGiven && !current.healthConsentGiven
          ? { healthConsentDate: new Date().toISOString() }
          : {}),
      };

      const next = persistHealthProfile(payload);
      setHealthProfile(next);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return { success: true, data: next };
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
    isSaving,
    error,
    saveSuccess,
    // convenience defaults
    DEFAULT_HEALTH_PROFILE,
  };
}
