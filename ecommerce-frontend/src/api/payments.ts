import { apiClient } from "./client";
import type { PaymentCreate, PaymentResponse, PaymentUpdate } from "../types";

// POST /payments/orders/{order_id}  (role: CUSTOMER)
export async function createPayment(
  orderId: string,
  data: PaymentCreate
): Promise<PaymentResponse> {
  const res = await apiClient.post<PaymentResponse>(`/payments/orders/${orderId}`, data);
  return res.data;
}

// PUT /payments/{payment_id}  (role: CUSTOMER)
// Used to push a status update (e.g. after a payment gateway callback).
export async function processPayment(
  paymentId: string,
  data: PaymentUpdate
): Promise<PaymentResponse> {
  const res = await apiClient.put<PaymentResponse>(`/payments/${paymentId}`, data);
  return res.data;
}

// GET /payments/my-payments  (role: CUSTOMER)
export async function getMyPayments(): Promise<PaymentResponse[]> {
  const res = await apiClient.get<PaymentResponse[]>("/payments/my-payments");
  return res.data;
}

// GET /payments/{payment_id}  (role: CUSTOMER)
export async function getPayment(paymentId: string): Promise<PaymentResponse> {
  const res = await apiClient.get<PaymentResponse>(`/payments/${paymentId}`);
  return res.data;
}

// GET /payments  (role: ADMIN)
export async function getAllPayments(): Promise<PaymentResponse[]> {
  const res = await apiClient.get<PaymentResponse[]>("/payments");
  return res.data;
}
