// Mirrors backend: app/schemas/*.py
// Field names, optionality, and nesting match the Pydantic models 1:1.
// NOTE on Decimal fields (price, stock, amount, total_amount, subtotal):
// FastAPI's default JSON encoder serializes Python Decimal as a JSON number,
// so these are typed as `number` here. If you ever see them arrive as strings
// (some Pydantic/FastAPI version combos do this), convert with Number(x) before math.

import type { UserRole, OrderStatus, PaymentStatus } from "../constants/enums";

// ---------- auth.py ----------
export interface RegisterRequest {
  full_name: string; // 3–150 chars
  email: string;
  password: string; // 8–100 chars
  role: UserRole;
}

export interface TokenResponse {
  access_token: string;
  token_type: string; // "bearer"
}

// ---------- user.py ----------
export interface UserResponse {
  id: string; // UUID
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string; // ISO datetime
  updated_at: string;
}

// ---------- vendor.py ----------
export interface VendorCreate {
  store_name: string; // 3–150 chars
  store_description?: string | null;
}

export interface VendorUpdate {
  store_name?: string;
  store_description?: string | null;
}

export interface VendorResponse {
  id: string;
  user_id: string;
  store_name: string;
  store_description: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

// ---------- category.py ----------
export interface CategoryCreate {
  name: string; // 2–100 chars
  description?: string | null;
}

export interface CategoryUpdate {
  name?: string;
  description?: string | null;
}

export interface CategoryResponse {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- product.py ----------
export interface ProductCreate {
  category_id: string;
  name: string; // 2–200 chars
  description?: string | null;
  price: number; // > 0
  stock: number; // >= 0
}

export interface ProductUpdate {
  category_id?: string;
  name?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  is_active?: boolean;
}

export interface ProductResponse {
  id: string;
  vendor_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null; // relative path served via /uploads static mount
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---------- cart.py ----------
export interface CartItemCreate {
  product_id: string;
  quantity: number; // >= 1
}

export interface CartItemUpdate {
  quantity: number; // >= 1
}

export interface CartItemResponse {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface CartResponse {
  id: string;
  customer_id: string;
  items: CartItemResponse[];
  total_amount: number;
  created_at: string;
  updated_at: string;
}

// ---------- order.py ----------
export interface OrderItemResponse {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderResponse {
  id: string;
  customer_id: string;
  vendor_id: string; // one order = one vendor; checkout splits cart into multiple orders
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  order_items: OrderItemResponse[];
  created_at: string;
  updated_at: string;
}

// ---------- payment.py ----------
export interface PaymentCreate {
  payment_method: string;
}

export interface PaymentUpdate {
  status: PaymentStatus;
  transaction_id?: string | null;
}

export interface PaymentResponse {
  id: string;
  order_id: string;
  amount: number;
  // NOTE: backend schema types this as `str`, not the PaymentStatus enum,
  // unlike order.payment_status. Kept as string here to match exactly —
  // narrow it with a type guard in your UI if you rely on it for logic.
  status: string;
  payment_method: string;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- generic API error shape (FastAPI default) ----------
export interface ApiErrorResponse {
  detail: string | { msg: string; loc: (string | number)[]; type: string }[];
}
