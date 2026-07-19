from datetime import datetime
from decimal import Decimal
from uuid import UUID

from app.constants.enums import OrderStatus, PaymentStatus
from app.schemas.base import BaseSchema


class OrderItemResponse(BaseSchema):
    id: UUID

    product_id: UUID
    product_name: str

    quantity: int

    price: Decimal
    subtotal: Decimal


class OrderResponse(BaseSchema):
    id: UUID

    customer_id: UUID
    vendor_id: UUID

    status: OrderStatus
    payment_status: PaymentStatus

    total_amount: Decimal

    order_items: list[OrderItemResponse]

    created_at: datetime
    updated_at: datetime
    
class OrderStatusUpdate(BaseSchema):
    status: OrderStatus