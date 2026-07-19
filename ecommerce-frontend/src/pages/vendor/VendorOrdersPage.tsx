import { useVendorOrders } from "../../hooks/useOrders";
import { OrderStatusBadge, PaymentStatusBadge } from "../../components/ui/StatusBadge";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { formatCurrency, formatDate } from "../../lib/format";
import { getApiErrorMessage } from "../../lib/errors";

export default function VendorOrdersPage() {
  const orders = useVendorOrders();

  if (orders.isLoading) return <LoadingState />;
  if (orders.isError) return <ErrorState message={getApiErrorMessage(orders.error)} />;

  const orderList = [...(orders.data ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Orders</h1>
      <p className="mt-1 text-sm text-muted">
        Fulfillment actions (mark shipped/delivered) aren't wired up yet — there's no
        vendor-facing order-status-update endpoint on the backend currently.
      </p>

      {orderList.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No orders yet" description="Orders placed for your products will show up here." />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-ink/[0.02] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {orderList.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-ink">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 text-ink">
                    {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""}
                  </td>
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
