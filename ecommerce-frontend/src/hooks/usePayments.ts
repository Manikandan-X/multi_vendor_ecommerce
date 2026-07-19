import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyPayments, getAllPayments, createPayment, processPayment } from "../api/payments";
import type { PaymentCreate, PaymentUpdate } from "../types";

export function useMyPayments() {
  return useQuery({ queryKey: ["payments", "mine"], queryFn: getMyPayments });
}

export function useAllPayments() {
  return useQuery({ queryKey: ["payments", "all"], queryFn: getAllPayments });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: PaymentCreate }) =>
      createPayment(orderId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments", "mine"] }),
  });
}

export function useProcessPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, data }: { paymentId: string; data: PaymentUpdate }) =>
      processPayment(paymentId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
}
