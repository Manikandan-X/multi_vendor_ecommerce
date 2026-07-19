from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.roles import require_customer
from app.models.user import User
from app.schemas.cart import (
    CartItemCreate,
    CartItemUpdate,
    CartResponse,
)
from app.services.cart_service import CartService

router = APIRouter(
    prefix="/cart",
    tags=["Shopping Cart"],
)

cart_service = CartService()


@router.post(
    "/items",
    response_model=CartResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_to_cart(
    request: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer),
):
    return cart_service.add_to_cart(
        db=db,
        current_user=current_user,
        request=request,
    )


@router.get(
    "",
    response_model=CartResponse,
)
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer),
):
    return cart_service.get_cart(
        db=db,
        current_user=current_user,
    )


@router.put(
    "/items/{item_id}",
    response_model=CartResponse,
)
def update_cart_item(
    item_id: UUID,
    request: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer),
):
    return cart_service.update_cart_item(
        db=db,
        current_user=current_user,
        item_id=item_id,
        request=request,
    )


@router.delete(
    "/items/{item_id}",
    response_model=CartResponse,
)
def remove_cart_item(
    item_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer),
):
    return cart_service.remove_cart_item(
        db=db,
        current_user=current_user,
        item_id=item_id,
    )


@router.delete(
    "/clear",
    status_code=status.HTTP_204_NO_CONTENT,
)
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer),
):
    cart_service.clear_cart(
        db=db,
        current_user=current_user,
    )

    return None