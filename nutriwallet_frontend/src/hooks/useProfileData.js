import { useCallback, useEffect, useState } from "react";
import {
  fetchProfileData,
  getProfileData,
  updateProfile as serviceUpdateProfile,
  linkMessengerAccount,
  unlinkMessengerAccount,
} from "../services/profile.service";

export function useProfileData() {
  const [profileData, setProfileData] = useState(() => getProfileData());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchProfileData();
      setProfileData(result.data);
      setError(result.error ?? "");
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

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

  const linkAccount = useCallback(async (code) => {
    setSaving(true);
    try {
      const result = await linkMessengerAccount(code);
      if (!result.error) {
        await refetchProfile();
      }
      return result;
    } finally {
      setSaving(false);
    }
  }, [refetchProfile]);

  const unlinkAccount = useCallback(async () => {
    setSaving(true);
    try {
      const result = await unlinkMessengerAccount();
      if (!result.error) {
        await refetchProfile();
      }
      return result;
    } finally {
      setSaving(false);
    }
  }, [refetchProfile]);

  return {
    profileData,
    updateProfile,
    refetchProfile,
    linkAccount,
    unlinkAccount,
    loading,
    saving,
    error,
  };
}
