from uuid import UUID
import os
import uuid

from fastapi import UploadFile, File

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.user import User
from app.repositories.category_repository import CategoryRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.vendor_repository import VendorRepository
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    
    UPLOAD_DIR = "uploads/products"

    def __init__(self):
        self.product_repository = ProductRepository()
        self.vendor_repository = VendorRepository()
        self.category_repository = CategoryRepository()

    def create_product(
        self,
        db: Session,
        current_user: User,
        request: ProductCreate,
    ) -> Product:

        vendor = self.vendor_repository.get_by_user_id(
            db,
            current_user.id,
        )

        if vendor is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor profile not found.",
            )

        if not vendor.is_approved:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vendor is not approved.",
            )

        category = self.category_repository.get_by_id(
            db,
            request.category_id,
        )

        if category is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found.",
            )

        product = Product(
            vendor_id=vendor.id,
            category_id=request.category_id,
            name=request.name,
            description=request.description,
            price=request.price,
            stock=request.stock,
        )

        self.product_repository.create(
            db,
            product,
        )

        db.commit()
        db.refresh(product)

        return product

    def get_my_products(
        self,
        db: Session,
        current_user: User,
    ) -> list[Product]:

        vendor = self.vendor_repository.get_by_user_id(
            db,
            current_user.id,
        )

        if vendor is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor profile not found.",
            )

        return self.product_repository.get_by_vendor(
            db,
            vendor.id,
        )

    def get_all_products(
        self,
        db: Session,
    ) -> list[Product]:

        return self.product_repository.get_active_products(
            db,
        )

    def get_product(
        self,
        db: Session,
        product_id: UUID,
    ) -> Product:

        product = self.product_repository.get_by_id(
            db,
            product_id,
        )

        if product is None or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )

        return product

    def update_product(
        self,
        db: Session,
        current_user: User,
        product_id: UUID,
        request: ProductUpdate,
    ) -> Product:

        vendor = self.vendor_repository.get_by_user_id(
            db,
            current_user.id,
        )

        if vendor is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor profile not found.",
            )

        product = self.get_product(
            db,
            product_id,
        )

        if product.vendor_id != vendor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can update only your own products.",
            )

        if request.category_id:

            category = self.category_repository.get_by_id(
                db,
                request.category_id,
            )

            if category is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Category not found.",
                )

            product.category_id = request.category_id

        if request.name is not None:
            product.name = request.name

        if request.description is not None:
            product.description = request.description

        if request.price is not None:
            product.price = request.price

        if request.stock is not None:
            product.stock = request.stock

        if request.is_active is not None:
            product.is_active = request.is_active

        db.commit()
        db.refresh(product)

        return product

    def delete_product(
        self,
        db: Session,
        current_user: User,
        product_id: UUID,
    ) -> None:

        vendor = self.vendor_repository.get_by_user_id(
            db,
            current_user.id,
        )

        if vendor is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor profile not found.",
            )

        product = self.get_product(
            db,
            product_id,
        )

        if product.vendor_id != vendor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can delete only your own products.",
            )

        product.is_active = False

        db.commit()
        
    def upload_product_image(
        self,
        db: Session,
        product_id: UUID,
        image: UploadFile,
    ):

        product = self.product_repository.get_by_id(
            db,
            product_id,
        )

        if product is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )

        if image.content_type not in [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp",
        ]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only image files are allowed.",
            )

        os.makedirs(
            self.UPLOAD_DIR,
            exist_ok=True,
        )

        if image.filename is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid filename.",
            )

        _, extension = os.path.splitext(image.filename)

        filename = f"{uuid.uuid4()}{extension}"

        filepath = os.path.join(
            self.UPLOAD_DIR,
            filename,
        )

        with open(filepath, "wb") as buffer:
            buffer.write(image.file.read())

        product.image_url = filepath.replace("\\", "/")

        db.commit()

        db.refresh(product)

        return product