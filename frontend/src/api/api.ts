import axios from "axios";
import type {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const BASE_URL = "http://2.28.14.20:3000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

function getAccessToken() {
  return (
    localStorage.getItem("token") ??
    sessionStorage.getItem("token")
  );
}

function getRefreshToken() {
  return (
    localStorage.getItem("refreshToken") ??
    sessionStorage.getItem("refreshToken")
  );
}

function saveTokens(
  accessToken: string,
  refreshToken: string,
) {
  // Jeśli sesja była zapamiętana, zostawiamy ją
  // w localStorage.
  if (localStorage.getItem("refreshToken")) {
    localStorage.setItem("token", accessToken);
    localStorage.setItem(
      "refreshToken",
      refreshToken,
    );
    return;
  }

  // W przeciwnym razie jest to sesja bieżącej karty.
  sessionStorage.setItem("token", accessToken);
  sessionStorage.setItem(
    "refreshToken",
    refreshToken,
  );
}

function clearTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("refreshToken");
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("Brak refresh tokena.");
  }

  const response = await axios.post<RefreshResponse>(
    `${BASE_URL}/auth/refresh`,
    {
      refreshToken,
    },
  );

  saveTokens(
    response.data.accessToken,
    response.data.refreshToken,
  );

  return response.data.accessToken;
}

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // Login nie powinien próbować odświeżać starej sesji.
    if (originalRequest.url?.includes("/auth/login")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(
          () => {
            refreshPromise = null;
          },
        );
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearTokens();

      // Powiadamiamy AuthProvider, że sesja naprawdę wygasła.
      window.dispatchEvent(
        new Event("auth-session-expired"),
      );

      return Promise.reject(refreshError);
    }
  },
);

export default api;
