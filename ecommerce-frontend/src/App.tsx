import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import { useAuthStore } from "./store/useAuthStore";
import { ProtectedRoute, RoleRoute } from "./routes/RoleRoute";
import { DashboardShell } from "./components/layout/DashboardShell";
import { PublicLayout } from "./components/layout/PublicLayout";
import { UserRole } from "./constants/enums";

import ProductGridPage from "./pages/storefront/ProductGridPage";
import ProductDetailPage from "./pages/storefront/ProductDetailPage";
import CartPage from "./pages/storefront/CartPage";
import CheckoutPage from "./pages/storefront/CheckoutPage";
import CheckoutSuccessPage from "./pages/storefront/CheckoutSuccessPage";

import BuyerOverviewPage from "./pages/buyer/BuyerOverviewPage";
import BuyerOrdersPage from "./pages/buyer/BuyerOrdersPage";
import BuyerPaymentsPage from "./pages/buyer/BuyerPaymentsPage";
import BuyerProfilePage from "./pages/buyer/BuyerProfilePage";

import VendorOverviewPage from "./pages/vendor/VendorOverviewPage";
import VendorProductsPage from "./pages/vendor/VendorProductsPage";
import VendorOrdersPage from "./pages/vendor/VendorOrdersPage";
import VendorSettingsPage from "./pages/vendor/VendorSettingsPage";

import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminVendorsPage from "./pages/admin/AdminVendorsPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";

export default function App() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public storefront — browsing works logged-out; add-to-cart gates
          on role inside ProductCard/ProductDetailPage instead of the route,
          since a logged-out visitor should still be able to browse. */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<ProductGridPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
      </Route>

      {/* Cart/checkout — CUSTOMER only, matches require_customer on the
          backend (/cart, /orders/checkout). Still uses PublicLayout for
          the shared navbar rather than the dashboard sidebar shell, since
          it's part of the shopping flow, not back-office. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute roles={[UserRole.CUSTOMER]} />}>
          <Route element={<PublicLayout />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<CheckoutSuccessPage />} />
          </Route>
        </Route>
      </Route>

      {/* Buyer dashboard — CUSTOMER role only, matches require_customer on
          the backend (/cart, /orders/my-orders, /payments/my-payments) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute roles={[UserRole.CUSTOMER]} />}>
          <Route
            path="/account"
            element={<DashboardShell roleLabel="Buyer" navItems={[
              { label: "Overview", to: "/account", end: true },
              { label: "Orders", to: "/account/orders" },
              { label: "Payments", to: "/account/payments" },
              { label: "Profile", to: "/account/profile" },
            ]} />}
          >
            <Route index element={<BuyerOverviewPage />} />
            <Route path="orders" element={<BuyerOrdersPage />} />
            <Route path="payments" element={<BuyerPaymentsPage />} />
            <Route path="profile" element={<BuyerProfilePage />} />
          </Route>
        </Route>

        {/* Vendor dashboard — VENDOR role only */}
        <Route element={<RoleRoute roles={[UserRole.VENDOR]} />}>
          <Route
            path="/vendor"
            element={<DashboardShell roleLabel="Vendor" navItems={[
              { label: "Overview", to: "/vendor", end: true },
              { label: "Products", to: "/vendor/products" },
              { label: "Orders", to: "/vendor/orders" },
              { label: "Store settings", to: "/vendor/settings" },
            ]} />}
          >
            <Route index element={<VendorOverviewPage />} />
            <Route path="products" element={<VendorProductsPage />} />
            <Route path="orders" element={<VendorOrdersPage />} />
            <Route path="settings" element={<VendorSettingsPage />} />
          </Route>
        </Route>

        {/* Admin dashboard — ADMIN role only */}
        <Route element={<RoleRoute roles={[UserRole.ADMIN]} />}>
          <Route
            path="/admin"
            element={<DashboardShell roleLabel="Admin" navItems={[
              { label: "Overview", to: "/admin", end: true },
              { label: "Vendors", to: "/admin/vendors" },
              { label: "Categories", to: "/admin/categories" },
              { label: "Payments", to: "/admin/payments" },
              { label: "Orders", to: "/admin/orders" },
              { label: "Users", to: "/admin/users" },
            ]} />}
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="vendors" element={<AdminVendorsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
