import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories";
import type { CategoryCreate, CategoryUpdate } from "../types";

export function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: getAllCategories });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryCreate) => createCategory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: CategoryUpdate }) =>
      updateCategory(categoryId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => deleteCategory(categoryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
