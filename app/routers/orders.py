from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.roles import (
    require_customer,
    require_vendor, require_admin,
)
from app.schemas.order import OrderResponse
from app.services.order_service import OrderService
from app.schemas.order import OrderStatusUpdate

router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)

order_service = OrderService()


@router.post(
    "/checkout",
    response_model=list[OrderResponse],
    status_code=status.HTTP_201_CREATED,
)
def checkout(
    db: Session = Depends(get_db),
    current_user=Depends(require_customer),
):
    return order_service.checkout(
        db=db,
        current_user=current_user,
    )


@router.get(
    "/my-orders",
    response_model=list[OrderResponse],
)
def get_my_orders(
    db: Session = Depends(get_db),
    current_user=Depends(require_customer),
):
    return order_service.get_customer_orders(
        db=db,
        current_user=current_user,
    )


@router.get(
    "/vendor-orders",
    response_model=list[OrderResponse],
)
def get_vendor_orders(
    db: Session = Depends(get_db),
    current_user=Depends(require_vendor),
):
    return order_service.get_vendor_orders(
        db=db,
        current_user=current_user,
    )
    
@router.get(
    "",
    response_model=list[OrderResponse],
)
def get_all_orders(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    return order_service.get_all_orders(
        db=db,
    )


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
)
def get_order(
    order_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return order_service.get_order(
        db=db,
        order_id=order_id,
        current_user=current_user,
    )
    
@router.put(
    "/{order_id}/status",
    response_model=OrderResponse,
)
def update_order_status(
    order_id: UUID,
    request: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_vendor),
):
    return order_service.update_order_status(
        db=db,
        current_user=current_user,
        order_id=order_id,
        request=request,
    )
    
@router.put(
    "/{order_id}/cancel",
    response_model=OrderResponse,
)
def cancel_order(
    order_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_customer),
):
    return order_service.cancel_order(
        db=db,
        current_user=current_user,
        order_id=order_id,
    )