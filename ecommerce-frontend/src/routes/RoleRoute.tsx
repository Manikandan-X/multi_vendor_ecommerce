import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import type { UserRole } from "../constants/enums";

// Blocks unauthenticated users. Wrap any route tree that requires login.
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null; // or a spinner
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}

// Blocks users whose role isn't in the allowed list. Use inside a
// ProtectedRoute tree, e.g. <RoleRoute roles={[UserRole.VENDOR]} />.
// Note: a vendor's `is_approved` flag lives on VendorResponse, not on the
// user object — check that separately (e.g. via getMyVendor) if you need
// to gate vendor dashboard access on approval status too.
export function RoleRoute({ roles }: { roles: UserRole[] }) {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
