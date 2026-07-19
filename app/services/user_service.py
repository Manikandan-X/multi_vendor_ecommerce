from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
)


class UserService:

    def __init__(self):
        self.user_repository = UserRepository()

    def create_user(
        self,
        db: Session,
        request: UserCreate,
    ) -> User:

        existing_user = self.user_repository.get_by_email(
            db,
            request.email,
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered.",
            )

        user = User(
            full_name=request.full_name,
            email=request.email,
            password_hash=hash_password(
                request.password,
            ),
            role=request.role,
        )

        self.user_repository.create(
            db,
            user,
        )

        db.commit()
        db.refresh(user)

        return user

    def get_all_users(
        self,
        db: Session,
    ) -> list[User]:

        return self.user_repository.get_all(db)

    def get_user(
        self,
        db: Session,
        user_id: UUID,
    ) -> User:

        user = self.user_repository.get_by_id(
            db,
            user_id,
        )

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        return user

    def update_user(
        self,
        db: Session,
        user_id: UUID,
        request: UserUpdate,
    ) -> User:

        user = self.user_repository.get_by_id(
            db,
            user_id,
        )

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        if (
            request.email
            and request.email != user.email
        ):
            existing_user = self.user_repository.get_by_email(
                db,
                request.email,
            )

            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered.",
                )

            user.email = request.email

        if request.full_name is not None:
            user.full_name = request.full_name

        if request.role is not None:
            user.role = request.role

        db.commit()
        db.refresh(user)

        return user

    def delete_user(
        self,
        db: Session,
        user_id: UUID,
    ) -> None:

        user = self.user_repository.get_by_id(
            db,
            user_id,
        )

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        self.user_repository.delete(
            db,
            user,
        )

        db.commit()