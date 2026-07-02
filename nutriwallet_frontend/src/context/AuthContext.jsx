import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./auth-context";
import {
  fetchCurrentUser,
  login as authLogin,
  loginWithFacebook as authLoginWithFacebook,
  loginWithGoogle as authLoginWithGoogle,
  logout as authLogout,
  readSession,
  register as authRegister,
} from "../services/auth.service";
import { persistAuthSession } from "../services/api";

export function AuthProvider({ children }) {
  const [session] = useState(() => readSession());
  const [currentUser, setCurrentUser] = useState(() => session?.user ?? null);
  const [accessToken, setAccessToken] = useState(() => session?.token ?? null);
  const [isLoading, setIsLoading] = useState(() => Boolean(session?.token));

  const isAuthenticated = currentUser !== null && accessToken !== null;

  const applyAuthResult = useCallback((result) => {
    setCurrentUser(result.user);
    setAccessToken(result.token);
    return result;
  }, []);

  const clearAuthState = useCallback(() => {
    setCurrentUser(null);
    setAccessToken(null);
  }, []);

  useEffect(() => {
    if (!accessToken) {
      return undefined;
    }

    let ignore = false;

    fetchCurrentUser()
      .then((user) => {
        if (!ignore && user) {
          setCurrentUser(user);
        }
      })
      .catch(() => {
        if (!ignore) {
          clearAuthState();
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [accessToken, clearAuthState]);

  useEffect(() => {
    function handleAuthLogout() {
      clearAuthState();
      setIsLoading(false);
    }

    window.addEventListener("auth:logout", handleAuthLogout);

    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, [clearAuthState]);

  const login = useCallback(
    async (credentials) => {
      setIsLoading(true);
      try {
        return applyAuthResult(await authLogin(credentials));
      } finally {
        setIsLoading(false);
      }
    },
    [applyAuthResult],
  );

  const loginWithGoogle = useCallback(
    async (idToken) => {
      setIsLoading(true);
      try {
        return applyAuthResult(await authLoginWithGoogle(idToken));
      } finally {
        setIsLoading(false);
      }
    },
    [applyAuthResult],
  );

  const loginWithFacebook = useCallback(
    async (nextAccessToken) => {
      setIsLoading(true);
      try {
        return applyAuthResult(await authLoginWithFacebook(nextAccessToken));
      } finally {
        setIsLoading(false);
      }
    },
    [applyAuthResult],
  );

  const register = useCallback(
    async (payload) => {
      setIsLoading(true);
      try {
        return applyAuthResult(await authRegister(payload));
      } finally {
        setIsLoading(false);
      }
    },
    [applyAuthResult],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authLogout();
    } finally {
      clearAuthState();
      setIsLoading(false);
    }
  }, [clearAuthState]);

  const replaceUser = useCallback(
    (user) => {
      setCurrentUser(user);

      if (accessToken) {
        persistAuthSession(user, accessToken);
      }
    },
    [accessToken],
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        accessToken,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        replaceUser,
        loginWithGoogle,
        loginWithFacebook,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
