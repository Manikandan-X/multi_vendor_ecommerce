from app.models.order_item import OrderItem
from app.repositories.base_repository import BaseRepository


class OrderItemRepository(BaseRepository[OrderItem]):

    def __init__(self):
        super().__init__(OrderItem)