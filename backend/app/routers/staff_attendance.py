from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, date, timezone
from uuid import UUID, uuid4
from typing import Optional
from app.database import get_db
from app.core.dependencies import get_current_user, require_roles as require_role
from app.models.user import User
from app.utils.response import success_response, error_response

router = APIRouter()


@router.post("/api/staff/checkin", response_model=dict)
def staff_check_in(
    current_user: User = Depends(require_role(["STAFF"])),
    db: Session = Depends(get_db)
):
    """Staff member checks in for today — server records the timestamp."""
    today = date.today()
    now = datetime.now(timezone.utc)

    existing = db.execute(
        text("SELECT * FROM staff_attendance WHERE staff_id = :sid AND date = :d"),
        {"sid": str(current_user.id), "d": today}
    ).fetchone()

    if existing and existing.checked_in_at:
        raise HTTPException(status_code=400, detail="Already checked in today")

    if existing:
        db.execute(
            text("UPDATE staff_attendance SET checked_in_at = :t, status = 'PRESENT' WHERE staff_id = :sid AND date = :d"),
            {"t": now, "sid": str(current_user.id), "d": today}
        )
    else:
        db.execute(text("""
            INSERT INTO staff_attendance (id, staff_id, center_id, date, checked_in_at, status)
            VALUES (:id, :sid, :cid, :d, :t, 'PRESENT')
        """), {
            "id": str(uuid4()),
            "sid": str(current_user.id),
            "cid": str(current_user.center_id),
            "d": today,
            "t": now
        })
    db.commit()
    return success_response({
        "checked_in_at": now.isoformat(),
        "date": str(today)
    }, "Checked in successfully")


@router.post("/api/staff/checkout", response_model=dict)
def staff_check_out(
    current_user: User = Depends(require_role(["STAFF"])),
    db: Session = Depends(get_db)
):
    """Staff member checks out for today — server records the timestamp."""
    today = date.today()
    now = datetime.now(timezone.utc)

    existing = db.execute(
        text("SELECT * FROM staff_attendance WHERE staff_id = :sid AND date = :d"),
        {"sid": str(current_user.id), "d": today}
    ).fetchone()

    if not existing or not existing.checked_in_at:
        raise HTTPException(status_code=400, detail="Not checked in yet today")
    if existing.checked_out_at:
        raise HTTPException(status_code=400, detail="Already checked out today")

    db.execute(
        text("UPDATE staff_attendance SET checked_out_at = :t WHERE staff_id = :sid AND date = :d"),
        {"t": now, "sid": str(current_user.id), "d": today}
    )
    db.commit()
    return success_response({
        "checked_out_at": now.isoformat(),
        "date": str(today)
    }, "Checked out successfully")


@router.get("/api/staff/attendance/me", response_model=dict)
def my_attendance_today(
    current_user: User = Depends(require_role(["STAFF"])),
    db: Session = Depends(get_db)
):
    """Current staff member's attendance record for today."""
    today = date.today()
    row = db.execute(
        text("SELECT * FROM staff_attendance WHERE staff_id = :sid AND date = :d"),
        {"sid": str(current_user.id), "d": today}
    ).fetchone()

    return success_response({
        "date": str(today),
        "status": row.status if row else None,
        "checked_in_at": row.checked_in_at.isoformat() if row and row.checked_in_at else None,
        "checked_out_at": row.checked_out_at.isoformat() if row and row.checked_out_at else None,
    })


@router.get("/api/admin/staff-attendance/summary", response_model=dict)
def staff_attendance_summary(
    year: Optional[int] = None,
    month: Optional[int] = None,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Present/absent day counts per staff member for a given month."""
    today = date.today()
    y = year or today.year
    m = month or today.month

    rows = db.execute(text("""
        SELECT u.id as staff_id, u.full_name, u.email,
               COUNT(sa.id) FILTER (WHERE sa.status = 'PRESENT') AS days_present
        FROM users u
        LEFT JOIN staff_attendance sa ON sa.staff_id = u.id
            AND EXTRACT(YEAR FROM sa.date) = :y
            AND EXTRACT(MONTH FROM sa.date) = :m
        WHERE u.center_id = :cid AND u.role = 'STAFF' AND u.is_active = true
        GROUP BY u.id, u.full_name, u.email
        ORDER BY u.full_name
    """), {"cid": str(current_user.center_id), "y": y, "m": m}).fetchall()

    return success_response([{
        "staff_id": str(r.staff_id),
        "staff_name": r.full_name,
        "staff_email": r.email,
        "days_present": r.days_present or 0,
    } for r in rows])


@router.get("/api/admin/staff-attendance", response_model=dict)
def admin_staff_attendance(
    year: Optional[int] = None,
    month: Optional[int] = None,
    staff_id: Optional[UUID] = None,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """All staff attendance records for a given month (admin only)."""
    today = date.today()
    y = year or today.year
    m = month or today.month

    filter_staff = "AND sa.staff_id = :staff_id" if staff_id else ""
    params = {"cid": str(current_user.center_id), "y": y, "m": m}
    if staff_id:
        params["staff_id"] = str(staff_id)

    rows = db.execute(text(f"""
        SELECT sa.*, u.full_name, u.email
        FROM staff_attendance sa
        JOIN users u ON u.id = sa.staff_id
        WHERE sa.center_id = :cid
          AND EXTRACT(YEAR FROM sa.date) = :y
          AND EXTRACT(MONTH FROM sa.date) = :m
          {filter_staff}
        ORDER BY u.full_name, sa.date
    """), params).fetchall()

    return success_response([{
        "id": str(r.id),
        "staff_id": str(r.staff_id),
        "staff_name": r.full_name,
        "staff_email": r.email,
        "date": str(r.date),
        "status": r.status,
        "checked_in_at": r.checked_in_at.isoformat() if r.checked_in_at else None,
        "checked_out_at": r.checked_out_at.isoformat() if r.checked_out_at else None,
    } for r in rows])


@router.get("/api/admin/staff-attendance/today", response_model=dict)
def staff_present_today(
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """How many staff are checked in today (for admin dashboard stat)."""
    today = date.today()
    count = db.execute(
        text("""
            SELECT COUNT(*) FROM staff_attendance sa
            JOIN users u ON u.id = sa.staff_id
            WHERE sa.center_id = :cid AND sa.date = :d AND sa.checked_in_at IS NOT NULL
        """),
        {"cid": str(current_user.center_id), "d": today}
    ).scalar()

    total = db.execute(
        text("SELECT COUNT(*) FROM users WHERE center_id = :cid AND role = 'STAFF' AND is_active = true"),
        {"cid": str(current_user.center_id)}
    ).scalar()

    return success_response({"present": count or 0, "total": total or 0})
