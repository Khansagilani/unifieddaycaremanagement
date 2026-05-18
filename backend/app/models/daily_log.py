from sqlalchemy import Column, String, Boolean, DateTime, UUID, ForeignKey, Integer, Enum as SQLEnum, Text, DATE, NUMERIC
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
import uuid

from app.database import Base


class ArrivalMood(str, enum.Enum):
    HAPPY = "HAPPY"
    NEUTRAL = "NEUTRAL"
    FUSSY = "FUSSY"
    CRYING = "CRYING"
    TIRED = "TIRED"


class MoodType(str, enum.Enum):
    VERY_HAPPY = "VERY_HAPPY"
    HAPPY = "HAPPY"
    NEUTRAL = "NEUTRAL"
    FUSSY = "FUSSY"
    SAD = "SAD"
    TIRED = "TIRED"
    SICK = "SICK"


class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey(
        "children.id", ondelete="CASCADE"), nullable=False)
    staff_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id"), nullable=False)
    log_date = Column(DATE, nullable=False)
    arrival_mood = Column(SQLEnum(ArrivalMood))
    departure_mood = Column(SQLEnum(MoodType))
    overall_notes = Column(Text)
    had_good_day = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True),
                        default=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True


class NapQuality(str, enum.Enum):
    EXCELLENT = "EXCELLENT"
    GOOD = "GOOD"
    RESTLESS = "RESTLESS"
    REFUSED = "REFUSED"


class NapRecord(Base):
    __tablename__ = "nap_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    daily_log_id = Column(UUID(as_uuid=True), ForeignKey(
        "daily_logs.id", ondelete="CASCADE"), nullable=False)
    staff_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id"), nullable=False)
    sleep_start = Column(DateTime(timezone=True), nullable=False)
    sleep_end = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer)
    sleep_quality = Column(SQLEnum(NapQuality))
    notes = Column(Text)

    class Config:
        from_attributes = True


class ActivityType(str, enum.Enum):
    OUTDOOR_PLAY = "OUTDOOR_PLAY"
    INDOOR_PLAY = "INDOOR_PLAY"
    ARTS_AND_CRAFTS = "ARTS_AND_CRAFTS"
    STORY_TIME = "STORY_TIME"
    MUSIC = "MUSIC"
    SENSORY_PLAY = "SENSORY_PLAY"
    TUMMY_TIME = "TUMMY_TIME"
    PHYSICAL_EXERCISE = "PHYSICAL_EXERCISE"
    EDUCATIONAL = "EDUCATIONAL"
    FREE_PLAY = "FREE_PLAY"
    SOCIAL_ACTIVITY = "SOCIAL_ACTIVITY"
    OTHER = "OTHER"


class EngagementLevel(str, enum.Enum):
    VERY_ENGAGED = "VERY_ENGAGED"
    ENGAGED = "ENGAGED"
    NEUTRAL = "NEUTRAL"
    DISENGAGED = "DISENGAGED"
    REFUSED = "REFUSED"


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    daily_log_id = Column(UUID(as_uuid=True), ForeignKey(
        "daily_logs.id", ondelete="CASCADE"), nullable=False)
    staff_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id"), nullable=False)
    activity_type = Column(SQLEnum(ActivityType), nullable=False)
    activity_name = Column(String(255), nullable=False)
    description = Column(Text)
    engagement_level = Column(SQLEnum(EngagementLevel))
    occurred_at = Column(DateTime(timezone=True), nullable=False)
    staff_notes = Column(Text)

    class Config:
        from_attributes = True


class MealType(str, enum.Enum):
    MORNING_BOTTLE = "MORNING_BOTTLE"
    BREAKFAST = "BREAKFAST"
    MID_MORNING_SNACK = "MID_MORNING_SNACK"
    LUNCH = "LUNCH"
    AFTERNOON_BOTTLE = "AFTERNOON_BOTTLE"
    AFTERNOON_SNACK = "AFTERNOON_SNACK"
    DINNER = "DINNER"
    EVENING_BOTTLE = "EVENING_BOTTLE"


class PortionEaten(str, enum.Enum):
    ALL = "ALL"
    MOST = "MOST"
    HALF = "HALF"
    LITTLE = "LITTLE"
    NONE = "NONE"
    REFUSED = "REFUSED"


class MealLog(Base):
    __tablename__ = "meal_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    daily_log_id = Column(UUID(as_uuid=True), ForeignKey(
        "daily_logs.id", ondelete="CASCADE"), nullable=False)
    child_id = Column(UUID(as_uuid=True), ForeignKey(
        "children.id"), nullable=False)
    staff_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id"), nullable=False)
    meal_type = Column(SQLEnum(MealType), nullable=False)
    items_served = Column(Text, nullable=False)
    portion_eaten = Column(SQLEnum(PortionEaten), nullable=False)
    refused_items = Column(Text)
    notes = Column(Text)
    logged_at = Column(DateTime(timezone=True),
                       default=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True


class DiaperType(str, enum.Enum):
    WET = "WET"
    DIRTY = "DIRTY"
    BOTH = "BOTH"
    DRY = "DRY"


class DiaperLog(Base):
    __tablename__ = "diaper_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    daily_log_id = Column(UUID(as_uuid=True), ForeignKey(
        "daily_logs.id", ondelete="CASCADE"), nullable=False)
    staff_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id"), nullable=False)
    changed_at = Column(DateTime(timezone=True), nullable=False)
    type = Column(SQLEnum(DiaperType), nullable=False)
    notes = Column(Text)

    class Config:
        from_attributes = True


class PottyLog(Base):
    __tablename__ = "potty_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    daily_log_id = Column(UUID(as_uuid=True), ForeignKey(
        "daily_logs.id", ondelete="CASCADE"), nullable=False)
    staff_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id"), nullable=False)
    occurred_at = Column(DateTime(timezone=True), nullable=False)
    successful = Column(Boolean, nullable=False)
    notes = Column(Text)

    class Config:
        from_attributes = True


class MediaType(str, enum.Enum):
    PHOTO = "PHOTO"
    VIDEO = "VIDEO"


class MediaPost(Base):
    __tablename__ = "media_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey(
        "children.id", ondelete="CASCADE"), nullable=False)
    staff_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id"), nullable=False)
    daily_log_id = Column(UUID(as_uuid=True), ForeignKey("daily_logs.id"))
    media_type = Column(SQLEnum(MediaType), nullable=False)
    url = Column(String, nullable=False)
    thumbnail_url = Column(String)
    caption = Column(Text)
    visible_to_parents = Column(Boolean, default=True)
    posted_at = Column(DateTime(timezone=True),
                       default=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True


class CheckinMethod(str, enum.Enum):
    QR_CODE = "QR_CODE"
    PIN = "PIN"
    MANUAL = "MANUAL"


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey(
        "children.id", ondelete="CASCADE"), nullable=False)
    center_id = Column(UUID(as_uuid=True), ForeignKey(
        "centers.id"), nullable=False)
    date = Column(DATE, nullable=False)
    checkin_at = Column(DateTime(timezone=True))
    checkin_by = Column(String(255))
    checkin_method = Column(SQLEnum(CheckinMethod))
    checkout_at = Column(DateTime(timezone=True))
    checkout_by = Column(String(255))
    late_pickup_alert = Column(Boolean, default=False)
    notes = Column(Text)

    class Config:
        from_attributes = True
