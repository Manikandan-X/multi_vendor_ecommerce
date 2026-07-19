import { Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { BRAND_NAME } from "../../constants/brand";
import { useAuthStore } from "../../store/useAuthStore";
import { useCart } from "../../hooks/useCart";
import { UserRole } from "../../constants/enums";

function dashboardPathFor(role: UserRole): string {
  if (role === UserRole.ADMIN) return "/admin";
  if (role === UserRole.VENDOR) return "/vendor";
  return "/account";
}

function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const isCustomer = user?.role === UserRole.CUSTOMER;
  const cart = useCart({ enabled: isCustomer });
  const cartCount = cart.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query ? `/?q=${encodeURIComponent(query)}` : "/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <Link to="/" className="font-display text-lg font-semibold text-ink">
          {BRAND_NAME}
        </Link>

        <form onSubmit={onSearch} className="flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full max-w-md rounded-lg border border-border bg-paper px-3.5 py-2 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </form>

        <div className="flex items-center gap-4">
          {isCustomer && (
            <Link to="/cart" className="relative text-sm font-medium text-ink">
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-ink">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated && user ? (
            <>
              <Link to={dashboardPathFor(user.role)} className="text-sm font-medium text-ink">
                {user.role === UserRole.CUSTOMER ? "My account" : "Dashboard"}
              </Link>
              <button onClick={logout} className="text-sm font-medium text-muted hover:text-danger">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-ink">
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-light"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
