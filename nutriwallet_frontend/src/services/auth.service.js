import api, {
  clearAuthSession,
  createApiError,
  getStoredAccessToken,
  getStoredUser,
  persistAuthSession,
  readStoredSession,
  unwrapApiData,
  ACCESS_TOKEN_STORAGE_KEY,
} from "./api";

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function humanizeRole(role) {
  if (role === "ADMIN") {
    return "Admin";
  }

  if (role === "USER") {
    return "Người dùng";
  }

  return role ?? "Người dùng";
}

export function mapCurrentUser(apiUser, fallbackUser = null) {
  const nextUser = apiUser ?? fallbackUser ?? {};
  const status = nextUser.status ?? fallbackUser?.status ?? "ACTIVE";

  return {
    id: nextUser.id ?? fallbackUser?.id ?? null,
    fullName: nextUser.fullName ?? fallbackUser?.fullName ?? "",
    email: nextUser.email ?? fallbackUser?.email ?? "",
    avatarUrl:
      nextUser.avatarUrl ??
      fallbackUser?.avatarUrl ??
      "https://i.pravatar.cc/100?img=12",
    role: humanizeRole(nextUser.role ?? fallbackUser?.rawRole),
    rawRole: nextUser.role ?? fallbackUser?.rawRole ?? "USER",
    status,
    emailVerified:
      typeof fallbackUser?.emailVerified === "boolean"
        ? fallbackUser.emailVerified
        : status === "ACTIVE",
    emailVerifiedAt:
      fallbackUser?.emailVerifiedAt ||
      (status === "ACTIVE" ? formatDateTime(new Date()) : ""),
    provider: nextUser.provider ?? fallbackUser?.provider ?? null,
    createdAt: nextUser.createdAt ?? fallbackUser?.createdAt ?? null,
    updatedAt: nextUser.updatedAt ?? fallbackUser?.updatedAt ?? null,
    messengerLinked:
      nextUser.messengerLinked ?? fallbackUser?.messengerLinked ?? false,
    messengerPlatform:
      nextUser.messengerPlatform ?? fallbackUser?.messengerPlatform ?? null,
    messengerLinkedAt:
      nextUser.messengerLinkedAt ?? fallbackUser?.messengerLinkedAt ?? null,
  };
}

async function persistMappedAuth(authPayload, fallbackUser = getStoredUser()) {
  const mappedUser = mapCurrentUser(authPayload?.user, fallbackUser);
  const accessToken = authPayload?.accessToken ?? getStoredAccessToken();

  if (accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  }

  try {
    const settingsRes = await api.get("/api/settings/user");
    const settings = unwrapApiData(settingsRes);
    if (settings && settings.gender) {
      mappedUser.onboardingCompleted = true;
      localStorage.setItem("nw_onboarding_completed", "true");
    }
  } catch (e) {
    console.error("Failed to check user settings after login:", e);
  }

  persistAuthSession(mappedUser, accessToken);

  return {
    user: mappedUser,
    token: accessToken,
  };
}

export function readSession() {
  const session = readStoredSession();

  if (!session) {
    return null;
  }

  return {
    user: session.user ? mapCurrentUser(session.user, session.user) : null,
    token: session.token ?? null,
  };
}

export async function login(credentials) {
  try {
    const authResponse = unwrapApiData(
      await api.post("/api/auth/login", credentials),
    );
    return await persistMappedAuth(authResponse);
  } catch (error) {
    throw createApiError(error, "Không thể đăng nhập lúc này.");
  }
}

export async function register(payload) {
  try {
    const authResponse = unwrapApiData(
      await api.post("/api/auth/register", payload),
    );
    return await persistMappedAuth(authResponse);
  } catch (error) {
    throw createApiError(error, "Không thể đăng ký lúc này.");
  }
}

export async function logout() {
  const accessToken = getStoredAccessToken();

  try {
    if (accessToken) {
      await api.post("/api/auth/logout");
    }
  } catch (error) {
    console.error("Backend logout failed:", error);
  } finally {
    clearAuthSession();
  }
}

export async function fetchCurrentUser() {
  const fallbackUser = getStoredUser();
  const accessToken = getStoredAccessToken();

  if (!accessToken) {
    return fallbackUser;
  }

  try {
    const apiUser = unwrapApiData(await api.get("/api/auth/me"));
    const mappedUser = mapCurrentUser(apiUser, fallbackUser);

    try {
      const settingsRes = await api.get("/api/settings/user");
      const settings = unwrapApiData(settingsRes);
      if (settings && settings.gender) {
        mappedUser.onboardingCompleted = true;
        localStorage.setItem("nw_onboarding_completed", "true");
      }
    } catch (e) {
      console.error("Failed to check user settings for onboarding status:", e);
    }

    persistAuthSession(mappedUser, accessToken);
    return mappedUser;
  } catch {
    const apiUser = unwrapApiData(await api.get("/api/users/me"));
    const mappedUser = mapCurrentUser(apiUser, fallbackUser);

    try {
      const settingsRes = await api.get("/api/settings/user");
      const settings = unwrapApiData(settingsRes);
      if (settings && settings.gender) {
        mappedUser.onboardingCompleted = true;
        localStorage.setItem("nw_onboarding_completed", "true");
      }
    } catch (e) {
      console.error("Failed to check user settings for onboarding status:", e);
    }

    persistAuthSession(mappedUser, accessToken);
    return mappedUser;
  }
}

export async function requestPasswordReset() {
  throw new Error("Khôi phục mật khẩu nội bộ đã bị vô hiệu hóa.");
}

export async function resetPassword() {
  throw new Error("Khôi phục mật khẩu nội bộ đã bị vô hiệu hóa.");
}

export async function loginWithGoogle(idToken) {
  try {
    const authResponse = unwrapApiData(
      await api.post("/api/auth/google", { idToken }),
    );
    return await persistMappedAuth(authResponse);
  } catch (error) {
    throw createApiError(error, "Lỗi đăng nhập Google.");
  }
}

export async function loginWithFacebook(accessToken) {
  try {
    const authResponse = unwrapApiData(
      await api.post("/api/auth/facebook", { accessToken }),
    );
    return await persistMappedAuth(authResponse);
  } catch (error) {
    throw createApiError(error, "Lỗi đăng nhập Facebook.");
  }
}
