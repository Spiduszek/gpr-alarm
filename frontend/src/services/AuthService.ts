import api from "../api/api";
import type { LoginResponse, User } from "../types/auth";

export interface LoginRequest {
  login: string;
  password: string;
}

export async function login(
  data: LoginRequest,
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    data,
  );

  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await api.get<User>("/auth/me");

  return response.data;
}