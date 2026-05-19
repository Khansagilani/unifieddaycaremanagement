from sqlalchemy import Column, String, Boolean, DateTime, UUID, ForeignKey, Integer, Enum as SQLEnum, Text, NUMERIC, DATE, TIME
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
import uuid

from app.database import Base


class Center(Base):
    __tablename__ = "centers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    phone = Column(String(50))
    email = Column(String(255))
    license_number = Column(String(100))
    capacity = Column(Integer, default=50)
    operating_hours = Column(String(255))
    logo_url = Column(String)
    created_at = Column(DateTime(timezone=True),
                        default=lambda: datetime.now(timezone.utc))

    # Relationships
    users = relationship("User", back_populates="center",
                         cascade="all, delete-orphan")

    class Config:
        from_attributes = True


class ChildStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    WAITLISTED = "WAITLISTED"
    GRADUATED = "GRADUATED"


class Gender(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class Child(Base):
    __tablename__ = "children"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    center_id = Column(UUID(as_uuid=True), ForeignKey(
        "centers.id", ondelete="CASCADE"), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(DATE, nullable=False)
    gender = Column(SQLEnum(Gender))
    photo_url = Column(String)
    room_name = Column(String(100))
    status = Column(SQLEnum(ChildStatus), default=ChildStatus.ACTIVE)
    enrollment_date = Column(DATE, nullable=False)
    exit_date = Column(DATE)
    home_language = Column(String(100))
    religion = Column(String(100))
    cultural_notes = Column(Text)
    created_at = Column(DateTime(timezone=True),
                        default=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True


class RelationshipType(str, enum.Enum):
    MOTHER = "MOTHER"
    FATHER = "FATHER"
    GRANDMOTHER = "GRANDMOTHER"
    GRANDFATHER = "GRANDFATHER"
    AUNT = "AUNT"
    UNCLE = "UNCLE"
    GUARDIAN = "GUARDIAN"
    OTHER = "OTHER"


class ParentChild(Base):
    __tablename__ = "parent_child"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    child_id = Column(UUID(as_uuid=True), ForeignKey(
        "children.id", ondelete="CASCADE"), nullable=False)
    relationship = Column(SQLEnum(RelationshipType), nullable=False)
    is_primary_contact = Column(Boolean, default=False)
    can_pickup = Column(Boolean, default=True)
    receives_updates = Column(Boolean, default=True)
    receives_invoices = Column(Boolean, default=False)
    is_emergency_contact = Column(Boolean, default=False)
    contact_priority = Column(Integer, default=1)

    class Config:
        from_attributes = True


class AuthorizedPickup(Base):
    __tablename__ = "authorized_pickups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey(
        "children.id", ondelete="CASCADE"), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    photo_url = Column(String)
    relationship = Column(String(100))
    id_type = Column(String(50))
    id_number = Column(String(100))
    is_active = Column(Boolean, default=True)

    class Config:
        from_attributes = True


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey(
        "children.id", ondelete="CASCADE"), nullable=False)
    full_name = Column(String(255), nullable=False)
    relationship = Column(String(100))
    phone_primary = Column(String(50), nullable=False)
    phone_secondary = Column(String(50))
    contact_order = Column(Integer, default=1)

    class Config:
        from_attributes = True


class Room(Base):
    __tablename__ = "rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    center_id = Column(UUID(as_uuid=True), ForeignKey(
        "centers.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    age_group = Column(String(50), nullable=False)
    max_capacity = Column(Integer, nullable=False)
    min_age_months = Column(Integer)
    max_age_months = Column(Integer)
    is_active = Column(Boolean, default=True)

    class Config:
        from_attributes = True


class StaffCertification(Base):
    __tablename__ = "staff_certifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    certification_name = Column(String(255), nullable=False)
    issued_by = Column(String(255))
    issued_date = Column(DATE, nullable=False)
    expiry_date = Column(DATE, nullable=False)
    document_url = Column(String)
    status = Column(String(50), default="VALID")

    user = relationship("User", back_populates="certifications")

    class Config:
        from_attributes = True
