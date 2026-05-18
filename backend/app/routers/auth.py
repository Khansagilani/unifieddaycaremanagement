from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User
from app.services.auth_service import AuthService
from app.schemas.auth import (
    LoginRequest, TokenResponse, CurrentUserResponse, UserResponse,
    ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest
)
from app.utils.response import success_response, error_response
from app.core.config import settings
from typing import Optional

router = APIRouter()


@router.post("/login", response_model=dict)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password"""
    try:
        user = AuthService.authenticate_user(
            db, request.email, request.password)
        tokens = AuthService.generate_tokens(user)
        user_response = AuthService.user_to_response(user)

        return success_response({
            "user": user_response,
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "token_type": tokens["token_type"],
            "expires_in": tokens["expires_in"]
        })
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/refresh", response_model=dict)
async def refresh_token(request: dict, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    refresh_token = request.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token required")

    try:
        payload = AuthService.verify_refresh_token(refresh_token)
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id,
                                     User.is_active == True).first()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        tokens = AuthService.generate_tokens(user)
        user_response = AuthService.user_to_response(user)

        return success_response({
            "user": user_response,
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "token_type": tokens["token_type"],
            "expires_in": tokens["expires_in"]
        }, message="Token refreshed successfully")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@router.post("/logout", response_model=dict)
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (invalidate tokens on client side)"""
    return success_response(None, message="Logged out successfully")


@router.get("/me", response_model=dict)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user info"""
    user_response = AuthService.user_to_response(current_user)
    return success_response(user_response, message="User info retrieved")


@router.put("/change-password", response_model=dict)
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change current user's password"""
    try:
        AuthService.change_password(
            db, current_user, request.old_password, request.new_password)
        return success_response(None, message="Password changed successfully")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/forgot-password", response_model=dict)
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Request password reset"""
    try:
        reset_token = AuthService.generate_reset_token(db, request.email)
        # In production, send email with reset link
        # For now, return token in response (development only)
        return success_response(
            {"reset_token": reset_token},
            message="Password reset email sent (development mode)"
        )
    except HTTPException as e:
        # Don't reveal if email exists or not
        return success_response(None, message="If email exists, reset link will be sent")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reset-password", response_model=dict)
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using token"""
    try:
        user = AuthService.reset_password(
            db, request.token, request.new_password)
        user_response = AuthService.user_to_response(user)
        return success_response(user_response, message="Password reset successfully")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/register", response_model=dict)
async def register(
    request: dict,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Register a new user (admin only)"""
    try:
        user = AuthService.create_user(
            db,
            email=request.get("email"),
            password=request.get("password"),
            full_name=request.get("full_name"),
            role=request.get("role", "STAFF"),
            center_id=current_user.center_id,
            phone=request.get("phone")
        )
        user_response = AuthService.user_to_response(user)
        return success_response(user_response, message="User created successfully")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users", response_model=dict)
async def list_users(
    role: Optional[str] = Query(None),
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """List users in the center (admin only)"""
    try:
        query = db.query(User).filter_by(center_id=current_user.center_id)
        if role:
            query = query.filter_by(role=role)
        users = query.all()
        return success_response([UserResponse.from_orm(u) for u in users])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
