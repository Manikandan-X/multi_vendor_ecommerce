import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart, useClearCart } from "../../hooks/useCart";
import { checkout } from "../../api/orders";
import { createPayment } from "../../api/payments";
import { LoadingState, ErrorState } from "../../components/ui/States";
import { formatCurrency } from "../../lib/format";
import { getApiErrorMessage } from "../../lib/errors";

const PAYMENT_METHODS = ["Card", "UPI", "Cash on Delivery"];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useCart();
  const clearCart = useClearCart();

  const [address, setAddress] = useState({ line1: "", city: "", state: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cart.isLoading) return <LoadingState />;
  if (cart.isError) return <ErrorState message={getApiErrorMessage(cart.error)} />;

  const items = cart.data?.items ?? [];
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <p className="text-sm text-muted">Your cart is empty — nothing to check out.</p>
      </div>
    );
  }

  const addressComplete = address.line1 && address.city && address.state && address.pincode;

  const onPlaceOrder = async () => {
    setError(null);
    setIsPlacing(true);
    try {
      // Splits the cart into one order per vendor on the backend.
      const orders = await checkout();

      // Best-effort: record a payment per order. If one fails partway
      // through, the orders themselves are already placed — surface the
      // error but don't pretend nothing happened.
      for (const order of orders) {
        await createPayment(order.id, { payment_method: paymentMethod });
      }

      await clearCart.mutateAsync().catch(() => {
        // checkout already empties the cart server-side in most designs;
        // if this 404s because it's already empty, that's fine to ignore.
      });

      navigate("/order-success", { state: { orderIds: orders.map((o) => o.id) } });
    } catch (err) {
      setError(getApiErrorMessage(err, "Checkout failed. Your cart hasn't been cleared."));
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink">Checkout</h1>

      <div className="mt-6 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-sm font-semibold text-ink">Shipping address</h2>
        <p className="mt-1 text-xs text-muted">
          Heads up: your backend doesn't have a field to store an address yet, so this is
          captured here for the checkout experience only — it won't be saved with the order or
          visible to the vendor. Add an address field on the backend before relying on this.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            placeholder="Address line"
            value={address.line1}
            onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
            className="col-span-2 rounded-lg border border-border bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
          <input
            placeholder="City"
            value={address.city}
            onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
            className="rounded-lg border border-border bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
          <input
            placeholder="State"
            value={address.state}
            onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
            className="rounded-lg border border-border bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
          <input
            placeholder="PIN code"
            value={address.pincode}
            onChange={(e) => setAddress((a) => ({ ...a, pincode: e.target.value }))}
            className="rounded-lg border border-border bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-sm font-semibold text-ink">Payment method</h2>
        <div className="mt-3 flex gap-2">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                paymentMethod === method
                  ? "border-ink bg-ink text-white"
                  : "border-border text-muted hover:text-ink"
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-sm font-semibold text-ink">Order summary</h2>
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted">
                {item.product_name} × {item.quantity}
              </span>
              <span className="text-ink">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3">
          <span className="text-sm font-medium text-ink">Total</span>
          <span className="font-display text-lg font-semibold text-ink">
            {formatCurrency(cart.data?.total_amount ?? 0)}
          </span>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        onClick={onPlaceOrder}
        disabled={!addressComplete || isPlacing}
        className="mt-4 w-full rounded-lg bg-accent py-3 text-sm font-semibold text-ink hover:bg-accent-deep disabled:opacity-50"
      >
        {isPlacing ? "Placing order…" : `Place order — ${formatCurrency(cart.data?.total_amount ?? 0)}`}
      </button>
      {!addressComplete && (
        <p className="mt-2 text-center text-xs text-muted">Fill in the address to continue.</p>
      )}
    </div>
  );
}
