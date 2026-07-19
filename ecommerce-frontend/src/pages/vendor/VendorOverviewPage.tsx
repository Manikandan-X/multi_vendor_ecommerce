import { useState } from "react";
import { useMyVendor, useCreateVendor } from "../../hooks/useVendors";
import { useMyProducts } from "../../hooks/useProducts";
import { useVendorOrders } from "../../hooks/useOrders";
import { StatCard } from "../../components/ui/StatCard";
import { LoadingState } from "../../components/ui/States";
import { getApiErrorMessage } from "../../lib/errors";
import { formatCurrency } from "../../lib/format";
import { OrderStatus } from "../../constants/enums";

export default function VendorOverviewPage() {
  const vendor = useMyVendor();

  // AxiosError 404 means "no store yet" — show setup form instead of an error.
  const needsSetup = vendor.isError;

  if (vendor.isLoading) return <LoadingState />;
  if (needsSetup) return <StoreSetupForm />;
  if (!vendor.data) return null;

  if (!vendor.data.is_approved) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          {vendor.data.store_name}
        </h1>
        <div className="mt-6 rounded-xl border border-dashed border-accent/40 bg-accent/5 px-5 py-8 text-center">
          <p className="font-display text-sm font-semibold text-ink">Pending approval</p>
          <p className="mt-1 text-sm text-muted">
            An admin needs to approve your store before you can list products or receive orders.
          </p>
        </div>
      </div>
    );
  }

  return <VendorStats storeName={vendor.data.store_name} />;
}

function StoreSetupForm() {
  const createVendor = useCreateVendor();
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createVendor.mutateAsync({
        store_name: storeName,
        store_description: storeDescription || null,
      });
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't create your store."));
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-2xl font-semibold text-ink">Set up your store</h1>
      <p className="mt-1 text-sm text-muted">
        You'll need this before you can list products. An admin will need to approve it.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Store name</label>
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            minLength={3}
            maxLength={150}
            required
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Store description <span className="text-muted">(optional)</span>
          </label>
          <textarea
            value={storeDescription}
            onChange={(e) => setStoreDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={createVendor.isPending}
          className="w-full rounded-lg bg-ink py-2.5 text-sm font-semibold text-white hover:bg-ink-light disabled:opacity-60"
        >
          {createVendor.isPending ? "Creating…" : "Create store"}
        </button>
      </form>
    </div>
  );
}

function VendorStats({ storeName }: { storeName: string }) {
  const products = useMyProducts();
  const orders = useVendorOrders();

  if (products.isLoading || orders.isLoading) return <LoadingState />;

  const productList = products.data ?? [];
  const orderList = orders.data ?? [];
  const lowStock = productList.filter((p) => p.stock <= 5 && p.is_active);
  const pendingOrders = orderList.filter((o) => o.status === OrderStatus.PENDING);
  const revenue = orderList
    .filter((o) => o.status !== OrderStatus.CANCELLED)
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">{storeName}</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Products" value={String(productList.length)} />
        <StatCard label="Orders" value={String(orderList.length)} hint={`${pendingOrders.length} pending`} />
        <StatCard label="Revenue" value={formatCurrency(revenue)} accent />
        <StatCard
          label="Low stock"
          value={String(lowStock.length)}
          hint={lowStock.length > 0 ? "5 units or fewer" : undefined}
        />
      </div>

      {lowStock.length > 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-accent/40 bg-accent/5 px-5 py-4">
          <p className="text-sm font-medium text-ink">Running low</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {lowStock.slice(0, 5).map((p) => (
              <li key={p.id}>
                {p.name} — {p.stock} left
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
