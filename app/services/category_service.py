from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.category import Category
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
)


class CategoryService:

    def __init__(self):
        self.category_repository = CategoryRepository()

    def create_category(
        self,
        db: Session,
        request: CategoryCreate,
    ) -> Category:

        existing = self.category_repository.get_by_name(
            db,
            request.name,
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category already exists.",
            )

        category = Category(
            name=request.name,
            description=request.description,
        )

        self.category_repository.create(db, category)

        db.commit()
        db.refresh(category)

        return category

    def get_all_categories(
        self,
        db: Session,
    ) -> list[Category]:

        return self.category_repository.get_all(db)

    def get_category(
        self,
        db: Session,
        category_id: UUID,
    ) -> Category:

        category = self.category_repository.get_by_id(
            db,
            category_id,
        )

        if category is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found.",
            )

        return category

    def update_category(
        self,
        db: Session,
        category_id: UUID,
        request: CategoryUpdate,
    ) -> Category:

        category = self.get_category(
            db,
            category_id,
        )

        if request.name and request.name != category.name:
            existing = self.category_repository.get_by_name(
                db,
                request.name,
            )

            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Category already exists.",
                )

            category.name = request.name

        if request.description is not None:
            category.description = request.description

        db.commit()
        db.refresh(category)

        return category

    def delete_category(
        self,
        db: Session,
        category_id: UUID,
    ) -> None:

        category = self.get_category(
            db,
            category_id,
        )

        self.category_repository.delete(
            db,
            category,
        )

        db.commit()