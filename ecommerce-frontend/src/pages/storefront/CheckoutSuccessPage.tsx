import { Link, useLocation } from "react-router-dom";

export default function CheckoutSuccessPage() {
  const location = useLocation();
  const orderIds = (location.state as { orderIds?: string[] } | null)?.orderIds ?? [];

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
        ✓
      </div>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Order placed</h1>
      <p className="mt-2 text-sm text-muted">
        {orderIds.length > 1
          ? `Your cart included items from multiple vendors, so it was split into ${orderIds.length} orders.`
          : "Thanks for your order."}
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          to="/account/orders"
          className="rounded-lg bg-ink py-2.5 text-sm font-semibold text-white hover:bg-ink-light"
        >
          View your orders
        </Link>
        <Link to="/" className="text-sm font-medium text-muted hover:text-ink">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
