import { Link } from "react-router-dom";
import { useMyOrders } from "../../hooks/useOrders";
import { useMyPayments } from "../../hooks/usePayments";
import { useCart } from "../../hooks/useCart";
import { StatCard } from "../../components/ui/StatCard";
import { OrderStatusBadge } from "../../components/ui/StatusBadge";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { formatCurrency, formatDate } from "../../lib/format";
import { getApiErrorMessage } from "../../lib/errors";
import { PaymentStatus } from "../../constants/enums";

export default function BuyerOverviewPage() {
  const orders = useMyOrders();
  const payments = useMyPayments();
  const cart = useCart();

  if (orders.isLoading || payments.isLoading || cart.isLoading) return <LoadingState />;
  if (orders.isError) return <ErrorState message={getApiErrorMessage(orders.error)} />;

  const orderList = orders.data ?? [];
  const paymentList = payments.data ?? [];

  const totalSpent = paymentList
    .filter((p) => p.status === PaymentStatus.SUCCESS)
    .reduce((sum, p) => sum + p.amount, 0);

  const recentOrders = [...orderList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Overview</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total orders" value={String(orderList.length)} />
        <StatCard
          label="Items in cart"
          value={String(cart.data?.items.length ?? 0)}
          hint={cart.data && cart.data.items.length > 0 ? formatCurrency(cart.data.total_amount) + " total" : undefined}
        />
        <StatCard label="Total spent" value={formatCurrency(totalSpent)} accent />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Recent orders</h2>
          <Link to="/account/orders" className="text-sm font-medium text-ink underline underline-offset-2">
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No orders yet" description="Orders you place will show up here." />
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-ink/[0.02] text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {order.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-ink">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
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
    </div>
  );
}
