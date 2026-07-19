import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllProducts,
  getMyProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from "../api/products";
import type { ProductCreate, ProductUpdate } from "../types";

export function useAllProducts() {
  return useQuery({ queryKey: ["products", "all"], queryFn: getAllProducts });
}

export function useMyProducts() {
  return useQuery({ queryKey: ["products", "mine"], queryFn: getMyProducts });
}

export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: ["products", productId],
    queryFn: () => getProduct(productId as string),
    enabled: Boolean(productId),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductCreate) => createProduct(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", "mine"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: ProductUpdate }) =>
      updateProduct(productId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", "mine"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", "mine"] }),
  });
}

export function useUploadProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      uploadProductImage(productId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", "mine"] }),
  });
}
