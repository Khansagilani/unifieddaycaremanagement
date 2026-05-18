from sqlalchemy import Column, String, Boolean, DateTime, UUID, ForeignKey, Integer, Enum as SQLEnum, Text, DATE, NUMERIC, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
import uuid

from app.database import Base


class ChecklistStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    OVERDUE = "OVERDUE"


class ChecklistFrequency(str, enum.Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"
    QUARTERLY = "QUARTERLY"
    ANNUALLY = "ANNUALLY"


class RegulatoryChecklist(Base):
    __tablename__ = "regulatory_checklists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    center_id = Column(UUID(as_uuid=True), ForeignKey(
        "centers.id", ondelete="CASCADE"), nullable=False)
    checklist_name = Column(String(255), nullable=False)
    frequency = Column(SQLEnum(ChecklistFrequency), nullable=False)
    due_date = Column(DATE, nullable=False)
    completed_date = Column(DATE)
    completed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    status = Column(SQLEnum(ChecklistStatus), default=ChecklistStatus.PENDING)
    notes = Column(Text)

    class Config:
        from_attributes = True


class RoomRatioLog(Base):
    __tablename__ = "room_ratio_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    center_id = Column(UUID(as_uuid=True), ForeignKey(
        "centers.id", ondelete="CASCADE"), nullable=False)
    room_name = Column(String(100), nullable=False)
    child_count = Column(Integer, nullable=False)
    staff_count = Column(Integer, nullable=False)
    ratio = Column(NUMERIC(5, 2), nullable=False)
    within_limit = Column(Boolean, nullable=False)
    logged_at = Column(DateTime(timezone=True),
                       default=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True


class EnrollmentDoc(Base):
    __tablename__ = "enrollment_docs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey(
        "children.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(100), nullable=False)
    file_url = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True),
                         default=lambda: datetime.now(timezone.utc))
    verified = Column(Boolean, default=False)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    class Config:
        from_attributes = True


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    center_id = Column(UUID(as_uuid=True), ForeignKey(
        "centers.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    action = Column(String(255), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(UUID(as_uuid=True))
    old_values = Column(JSONB)
    new_values = Column(JSONB)
    ip_address = Column(String(50))
    created_at = Column(DateTime(timezone=True),
                        default=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True
