import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { AuthContext } from "../context/AuthContext";
import { getMe } from "../services/AuthService";
import type { User } from "../types/auth";

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  function clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken");

    setUser(null);
  }

  async function login(
    accessToken: string,
    refreshToken: string,
    remember: boolean,
  ) {
    // Czyścimy ewentualną starą sesję.
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken");

    if (remember) {
      localStorage.setItem(
        "token",
        accessToken,
      );
      localStorage.setItem(
        "refreshToken",
        refreshToken,
      );
    } else {
      sessionStorage.setItem(
        "token",
        accessToken,
      );
      sessionStorage.setItem(
        "refreshToken",
        refreshToken,
      );
    }

    const me = await getMe();

    setUser(me);
  }

  function logout() {
    clearSession();
  }

  useEffect(() => {
    const handleSessionExpired = () => {
      clearSession();
    };

    window.addEventListener(
      "auth-session-expired",
      handleSessionExpired,
    );

    return () => {
      window.removeEventListener(
        "auth-session-expired",
        handleSessionExpired,
      );
    };
  }, []);

  useEffect(() => {
    async function restoreSession() {
      const token =
        localStorage.getItem("token") ??
        sessionStorage.getItem("token");

      const refreshToken =
        localStorage.getItem("refreshToken") ??
        sessionStorage.getItem("refreshToken");

      if (!token && !refreshToken) {
        setLoading(false);
        return;
      }

      try {
        // Jeśli access token wygasł, interceptor w api.ts
        // automatycznie użyje refresh tokena.
        const me = await getMe();

        setUser(me);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}