from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.base import BaseSchema


class CartItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartItemResponse(BaseSchema):
    id: UUID

    product_id: UUID
    product_name: str

    quantity: int

    price: Decimal

    subtotal: Decimal


class CartResponse(BaseSchema):
    id: UUID

    customer_id: UUID

    items: list[CartItemResponse]

    total_amount: Decimal

    created_at: datetime
    updated_at: datetime