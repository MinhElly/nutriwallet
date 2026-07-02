import axios from "axios";
import { API_BASE_URL as ENV_API_BASE_URL } from "../config/env";

export const API_BASE_URL = ENV_API_BASE_URL || "http://localhost:8081";
export const ACCESS_TOKEN_STORAGE_KEY = "nw_access_token";
export const CURRENT_USER_STORAGE_KEY = "nw_current_user";
export const LEGACY_SESSION_KEY = "nw_session";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

function readStoredJson(storage, key) {
  try {
    const rawValue = storage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
}

function getLegacySession() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    readStoredJson(window.localStorage, LEGACY_SESSION_KEY) ??
    readStoredJson(window.sessionStorage, LEGACY_SESSION_KEY)
  );
}

export function getStoredAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ??
    getLegacySession()?.token ??
    null
  );
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    readStoredJson(window.localStorage, CURRENT_USER_STORAGE_KEY) ??
    getLegacySession()?.user ??
    null
  );
}

export function readStoredSession() {
  const token = getStoredAccessToken();
  const user = getStoredUser();

  if (!token && !user) {
    return null;
  }

  return {
    token: token ?? null,
    user: user ?? null,
  };
}

export function persistAuthSession(user, accessToken) {
  if (typeof window === "undefined") {
    return;
  }

  if (accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  }

  if (user) {
    window.localStorage.setItem(
      CURRENT_USER_STORAGE_KEY,
      JSON.stringify(user),
    );
  }

  window.localStorage.removeItem(LEGACY_SESSION_KEY);
  window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_SESSION_KEY);
  window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
}

export function unwrapApiData(response) {
  if (
    response?.data &&
    typeof response.data === "object" &&
    "data" in response.data
  ) {
    return response.data.data;
  }

  return response?.data ?? response;
}

export function extractApiMessage(
  source,
  fallbackMessage = "Đã có lỗi xảy ra.",
) {
  const responseData = source?.response?.data;

  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message;
  }

  if (typeof responseData?.error === "string" && responseData.error.trim()) {
    return responseData.error;
  }

  if (typeof source?.message === "string" && source.message.trim()) {
    return source.message;
  }

  return fallbackMessage;
}

export function createApiError(
  source,
  fallbackMessage = "Đã có lỗi xảy ra.",
) {
  const error = new Error(extractApiMessage(source, fallbackMessage));
  error.cause = source;
  error.status = source?.response?.status ?? null;
  return error;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = getStoredAccessToken();

    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthSession();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:logout"));

        if (!PUBLIC_PATHS.has(window.location.pathname)) {
          window.location.replace("/login");
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
