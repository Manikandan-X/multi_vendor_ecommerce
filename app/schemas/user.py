from datetime import datetime
from uuid import UUID
from pydantic import EmailStr
from pydantic import ConfigDict

from app.constants.enums import UserRole
from app.schemas.base import BaseSchema

class UserCreate(BaseSchema):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole


class UserUpdate(BaseSchema):
    full_name: str | None = None
    email: EmailStr | None = None
    role: UserRole | None = None

class UserResponse(BaseSchema):
    id: UUID
    full_name: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )