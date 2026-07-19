from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.order import Order
from app.models.order_item import OrderItem
from app.repositories.base_repository import BaseRepository


class OrderRepository(BaseRepository[Order]):

    def __init__(self):
        super().__init__(Order)

    def get_by_id(
        self,
        db: Session,
        obj_id: UUID,
    ) -> Order | None:

        statement = (
            select(Order)
            .where(Order.id == obj_id)
            .options(
                joinedload(Order.order_items)
                .joinedload(OrderItem.product)
            )
        )

        result = db.execute(statement)

        return result.unique().scalar_one_or_none()

    def get_customer_orders(
        self,
        db: Session,
        customer_id: UUID,
    ) -> Sequence[Order]:

        statement = (
            select(Order)
            .where(Order.customer_id == customer_id)
            .options(
                joinedload(Order.order_items)
                .joinedload(OrderItem.product)
            )
            .order_by(Order.created_at.desc())
        )

        result = db.execute(statement)

        return result.unique().scalars().all()

    def get_vendor_orders(
        self,
        db: Session,
        vendor_id: UUID,
    ) -> Sequence[Order]:

        statement = (
            select(Order)
            .where(Order.vendor_id == vendor_id)
            .options(
                joinedload(Order.order_items)
                .joinedload(OrderItem.product)
            )
            .order_by(Order.created_at.desc())
        )

        result = db.execute(statement)

        return result.unique().scalars().all()

    def get_all_orders(
        self,
        db: Session,
    ) -> Sequence[Order]:

        statement = (
            select(Order)
            .options(
                joinedload(Order.order_items)
                .joinedload(OrderItem.product)
            )
            .order_by(Order.created_at.desc())
        )

        result = db.execute(statement)

        return result.unique().scalars().all()