import { useState } from "react";
import { useAllVendors, useApproveVendor } from "../../hooks/useVendors";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { BooleanBadge } from "../../components/ui/StatusBadge";
import { formatDate } from "../../lib/format";
import { getApiErrorMessage } from "../../lib/errors";

export default function AdminVendorsPage() {
  const vendors = useAllVendors();
  const approveVendor = useApproveVendor();
  const [error, setError] = useState<string | null>(null);

  if (vendors.isLoading) return <LoadingState />;
  if (vendors.isError) return <ErrorState message={getApiErrorMessage(vendors.error)} />;

  const vendorList = [...(vendors.data ?? [])].sort(
    (a, b) => Number(a.is_approved) - Number(b.is_approved) // pending first
  );

  const onApprove = async (vendorId: string) => {
    setError(null);
    try {
      await approveVendor.mutateAsync(vendorId);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't approve this vendor."));
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Vendors</h1>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      {vendorList.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No vendors yet" />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-ink/[0.02] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Store</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendorList.map((vendor) => (
                <tr key={vendor.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{vendor.store_name}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted">
                    {vendor.store_description || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink">{formatDate(vendor.created_at)}</td>
                  <td className="px-4 py-3">
                    <BooleanBadge value={vendor.is_approved} trueLabel="Approved" falseLabel="Pending" />
                  </td>
                  <td className="px-4 py-3">
                    {!vendor.is_approved && (
                      <button
                        onClick={() => onApprove(vendor.id)}
                        disabled={approveVendor.isPending}
                        className="text-sm font-medium text-ink underline underline-offset-2 disabled:opacity-60"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
