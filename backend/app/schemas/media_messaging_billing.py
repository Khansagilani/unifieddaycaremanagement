from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum
from uuid import UUID


class MediaTypeEnum(str, Enum):
    PHOTO = "PHOTO"
    VIDEO = "VIDEO"


class MediaUploadRequest(BaseModel):
    child_id: Optional[UUID] = None
    caption: Optional[str] = None
    media_type: Optional[str] = "PHOTO"
    url: str


class MediaResponse(BaseModel):
    id: UUID
    child_id: UUID
    staff_id: UUID
    media_type: str
    url: str
    caption: Optional[str] = None
    visible_to_parents: bool = True
    posted_at: datetime

    class Config:
        from_attributes = True

# Messaging


class ConversationCreate(BaseModel):
    name: Optional[str] = None
    member_ids: List[int] = []


class ConversationResponse(BaseModel):
    id: UUID
    title: Optional[str] = None
    type: Optional[str] = None
    created_at: datetime
    last_message_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    conversation_id: UUID
    body: str = Field(..., min_length=1)
    attachment_url: Optional[str] = None


class MessageResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    body: str
    attachment_url: Optional[str] = None
    sent_at: datetime

    class Config:
        from_attributes = True

# Billing (skeleton)


class FeePlanCreate(BaseModel):
    name: str
    monthly_amount: Decimal
    registration_fee: Optional[Decimal] = None
    sibling_discount: bool = False
    sibling_discount_pct: Optional[Decimal] = None
    billing_cycle: str


class FeePlanResponse(FeePlanCreate):
    id: UUID
    center_id: UUID

    class Config:
        from_attributes = True


class InvoiceCreate(BaseModel):
    child_id: Optional[UUID] = None
    fee_plan_id: Optional[UUID] = None
    due_date: datetime
    billing_month: Optional[str] = None
    billing_year: Optional[int] = None
    amount_due: Optional[Decimal] = None
    notes: Optional[str] = None


class GenerateMonthlyRequest(BaseModel):
    year: int
    month: int
    fee_plan_id: Optional[UUID] = None


class InvoiceResponse(BaseModel):
    id: UUID
    invoice_number: str
    child_id: Optional[UUID] = None
    child_name: Optional[str] = None
    center_id: Optional[UUID] = None
    fee_plan_id: Optional[UUID] = None
    billing_month: Optional[str] = None
    billing_year: Optional[int] = None
    amount_due: Optional[Decimal] = None
    amount_paid: Optional[Decimal] = None
    status: Optional[str] = None
    due_date: Optional[date] = None
    notes: Optional[str] = None
    issued_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True
