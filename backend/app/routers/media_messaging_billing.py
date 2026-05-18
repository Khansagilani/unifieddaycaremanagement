from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User
from app.services.media_service import MediaService
from app.services.messaging_service import MessagingService
from app.services.billing_service import BillingService
from app.models.messaging import Invoice, FeePlan
from app.schemas.media_messaging_billing import (
    MediaUploadRequest, MediaResponse, ConversationCreate, ConversationResponse,
    MessageCreate, MessageResponse, FeePlanCreate, FeePlanResponse, InvoiceCreate, InvoiceResponse
)
from app.utils.response import success_response, error_response
from app.core.config import settings
import cloudinary
import cloudinary.uploader
import stripe
import json

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

stripe.api_key = getattr(settings, "STRIPE_SECRET_KEY", None)

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
    child_id: Optional[int] = Form(None),
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    """Upload multipart file to Cloudinary and create MediaPost"""
    if not settings.CLOUDINARY_API_KEY:
        return error_response("CLOUDINARY_NOT_CONFIGURED", "Cloudinary is not configured on the server")
    try:
        file_content = file.file
        public_id = filename or None
        res = cloudinary.uploader.upload(file_content, public_id=public_id)
        media_req = MediaUploadRequest(
            child_id=int(child_id) if child_id else None,
            media_type=None,
            url=res.get('secure_url'),
            public_id=res.get('public_id')
        )
        media = MediaService.add_media(db, current_user.id, media_req)
        return success_response(MediaResponse.from_orm(media), "Uploaded to Cloudinary")
    except Exception as e:
        return error_response("CLOUDINARY_UPLOAD_FAILED", str(e))

@router.get("/children/{child_id}", response_model=dict)
def media_for_child(
    child_id: int,
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
    convo = MessagingService.create_conversation(db, current_user.id, payload.member_ids, payload.name)
    return success_response(ConversationResponse.from_orm(convo), "Conversation created")

@msg_router.post("/messages", response_model=dict)
def send_message(
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    msg = MessagingService.send_message(db, current_user.id, payload.conversation_id, payload.content, payload.attachments)
    return success_response(MessageResponse.from_orm(msg), "Message sent")

@msg_router.get("/conversations/{conversation_id}", response_model=dict)
def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    msgs = MessagingService.get_conversation_messages(db, conversation_id)
    return success_response([MessageResponse.from_orm(m) for m in msgs])

# Billing router
billing_router = APIRouter(prefix="/api/billing", tags=["billing"])

@billing_router.post("/fee-plans", response_model=dict)
def create_fee_plan(
    payload: FeePlanCreate,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    fp = BillingService.create_fee_plan(db, current_user.center_id, payload.name, payload.amount_cents, payload.billing_cycle, payload.description)
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
    inv = BillingService.create_invoice(db, payload.child_id, payload.fee_plan_id, payload.due_date)
    return success_response(InvoiceResponse.from_orm(inv), "Invoice created")


@billing_router.get("/invoices", response_model=dict)
def list_invoices(
    child_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List invoices optionally filtered by child_id. Admins see center invoices; parents see their child's invoices."""
    query = db.query(Invoice)
    if child_id:
        query = query.filter_by(child_id=child_id)
    else:
        # if parent, limit to their children
        if current_user.role == 'PARENT':
            from app.models.base import ParentChild
            links = db.query(ParentChild).filter_by(user_id=current_user.id).all()
            child_ids = [l.child_id for l in links]
            query = query.filter(Invoice.child_id.in_(child_ids))
    invoices = query.order_by(Invoice.created_at.desc()).all()
    return success_response([InvoiceResponse.from_orm(i) for i in invoices])


@billing_router.post("/stripe/create-payment-intent", response_model=dict)
def create_payment_intent(
    invoice_id: int,
    current_user: User = Depends(require_role(["ADMIN", "STAFF", "PARENT"])),
    db: Session = Depends(get_db)
):
    """Create Stripe payment intent for an invoice"""
    if not stripe.api_key:
        return error_response("STRIPE_NOT_CONFIGURED", "Stripe is not configured on the server")
    inv = db.query(Invoice).filter_by(id=invoice_id).first()
    if not inv:
        return error_response("INVOICE_NOT_FOUND", "Invoice not found")
    amount = int(getattr(inv, 'amount_cents', 0) or 0)
    try:
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency="usd",
            metadata={"invoice_id": str(inv.id)}
        )
        return success_response({"client_secret": intent.client_secret})
    except Exception as e:
        return error_response("STRIPE_ERROR", str(e))


@billing_router.post("/stripe/webhook", response_model=dict)
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Stripe webhook handler for payment completion"""
    webhook_secret = getattr(settings, "STRIPE_WEBHOOK_SECRET", None)
    if not webhook_secret:
        return error_response("WEBHOOK_NOT_CONFIGURED", "Webhook secret not configured")
    
    sig_header = request.headers.get("stripe-signature", "")
    body = await request.body()
    
    try:
        event = stripe.Webhook.construct_event(body, sig_header, webhook_secret)
    except ValueError:
        return error_response("INVALID_PAYLOAD", "Invalid payload")
    except stripe.error.SignatureVerificationError:
        return error_response("INVALID_SIGNATURE", "Invalid signature")
    
    if event["type"] == "payment_intent.succeeded":
        pi = event["data"]["object"]
        invoice_id = pi.get("metadata", {}).get("invoice_id")
        if invoice_id:
            inv = db.query(Invoice).filter_by(id=int(invoice_id)).first()
            if inv:
                inv.status = "PAID"
                inv.paid_at = db.func.now()
                db.commit()
    
    return success_response({}, "Webhook processed")

