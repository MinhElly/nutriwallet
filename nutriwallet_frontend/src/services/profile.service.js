/**
 * profile.service.js
 *
 * Tầng service cho dữ liệu hồ sơ người dùng.
 * Hiện tại trả về mock data — không gọi API.
 *
 * Sau này thay bằng:
 *   const response = await axios.get(`${API_BASE_URL}/profile`);
 *   return mapProfileData(response.data);
 */

import {
  profileData,
  applyProfileDataUpdates,
} from "../data/accountData";

/**
 * Lấy dữ liệu hồ sơ người dùng hiện tại.
 *
 * @returns {typeof profileData}
 */
export function getProfileData() {
  return profileData;
}

/**
 * Cập nhật hồ sơ người dùng (mock — cập nhật object in-memory).
 *
 * @param {{ fullName?: string, email?: string }} updates
 */
export function updateProfile(updates) {
  applyProfileDataUpdates(updates);
}
