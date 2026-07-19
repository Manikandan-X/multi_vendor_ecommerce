import { apiClient } from "./client";
import type { OrderResponse } from "../types";

// POST /orders/checkout  (role: CUSTOMER)
// Returns an ARRAY of orders — checkout splits the customer's cart into one
// order per vendor, since a single order belongs to exactly one vendor_id.
export async function checkout(): Promise<OrderResponse[]> {
  const res = await apiClient.post<OrderResponse[]>("/orders/checkout");
  return res.data;
}

// GET /orders/my-orders  (role: CUSTOMER)
export async function getMyOrders(): Promise<OrderResponse[]> {
  const res = await apiClient.get<OrderResponse[]>("/orders/my-orders");
  return res.data;
}

// GET /orders/vendor-orders  (role: VENDOR)
export async function getVendorOrders(): Promise<OrderResponse[]> {
  const res = await apiClient.get<OrderResponse[]>("/orders/vendor-orders");
  return res.data;
}

// GET /orders/{order_id}  (any authenticated user — backend should further
// check the order belongs to them; frontend still shouldn't link to orders
// that aren't the current user's)
export async function getOrder(orderId: string): Promise<OrderResponse> {
  const res = await apiClient.get<OrderResponse>(`/orders/${orderId}`);
  return res.data;
}
