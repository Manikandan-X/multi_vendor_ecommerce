from collections import defaultdict
from decimal import Decimal
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.order import OrderStatusUpdate
from app.models.cart import Cart
from app.models.user import User
from app.repositories.cart_repository import CartRepository
from app.repositories.order_item_repository import OrderItemRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.vendor_repository import VendorRepository
from app.constants.enums import OrderStatus, PaymentStatus
from app.models.order import Order
from app.models.cart_item import CartItem
from app.models.order_item import OrderItem
from app.constants.enums import UserRole

class OrderService:

    def __init__(self):
        self.cart_repository = CartRepository()
        self.product_repository = ProductRepository()
        self.order_repository = OrderRepository()
        self.order_item_repository = OrderItemRepository()
        self.vendor_repository = VendorRepository()

    def checkout(
        self,
        db: Session,
        current_user: User,
    ):
        """
        Checkout flow:

        1. Validate cart
        2. Group items by vendor
        3. Create vendor orders
        4. Create order items
        5. Reduce stock
        6. Clear cart
        7. Commit transaction
        """

        cart = self._validate_cart(
            db,
            current_user,
        )

        grouped_items = self._group_items_by_vendor(
            cart,
        )

        created_orders = []

        for vendor_id, cart_items in grouped_items.items():

            order = self._create_vendor_order(
                db=db,
                customer=current_user,
                vendor_id=vendor_id,
                cart_items=cart_items,
            )

            self._create_order_items(
                db=db,
                order=order,
                cart_items=cart_items,
            )

            self._reduce_stock(
                cart_items,
            )

            created_orders.append(order)

        self._clear_cart(
            db,
            cart,
        )

        db.commit()

        return created_orders

    def _validate_cart(
        self,
        db: Session,
        current_user: User,
    ) -> Cart:

        cart = self.cart_repository.get_by_customer_id(
            db,
            current_user.id,
        )

        if cart is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart not found.",
            )

        if not cart.cart_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty.",
            )

        for item in cart.cart_items:

            if not item.product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"{item.product.name} is unavailable.",
                )

            if item.quantity > item.product.stock:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for {item.product.name}.",
                )

        return cart
    
    def _group_items_by_vendor(
        self,
        cart: Cart,
    ):

        grouped_items = defaultdict(list)

        for item in cart.cart_items:

            vendor_id = item.product.vendor_id

            grouped_items[vendor_id].append(item)

        return grouped_items
    
    def _create_vendor_order(
        self,
        db: Session,
        customer: User,
        vendor_id: UUID,
        cart_items: list,
    ) -> Order:

        total_amount = Decimal("0.00")

        for item in cart_items:

            total_amount += item.product.price * item.quantity

        order = Order(
            customer_id=customer.id,
            vendor_id=vendor_id,
            status=OrderStatus.PENDING,
            payment_status=PaymentStatus.PENDING,
            total_amount=total_amount,
        )

        self.order_repository.create(
            db,
            order,
        )

        return order
    
    def _create_order_items(
        self,
        db: Session,
        order: Order,
        cart_items: list[CartItem],
    ) -> None:

        for item in cart_items:

            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product.id,
                quantity=item.quantity,
                price=item.product.price,
                subtotal=item.product.price * item.quantity,
            )

            self.order_item_repository.create(
                db,
                order_item,
            )
            
    def _reduce_stock(
        self,
        cart_items: list[CartItem],
    ) -> None:

        for item in cart_items:

            item.product.stock -= item.quantity
            
    def _clear_cart(
        self,
        db: Session,
        cart: Cart,
    ) -> None:

        self.cart_repository.clear_cart(
            db,
            cart,
        )
            
    def get_customer_orders(
        self,
        db: Session,
        current_user: User,
    ) -> list[Order]:

        return list(
            self.order_repository.get_customer_orders(
                db,
                current_user.id,
            )
        )


    def get_vendor_orders(
        self,
        db: Session,
        current_user: User,
    ) -> list[Order]:

        if current_user.vendor is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor profile not found.",
            )

        return list(
            self.order_repository.get_vendor_orders(
                db,
                current_user.vendor.id,
            )
        )


    def get_order(
        self,
        db: Session,
        order_id: UUID,
        current_user: User,
    ) -> Order:

        order = self.order_repository.get_by_id(
            db,
            order_id,
        )

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found.",
            )

        if current_user.role == UserRole.ADMIN:
            return order

        if (
            current_user.role == UserRole.CUSTOMER
            and order.customer_id == current_user.id
        ):
            return order

        if (
            current_user.role == UserRole.VENDOR
            and current_user.vendor
            and order.vendor_id == current_user.vendor.id
        ):
            return order

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this order.",
        )    
        
    def get_all_orders(
        self,
        db: Session,
    ) -> list[Order]:

        return list(
            self.order_repository.get_all_orders(
                db,
            )
        )
        
    def update_order_status(
        self,
        db: Session,
        current_user: User,
        order_id: UUID,
        request: OrderStatusUpdate,
    ) -> Order:

        order = self.order_repository.get_by_id(
            db,
            order_id,
        )

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found.",
            )

        vendor = self.vendor_repository.get_by_user_id(
            db,
            current_user.id,
        )

        if vendor is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor not found.",
            )

        if order.vendor_id != vendor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied.",
            )

        allowed_transitions = {
            OrderStatus.PENDING: [OrderStatus.PAID],
            OrderStatus.PAID: [OrderStatus.PROCESSING],
            OrderStatus.PROCESSING: [OrderStatus.SHIPPED],
            OrderStatus.SHIPPED: [OrderStatus.DELIVERED],
            OrderStatus.DELIVERED: [],
            OrderStatus.CANCELLED: [],
        }

        if request.status not in allowed_transitions[order.status]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot change order status from {order.status.value} to {request.status.value}.",
            )

        order.status = request.status

        db.commit()
        db.refresh(order)

        return order
    
    def cancel_order(
        self,
        db: Session,
        current_user: User,
        order_id: UUID,
    ) -> Order:

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

        if order.status not in [
            OrderStatus.PENDING,
            OrderStatus.PAID,
        ]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order cannot be cancelled.",
            )

        order.status = OrderStatus.CANCELLED

        db.commit()
        db.refresh(order)

        return order