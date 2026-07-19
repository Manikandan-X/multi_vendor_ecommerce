from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.user import User
from app.repositories.cart_repository import CartRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.cart import (
    CartItemCreate,
    CartItemResponse,
    CartItemUpdate,
    CartResponse,
)
from app.repositories.cart_item_repository import CartItemRepository

class CartService:

    def __init__(self):
        self.cart_repository = CartRepository()
        self.cart_item_repository = CartItemRepository()
        self.product_repository = ProductRepository()

    def add_to_cart(
        self,
        db: Session,
        current_user: User,
        request: CartItemCreate,
    ) -> CartResponse:

        product = self.product_repository.get_by_id(
            db,
            request.product_id,
        )

        if product is None or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )

        if request.quantity > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock.",
            )

        cart = self.cart_repository.get_by_customer_id(
            db,
            current_user.id,
        )

        if cart is None:
            cart = Cart(
                customer_id=current_user.id,
            )

            self.cart_repository.create(
                db,
                cart,
            )

            db.refresh(cart)

        cart_item = self.cart_repository.get_cart_item(
            db,
            cart.id,
            product.id,
        )

        if cart_item:

            new_quantity = cart_item.quantity + request.quantity

            if new_quantity > product.stock:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Insufficient stock.",
                )

            cart_item.quantity = new_quantity

        else:

            cart_item = CartItem(
                cart_id=cart.id,
                product_id=product.id,
                quantity=request.quantity,
            )

            self.cart_item_repository.create(
                db,
                cart_item,
            )

        db.commit()

        return self.get_cart(
            db,
            current_user,
        )

    def get_cart(
        self,
        db: Session,
        current_user: User,
    ) -> CartResponse:

        cart = self.cart_repository.get_by_customer_id(
            db,
            current_user.id,
        )

        if cart is None:

            cart = Cart(
                customer_id=current_user.id,
            )

            self.cart_repository.create(
                db,
                cart,
            )

            db.commit()
            db.refresh(cart)

        items = []
        total_amount = Decimal("0.00")

        for item in cart.cart_items:

            subtotal = item.product.price * item.quantity

            total_amount += subtotal

            items.append(
                CartItemResponse(
                    id=item.id,
                    product_id=item.product.id,
                    product_name=item.product.name,
                    quantity=item.quantity,
                    price=item.product.price,
                    subtotal=subtotal,
                )
            )

        return CartResponse(
            id=cart.id,
            customer_id=cart.customer_id,
            items=items,
            total_amount=total_amount,
            created_at=cart.created_at,
            updated_at=cart.updated_at,
        )

    def update_cart_item(
        self,
        db: Session,
        current_user: User,
        item_id: UUID,
        request: CartItemUpdate,
    ) -> CartResponse:

        cart = self.cart_repository.get_by_customer_id(
            db,
            current_user.id,
        )

        if cart is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart not found.",
            )

        item = self.cart_repository.get_cart_item_by_id(
            db,
            item_id,
        )

        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found.",
            )

        if item.cart_id != cart.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied.",
            )

        if request.quantity > item.product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock.",
            )

        item.quantity = request.quantity

        db.commit()

        return self.get_cart(
            db,
            current_user,
        )

    def remove_cart_item(
        self,
        db: Session,
        current_user: User,
        item_id: UUID,
    ) -> CartResponse:

        cart = self.cart_repository.get_by_customer_id(
            db,
            current_user.id,
        )

        if cart is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart not found.",
            )

        item = self.cart_repository.get_cart_item_by_id(
            db,
            item_id,
        )

        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found.",
            )

        if item.cart_id != cart.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied.",
            )

        self.cart_item_repository.delete(
            db,
            item,
        )

        db.commit()

        return self.get_cart(
            db,
            current_user,
        )

    def clear_cart(
        self,
        db: Session,
        current_user: User,
    ) -> None:

        cart = self.cart_repository.get_by_customer_id(
            db,
            current_user.id,
        )

        if cart is None:
            return

        self.cart_repository.clear_cart(
            db,
            cart,
        )

        db.commit()