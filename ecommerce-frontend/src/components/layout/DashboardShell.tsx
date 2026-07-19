import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { BRAND_NAME } from "../../constants/brand";

export interface DashboardNavItem {
  label: string;
  to: string;
  end?: boolean; // passed to NavLink for exact index-route matching
}

interface DashboardShellProps {
  navItems: DashboardNavItem[];
  roleLabel: string;
}

export function DashboardShell({ navItems, roleLabel }: DashboardShellProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-60 flex-col border-r border-border bg-surface">
        <div className="border-b border-border px-5 py-5">
          <span className="font-display text-lg font-semibold text-ink">{BRAND_NAME}</span>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-muted">
            {roleLabel}
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-ink text-white" : "text-muted hover:bg-ink/5 hover:text-ink"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border px-5 py-4">
          <p className="truncate text-sm font-medium text-ink">{user?.full_name}</p>
          <p className="truncate text-xs text-muted">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-3 text-sm font-medium text-danger hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
