from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.vendor import Vendor
from app.repositories.base_repository import BaseRepository


class VendorRepository(BaseRepository[Vendor]):

    def __init__(self):
        super().__init__(Vendor)

    def get_by_user_id(
        self,
        db: Session,
        user_id: UUID,
    ) -> Vendor | None:

        statement = (
            select(Vendor)
            .where(Vendor.user_id == user_id)
        )

        result = db.execute(statement)

        return result.scalar_one_or_none()

    def get_by_store_name(
        self,
        db: Session,
        store_name: str,
    ) -> Vendor | None:

        statement = (
            select(Vendor)
            .where(Vendor.store_name == store_name)
        )

        result = db.execute(statement)

        return result.scalar_one_or_none()