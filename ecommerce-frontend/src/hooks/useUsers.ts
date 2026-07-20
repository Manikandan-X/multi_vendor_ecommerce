import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, getAllUsers, updateUser, deleteUser } from "../api/users";
import type { UserCreate, UserUpdate } from "../types";

export function useAllUsers() {
  return useQuery({ queryKey: ["users", "all"], queryFn: getAllUsers });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserCreate) => createUser(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users", "all"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UserUpdate }) =>
      updateUser(userId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users", "all"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users", "all"] }),
  });
}
