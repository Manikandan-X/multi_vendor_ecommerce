import { useState } from "react";
import { useMyOrders, useCancelOrder } from "../../hooks/useOrders";
import { OrderStatusBadge, PaymentStatusBadge } from "../../components/ui/StatusBadge";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { formatCurrency, formatDate } from "../../lib/format";
import { getApiErrorMessage } from "../../lib/errors";
import { OrderStatus } from "../../constants/enums";

// Once an order has shipped, cancelling from the buyer side no longer makes
// sense — that would need a return/refund flow instead, which this backend
// doesn't have yet.
const NON_CANCELLABLE_STATUSES: OrderStatus[] = [
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
];

export default function BuyerOrdersPage() {
  const orders = useMyOrders();
  const cancelOrder = useCancelOrder();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  if (orders.isLoading) return <LoadingState />;
  if (orders.isError) return <ErrorState message={getApiErrorMessage(orders.error)} />;

  const orderList = [...(orders.data ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const onCancel = async (orderId: string) => {
    if (!confirm("Cancel this order? This can't be undone.")) return;
    setError(null);
    setCancellingId(orderId);
    try {
      await cancelOrder.mutateAsync(orderId);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't cancel this order."));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Your orders</h1>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      {orderList.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No orders yet" description="Orders you place will show up here." />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orderList.map((order) => {
            const isOpen = expandedId === order.id;
            return (
              <div key={order.id} className="overflow-hidden rounded-xl border border-border bg-surface">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedId(isOpen ? null : order.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setExpandedId(isOpen ? null : order.id);
                  }}
                  className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left"
                >
                  <div>
                    <p className="font-mono text-xs text-muted">Order {order.id.slice(0, 8)}</p>
                    <p className="mt-0.5 text-sm text-ink">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.payment_status} />
                    <p className="w-24 text-right font-medium text-ink">
                      {formatCurrency(order.total_amount)}
                    </p>
                    {!NON_CANCELLABLE_STATUSES.includes(order.status) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancel(order.id);
                        }}
                        disabled={cancellingId === order.id}
                        className="text-sm font-medium text-danger underline underline-offset-2 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                    <span className="text-muted">{isOpen ? "−" : "+"}</span>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-border px-5 py-4">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs uppercase tracking-wide text-muted">
                        <tr>
                          <th className="pb-2 font-medium">Product</th>
                          <th className="pb-2 text-right font-medium">Qty</th>
                          <th className="pb-2 text-right font-medium">Price</th>
                          <th className="pb-2 text-right font-medium">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.order_items.map((item) => (
                          <tr key={item.id} className="border-t border-border">
                            <td className="py-2 text-ink">{item.product_name}</td>
                            <td className="py-2 text-right text-ink">{item.quantity}</td>
                            <td className="py-2 text-right text-ink">{formatCurrency(item.price)}</td>
                            <td className="py-2 text-right font-medium text-ink">
                              {formatCurrency(item.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
