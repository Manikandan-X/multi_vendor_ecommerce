import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useAddToCart } from "../../hooks/useCart";
import { useAuthStore } from "../../store/useAuthStore";
import { LoadingState, ErrorState } from "../../components/ui/States";
import { getApiErrorMessage } from "../../lib/errors";
import { formatCurrency } from "../../lib/format";
import { resolveUploadUrl } from "../../api/client";
import { UserRole } from "../../constants/enums";

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const product = useProduct(productId);
  const categories = useCategories();
  const addToCart = useAddToCart();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  if (product.isLoading) return <LoadingState label="Loading product…" />;
  if (product.isError || !product.data) {
    return <ErrorState message={getApiErrorMessage(product.error, "Product not found.")} />;
  }

  const p = product.data;
  const categoryName = categories.data?.find((c) => c.id === p.category_id)?.name;
  const imageUrl = resolveUploadUrl(p.image_url);
  const isOutOfStock = p.stock === 0;

  const canBuy = user?.role === UserRole.CUSTOMER;

  const onAddToCart = async () => {
    setError(null);
    setAdded(false);
    try {
      await addToCart.mutateAsync({ product_id: p.id, quantity });
      setAdded(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't add this to your cart."));
    }
  };

  return (
    <div>
      <Link to="/" className="text-sm font-medium text-muted hover:text-ink">
        ← Back to products
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl border border-border bg-surface">
          {imageUrl ? (
            <img src={imageUrl} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-display text-6xl font-semibold text-border">
                {p.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div>
          {categoryName && (
            <span className="text-xs font-medium uppercase tracking-wide text-muted">{categoryName}</span>
          )}
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{p.name}</h1>
          <p className="mt-3 font-display text-3xl font-semibold text-ink">{formatCurrency(p.price)}</p>

          <div className="mt-2">
            {isOutOfStock ? (
              <span className="text-sm font-medium text-danger">Out of stock</span>
            ) : p.stock <= 5 ? (
              <span className="text-sm font-medium text-accent-deep">Only {p.stock} left</span>
            ) : (
              <span className="text-sm font-medium text-success">In stock</span>
            )}
          </div>

          {p.description && <p className="mt-4 text-sm leading-relaxed text-muted">{p.description}</p>}

          <div className="mt-6">
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="inline-block rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-light"
              >
                Sign in to buy
              </Link>
            ) : !canBuy ? (
              <p className="text-sm text-muted">
                Signed in as {user?.role.toLowerCase()} — only customer accounts can purchase.
              </p>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-border">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-ink hover:bg-ink/5"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm text-ink">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(p.stock, q + 1))}
                    className="px-3 py-2 text-ink hover:bg-ink/5"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={onAddToCart}
                  disabled={isOutOfStock || addToCart.isPending}
                  className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-ink hover:bg-accent-deep disabled:opacity-50"
                >
                  {addToCart.isPending ? "Adding…" : "Add to cart"}
                </button>
              </div>
            )}

            {added && (
              <p className="mt-3 text-sm text-success">
                Added to cart.{" "}
                <Link to="/cart" className="font-medium underline underline-offset-2">
                  View cart
                </Link>
              </p>
            )}
            {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
