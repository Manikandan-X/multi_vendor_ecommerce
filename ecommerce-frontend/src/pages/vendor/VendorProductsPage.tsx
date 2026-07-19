import { useRef, useState } from "react";
import { useMyProducts, useDeleteProduct, useUploadProductImage } from "../../hooks/useProducts";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { BooleanBadge } from "../../components/ui/StatusBadge";
import { formatCurrency } from "../../lib/format";
import { getApiErrorMessage } from "../../lib/errors";
import { resolveUploadUrl } from "../../api/client";
import { ProductFormModal } from "./ProductFormModal";
import type { ProductResponse } from "../../types";

export default function VendorProductsPage() {
  const products = useMyProducts();
  const deleteProduct = useDeleteProduct();
  const uploadImage = useUploadProductImage();

  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (products.isLoading) return <LoadingState />;
  if (products.isError) return <ErrorState message={getApiErrorMessage(products.error)} />;

  const productList = products.data ?? [];

  const onDelete = async (productId: string) => {
    if (!confirm("Delete this product? This can't be undone.")) return;
    try {
      await deleteProduct.mutateAsync(productId);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't delete the product."));
    }
  };

  const onImagePick = async (productId: string, file: File | undefined) => {
    if (!file) return;
    try {
      await uploadImage.mutateAsync({ productId, file });
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't upload the image."));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Products</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink hover:bg-accent-deep"
        >
          Add product
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      {productList.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No products yet" description="Add your first product to start selling." />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-ink/[0.02] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productList.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => fileInputRefs.current[product.id]?.click()}
                        className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-dashed border-border bg-paper"
                        title={product.image_url ? "Click to change image" : "Click to add an image"}
                      >
                        {product.image_url ? (
                          <img
                            src={resolveUploadUrl(product.image_url) ?? undefined}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-xs text-muted">
                            +
                          </span>
                        )}
                      </button>
                      <input
                        ref={(el) => { fileInputRefs.current[product.id] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onImagePick(product.id, e.target.files?.[0])}
                      />
                      <div>
                        <p className="font-medium text-ink">{product.name}</p>
                        <button
                          onClick={() => fileInputRefs.current[product.id]?.click()}
                          className="text-xs font-medium text-ink underline underline-offset-2"
                        >
                          {product.image_url ? "Change image" : "Add image"}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3 text-ink">{product.stock}</td>
                  <td className="px-4 py-3">
                    <BooleanBadge value={product.is_active} trueLabel="Active" falseLabel="Inactive" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-sm font-medium text-ink underline underline-offset-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="text-sm font-medium text-danger underline underline-offset-2"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreating && <ProductFormModal product={null} onClose={() => setIsCreating(false)} />}
      {editingProduct && (
        <ProductFormModal product={editingProduct} onClose={() => setEditingProduct(null)} />
      )}
    </div>
  );
}