import { createContext } from "react";
import type { User } from "../types/auth";

export interface AuthContextType {
  user: User | null;
  loading: boolean;

  login: (
    accessToken: string,
    refreshToken: string,
    remember: boolean,
  ) => Promise<void>;

  logout: () => void;
}

export const AuthContext =
  createContext<AuthContextType | null>(null);