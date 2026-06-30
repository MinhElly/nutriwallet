/**
 * settings.service.js
 *
 * Tầng service cho dữ liệu cài đặt ứng dụng.
 * Hiện tại trả về mock data — không gọi API.
 *
 * Sau này thay bằng:
 *   const response = await axios.get(`${API_BASE_URL}/settings`);
 *   return mapSettingsData(response.data);
 */

import {
  settingsData,
  applySettingsState,
} from "../data/accountData";

/**
 * Lấy dữ liệu cài đặt hiện tại.
 *
 * @returns {typeof settingsData}
 */
export function getSettingsData() {
  return settingsData;
}

/**
 * Lưu cài đặt mới (mock — cập nhật object in-memory).
 *
 * @param {Record<string, unknown>} settingsState
 */
export function saveSettings(settingsState) {
  applySettingsState(settingsState);
}
