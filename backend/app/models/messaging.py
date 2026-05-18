from sqlalchemy import Column, String, Boolean, DateTime, UUID, ForeignKey, Integer, Enum as SQLEnum, Text, DATE, NUMERIC
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
import uuid

from app.database import Base

class ConversationType(str, enum.Enum):
    DIRECT = "DIRECT"
    GROUP = "GROUP"
    ANNOUNCEMENT = "ANNOUNCEMENT"

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    center_id = Column(UUID(as_uuid=True), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False)
    type = Column(SQLEnum(ConversationType), nullable=False)
    title = Column(String(255))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_message_at = Column(DateTime(timezone=True))

    class Config:
        from_attributes = True

class ConversationMember(Base):
    __tablename__ = "conversation_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    joined_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_read_at = Column(DateTime(timezone=True))

    class Config:
        from_attributes = True

class MessageType(str, enum.Enum):
    TEXT = "TEXT"
    IMAGE = "IMAGE"
    DOCUMENT = "DOCUMENT"
    ANNOUNCEMENT = "ANNOUNCEMENT"

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    center_id = Column(UUID(as_uuid=True), ForeignKey("centers.id"), nullable=False)
    body = Column(Text, nullable=False)
    message_type = Column(SQLEnum(MessageType), default=MessageType.TEXT)
    attachment_url = Column(String)
    is_announcement = Column(Boolean, default=False)
    sent_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    is_deleted = Column(Boolean, default=False)

    sender = relationship("User", foreign_keys=[sender_id], back_populates="messages_sent")

    class Config:
        from_attributes = True

class MessageRead(Base):
    __tablename__ = "message_reads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    read_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True

class AudienceType(str, enum.Enum):
    ALL_PARENTS = "ALL_PARENTS"
    ALL_STAFF = "ALL_STAFF"
    SPECIFIC_ROOM = "SPECIFIC_ROOM"
    INDIVIDUAL = "INDIVIDUAL"

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    center_id = Column(UUID(as_uuid=True), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    audience = Column(SQLEnum(AudienceType), nullable=False)
    room_target = Column(String(100))
    published_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True

class BillingCycle(str, enum.Enum):
    MONTHLY = "MONTHLY"
    WEEKLY = "WEEKLY"
    DAILY = "DAILY"

class FeePlan(Base):
    __tablename__ = "fee_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    center_id = Column(UUID(as_uuid=True), ForeignKey("centers.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    monthly_amount = Column(NUMERIC(10, 2), nullable=False)
    registration_fee = Column(NUMERIC(10, 2))
    sibling_discount = Column(Boolean, default=False)
    sibling_discount_pct = Column(NUMERIC(5, 2))
    billing_cycle = Column(SQLEnum(BillingCycle), default=BillingCycle.MONTHLY)

    class Config:
        from_attributes = True

class InvoiceStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id", ondelete="CASCADE"), nullable=False)
    center_id = Column(UUID(as_uuid=True), ForeignKey("centers.id"), nullable=False)
    fee_plan_id = Column(UUID(as_uuid=True), ForeignKey("fee_plans.id"))
    invoice_number = Column(String(100), nullable=False, unique=True)
    amount_due = Column(NUMERIC(10, 2), nullable=False)
    amount_paid = Column(NUMERIC(10, 2), default=0)
    due_date = Column(DATE, nullable=False)
    status = Column(SQLEnum(InvoiceStatus), default=InvoiceStatus.DRAFT)
    notes = Column(Text)
    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    paid_at = Column(DateTime(timezone=True))

    class Config:
        from_attributes = True

class PaymentMethod(str, enum.Enum):
    BANK_TRANSFER = "BANK_TRANSFER"
    CREDIT_CARD = "CREDIT_CARD"
    DEBIT_CARD = "DEBIT_CARD"
    CASH = "CASH"
    CHEQUE = "CHEQUE"
    ONLINE = "ONLINE"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    amount = Column(NUMERIC(10, 2), nullable=False)
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False)
    transaction_ref = Column(String(255))
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    paid_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True
