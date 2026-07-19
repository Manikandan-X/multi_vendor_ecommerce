import axios, { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types";

// Your FastAPI app has NO global prefix (routers mount at root: /auth, /products, etc.)
// so VITE_API_BASE_URL should just be the host, e.g. http://localhost:8000
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

const TOKEN_KEY = "access_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      clearToken();
      // full reload so all in-memory state (cart, user) clears too
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Helper to build a display URL for image_url fields returned by the API,
// which are relative paths served from the /uploads static mount in main.py.
export function resolveUploadUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
