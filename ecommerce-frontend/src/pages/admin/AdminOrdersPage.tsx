import { NeedsBackendEndpoint } from "../../components/ui/States";

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Orders</h1>
      <div className="mt-6">
        <NeedsBackendEndpoint
          title="Platform-wide order view isn't available yet"
          endpoint="GET /orders (admin-only, list all orders across vendors)"
        />
      </div>
    </div>
  );
}
