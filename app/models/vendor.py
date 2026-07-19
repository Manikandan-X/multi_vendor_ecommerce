from typing import TYPE_CHECKING
from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base import Base
from app.models.audit_mixin import AuditMixin
import uuid

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.product import Product
    from app.models.order import Order

class Vendor(Base, AuditMixin):
    __tablename__ = "vendors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    store_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        unique=True,
    )

    store_description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    is_approved: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="vendor",
    )
    
    products: Mapped[list["Product"]] = relationship(
        "Product",
        back_populates="vendor",
        cascade="all, delete-orphan",
    )
    
    orders: Mapped[list["Order"]] = relationship(
        "Order",
        back_populates="vendor",
    )