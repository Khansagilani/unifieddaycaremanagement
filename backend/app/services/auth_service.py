from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import timedelta
import secrets
import string

from app.models.user import User, UserRole
from app.models.base import Center
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.schemas.auth import UserResponse
from app.core.config import settings

class AuthService:
    @staticmethod
    def create_user(db: Session, email: str, password: str, full_name: str, role: UserRole, center_id: str, phone: str = None) -> User:
        """Create a new user"""
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        new_user = User(
            email=email,
            full_name=full_name,
            password_hash=hash_password(password),
            role=role,
            center_id=center_id,
            phone=phone
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        """Authenticate user and return user object"""
        user = db.query(User).filter(User.email == email, User.is_active == True).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        if not verify_password(password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        return user

    @staticmethod
    def generate_tokens(user: User) -> dict:
        """Generate access and refresh tokens"""
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id), "role": user.role.value, "center_id": str(user.center_id)},
            expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(
            data={"sub": str(user.id), "role": user.role.value, "center_id": str(user.center_id)}
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }

    @staticmethod
    def verify_refresh_token(token: str) -> dict:
        """Verify refresh token and return payload"""
        payload = decode_token(token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        return payload

    @staticmethod
    def generate_reset_token(db: Session, email: str) -> str:
        """Generate password reset token"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        
        return reset_token

    @staticmethod
    def reset_password(db: Session, token: str, new_password: str) -> User:
        """Reset password using reset token"""
        from datetime import datetime, timezone
        
        user = db.query(User).filter(User.reset_token == token).first()
        if not user:
            raise HTTPException(status_code=400, detail="Invalid reset token")
        
        if user.reset_token_expiry < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Reset token has expired")
        
        user.password_hash = hash_password(new_password)
        user.reset_token = None
        user.reset_token_expiry = None
        db.commit()
        db.refresh(user)
        
        return user

    @staticmethod
    def change_password(db: Session, user: User, old_password: str, new_password: str) -> User:
        """Change user's password"""
        if not verify_password(old_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        user.password_hash = hash_password(new_password)
        db.commit()
        db.refresh(user)
        
        return user

    @staticmethod
    def user_to_response(user: User) -> UserResponse:
        """Convert user model to response"""
        return UserResponse(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            role=user.role.value,
            phone=user.phone,
            photo_url=user.photo_url,
            center_id=user.center_id,
            created_at=user.created_at
        )

from datetime import datetime
