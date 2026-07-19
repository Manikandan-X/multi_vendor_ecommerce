from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.payment import Payment
from app.repositories.base_repository import BaseRepository


class PaymentRepository(BaseRepository[Payment]):

    def __init__(self):
        super().__init__(Payment)

    def get_by_order_id(
        self,
        db: Session,
        order_id: UUID,
    ) -> Payment | None:

        statement = (
            select(Payment)
            .where(Payment.order_id == order_id)
            .options(
                joinedload(Payment.order)
            )
        )

        result = db.execute(statement)

        return result.scalar_one_or_none()

    def get_by_transaction_id(
        self,
        db: Session,
        transaction_id: str,
    ) -> Payment | None:

        statement = select(Payment).where(
            Payment.transaction_id == transaction_id
        )

        result = db.execute(statement)

        return result.scalar_one_or_none()

    def get_customer_payments(
        self,
        db: Session,
        customer_id: UUID,
    ) -> list[Payment]:

        statement = (
            select(Payment)
            .join(Payment.order)
            .where(Payment.order.has(customer_id=customer_id))
            .options(
                joinedload(Payment.order)
            )
        )

        result = db.execute(statement)

        return list(result.scalars().all())

    def get_all_payments(
        self,
        db: Session,
    ) -> list[Payment]:

        statement = (
            select(Payment)
            .options(
                joinedload(Payment.order)
            )
        )

        result = db.execute(statement)

        return list(result.scalars().all())