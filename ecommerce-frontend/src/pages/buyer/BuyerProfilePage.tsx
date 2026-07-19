import { useAuthStore } from "../../store/useAuthStore";
import { formatDate } from "../../lib/format";

export default function BuyerProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Profile</h1>
      <p className="mt-1 text-sm text-muted">
        Read-only for now — there's no update-profile endpoint on the backend yet
        (would need a <code className="rounded bg-ink/5 px-1 py-0.5 text-xs">PUT /auth/me</code> or similar).
      </p>

      <dl className="mt-6 max-w-md divide-y divide-border rounded-xl border border-border bg-surface">
        {[
          ["Full name", user.full_name],
          ["Email", user.email],
          ["Role", user.role],
          ["Account status", user.is_active ? "Active" : "Inactive"],
          ["Member since", formatDate(user.created_at)],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-5 py-3.5 text-sm">
            <dt className="text-muted">{label}</dt>
            <dd className="font-medium text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
