from sqlalchemy import Column, String, Boolean, DateTime, UUID, ForeignKey, Integer, Enum as SQLEnum, Text, DATE, TIME
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
import uuid

from app.database import Base


class ChildPersonality(Base):
    __tablename__ = "child_personalities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey(
        "children.id", ondelete="CASCADE"), nullable=False, unique=True)
    favorite_toys = Column(Text)
    favorite_activities = Column(Text)
    favorite_sports = Column(Text)
    favorite_books = Column(Text)
    favorite_songs = Column(Text)
    comfort_objects = Column(Text)
    dislikes = Column(Text)
    things_that_calm_them = Column(Text)
    things_that_excite_them = Column(Text)
    social_style = Column(Text)
    learning_style = Column(Text)
    temperament_notes = Column(Text)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True


class FearSeverity(str, enum.Enum):
    MILD = "MILD"
    MODERATE = "MODERATE"
    SEVERE = "SEVERE"


class ChildFear(Base):
    __tablename__ = "child_fears"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey(
        "children.id", ondelete="CASCADE"), nullable=False)
    fear_description = Column(Text, nullable=False)
    severity = Column(SQLEnum(FearSeverity), default=FearSeverity.MILD)
    triggers = Column(Text)
    coping_strategy = Column(Text)
    staff_notes = Column(Text)

    class Config:
        from_attributes = True


class EnthusiasmLevel(str, enum.Enum):
    LOVES = "LOVES"
    LIKES = "LIKES"
    NEUTRAL = "NEUTRAL"


class InterestCategory(str, enum.Enum):
    SPORTS = "SPORTS"
    ARTS = "ARTS"
    MUSIC = "MUSIC"
    ANIMALS = "ANIMALS"
    VEHICLES = "VEHICLES"
    NATURE = "NATURE"
    BOOKS = "BOOKS"
    TECHNOLOGY = "TECHNOLOGY"
    DANCE = "DANCE"
    COOKING = "COOKING"
    OTHER = "OTHER"


class ChildInterest(Base):
    __tablename__ = "child_interests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey(
        "children.id", ondelete="CASCADE"), nullable=False)
    interest_category = Column(SQLEnum(InterestCategory), nullable=False)
    specific_interest = Column(String(255), nullable=False)
    enthusiasm_level = Column(SQLEnum(EnthusiasmLevel),
                              default=EnthusiasmLevel.LIKES)
    notes = Column(Text)

    class Config:
        from_attributes = True


class EmotionalSupportPlan(Base):
    __tablename__ = "emotional_support_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey(
        "children.id", ondelete="CASCADE"), nullable=False, unique=True)
    separation_anxiety_notes = Column(Text)
    calming_techniques = Column(Text)
    triggers_to_avoid = Column(Text)
    positive_reinforcements = Column(Text)
    behavioral_notes = Column(Text)
    staff_guidance = Column(Text)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True


class ToiletStage(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    AWARE = "AWARE"
    IN_TRAINING = "IN_TRAINING"
    MOSTLY_TRAINED = "MOSTLY_TRAINED"
    FULLY_TRAINED = "FULLY_TRAINED"


class ChildRoutine(Base):
    __tablename__ = "child_routines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey(
        "children.id", ondelete="CASCADE"), nullable=False, unique=True)
    usual_wake_time = Column(TIME)
    usual_sleep_time = Column(TIME)
    nap_duration_minutes = Column(Integer)
    nap_preferences = Column(Text)
    bedtime_rituals = Column(Text)
    morning_mood = Column(Text)
    potty_training_stage = Column(
        SQLEnum(ToiletStage), default=ToiletStage.NOT_STARTED)
    uses_pacifier = Column(Boolean, default=False)
    uses_comfort_blanket = Column(Boolean, default=False)
    comfort_blanket_desc = Column(Text)
    special_routines = Column(Text)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True


class WalkingStage(str, enum.Enum):
    NOT_WALKING = "NOT_WALKING"
    SUPPORTED = "SUPPORTED"
    CRUISING = "CRUISING"
    INDEPENDENT = "INDEPENDENT"


class TalkingStage(str, enum.Enum):
    BABBLING = "BABBLING"
    FIRST_WORDS = "FIRST_WORDS"
    TWO_WORDS = "TWO_WORDS"
    SENTENCES = "SENTENCES"
    FLUENT = "FLUENT"


class FeedingStage(str, enum.Enum):
    MILK_ONLY = "MILK_ONLY"
    INTRODUCING_SOLIDS = "INTRODUCING_SOLIDS"
    MIXED = "MIXED"
    TABLE_FOOD = "TABLE_FOOD"


class ChildDevelopment(Base):
    __tablename__ = "child_development"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey(
        "children.id", ondelete="CASCADE"), nullable=False, unique=True)
    walking_stage = Column(SQLEnum(WalkingStage),
                           default=WalkingStage.NOT_WALKING)
    talking_stage = Column(SQLEnum(TalkingStage),
                           default=TalkingStage.BABBLING)
    feeding_stage = Column(SQLEnum(FeedingStage),
                           default=FeedingStage.MILK_ONLY)
    toilet_stage = Column(SQLEnum(ToiletStage),
                          default=ToiletStage.NOT_STARTED)
    milestones_achieved = Column(Text)
    areas_to_support = Column(Text)
    staff_observations = Column(Text)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True
