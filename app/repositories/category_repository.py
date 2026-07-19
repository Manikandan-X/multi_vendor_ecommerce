from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.repositories.base_repository import BaseRepository


class CategoryRepository(BaseRepository[Category]):

    def __init__(self):
        super().__init__(Category)

    def get_by_name(
        self,
        db: Session,
        name: str,
    ) -> Category | None:

        statement = select(Category).where(
            Category.name == name
        )

        result = db.execute(statement)

        return result.scalar_one_or_none()