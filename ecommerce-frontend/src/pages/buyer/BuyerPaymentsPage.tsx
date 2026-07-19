import { useMyPayments } from "../../hooks/usePayments";
import { PaymentStatusBadge } from "../../components/ui/StatusBadge";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { formatCurrency, formatDate } from "../../lib/format";
import { getApiErrorMessage } from "../../lib/errors";

export default function BuyerPaymentsPage() {
  const payments = useMyPayments();

  if (payments.isLoading) return <LoadingState />;
  if (payments.isError) return <ErrorState message={getApiErrorMessage(payments.error)} />;

  const paymentList = [...(payments.data ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Payment history</h1>

      {paymentList.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No payments yet" description="Payments you make will show up here." />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-ink/[0.02] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paymentList.map((payment) => (
                <tr key={payment.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    {payment.order_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 capitalize text-ink">{payment.payment_method}</td>
                  <td className="px-4 py-3 text-ink">{formatDate(payment.created_at)}</td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={payment.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-ink">
                    {formatCurrency(payment.amount)}
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
