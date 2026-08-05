import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { AuthContext } from "../context/AuthContext";
import { getMe } from "../services/AuthService";
import type { User } from "../types/auth";

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function login(
    accessToken: string,
    refreshToken: string,
    remember: boolean,
  ) {
    if (remember) {
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      sessionStorage.setItem("token", accessToken);
      sessionStorage.setItem("refreshToken", refreshToken);
    }

    const me = await getMe();

    setUser(me);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken");

    setUser(null);
  }

  useEffect(() => {
    async function restoreSession() {
      const token =
        localStorage.getItem("token") ??
        sessionStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await getMe();

        setUser(me);
      } catch {
        logout();
      }

      setLoading(false);
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