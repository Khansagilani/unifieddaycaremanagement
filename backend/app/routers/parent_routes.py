from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from uuid import UUID
from datetime import datetime, timezone
from app.database import get_db
from app.core.dependencies import get_current_user, require_roles as require_role
from app.models.user import User
from app.services.auth_service import AuthService
from app.utils.response import success_response, error_response
from pydantic import BaseModel, EmailStr
import uuid

router = APIRouter()

# ─── Schemas ─────────────────────────────────────────────────────────────────

class ParentRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None

class LinkChildRequest(BaseModel):
    registration_number: str

class NotificationRead(BaseModel):
    notification_id: UUID

# ─── Helper: create notification ─────────────────────────────────────────────

def create_notification(db: Session, user_id: UUID, title: str, message: str, notif_type: str, related_id: UUID = None):
    db.execute(text("""
        INSERT INTO notifications (id, user_id, title, message, type, related_id, created_at)
        VALUES (:id, :user_id, :title, :message, :type, :related_id, :created_at)
    """), {
        "id": str(uuid.uuid4()),
        "user_id": str(user_id),
        "title": title,
        "message": message,
        "type": notif_type,
        "related_id": str(related_id) if related_id else None,
        "created_at": datetime.now(timezone.utc)
    })
    db.commit()

# ─── Public: Parent Registration ─────────────────────────────────────────────

@router.post("/api/auth/register-parent", response_model=dict)
async def register_parent(request: ParentRegisterRequest, db: Session = Depends(get_db)):
    """Public endpoint for parents to self-register"""
    try:
        # Get or create a default center (parents need a center_id)
        center = db.execute(text("SELECT id FROM centers LIMIT 1")).fetchone()
        if not center:
            raise HTTPException(status_code=400, detail="No center found. Contact admin.")

        # Check if email already exists
        existing = db.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": request.email}
        ).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user = AuthService.create_user(
            db,
            email=request.email,
            password=request.password,
            full_name=request.full_name,
            role="PARENT",
            center_id=center.id,
            phone=request.phone
        )
        tokens = AuthService.generate_tokens(user)
        user_response = AuthService.user_to_response(user)
        return success_response({
            "user": user_response,
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "token_type": tokens["token_type"],
            "expires_in": tokens["expires_in"]
        }, message="Account created successfully")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Parent: Submit Link Request ──────────────────────────────────────────────

