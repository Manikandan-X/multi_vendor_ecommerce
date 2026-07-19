import { apiClient } from "./client";
import type { ProductCreate, ProductResponse, ProductUpdate } from "../types";

// POST /products  (role: VENDOR)
export async function createProduct(data: ProductCreate): Promise<ProductResponse> {
  const res = await apiClient.post<ProductResponse>("/products", data);
  return res.data;
}

// GET /products  (public — storefront listing)
export async function getAllProducts(): Promise<ProductResponse[]> {
  const res = await apiClient.get<ProductResponse[]>("/products");
  return res.data;
}

// GET /products/me  (role: VENDOR — vendor's own product list)
export async function getMyProducts(): Promise<ProductResponse[]> {
  const res = await apiClient.get<ProductResponse[]>("/products/me");
  return res.data;
}

// GET /products/{product_id}  (public)
export async function getProduct(productId: string): Promise<ProductResponse> {
  const res = await apiClient.get<ProductResponse>(`/products/${productId}`);
  return res.data;
}

// PUT /products/{product_id}  (role: VENDOR)
export async function updateProduct(
  productId: string,
  data: ProductUpdate
): Promise<ProductResponse> {
  const res = await apiClient.put<ProductResponse>(`/products/${productId}`, data);
  return res.data;
}

// POST /products/{product_id}/image  (role: VENDOR, multipart/form-data)
export async function uploadProductImage(
  productId: string,
  imageFile: File
): Promise<ProductResponse> {
  const form = new FormData();
  form.append("image", imageFile); // field name must be "image" per backend

  const res = await apiClient.post<ProductResponse>(
    `/products/${productId}/image`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
}

// DELETE /products/{product_id}  (role: VENDOR)
export async function deleteProduct(productId: string): Promise<void> {
  await apiClient.delete(`/products/${productId}`);
}
