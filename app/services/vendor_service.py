from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.vendor import Vendor
from app.repositories.vendor_repository import VendorRepository
from app.schemas.vendor import VendorCreate, VendorUpdate


class VendorService:

    def __init__(self):
        self.vendor_repository = VendorRepository()

    def create_vendor(
        self,
        db: Session,
        current_user: User,
        request: VendorCreate,
    ) -> Vendor:

        existing_vendor = self.vendor_repository.get_by_user_id(
            db,
            current_user.id,
        )
        if existing_vendor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vendor profile already exists.",
            )

        existing_store = self.vendor_repository.get_by_store_name(
            db,
            request.store_name,
        )

        if existing_store:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Store name already exists.",
            )

        vendor = Vendor(
            user_id=current_user.id,
            store_name=request.store_name,
            store_description=request.store_description,
        )

        self.vendor_repository.create(
            db,
            vendor,
        )

        db.commit()
        db.refresh(vendor)

        return vendor

    def get_my_vendor(
        self,
        db: Session,
        current_user: User,
    ) -> Vendor:

        vendor = self.vendor_repository.get_by_user_id(
            db,
            current_user.id,
        )

        if vendor is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor profile not found.",
            )

        return vendor

    def update_vendor(
        self,
        db: Session,
        current_user: User,
        request: VendorUpdate,
    ) -> Vendor:

        vendor = self.get_my_vendor(
            db,
            current_user,
        )

        if (
            request.store_name
            and request.store_name != vendor.store_name
        ):
            existing_store = self.vendor_repository.get_by_store_name(
                db,
                request.store_name,
            )

            if existing_store:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Store name already exists.",
                )

            vendor.store_name = request.store_name

        if request.store_description is not None:
            vendor.store_description = request.store_description

        db.commit()
        db.refresh(vendor)

        return vendor

    def get_all_vendors(
        self,
        db: Session,
    ) -> list[Vendor]:

        return self.vendor_repository.get_all(db)

    def approve_vendor(
        self,
        db: Session,
        vendor_id,
    ) -> Vendor:

        vendor = self.vendor_repository.get_by_id(
            db,
            vendor_id,
        )

        if vendor is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor not found.",
            )

        vendor.is_approved = True

        db.commit()
        db.refresh(vendor)

        return vendor