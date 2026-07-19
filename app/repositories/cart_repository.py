from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.repositories.base_repository import BaseRepository


class CartRepository(BaseRepository[Cart]):

    def __init__(self):
        super().__init__(Cart)

    def get_by_customer_id(
        self,
        db: Session,
        customer_id: UUID,
    ) -> Cart | None:

        statement = (
            select(Cart)
            .where(Cart.customer_id == customer_id)
            .options(
                joinedload(Cart.cart_items)
                .joinedload(CartItem.product)
            )
        )

        result = db.execute(statement)

        return result.unique().scalar_one_or_none()

    def get_cart_item(
        self,
        db: Session,
        cart_id: UUID,
        product_id: UUID,
    ) -> CartItem | None:

        statement = (
            select(CartItem)
            .where(CartItem.cart_id == cart_id)
            .where(CartItem.product_id == product_id)
        )

        result = db.execute(statement)

        return result.scalar_one_or_none()

    def get_cart_item_by_id(
        self,
        db: Session,
        item_id: UUID,
    ) -> CartItem | None:

        statement = (
            select(CartItem)
            .where(CartItem.id == item_id)
        )

        result = db.execute(statement)

        return result.scalar_one_or_none()

    def clear_cart(
        self,
        db: Session,
        cart: Cart,
    ) -> None:

        for item in cart.cart_items:
            db.delete(item)