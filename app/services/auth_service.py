from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    RegisterRequest,
    TokenResponse,
)

from fastapi.security import OAuth2PasswordRequestForm
from fastapi import HTTPException, status

class AuthService:

    def __init__(self):
        self.user_repository = UserRepository()

    def register(
        self,
        db: Session,
        request: RegisterRequest,
    ) -> User:

        existing_user = self.user_repository.get_by_email(
            db,
            request.email,
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        user = User(
            full_name=request.full_name,
            email=request.email,
            password_hash=hash_password(request.password),
            role=request.role,
        )

        self.user_repository.create(db, user)

        db.commit()
        db.refresh(user)

        return user

    def login(
        self,
        db: Session,
        form_data: OAuth2PasswordRequestForm,
    ) -> TokenResponse:

        user = self.user_repository.get_by_email(
            db,
            form_data.username,
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )

        if not verify_password(
            form_data.password,
            user.password_hash,
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )

        access_token = create_access_token(
            subject=user.id,
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
        )