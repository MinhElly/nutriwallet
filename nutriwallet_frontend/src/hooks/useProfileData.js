import { useCallback, useEffect, useState } from "react";
import {
  fetchProfileData,
  getProfileData,
  updateProfile as serviceUpdateProfile,
} from "../services/profile.service";

export function useProfileData() {
  const [profileData, setProfileData] = useState(() => getProfileData());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    fetchProfileData()
      .then((result) => {
        if (ignore) {
          return;
        }

        setProfileData(result.data);
        setError(result.error ?? "");
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      setSaving(true);

      try {
        const result = await serviceUpdateProfile(updates, profileData);
        setProfileData(result.data);
        setError(result.error ?? "");
        return result;
      } finally {
        setSaving(false);
      }
    },
    [profileData],
  );

  return { profileData, updateProfile, loading, saving, error };
}
