from sqlalchemy import Column, String, Boolean, DateTime, UUID, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
import uuid

from app.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    STAFF = "STAFF"
    PARENT = "PARENT"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    center_id = Column(UUID(as_uuid=True), ForeignKey(
        "centers.id", ondelete="CASCADE"), nullable=False)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    phone = Column(String(50))
    role = Column(SQLEnum(UserRole), nullable=False)
    password_hash = Column(String(255), nullable=False)
    photo_url = Column(String)
    is_active = Column(Boolean, default=True)
    preferred_language = Column(String(10), default="en")
    push_notifications = Column(Boolean, default=True)
    reset_token = Column(String(255))
    reset_token_expiry = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True),
                        default=lambda: datetime.now(timezone.utc))

    # Relationships
    center = relationship("Center", back_populates="users")
    messages_sent = relationship(
        "Message", foreign_keys="Message.sender_id", back_populates="sender")
    certifications = relationship("StaffCertification", back_populates="user")

    class Config:
        from_attributes = True
