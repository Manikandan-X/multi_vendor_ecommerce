from uuid import UUID

from fastapi import APIRouter, Depends, status, File, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.roles import require_vendor
from app.models.user import User
from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)
from app.services.product_service import ProductService

router = APIRouter(
    prefix="/products",
    tags=["Products"],
)

product_service = ProductService()


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    request: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vendor),
):
    return product_service.create_product(
        db=db,
        current_user=current_user,
        request=request,
    )


@router.get(
    "",
    response_model=list[ProductResponse],
)
def get_all_products(
    db: Session = Depends(get_db),
):
    return product_service.get_all_products(
        db=db,
    )


@router.get(
    "/me",
    response_model=list[ProductResponse],
)
def get_my_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vendor),
):
    return product_service.get_my_products(
        db=db,
        current_user=current_user,
    )


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
def get_product(
    product_id: UUID,
    db: Session = Depends(get_db),
):
    return product_service.get_product(
        db=db,
        product_id=product_id,
    )


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
)
def update_product(
    product_id: UUID,
    request: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vendor),
):
    return product_service.update_product(
        db=db,
        current_user=current_user,
        product_id=product_id,
        request=request,
    )
    
@router.post(
    "/{product_id}/image",
    response_model=ProductResponse,
)
def upload_product_image(
    product_id: UUID,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_vendor),
):
    return product_service.upload_product_image(
        db=db,
        product_id=product_id,
        image=image,
    )


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vendor),
):
    product_service.delete_product(
        db=db,
        current_user=current_user,
        product_id=product_id,
    )

    return None