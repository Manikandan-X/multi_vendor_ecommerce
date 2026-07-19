from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.constants.enums import PaymentStatus
from app.schemas.base import BaseSchema


class PaymentCreate(BaseModel):
    payment_method: str


class PaymentUpdate(BaseModel):
    status: PaymentStatus
    transaction_id: str | None = None


class PaymentResponse(BaseSchema):
    id: UUID

    order_id: UUID

    amount: Decimal

    status: str

    payment_method: str

    transaction_id: str | None = None

    created_at: datetime
    updated_at: datetime