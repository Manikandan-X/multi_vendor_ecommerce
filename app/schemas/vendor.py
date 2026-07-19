from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.base import BaseSchema


class VendorCreate(BaseModel):
    store_name: str = Field(
        min_length=3,
        max_length=150,
    )

    store_description: str | None = None


class VendorUpdate(BaseModel):
    store_name: str | None = Field(
        default=None,
        min_length=3,
        max_length=150,
    )

    store_description: str | None = None


class VendorResponse(BaseSchema):
    id: UUID
    user_id: UUID
    store_name: str
    store_description: str | None
    is_approved: bool
    created_at: datetime
    updated_at: datetime