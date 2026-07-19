import { apiClient } from "./client";
import type { RegisterRequest, TokenResponse, UserResponse } from "../types";

// POST /auth/register
export async function registerUser(data: RegisterRequest): Promise<UserResponse> {
  const res = await apiClient.post<UserResponse>("/auth/register", data);
  return res.data;
}

// POST /auth/login
// IMPORTANT: this endpoint uses FastAPI's OAuth2PasswordRequestForm, which
// requires application/x-www-form-urlencoded with fields "username" and
// "password" — NOT a JSON body, and NOT an "email" field.
export async function loginUser(email: string, password: string): Promise<TokenResponse> {
  const form = new URLSearchParams();
  form.set("username", email); // "username" is the field name FastAPI expects
  form.set("password", password);

  const res = await apiClient.post<TokenResponse>("/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.data;
}

// GET /auth/me
export async function getCurrentUser(): Promise<UserResponse> {
  const res = await apiClient.get<UserResponse>("/auth/me");
  return res.data;
}
