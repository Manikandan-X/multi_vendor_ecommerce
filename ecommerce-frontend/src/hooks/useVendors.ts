import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyVendor,
  updateMyVendor,
  createVendor,
  getAllVendors,
  approveVendor,
} from "../api/vendors";
import type { VendorCreate, VendorUpdate } from "../types";

export function useMyVendor() {
  return useQuery({
    queryKey: ["vendors", "me"],
    queryFn: getMyVendor,
    retry: false, // 404s here are expected for a vendor who hasn't set up their store yet
  });
}

export function useAllVendors() {
  return useQuery({ queryKey: ["vendors", "all"], queryFn: getAllVendors });
}

export function useCreateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VendorCreate) => createVendor(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors", "me"] }),
  });
}

export function useUpdateMyVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VendorUpdate) => updateMyVendor(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors", "me"] }),
  });
}

export function useApproveVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vendorId: string) => approveVendor(vendorId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors", "all"] }),
  });
}
