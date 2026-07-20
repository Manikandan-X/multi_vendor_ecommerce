import { apiClient } from "./client";
import type { UserCreate, UserResponse, UserUpdate } from "../types";

// POST /users  (role: ADMIN)
export async function createUser(data: UserCreate): Promise<UserResponse> {
  const res = await apiClient.post<UserResponse>("/users", data);
  return res.data;
}

// GET /users  (role: ADMIN)
export async function getAllUsers(): Promise<UserResponse[]> {
  const res = await apiClient.get<UserResponse[]>("/users");
  return res.data;
}

// GET /users/{user_id}  (role: ADMIN)
export async function getUser(userId: string): Promise<UserResponse> {
  const res = await apiClient.get<UserResponse>(`/users/${userId}`);
  return res.data;
}

// PUT /users/{user_id}  (role: ADMIN)
export async function updateUser(userId: string, data: UserUpdate): Promise<UserResponse> {
  const res = await apiClient.put<UserResponse>(`/users/${userId}`, data);
  return res.data;
}

// DELETE /users/{user_id}  (role: ADMIN)  — 204 No Content
export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}
