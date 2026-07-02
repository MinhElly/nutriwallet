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
  
  const memberSince = apiUser?.createdAt ? new Date(apiUser.createdAt).toLocaleDateString("vi-VN", {
    month: "2-digit",
    year: "numeric"
  }) : (fallback.stats?.memberSince || "02/2026");

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
    chatbotProfile: apiUser?.chatbotProfile ? {
      id: apiUser.chatbotProfile.id,
      psid: apiUser.chatbotProfile.psid,
      platform: apiUser.chatbotProfile.platform,
      linkedAt: apiUser.chatbotProfile.linkedAt,
      guestSessionCode: apiUser.chatbotProfile.guestSessionCode,
    } : null,
    stats: {
      ...fallback.stats,
      memberSince: memberSince,
    }
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

const fallbackUsersList = [
  {
    id: 1,
    fullName: "Nguyễn Văn A",
    email: "vana@gmail.com",
    avatarUrl: "https://i.pravatar.cc/150?img=33",
    role: "Người dùng",
    rawRole: "USER",
    status: "ACTIVE",
    createdAt: "2026-06-01T09:00:00Z"
  },
  {
    id: 2,
    fullName: "Trần Thị B",
    email: "thib@gmail.com",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
    role: "Người dùng",
    rawRole: "USER",
    status: "ACTIVE",
    createdAt: "2026-06-15T14:30:00Z"
  },
  {
    id: 3,
    fullName: "Lê Văn Admin",
    email: "admin@nutriwallet.com",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    role: "Admin",
    rawRole: "ADMIN",
    status: "ACTIVE",
    createdAt: "2026-05-20T08:00:00Z"
  }
];

export async function fetchAllUsers() {
  try {
    const users = unwrapApiData(await api.get("/api/users"));
    return {
      data: users.map((u) => mapCurrentUser(u)),
      error: null,
    };
  } catch (error) {
    console.warn("API fetchAllUsers failed, using fallback mock data.", error);
    return {
      data: fallbackUsersList,
      error: null,
    };
  }
}
