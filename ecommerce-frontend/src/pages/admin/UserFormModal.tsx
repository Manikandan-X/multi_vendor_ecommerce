import { useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { useCreateUser, useUpdateUser } from "../../hooks/useUsers";
import { getApiErrorMessage } from "../../lib/errors";
import { UserRole } from "../../constants/enums";
import type { UserResponse } from "../../types";

export function UserFormModal({
  user,
  onClose,
}: {
  user: UserResponse | null; // null = create mode
  onClose: () => void;
}) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(user?.role ?? UserRole.CUSTOMER);
  const [error, setError] = useState<string | null>(null);

  const isSaving = createUser.isPending || updateUser.isPending;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (user) {
        await updateUser.mutateAsync({
          userId: user.id,
          data: { full_name: fullName, email, role },
        });
      } else {
        await createUser.mutateAsync({ full_name: fullName, email, password, role });
      }
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't save this user."));
    }
  };

  return (
    <Modal title={user ? "Edit user" : "Add user"} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            minLength={3}
            maxLength={150}
            required
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </div>

        {!user && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              maxLength={100}
              required
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
            />
            <p className="mt-1 text-xs text-muted">8–100 characters</p>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          >
            <option value={UserRole.CUSTOMER}>Customer</option>
            <option value={UserRole.VENDOR}>Vendor</option>
            <option value={UserRole.ADMIN}>Admin</option>
          </select>
          {user && role !== user.role && (
            <p className="mt-1 text-xs text-accent-deep">
              Changing role won't retroactively create/remove a vendor store — check the Vendors
              tab if this user needs one.
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-semibold text-ink hover:bg-ink/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-lg bg-ink py-2.5 text-sm font-semibold text-white hover:bg-ink-light disabled:opacity-60"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
