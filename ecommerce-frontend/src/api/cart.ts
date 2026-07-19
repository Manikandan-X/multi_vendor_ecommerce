import { apiClient } from "./client";
import type { CartItemCreate, CartItemUpdate, CartResponse } from "../types";

// All cart endpoints require role: CUSTOMER (require_customer dependency).
// A logged-in VENDOR or ADMIN hitting these will get a 403 — gate the
// "Add to Cart" UI accordingly, don't just rely on the API rejecting it.

// POST /cart/items
export async function addToCart(data: CartItemCreate): Promise<CartResponse> {
  const res = await apiClient.post<CartResponse>("/cart/items", data);
  return res.data;
}

// GET /cart
export async function getCart(): Promise<CartResponse> {
  const res = await apiClient.get<CartResponse>("/cart");
  return res.data;
}

// PUT /cart/items/{item_id}
export async function updateCartItem(
  itemId: string,
  data: CartItemUpdate
): Promise<CartResponse> {
  const res = await apiClient.put<CartResponse>(`/cart/items/${itemId}`, data);
  return res.data;
}

// DELETE /cart/items/{item_id}
export async function removeCartItem(itemId: string): Promise<CartResponse> {
  const res = await apiClient.delete<CartResponse>(`/cart/items/${itemId}`);
  return res.data;
}

// DELETE /cart/clear  (204 No Content — nothing to return)
export async function clearCart(): Promise<void> {
  await apiClient.delete("/cart/clear");
}
