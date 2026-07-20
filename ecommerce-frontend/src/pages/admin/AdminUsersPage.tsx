import { useState } from "react";
import { useAllUsers, useDeleteUser } from "../../hooks/useUsers";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { BooleanBadge } from "../../components/ui/StatusBadge";
import { formatDate } from "../../lib/format";
import { getApiErrorMessage } from "../../lib/errors";
import { useAuthStore } from "../../store/useAuthStore";
import { UserFormModal } from "./UserFormModal";
import type { UserResponse } from "../../types";

const ROLE_STYLE: Record<string, string> = {
  ADMIN: "bg-ink/10 text-ink",
  VENDOR: "bg-accent/15 text-accent-deep",
  CUSTOMER: "bg-info/10 text-info",
};

export default function AdminUsersPage() {
  const users = useAllUsers();
  const deleteUser = useDeleteUser();
  const currentUser = useAuthStore((s) => s.user);

  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (users.isLoading) return <LoadingState />;
  if (users.isError) return <ErrorState message={getApiErrorMessage(users.error)} />;

  const userList = [...(users.data ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const onDelete = async (user: UserResponse) => {
    if (user.id === currentUser?.id) {
      setError("You can't delete your own account while signed in as it.");
      return;
    }
    if (!confirm(`Delete ${user.full_name}? This can't be undone.`)) return;
    setError(null);
    try {
      await deleteUser.mutateAsync(user.id);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't delete this user."));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Users</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink hover:bg-accent-deep"
        >
          Add user
        </button>
      </div>
      <p className="mt-1 text-sm text-muted">
        There's no way to deactivate a user without deleting them — the update endpoint doesn't
        have an <code className="rounded bg-ink/5 px-1 py-0.5 text-xs">is_active</code> field.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      {userList.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No users yet" />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-ink/[0.02] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">
                    {user.full_name}
                    {user.id === currentUser?.id && (
                      <span className="ml-2 text-xs text-muted">(you)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLE[user.role]}`}
                    >
                      {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <BooleanBadge value={user.is_active} trueLabel="Active" falseLabel="Inactive" />
                  </td>
                  <td className="px-4 py-3 text-ink">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-sm font-medium text-ink underline underline-offset-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(user)}
                        className="text-sm font-medium text-danger underline underline-offset-2"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreating && <UserFormModal user={null} onClose={() => setIsCreating(false)} />}
      {editingUser && <UserFormModal user={editingUser} onClose={() => setEditingUser(null)} />}
    </div>
  );
}
