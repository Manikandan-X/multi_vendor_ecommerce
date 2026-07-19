import { NeedsBackendEndpoint } from "../../components/ui/States";

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Users</h1>
      <div className="mt-6">
        <NeedsBackendEndpoint
          title="User management isn't available yet"
          endpoint="GET /users (admin-only, list all users) — app/routers/users.py is currently empty"
        />
      </div>
    </div>
  );
}
