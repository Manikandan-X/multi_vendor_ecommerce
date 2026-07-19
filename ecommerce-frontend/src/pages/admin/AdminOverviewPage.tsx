import { useAllVendors } from "../../hooks/useVendors";
import { useCategories } from "../../hooks/useCategories";
import { useAllPayments } from "../../hooks/usePayments";
import { StatCard } from "../../components/ui/StatCard";
import { LoadingState, ErrorState } from "../../components/ui/States";
import { getApiErrorMessage } from "../../lib/errors";
import { formatCurrency } from "../../lib/format";
import { PaymentStatus } from "../../constants/enums";

export default function AdminOverviewPage() {
  const vendors = useAllVendors();
  const categories = useCategories();
  const payments = useAllPayments();

  if (vendors.isLoading || categories.isLoading || payments.isLoading) return <LoadingState />;
  if (vendors.isError) return <ErrorState message={getApiErrorMessage(vendors.error)} />;

  const vendorList = vendors.data ?? [];
  const pendingVendors = vendorList.filter((v) => !v.is_approved);
  const paymentList = payments.data ?? [];
  const totalRevenue = paymentList
    .filter((p) => p.status === PaymentStatus.SUCCESS)
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Overview</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Vendors" value={String(vendorList.length)} hint={`${pendingVendors.length} pending approval`} />
        <StatCard label="Categories" value={String(categories.data?.length ?? 0)} />
        <StatCard label="Payments recorded" value={String(paymentList.length)} />
        <StatCard label="Platform revenue" value={formatCurrency(totalRevenue)} accent />
      </div>

      {pendingVendors.length > 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-accent/40 bg-accent/5 px-5 py-4">
          <p className="text-sm font-medium text-ink">
            {pendingVendors.length} vendor{pendingVendors.length !== 1 ? "s" : ""} waiting on approval
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {pendingVendors.slice(0, 5).map((v) => (
              <li key={v.id}>{v.store_name}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-dashed border-border px-5 py-4 text-sm text-muted">
        Order volume and total-user counts aren't shown here — those need the{" "}
        <code className="rounded bg-ink/5 px-1 py-0.5 text-xs">GET /orders</code> and{" "}
        <code className="rounded bg-ink/5 px-1 py-0.5 text-xs">GET /users</code> endpoints
        that don't exist on the backend yet. See the Orders and Users tabs.
      </div>
    </div>
  );
}
