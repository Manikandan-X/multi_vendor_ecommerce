import { Link } from "react-router-dom";
import type { ProductResponse } from "../../types";
import { resolveUploadUrl } from "../../api/client";
import { formatCurrency } from "../../lib/format";
import { useAuthStore } from "../../store/useAuthStore";
import { useAddToCart } from "../../hooks/useCart";
import { UserRole } from "../../constants/enums";
import { useState } from "react";

export function ProductCard({ product, categoryName }: { product: ProductResponse; categoryName?: string }) {
  const user = useAuthStore((s) => s.user);
  const addToCart = useAddToCart();
  const [justAdded, setJustAdded] = useState(false);

  const imageUrl = resolveUploadUrl(product.image_url);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const canBuy = user?.role === UserRole.CUSTOMER;

  const onQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault(); // don't follow the card's Link
    e.stopPropagation();
    try {
      await addToCart.mutateAsync({ product_id: product.id, quantity: 1 });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    } catch {
      // silently ignore here — detail page surfaces errors properly;
      // a quick-add failing on a grid card isn't worth a blocking error state
    }
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden bg-paper">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-3xl font-semibold text-border">
              {product.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {categoryName && (
          <span className="text-xs font-medium uppercase tracking-wide text-muted">{categoryName}</span>
        )}
        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-ink">{product.name}</h3>

        <div className="mt-2 flex items-center gap-2">
          <span className="font-display text-base font-semibold text-ink">
            {formatCurrency(product.price)}
          </span>
          {isLowStock && <span className="text-xs text-accent-deep">Only {product.stock} left</span>}
          {isOutOfStock && <span className="text-xs text-danger">Out of stock</span>}
        </div>

        <div className="mt-3 flex-1" />

        {canBuy && (
          <button
            onClick={onQuickAdd}
            disabled={isOutOfStock || addToCart.isPending}
            className="mt-2 w-full rounded-lg bg-ink py-2 text-xs font-semibold text-white transition-colors hover:bg-ink-light disabled:opacity-50"
          >
            {justAdded ? "Added ✓" : isOutOfStock ? "Out of stock" : "Add to cart"}
          </button>
        )}
      </div>
    </Link>
  );
}
