import { useEffect, useState } from "react";
import { useMyVendor, useUpdateMyVendor } from "../../hooks/useVendors";
import { LoadingState } from "../../components/ui/States";
import { getApiErrorMessage } from "../../lib/errors";

export default function VendorSettingsPage() {
  const vendor = useMyVendor();
  const updateVendor = useUpdateMyVendor();

  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (vendor.data) {
      setStoreName(vendor.data.store_name);
      setStoreDescription(vendor.data.store_description ?? "");
    }
  }, [vendor.data]);

  if (vendor.isLoading) return <LoadingState />;
  if (!vendor.data) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await updateVendor.mutateAsync({
        store_name: storeName,
        store_description: storeDescription || null,
      });
      setSaved(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't save changes."));
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="font-display text-2xl font-semibold text-ink">Store settings</h1>

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
          <label className="mb-1.5 block text-sm font-medium text-ink">Store description</label>
          <textarea
            value={storeDescription}
            onChange={(e) => setStoreDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}
        {saved && (
          <p className="rounded-lg bg-success/10 px-3.5 py-2.5 text-sm text-success">
            Saved.
          </p>
        )}

        <button
          type="submit"
          disabled={updateVendor.isPending}
          className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-light disabled:opacity-60"
        >
          {updateVendor.isPending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
