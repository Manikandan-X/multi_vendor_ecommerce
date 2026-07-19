import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToCart, getCart, updateCartItem, removeCartItem, clearCart } from "../api/cart";
import type { CartItemCreate, CartItemUpdate } from "../types";

const CART_KEY = ["cart"];

export function useCart(options?: { enabled?: boolean }) {
  return useQuery({ queryKey: CART_KEY, queryFn: getCart, enabled: options?.enabled ?? true });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CartItemCreate) => addToCart(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: CartItemUpdate }) =>
      updateCartItem(itemId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => clearCart(),
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
}
