import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyOrders,
  getVendorOrders,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
} from "../api/orders";
import type { OrderStatusUpdate } from "../types";

export function useMyOrders() {
  return useQuery({ queryKey: ["orders", "mine"], queryFn: getMyOrders });
}

export function useVendorOrders() {
  return useQuery({ queryKey: ["orders", "vendor"], queryFn: getVendorOrders });
}

export function useAllOrders() {
  return useQuery({ queryKey: ["orders", "all"], queryFn: getAllOrders });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => getOrder(orderId as string),
    enabled: Boolean(orderId),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: OrderStatusUpdate }) =>
      updateOrderStatus(orderId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

