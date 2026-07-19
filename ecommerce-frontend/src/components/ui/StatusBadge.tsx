import { OrderStatus, PaymentStatus } from "../../constants/enums";

const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-muted/10 text-muted",
  [OrderStatus.PAID]: "bg-success/10 text-success",
  [OrderStatus.SHIPPED]: "bg-info/10 text-info",
  [OrderStatus.DELIVERED]: "bg-success/15 text-success",
  [OrderStatus.CANCELLED]: "bg-danger/10 text-danger",
};

const PAYMENT_STATUS_STYLE: Record<string, string> = {
  [PaymentStatus.PENDING]: "bg-muted/10 text-muted",
  [PaymentStatus.SUCCESS]: "bg-success/10 text-success",
  [PaymentStatus.FAILED]: "bg-danger/10 text-danger",
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${className}`}
    >
      {label.toLowerCase()}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge label={status} className={ORDER_STATUS_STYLE[status] ?? "bg-muted/10 text-muted"} />;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      label={status}
      className={PAYMENT_STATUS_STYLE[status] ?? "bg-muted/10 text-muted"}
    />
  );
}

export function BooleanBadge({ value, trueLabel, falseLabel }: { value: boolean; trueLabel: string; falseLabel: string }) {
  return (
    <Badge
      label={value ? trueLabel : falseLabel}
      className={value ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}
    />
  );
}
