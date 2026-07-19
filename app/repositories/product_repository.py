from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.repositories.base_repository import BaseRepository


class ProductRepository(BaseRepository[Product]):

    def __init__(self):
        super().__init__(Product)

    def get_by_vendor(
        self,
        db: Session,
        vendor_id: UUID,
    ) -> list[Product]:

        statement = (
            select(Product)
            .where(Product.vendor_id == vendor_id)
            .where(Product.is_active.is_(True))
        )

        result = db.execute(statement)

        return list(result.scalars().all())

    def get_active_products(
        self,
        db: Session,
    ) -> list[Product]:

        statement = (
            select(Product)
            .where(Product.is_active.is_(True))
        )

        result = db.execute(statement)

        return list(result.scalars().all())