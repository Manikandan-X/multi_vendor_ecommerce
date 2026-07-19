import { apiClient } from "./client";
import type { VendorCreate, VendorResponse, VendorUpdate } from "../types";

// POST /vendors  (role: VENDOR)
export async function createVendor(data: VendorCreate): Promise<VendorResponse> {
  const res = await apiClient.post<VendorResponse>("/vendors", data);
  return res.data;
}

// GET /vendors/me  (role: VENDOR)
export async function getMyVendor(): Promise<VendorResponse> {
  const res = await apiClient.get<VendorResponse>("/vendors/me");
  return res.data;
}

// PUT /vendors/me  (role: VENDOR)
export async function updateMyVendor(data: VendorUpdate): Promise<VendorResponse> {
  const res = await apiClient.put<VendorResponse>("/vendors/me", data);
  return res.data;
}

// GET /vendors  (role: ADMIN)
export async function getAllVendors(): Promise<VendorResponse[]> {
  const res = await apiClient.get<VendorResponse[]>("/vendors");
  return res.data;
}

// PATCH /vendors/{vendor_id}/approve  (role: ADMIN)
export async function approveVendor(vendorId: string): Promise<VendorResponse> {
  const res = await apiClient.patch<VendorResponse>(`/vendors/${vendorId}/approve`);
  return res.data;
}
