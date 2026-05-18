from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: UUID
    full_name: str
    email: str
    role: str
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    center_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class CurrentUserResponse(BaseModel):
    user: UserResponse
    access_token: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class RefreshTokenRequest(BaseModel):
    refresh_token: str
