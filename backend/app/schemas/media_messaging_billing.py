from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
from enum import Enum

class MediaTypeEnum(str, Enum):
    PHOTO = "PHOTO"
    VIDEO = "VIDEO"

class MediaUploadRequest(BaseModel):
    child_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    media_type: MediaTypeEnum
    url: HttpUrl
    public_id: Optional[str] = None

class MediaResponse(MediaUploadRequest):
    id: int
    staff_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Messaging
class ConversationCreate(BaseModel):
    name: Optional[str] = None
    member_ids: List[int] = []

class ConversationResponse(BaseModel):
    id: int
    name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    conversation_id: int
    content: str = Field(..., min_length=1)
    attachments: Optional[List[str]] = []

class MessageResponse(MessageCreate):
    id: int
    sender_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Billing (skeleton)
class FeePlanCreate(BaseModel):
    name: str
    amount_cents: int
    billing_cycle: str
    description: Optional[str] = None

class FeePlanResponse(FeePlanCreate):
    id: int
    center_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class InvoiceCreate(BaseModel):
    child_id: int
    fee_plan_id: int
    due_date: datetime

class InvoiceResponse(InvoiceCreate):
    id: int
    invoice_number: str
    created_at: datetime

    class Config:
        from_attributes = True
