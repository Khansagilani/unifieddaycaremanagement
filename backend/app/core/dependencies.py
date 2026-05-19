from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = decode_token(token)
        if payload is None:
            raise HTTPException(
                status_code=401, detail="Invalid or expired token")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == user_id,
                                 User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_roles(*roles):
    # flatten in case a list is passed e.g. require_role(["ADMIN"])
    flat_roles = []
    for r in roles:
        if isinstance(r, list):
            flat_roles.extend(r)
        else:
            flat_roles.append(r)

    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role.value not in flat_roles:
            raise HTTPException(
                status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# Shortcut dependency factories


def get_admin():
    return require_roles("ADMIN")


def get_admin_or_staff():
    return require_roles("ADMIN", "STAFF")


def get_any_authenticated_user():
    return require_roles("ADMIN", "STAFF", "PARENT")


require_role = require_roles
