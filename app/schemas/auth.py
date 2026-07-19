from pydantic import BaseModel, EmailStr, Field

from app.constants.enums import UserRole
from uuid import UUID

class RegisterRequest(BaseModel):
    full_name: str = Field(
        min_length=3,
        max_length=150
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=100
    )

    role: UserRole
    
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    
class TokenPayload(BaseModel):
    sub: UUID