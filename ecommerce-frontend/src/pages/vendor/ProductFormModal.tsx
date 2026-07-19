import { useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { useCategories } from "../../hooks/useCategories";
import { useCreateProduct, useUpdateProduct } from "../../hooks/useProducts";
import { getApiErrorMessage } from "../../lib/errors";
import type { ProductResponse } from "../../types";

export function ProductFormModal({
  product,
  onClose,
}: {
  product: ProductResponse | null; // null = create mode
  onClose: () => void;
}) {
  const categories = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [stock, setStock] = useState(product ? String(product.stock) : "");
  const [error, setError] = useState<string | null>(null);

  const isSaving = createProduct.isPending || updateProduct.isPending;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError("Choose a category");
      return;
    }

    try {
      if (product) {
        await updateProduct.mutateAsync({
          productId: product.id,
          data: {
            name,
            description: description || null,
            category_id: categoryId,
            price: Number(price),
            stock: Number(stock),
          },
        });
      } else {
        await createProduct.mutateAsync({
          name,
          description: description || null,
          category_id: categoryId,
          price: Number(price),
          stock: Number(stock),
        });
      }
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't save the product."));
    }
  };

  return (
    <Modal title={product ? "Edit product" : "Add product"} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            maxLength={200}
            required
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          >
            <option value="">Select a category</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {categories.data?.length === 0 && (
            <p className="mt-1 text-xs text-muted">
              No categories exist yet — an admin needs to create one first.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Description <span className="text-muted">(optional)</span>
          </label>
          <textarea
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Price</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Stock</label>
            <input
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-semibold text-ink hover:bg-ink/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-lg bg-ink py-2.5 text-sm font-semibold text-white hover:bg-ink-light disabled:opacity-60"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
