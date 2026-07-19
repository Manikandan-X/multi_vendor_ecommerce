from app.models.cart_item import CartItem
from app.repositories.base_repository import BaseRepository


class CartItemRepository(BaseRepository[CartItem]):

    def __init__(self):
        super().__init__(CartItem)