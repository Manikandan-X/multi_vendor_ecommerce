import { useState } from "react";
import { useVendorOrders, useUpdateOrderStatus } from "../../hooks/useOrders";
import { OrderStatusBadge, PaymentStatusBadge } from "../../components/ui/StatusBadge";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { formatCurrency, formatDate } from "../../lib/format";
import { getApiErrorMessage } from "../../lib/errors";
import { OrderStatus } from "../../constants/enums";

// Vendors update fulfillment progress, not payment/cancellation — those are
// PAID (payment-driven) and CANCELLED (customer-only), so they're excluded
// from this dropdown even though the backend would technically accept them.
const VENDOR_SETTABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

const TERMINAL_STATUSES: OrderStatus[] = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];

export default function VendorOrdersPage() {
  const orders = useVendorOrders();
  const updateStatus = useUpdateOrderStatus();
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (orders.isLoading) return <LoadingState />;
  if (orders.isError) return <ErrorState message={getApiErrorMessage(orders.error)} />;

  const orderList = [...(orders.data ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const onStatusChange = async (orderId: string, status: OrderStatus) => {
    setError(null);
    setUpdatingId(orderId);
    try {
      await updateStatus.mutateAsync({ orderId, data: { status } });
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't update order status."));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Orders</h1>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

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
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orderList.map((order) => {
                const isTerminal = TERMINAL_STATUSES.includes(order.status);
                return (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-muted">{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-ink">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 text-ink">
                      {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={order.payment_status} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-ink">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      {isTerminal ? (
                        <OrderStatusBadge status={order.status} />
                      ) : (
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-ink outline-none focus:border-ink disabled:opacity-50"
                        >
                          {VENDOR_SETTABLE_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0) + s.slice(1).toLowerCase()}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
