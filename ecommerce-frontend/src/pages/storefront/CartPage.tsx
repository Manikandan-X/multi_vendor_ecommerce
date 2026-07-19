import { Link, useNavigate } from "react-router-dom";
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from "../../hooks/useCart";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { formatCurrency } from "../../lib/format";
import { getApiErrorMessage } from "../../lib/errors";
import { useState } from "react";

export default function CartPage() {
  const cart = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  if (cart.isLoading) return <LoadingState />;
  if (cart.isError) return <ErrorState message={getApiErrorMessage(cart.error)} />;

  const items = cart.data?.items ?? [];

  const onQuantityChange = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setError(null);
    try {
      await updateItem.mutateAsync({ itemId, data: { quantity } });
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't update quantity — it may exceed available stock."));
    }
  };

  const onRemove = async (itemId: string) => {
    setError(null);
    try {
      await removeItem.mutateAsync(itemId);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't remove this item."));
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-12">
        <EmptyState title="Your cart is empty" description="Products you add will show up here." />
        <Link
          to="/"
          className="mt-6 block w-full rounded-lg bg-ink py-2.5 text-center text-sm font-semibold text-white hover:bg-ink-light"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Your cart</h1>
        <button
          onClick={() => clearCart.mutate()}
          className="text-sm font-medium text-muted hover:text-danger"
        >
          Clear cart
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">{item.product_name}</p>
              <p className="mt-0.5 text-sm text-muted">{formatCurrency(item.price)} each</p>
            </div>

            <div className="flex items-center rounded-lg border border-border">
              <button
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                className="px-2.5 py-1.5 text-ink hover:bg-ink/5"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center text-sm text-ink">{item.quantity}</span>
              <button
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                className="px-2.5 py-1.5 text-ink hover:bg-ink/5"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <p className="w-24 text-right text-sm font-medium text-ink">
              {formatCurrency(item.subtotal)}
            </p>

            <button
              onClick={() => onRemove(item.id)}
              className="text-sm font-medium text-danger"
              aria-label={`Remove ${item.product_name}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4">
        <span className="text-sm font-medium text-muted">Total</span>
        <span className="font-display text-xl font-semibold text-ink">
          {formatCurrency(cart.data?.total_amount ?? 0)}
        </span>
      </div>

      <button
        onClick={() => navigate("/checkout")}
        className="mt-4 w-full rounded-lg bg-accent py-3 text-sm font-semibold text-ink hover:bg-accent-deep"
      >
        Proceed to checkout
      </button>
    </div>
  );
}
