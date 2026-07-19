import uuid

from sqlalchemy import Boolean, Enum, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constants.enums import UserRole
from app.core.base import Base
from app.models.audit_mixin import AuditMixin
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.vendor import Vendor
    from app.models.cart import Cart
    from app.models.order import Order

class User(Base, AuditMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    full_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    
    vendor: Mapped["Vendor | None"] = relationship(
        "Vendor",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    
    cart: Mapped["Cart | None"] = relationship(
        "Cart",
        back_populates="customer",
        uselist=False,
        cascade="all, delete-orphan",
    )
    
    orders: Mapped[list["Order"]] = relationship(
        "Order",
        back_populates="customer",
    )