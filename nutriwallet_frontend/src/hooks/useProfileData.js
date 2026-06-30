import { useCallback, useMemo, useState } from "react";
import {
  getProfileData,
  updateProfile as serviceUpdateProfile,
} from "../services/profile.service";

/**
 * useProfileData — hook lấy và cập nhật dữ liệu hồ sơ người dùng.
 *
 * Page không import mock trực tiếp.
 * Sau này service gọi API, hook không cần thay đổi.
 *
 * @returns {{
 *   profileData: ReturnType<typeof getProfileData>,
 *   updateProfile: (updates: { fullName?: string, email?: string }) => void,
 * }}
 */
export function useProfileData() {
  const initialData = useMemo(() => getProfileData(), []);
  const [profileData, setProfileData] = useState(initialData);

  const updateProfile = useCallback((updates) => {
    serviceUpdateProfile(updates);
    setProfileData((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        ...(updates.fullName !== undefined && { fullName: updates.fullName }),
        ...(updates.email !== undefined && { email: updates.email }),
      },
    }));
  }, []);

  return { profileData, updateProfile };
}
