import { useCallback, useMemo } from "react";
import {
  getSettingsData,
  saveSettings as serviceSaveSettings,
} from "../services/settings.service";

/**
 * useSettingsData — hook lấy và lưu dữ liệu cài đặt.
 *
 * Page không import mock trực tiếp.
 * Sau này service gọi API, hook không cần thay đổi.
 *
 * @returns {{
 *   settingsData: ReturnType<typeof getSettingsData>,
 *   saveSettings: (state: Record<string, unknown>) => void,
 * }}
 */
export function useSettingsData() {
  const settingsData = useMemo(() => getSettingsData(), []);

  const saveSettings = useCallback((state) => {
    serviceSaveSettings(state);
  }, []);

  return { settingsData, saveSettings };
}
