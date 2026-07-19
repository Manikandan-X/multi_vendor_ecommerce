import { useQuery } from "@tanstack/react-query";
import { getMyOrders, getVendorOrders, getOrder } from "../api/orders";

export function useMyOrders() {
  return useQuery({ queryKey: ["orders", "mine"], queryFn: getMyOrders });
}

export function useVendorOrders() {
  return useQuery({ queryKey: ["orders", "vendor"], queryFn: getVendorOrders });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => getOrder(orderId as string),
    enabled: Boolean(orderId),
  });
}
