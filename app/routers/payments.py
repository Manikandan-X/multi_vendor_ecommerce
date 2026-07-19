from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.roles import (
    require_admin,
    require_customer,
)
from app.schemas.payment import (
    PaymentCreate,
    PaymentResponse,
    PaymentUpdate,
)
from app.services.payment_service import PaymentService

router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)

payment_service = PaymentService()


@router.post(
    "/orders/{order_id}",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_payment(
    order_id: UUID,
    request: PaymentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_customer),
):
    return payment_service.create_payment(
        db=db,
        current_user=current_user,
        order_id=order_id,
        request=request,
    )


@router.put(
    "/{payment_id}",
    response_model=PaymentResponse,
)
def process_payment(
    payment_id: UUID,
    request: PaymentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_customer),
):
    return payment_service.process_payment(
        db=db,
        current_user=current_user,
        payment_id=payment_id,
        request=request,
    )


@router.get(
    "/my-payments",
    response_model=list[PaymentResponse],
)
def get_my_payments(
    db: Session = Depends(get_db),
    current_user=Depends(require_customer),
):
    return payment_service.get_my_payments(
        db=db,
        current_user=current_user,
    )


@router.get(
    "/{payment_id}",
    response_model=PaymentResponse,
)
def get_payment(
    payment_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_customer),
):
    return payment_service.get_payment(
        db=db,
        current_user=current_user,
        payment_id=payment_id,
    )


@router.get(
    "",
    response_model=list[PaymentResponse],
)
def get_all_payments(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    return payment_service.get_all_payments(
        db=db,
    )