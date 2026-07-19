from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.roles import require_admin, require_vendor
from app.models.user import User
from app.schemas.vendor import (
    VendorCreate,
    VendorResponse,
    VendorUpdate,
)
from app.services.vendor_service import VendorService

router = APIRouter(
    prefix="/vendors",
    tags=["Vendors"],
)

vendor_service = VendorService()


@router.post(
    "",
    response_model=VendorResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_vendor(
    request: VendorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vendor),
):
    return vendor_service.create_vendor(
        db=db,
        current_user=current_user,
        request=request,
    )


@router.get(
    "/me",
    response_model=VendorResponse,
)
def get_my_vendor(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vendor),
):
    return vendor_service.get_my_vendor(
        db=db,
        current_user=current_user,
    )


@router.put(
    "/me",
    response_model=VendorResponse,
)
def update_my_vendor(
    request: VendorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vendor),
):
    return vendor_service.update_vendor(
        db=db,
        current_user=current_user,
        request=request,
    )


@router.get(
    "",
    response_model=list[VendorResponse],
)
def get_all_vendors(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return vendor_service.get_all_vendors(
        db=db,
    )


@router.patch(
    "/{vendor_id}/approve",
    response_model=VendorResponse,
)
def approve_vendor(
    vendor_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return vendor_service.approve_vendor(
        db=db,
        vendor_id=vendor_id,
    )