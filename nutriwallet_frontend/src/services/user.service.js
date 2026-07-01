import api, {
  extractApiMessage,
  getStoredAccessToken,
  getStoredUser,
  persistAuthSession,
  unwrapApiData,
} from "./api";
import { mapCurrentUser } from "./auth.service";
import { uploadImage } from "./storage.service";
import {
  applyProfileDataUpdates,
  profileData as fallbackProfileData,
} from "../data/accountData";

function mapStoredUserToProfileUser(storedUser, fallbackUser = {}) {
  if (!storedUser) {
    return fallbackUser;
  }

  return {
    ...fallbackUser,
    id: storedUser.id ?? fallbackUser.id,
    fullName: storedUser.fullName ?? fallbackUser.fullName,
    email: storedUser.email ?? fallbackUser.email,
    avatarUrl: storedUser.avatarUrl ?? fallbackUser.avatarUrl,
    role: storedUser.rawRole ?? storedUser.role ?? fallbackUser.role,
    status: storedUser.status ?? fallbackUser.status,
    provider: storedUser.provider ?? fallbackUser.provider,
    createdAt: storedUser.createdAt ?? fallbackUser.createdAt,
    updatedAt: storedUser.updatedAt ?? fallbackUser.updatedAt,
  };
}

function getFallbackProfileData() {
  const storedUser = getStoredUser();

  return {
    ...fallbackProfileData,
    user: mapStoredUserToProfileUser(storedUser, {
      ...fallbackProfileData.user,
    }),
    stats: {
      ...fallbackProfileData.stats,
    },
    emailVerification: fallbackProfileData.emailVerification
      ? { ...fallbackProfileData.emailVerification }
      : null,
    chatbotProfile: fallbackProfileData.chatbotProfile
      ? { ...fallbackProfileData.chatbotProfile }
      : null,
  };
}

function mergeProfileData(apiUser, fallback = getFallbackProfileData()) {
  const user = fallback.user ?? {};

  return {
    ...fallback,
    user: {
      ...user,
      id: apiUser?.id ?? user.id,
      fullName: apiUser?.fullName ?? user.fullName,
      email: apiUser?.email ?? user.email,
      avatarUrl: apiUser?.avatarUrl ?? user.avatarUrl,
      role: apiUser?.role ?? user.role,
      status: apiUser?.status ?? user.status,
      provider: apiUser?.provider ?? user.provider,
      createdAt: apiUser?.createdAt ?? user.createdAt,
      updatedAt: apiUser?.updatedAt ?? user.updatedAt,
    },
  };
}

export function getProfileData() {
  return getFallbackProfileData();
}

export async function fetchProfileData() {
  const fallback = getProfileData();

  try {
    const user = unwrapApiData(await api.get("/api/users/me"));

    return {
      data: mergeProfileData(user, fallback),
      error: null,
    };
  } catch (error) {
    return {
      data: fallback,
      error: extractApiMessage(error, "Khong the tai ho so. Dang dung du lieu mau."),
    };
  }
}

export async function updateCurrentUser(
  updates,
  currentProfile = getProfileData(),
) {
  const fallback = currentProfile;
  const normalizedFullName =
    updates.fullName?.trim() || fallback.user?.fullName || "NutriWallet User";

  try {
    let avatarUrl = updates.avatarUrl;

    if (updates.avatarFile) {
      const uploadedImage = await uploadImage(updates.avatarFile);
      avatarUrl = uploadedImage.url;
    }

    const requestBody = {
      fullName: normalizedFullName,
      avatarUrl: avatarUrl ?? fallback.user?.avatarUrl ?? "",
    };

    const updatedUser = unwrapApiData(
      await api.patch("/api/users/me", requestBody),
    );
    const nextProfile = mergeProfileData(
      {
        ...fallback.user,
        ...updatedUser,
        avatarUrl: avatarUrl ?? updatedUser?.avatarUrl,
      },
      fallback,
    );

    if (getStoredAccessToken()) {
      persistAuthSession(
        mapCurrentUser(nextProfile.user, getStoredUser()),
        getStoredAccessToken(),
      );
    }

    applyProfileDataUpdates({
      fullName: nextProfile.user.fullName,
      avatarUrl: nextProfile.user.avatarUrl,
    });

    return {
      data: nextProfile,
      error: null,
    };
  } catch (error) {
    return {
      data: currentProfile,
      error: extractApiMessage(error, "Khong the cap nhat ho so luc nay."),
    };
  }
}

export async function getCurrentUser() {
  return unwrapApiData(await api.get("/api/users/me"));
}
