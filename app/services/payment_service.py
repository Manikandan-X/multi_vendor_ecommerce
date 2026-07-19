from uuid import UUID
import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.constants.enums import PaymentStatus
from app.models.payment import Payment
from app.models.user import User
from app.repositories.order_repository import OrderRepository
from app.repositories.payment_repository import PaymentRepository
from app.schemas.payment import (
    PaymentCreate,
    PaymentResponse,
    PaymentUpdate,
)


class PaymentService:

    def __init__(self):
        self.payment_repository = PaymentRepository()
        self.order_repository = OrderRepository()

    def create_payment(
        self,
        db: Session,
        current_user: User,
        order_id: UUID,
        request: PaymentCreate,
    ) -> Payment:

        order = self.order_repository.get_by_id(
            db,
            order_id,
        )

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found.",
            )

        if order.customer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied.",
            )

        existing_payment = self.payment_repository.get_by_order_id(
            db,
            order_id,
        )

        if existing_payment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment already exists for this order.",
            )

        payment = Payment(
            order_id=order.id,
            amount=order.total_amount,
            payment_method=request.payment_method,
            status=PaymentStatus.PENDING.value,
        )

        self.payment_repository.create(
            db,
            payment,
        )

        db.commit()
        db.refresh(payment)

        return payment
    
    def process_payment(
        self,
        db: Session,
        current_user: User,
        payment_id: UUID,
        request: PaymentUpdate,
    ) -> Payment:

        payment = self.payment_repository.get_by_id(
            db,
            payment_id,
        )

        if payment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found.",
            )

        order = payment.order

        if order.customer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied.",
            )

        payment.status = request.status.value

        if request.transaction_id:
            payment.transaction_id = request.transaction_id
        else:
            payment.transaction_id = str(uuid.uuid4())

        order.payment_status = request.status

        db.commit()

        db.refresh(payment)

        return payment
    
    def get_payment(
        self,
        db: Session,
        current_user: User,
        payment_id: UUID,
    ) -> Payment:

        payment = self.payment_repository.get_by_id(
            db,
            payment_id,
        )

        if payment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found.",
            )

        if payment.order.customer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied.",
            )

        return payment

    def get_my_payments(
        self,
        db: Session,
        current_user: User,
    ) -> list[Payment]:

        return self.payment_repository.get_customer_payments(
            db,
            current_user.id,
        )

    def get_all_payments(
        self,
        db: Session,
    ) -> list[Payment]:

        return self.payment_repository.get_all_payments(
            db,
        )