export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-danger/20 bg-danger/5 px-5 py-8 text-center">
      <p className="text-sm text-danger">{message}</p>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center">
      <p className="font-display text-sm font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
    </div>
  );
}

// Used where a section needs a backend endpoint that doesn't exist yet
// (e.g. admin "all orders" / "all users") so the gap is visible in the UI
// instead of silently failing or being left out.
export function NeedsBackendEndpoint({
  title,
  endpoint,
}: {
  title: string;
  endpoint: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-accent/40 bg-accent/5 px-5 py-10 text-center">
      <p className="font-display text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-muted">
        Needs a backend endpoint that doesn't exist yet:{" "}
        <code className="rounded bg-ink/5 px-1.5 py-0.5 text-xs">{endpoint}</code>
      </p>
    </div>
  );
}
