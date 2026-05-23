from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import nullslast
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
from app.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User
from app.models.base import Child
from app.services.media_service import MediaService
from app.services.messaging_service import MessagingService
from app.services.billing_service import BillingService
from app.models.messaging import Invoice, FeePlan, Payment, ConversationMember, Conversation
from app.schemas.media_messaging_billing import (
    MediaUploadRequest, MediaResponse, ConversationCreate, ConversationResponse,
    MessageCreate, MessageResponse, FeePlanCreate, FeePlanResponse, InvoiceCreate, InvoiceResponse,
    GenerateMonthlyRequest
)
from app.utils.response import success_response, error_response
from app.core.config import settings
import cloudinary
import cloudinary.uploader
import json

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

router = APIRouter(prefix="/api/media", tags=["media"])


@router.post("/upload", response_model=dict)
def upload_media(
    media_data: MediaUploadRequest,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    media = MediaService.add_media(db, current_user.id, media_data)
    if not media:
        return error_response("INVALID_CHILD", "Child not found or invalid")
    return success_response(MediaResponse.from_orm(media), "Media uploaded")


@router.post("/upload-cloudinary", response_model=dict)
def upload_cloudinary(
    file: UploadFile = File(...),
    filename: Optional[str] = Form(None),
    child_id: Optional[str] = Form(None),
    caption: Optional[str] = Form(None),
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    """Upload multipart file to Cloudinary and create MediaPost"""
    if not settings.CLOUDINARY_API_KEY:
        return error_response("CLOUDINARY_NOT_CONFIGURED", "Cloudinary is not configured on the server")
    try:
        res = cloudinary.uploader.upload(file.file, public_id=filename or None)
        child_uuid = UUID(child_id) if child_id else None
        media_type = "VIDEO" if file.content_type and file.content_type.startswith("video") else "PHOTO"
        media_req = MediaUploadRequest(
            child_id=child_uuid,
            media_type=media_type,
            url=res.get('secure_url'),
            caption=caption,
        )
        media = MediaService.add_media(db, current_user.id, media_req)
        return success_response(MediaResponse.from_orm(media), "Uploaded to Cloudinary")
    except Exception as e:
        return error_response("CLOUDINARY_UPLOAD_FAILED", str(e))


@router.get("/children/{child_id}", response_model=dict)
def media_for_child(
    child_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    media = MediaService.get_media_for_child(db, child_id)
    return success_response([MediaResponse.from_orm(m) for m in media])


# Messaging router
msg_router = APIRouter(prefix="/api/messages", tags=["messaging"])


@msg_router.post("/conversations", response_model=dict)
def create_conversation(
    payload: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    convo = MessagingService.create_conversation(
        db, current_user.id, current_user.center_id, payload.member_ids, payload.name)
    return success_response(ConversationResponse.from_orm(convo), "Conversation created")


@msg_router.post("/messages", response_model=dict)
def send_message(
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    msg = MessagingService.send_message(
        db, current_user.id, payload.conversation_id, payload.body, payload.attachment_url)
    return success_response(MessageResponse.from_orm(msg), "Message sent")


@msg_router.get("/conversations/{conversation_id}", response_model=dict)
def get_messages(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    msgs = MessagingService.get_conversation_messages(db, conversation_id)
    return success_response([MessageResponse.from_orm(m) for m in msgs])


# Billing router
billing_router = APIRouter(prefix="/api/billing", tags=["billing"])


def _invoice_response(inv: Invoice, db: Session) -> dict:
    """Build an InvoiceResponse dict enriched with child_name."""
    d = InvoiceResponse.from_orm(inv).model_dump()
    if inv.child_id:
        child = db.query(Child).filter_by(id=inv.child_id).first()
        if child:
            d['child_name'] = f"{child.first_name} {child.last_name}"
    return d


def _invoice_responses(invoices: list, db: Session) -> list:
    """Build InvoiceResponse dicts enriched with child_names (batched lookup)."""
    child_ids = list({i.child_id for i in invoices if i.child_id})
    child_map = {}
    if child_ids:
        children = db.query(Child).filter(Child.id.in_(child_ids)).all()
        child_map = {c.id: f"{c.first_name} {c.last_name}" for c in children}
    result = []
    for inv in invoices:
        d = InvoiceResponse.from_orm(inv).model_dump()
        d['child_name'] = child_map.get(inv.child_id)
        result.append(d)
    return result


@billing_router.post("/fee-plans", response_model=dict)
def create_fee_plan(
    payload: FeePlanCreate,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    fp = BillingService.create_fee_plan(
        db,
        current_user.center_id,
        payload.name,
        payload.monthly_amount,
        payload.billing_cycle,
        payload.registration_fee,
        payload.sibling_discount,
        payload.sibling_discount_pct
    )
    return success_response(FeePlanResponse.from_orm(fp), "Fee plan created")


@billing_router.get("/fee-plans", response_model=dict)
def list_fee_plans(
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    plans = db.query(FeePlan).filter_by(center_id=current_user.center_id).all()
    return success_response([FeePlanResponse.from_orm(fp) for fp in plans])


@billing_router.post("/invoices", response_model=dict)
def create_invoice(
    payload: InvoiceCreate,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    inv = BillingService.create_invoice(
        db,
        child_id=payload.child_id,
        fee_plan_id=payload.fee_plan_id,
        due_date=payload.due_date,
        center_id=current_user.center_id,
        billing_month=payload.billing_month,
        billing_year=payload.billing_year,
        amount_due=payload.amount_due,
        notes=payload.notes,
    )
    return success_response(_invoice_response(inv, db), "Invoice created")


@billing_router.post("/invoices/generate-monthly", response_model=dict)
def generate_monthly_invoices(
    payload: GenerateMonthlyRequest,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Generate DRAFT invoices for all active children with fee plans for a given month."""
    if not 1 <= payload.month <= 12:
        raise HTTPException(status_code=400, detail="Month must be 1-12")
    created = BillingService.generate_monthly_invoices(
        db, current_user.center_id, payload.year, payload.month, payload.fee_plan_id)
    return success_response(
        _invoice_responses(created, db),
        f"Generated {len(created)} draft invoice(s)"
    )


@billing_router.post("/invoices/{invoice_id}/send", response_model=dict)
def send_invoice(
    invoice_id: UUID,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Admin approves and sends a DRAFT invoice to the parent (status → SENT)."""
    inv = BillingService.send_invoice(db, invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return success_response(_invoice_response(inv, db), "Invoice sent to parent")


@billing_router.get("/invoices", response_model=dict)
def list_invoices(
    child_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List invoices. Admins see center invoices; parents see their children's invoices."""
    query = db.query(Invoice)
    if current_user.role == 'ADMIN':
        query = query.filter_by(center_id=current_user.center_id)
        if child_id:
            query = query.filter(Invoice.child_id == child_id)
    elif current_user.role == 'PARENT':
        from app.models.base import ParentChild
        links = db.query(ParentChild).filter_by(user_id=current_user.id).all()
        child_ids = [l.child_id for l in links]
        query = query.filter(
            Invoice.child_id.in_(child_ids),
            Invoice.status.in_(["SENT", "PAID", "OVERDUE"])
        )
    invoices = query.order_by(Invoice.issued_at.desc()).all()
    return success_response(_invoice_responses(invoices, db))


@billing_router.post("/invoices/{invoice_id}/mark-cash-paid", response_model=dict)
def mark_cash_paid(
    invoice_id: UUID,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Admin marks an invoice as paid via cash"""
    inv = db.query(Invoice).filter_by(id=invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if inv.status == "PAID":
        raise HTTPException(status_code=400, detail="Invoice already paid")

    now = datetime.now(timezone.utc)
    inv.status = "PAID"
    inv.amount_paid = inv.amount_due
    inv.paid_at = now

    payment = Payment(
        invoice_id=inv.id,
        amount=inv.amount_due,
        payment_method="CASH",
        transaction_ref=f"CASH-{inv.invoice_number}",
        status="COMPLETED",
        paid_at=now
    )
    db.add(payment)
    db.commit()
    db.refresh(inv)
    return success_response(_invoice_response(inv, db), "Invoice marked as paid (cash)")


@msg_router.get("/conversations", response_model=dict)
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List conversations the current user is a member of"""
    members = db.query(ConversationMember).filter_by(user_id=current_user.id).all()
    conv_ids = [m.conversation_id for m in members]
    convs = db.query(Conversation).filter(Conversation.id.in_(conv_ids)).order_by(
        nullslast(Conversation.last_message_at.desc())
    ).all()
    return success_response([ConversationResponse.from_orm(c) for c in convs])
