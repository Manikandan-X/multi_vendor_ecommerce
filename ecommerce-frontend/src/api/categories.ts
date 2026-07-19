import { apiClient } from "./client";
import type { CategoryCreate, CategoryResponse, CategoryUpdate } from "../types";

// POST /categories  (role: ADMIN)
export async function createCategory(data: CategoryCreate): Promise<CategoryResponse> {
  const res = await apiClient.post<CategoryResponse>("/categories", data);
  return res.data;
}

// GET /categories  (public)
export async function getAllCategories(): Promise<CategoryResponse[]> {
  const res = await apiClient.get<CategoryResponse[]>("/categories");
  return res.data;
}

// GET /categories/{category_id}  (public)
export async function getCategory(categoryId: string): Promise<CategoryResponse> {
  const res = await apiClient.get<CategoryResponse>(`/categories/${categoryId}`);
  return res.data;
}

// PUT /categories/{category_id}  (role: ADMIN)
export async function updateCategory(
  categoryId: string,
  data: CategoryUpdate
): Promise<CategoryResponse> {
  const res = await apiClient.put<CategoryResponse>(`/categories/${categoryId}`, data);
  return res.data;
}

// DELETE /categories/{category_id}  (role: ADMIN)
export async function deleteCategory(categoryId: string): Promise<void> {
  await apiClient.delete(`/categories/${categoryId}`);
}