@router.post("/api/parent/link-request", response_model=dict)
async def submit_link_request(
    request: LinkChildRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Parent submits registration number to link to a child"""
    role_value = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    if role_value != "PARENT":
        raise HTTPException(status_code=403, detail=f"Only parents can submit link requests (your role: {role_value})")

    # Find child by registration number
    child = db.execute(
        text("SELECT id, first_name, last_name, center_id FROM children WHERE registration_number = :reg"),
        {"reg": request.registration_number}
    ).fetchone()

    if not child:
        return error_response("INVALID_REG", "No child found with this registration number")

    # Check if already linked
    existing_link = db.execute(
        text("SELECT id, status FROM parent_child WHERE user_id = :uid AND child_id = :cid"),
        {"uid": str(current_user.id), "cid": str(child.id)}
    ).fetchone()
    if existing_link and existing_link.status == "APPROVED":
        return error_response("ALREADY_LINKED", "You are already linked to this child")

    # Check if pending request already exists
    existing_request = db.execute(
        text("SELECT id FROM parent_link_requests WHERE parent_id = :pid AND child_id = :cid AND status = 'PENDING'"),
        {"pid": str(current_user.id), "cid": str(child.id)}
    ).fetchone()
    if existing_request:
        return error_response("ALREADY_PENDING", "A request is already pending for this child")

    # Create link request
    request_id = str(uuid.uuid4())
    db.execute(text("""
        INSERT INTO parent_link_requests (id, parent_id, child_id, registration_number, status, created_at, updated_at)
        VALUES (:id, :parent_id, :child_id, :reg, 'PENDING', :now, :now)
    """), {
        "id": request_id,
        "parent_id": str(current_user.id),
        "child_id": str(child.id),
        "reg": request.registration_number,
        "now": datetime.now(timezone.utc)
    })
    db.commit()

    # Notify all admins in the center
    admins = db.execute(
        text("SELECT id FROM users WHERE role = 'ADMIN' AND center_id = :cid"),
        {"cid": str(child.center_id)}
    ).fetchall()

    for admin in admins:
        create_notification(
            db,
            user_id=admin.id,
            title="New Parent Link Request",
            message=f"{current_user.full_name} is requesting to be linked to {child.first_name} {child.last_name}",
            notif_type="LINK_REQUEST",
            related_id=UUID(request_id)
        )

    return success_response({"request_id": request_id}, "Request submitted. Waiting for admin approval.")


# ─── Parent: Get My Link Requests ─────────────────────────────────────────────

@router.get("/api/parent/link-requests", response_model=dict)
async def get_my_link_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Parent views their link request statuses"""
    requests = db.execute(text("""
        SELECT plr.id, plr.status, plr.created_at, plr.registration_number,
               c.first_name, c.last_name, c.id as child_id
        FROM parent_link_requests plr
        JOIN children c ON c.id = plr.child_id
        WHERE plr.parent_id = :pid
        ORDER BY plr.created_at DESC
    """), {"pid": str(current_user.id)}).fetchall()

    return success_response([{
        "id": str(r.id),
        "status": r.status,
        "created_at": r.created_at.isoformat(),
        "registration_number": r.registration_number,
        "child_name": f"{r.first_name} {r.last_name}",
        "child_id": str(r.child_id)
    } for r in requests])


# ─── Admin: Get All Pending Link Requests ─────────────────────────────────────

@router.get("/api/admin/link-requests", response_model=dict)
async def get_link_requests(
    status: Optional[str] = "PENDING",
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Admin views all link requests"""
    requests = db.execute(text("""
        SELECT plr.id, plr.status, plr.created_at, plr.registration_number,
               c.first_name as child_first, c.last_name as child_last, c.id as child_id,
               u.full_name as parent_name, u.email as parent_email, u.id as parent_id
        FROM parent_link_requests plr
        JOIN children c ON c.id = plr.child_id
        JOIN users u ON u.id = plr.parent_id
        WHERE c.center_id = :cid AND (:status = 'ALL' OR plr.status = :status)
        ORDER BY plr.created_at DESC
    """), {"cid": str(current_user.center_id), "status": status}).fetchall()

    return success_response([{
        "id": str(r.id),
        "status": r.status,
        "created_at": r.created_at.isoformat(),
        "registration_number": r.registration_number,
        "child_name": f"{r.child_first} {r.child_last}",
        "child_id": str(r.child_id),
        "parent_name": r.parent_name,
        "parent_email": r.parent_email,
        "parent_id": str(r.parent_id)
    } for r in requests])


# ─── Admin: Approve or Reject Link Request ────────────────────────────────────

@router.post("/api/admin/link-requests/{request_id}/approve", response_model=dict)
async def approve_link_request(
    request_id: UUID,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Admin approves a parent-child link request"""
    req = db.execute(
        text("SELECT * FROM parent_link_requests WHERE id = :id"),
        {"id": str(request_id)}
    ).fetchone()

    if not req:
        return error_response("NOT_FOUND", "Request not found")

    # Update request status
    db.execute(
        text("UPDATE parent_link_requests SET status = 'APPROVED', updated_at = :now WHERE id = :id"),
        {"id": str(request_id), "now": datetime.now(timezone.utc)}
    )

    # Create parent_child link
    existing = db.execute(
        text("SELECT id FROM parent_child WHERE user_id = :uid AND child_id = :cid"),
        {"uid": str(req.parent_id), "cid": str(req.child_id)}
    ).fetchone()

    if not existing:
        db.execute(text("""
            INSERT INTO parent_child (id, user_id, child_id, relationship, is_primary_contact, can_pickup, receives_updates, receives_invoices, is_emergency_contact, contact_priority, status)
            VALUES (:id, :uid, :cid, 'GUARDIAN', true, true, true, true, false, 1, 'APPROVED')
        """), {
            "id": str(uuid.uuid4()),
            "uid": str(req.parent_id),
            "cid": str(req.child_id)
        })
    else:
        db.execute(
            text("UPDATE parent_child SET status = 'APPROVED' WHERE user_id = :uid AND child_id = :cid"),
            {"uid": str(req.parent_id), "cid": str(req.child_id)}
        )

    db.commit()

    # Get child name for notification
    child = db.execute(
        text("SELECT first_name, last_name FROM children WHERE id = :id"),
        {"id": str(req.child_id)}
    ).fetchone()

    # Notify parent
    create_notification(
        db,
        user_id=req.parent_id,
        title="Link Request Approved ✅",
        message=f"Your request to be linked to {child.first_name} {child.last_name} has been approved!",
        notif_type="LINK_APPROVED",
        related_id=req.child_id
    )

    return success_response(None, "Request approved successfully")


@router.post("/api/admin/link-requests/{request_id}/reject", response_model=dict)
async def reject_link_request(
    request_id: UUID,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Admin rejects a parent-child link request"""
    req = db.execute(
        text("SELECT * FROM parent_link_requests WHERE id = :id"),
        {"id": str(request_id)}
    ).fetchone()

    if not req:
        return error_response("NOT_FOUND", "Request not found")

    db.execute(
        text("UPDATE parent_link_requests SET status = 'REJECTED', updated_at = :now WHERE id = :id"),
        {"id": str(request_id), "now": datetime.now(timezone.utc)}
    )
    db.commit()

    # Get child name
    child = db.execute(
        text("SELECT first_name, last_name FROM children WHERE id = :id"),
        {"id": str(req.child_id)}
    ).fetchone()

    # Notify parent
    create_notification(
        db,
        user_id=req.parent_id,
        title="Link Request Rejected ❌",
        message=f"Your request to be linked to {child.first_name} {child.last_name} was rejected. Please check the registration number and try again.",
        notif_type="LINK_REJECTED",
        related_id=req.child_id
    )

    return success_response(None, "Request rejected")


# ─── Notifications ────────────────────────────────────────────────────────────

@router.get("/api/notifications", response_model=dict)
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all notifications for current user"""
    notifications = db.execute(text("""
        SELECT id, title, message, is_read, type, related_id, created_at
        FROM notifications
        WHERE user_id = :uid
        ORDER BY created_at DESC
        LIMIT 50
    """), {"uid": str(current_user.id)}).fetchall()

    return success_response([{
        "id": str(n.id),
        "title": n.title,
        "message": n.message,
        "is_read": n.is_read,
        "type": n.type,
        "related_id": str(n.related_id) if n.related_id else None,
        "created_at": n.created_at.isoformat()
    } for n in notifications])


@router.post("/api/notifications/mark-read", response_model=dict)
async def mark_notification_read(
    request: NotificationRead,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.execute(
        text("UPDATE notifications SET is_read = true WHERE id = :id AND user_id = :uid"),
        {"id": str(request.notification_id), "uid": str(current_user.id)}
    )
    db.commit()
    return success_response(None, "Marked as read")


@router.post("/api/notifications/mark-all-read", response_model=dict)
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.execute(
        text("UPDATE notifications SET is_read = true WHERE user_id = :uid"),
        {"uid": str(current_user.id)}
    )
    db.commit()
    return success_response(None, "All marked as read")


@router.get("/api/notifications/unread-count", response_model=dict)
async def unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.execute(
        text("SELECT COUNT(*) FROM notifications WHERE user_id = :uid AND is_read = false"),
        {"uid": str(current_user.id)}
    ).scalar()
    return success_response({"count": count})


# ─── Admin: Get My Children (for parents) ─────────────────────────────────────

@router.get("/api/parent/my-children", response_model=dict)
async def get_my_children(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Parent gets their linked children"""
    if current_user.role != "PARENT":
        raise HTTPException(status_code=403, detail="Only parents can access this")

    children = db.execute(text("""
        SELECT c.id, c.first_name, c.last_name, c.date_of_birth, c.gender,
               c.room_name, c.status, c.photo_url, c.enrollment_date, c.registration_number
        FROM children c
        JOIN parent_child pc ON pc.child_id = c.id
        WHERE pc.user_id = :uid AND pc.status = 'APPROVED'
    """), {"uid": str(current_user.id)}).fetchall()

    return success_response([{
        "id": str(c.id),
        "first_name": c.first_name,
        "last_name": c.last_name,
        "date_of_birth": c.date_of_birth.isoformat() if c.date_of_birth else None,
        "gender": c.gender,
        "room_name": c.room_name,
        "status": c.status,
        "photo_url": c.photo_url,
        "enrollment_date": c.enrollment_date.isoformat() if c.enrollment_date else None,
        "registration_number": c.registration_number
    } for c in children])
