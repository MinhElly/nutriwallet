import api, {
  extractApiMessage,
  getStoredAccessToken,
  getStoredUser,
  persistAuthSession,
  unwrapApiData,
} from "./api";
import { mapCurrentUser } from "./auth.service";
import { uploadImage } from "./storage.service";
import { applyProfileDataUpdates } from "../data/accountData";

function mapStoredUserToProfileUser(storedUser) {
  if (!storedUser) {
    return null;
  }

  return {
    id: storedUser.id,
    fullName: storedUser.fullName ?? storedUser.full_name ?? "",
    email: storedUser.email ?? "",
    avatarUrl: storedUser.avatarUrl ?? storedUser.avatar_url ?? "",
    role: storedUser.rawRole ?? storedUser.role ?? "USER",
    status: storedUser.status ?? "ACTIVE",
    provider: storedUser.provider ?? "LOCAL",
    createdAt: storedUser.createdAt ?? null,
    updatedAt: storedUser.updatedAt ?? null,
  };
}

function getEmptyProfile() {
  const storedUser = getStoredUser();

  return {
    user: mapStoredUserToProfileUser(storedUser),
    emailVerification: null,
    chatbotProfile: null,
    stats: {
      mealCount: 0,
      expenseCount: 0,
      currentBudget: 0,
      memberSince: "—",
    },
  };
}

function mergeProfileData(apiUser, fallback = getEmptyProfile()) {
  const user = fallback.user ?? {};

  const memberSince = apiUser?.createdAt
    ? new Date(apiUser.createdAt).toLocaleDateString("vi-VN", {
        month: "2-digit",
        year: "numeric",
      })
    : fallback.stats?.memberSince || "—";

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
    chatbotProfile: apiUser?.chatbotProfile
      ? {
          id: apiUser.chatbotProfile.id,
          psid: apiUser.chatbotProfile.psid,
          platform: apiUser.chatbotProfile.platform,
          linkedAt: apiUser.chatbotProfile.linkedAt,
          guestSessionCode: apiUser.chatbotProfile.guestSessionCode,
        }
      : null,
    stats: {
      ...fallback.stats,
      memberSince,
    },
  };
}

export function getProfileData() {
  return getEmptyProfile();
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
      error: extractApiMessage(error, "Không thể tải hồ sơ."),
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
      error: extractApiMessage(error, "Không thể cập nhật hồ sơ lúc này."),
    };
  }
}

export async function getCurrentUser() {
  return unwrapApiData(await api.get("/api/users/me"));
}

export async function fetchAllUsers() {
  try {
    const users = unwrapApiData(await api.get("/api/users"));
    return {
      data: users.map((u) => mapCurrentUser(u)),
      error: null,
    };
  } catch (error) {
    console.warn("API fetchAllUsers failed.", error);
    return {
      data: [],
      error: extractApiMessage(error, "Không thể tải danh sách người dùng."),
    };
  }
}

export async function linkMessengerAccount(code) {
  try {
    const res = await api.post("/api/messenger/accounts/link", { code });
    return {
      data: unwrapApiData(res),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: extractApiMessage(error, "Không thể liên kết tài khoản Messenger."),
    };
  }
}

export async function unlinkMessengerAccount() {
  try {
    const res = await api.delete("/api/messenger/accounts/unlink");
    return {
      data: unwrapApiData(res),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: extractApiMessage(error, "Không thể hủy liên kết tài khoản Messenger."),
    };
  }
}

