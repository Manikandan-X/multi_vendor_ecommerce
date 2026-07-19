import { useState } from "react";
import { useMyOrders } from "../../hooks/useOrders";
import { OrderStatusBadge, PaymentStatusBadge } from "../../components/ui/StatusBadge";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { formatCurrency, formatDate } from "../../lib/format";
import { getApiErrorMessage } from "../../lib/errors";

export default function BuyerOrdersPage() {
  const orders = useMyOrders();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (orders.isLoading) return <LoadingState />;
  if (orders.isError) return <ErrorState message={getApiErrorMessage(orders.error)} />;

  const orderList = [...(orders.data ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Your orders</h1>

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
                <button
                  onClick={() => setExpandedId(isOpen ? null : order.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
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
                    <span className="text-muted">{isOpen ? "−" : "+"}</span>
                  </div>
                </button>

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
