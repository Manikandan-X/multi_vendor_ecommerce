import { useMemo } from "react";
import { useAllOrders } from "../../hooks/useOrders";
import { useAllUsers } from "../../hooks/useUsers";
import { useAllVendors } from "../../hooks/useVendors";
import { OrderStatusBadge, PaymentStatusBadge } from "../../components/ui/StatusBadge";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { formatCurrency, formatDate } from "../../lib/format";
import { getApiErrorMessage } from "../../lib/errors";

export default function AdminOrdersPage() {
  const orders = useAllOrders();
  const users = useAllUsers();
  const vendors = useAllVendors();

  const customerNameById = useMemo(() => {
    const map = new Map<string, string>();
    users.data?.forEach((u) => map.set(u.id, u.full_name));
    return map;
  }, [users.data]);

  const vendorNameById = useMemo(() => {
    const map = new Map<string, string>();
    vendors.data?.forEach((v) => map.set(v.id, v.store_name));
    return map;
  }, [vendors.data]);

  if (orders.isLoading) return <LoadingState />;
  if (orders.isError) return <ErrorState message={getApiErrorMessage(orders.error)} />;

  const orderList = [...(orders.data ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">All orders</h1>
      <p className="mt-1 text-sm text-muted">
        Platform-wide, read-only. Status changes happen on the vendor side.
      </p>

      {orderList.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No orders yet" />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-ink/[0.02] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {orderList.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-ink">
                    {customerNameById.get(order.customer_id) ?? order.customer_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {vendorNameById.get(order.vendor_id) ?? order.vendor_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-ink">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={order.payment_status} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-ink">
                    {formatCurrency(order.total_amount)}
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
