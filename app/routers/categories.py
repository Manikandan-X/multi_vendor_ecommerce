from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.roles import require_admin
from app.schemas.category import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
)
from app.services.category_service import CategoryService

router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
)

category_service = CategoryService()


@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    request: CategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    return category_service.create_category(
        db=db,
        request=request,
    )


@router.get(
    "",
    response_model=list[CategoryResponse],
)
def get_all_categories(
    db: Session = Depends(get_db),
):
    return category_service.get_all_categories(db)


@router.get(
    "/{category_id}",
    response_model=CategoryResponse,
)
def get_category(
    category_id: UUID,
    db: Session = Depends(get_db),
):
    return category_service.get_category(
        db=db,
        category_id=category_id,
    )


@router.put(
    "/{category_id}",
    response_model=CategoryResponse,
)
def update_category(
    category_id: UUID,
    request: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    return category_service.update_category(
        db=db,
        category_id=category_id,
        request=request,
    )


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    category_service.delete_category(
        db=db,
        category_id=category_id,
    )

    return None