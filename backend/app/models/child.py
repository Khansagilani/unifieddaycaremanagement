from sqlalchemy import Column, String, Boolean, DateTime, UUID, ForeignKey, Integer, Enum as SQLEnum, Text, DATE, TIME, NUMERIC
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
import uuid

from app.database import Base

class AllergenSeverity(str, enum.Enum):
    MILD = "MILD"
    MODERATE = "MODERATE"
    SEVERE = "SEVERE"
    ANAPHYLACTIC = "ANAPHYLACTIC"

class FoodPreferenceType(str, enum.Enum):
    LOVES = "LOVES"
    LIKES = "LIKES"
    DISLIKES = "DISLIKES"
    REFUSES = "REFUSES"
    ALLERGIC = "ALLERGIC"

class FeedingMethod(str, enum.Enum):
    BOTTLE_FORMULA = "BOTTLE_FORMULA"
    BOTTLE_BREAST_MILK = "BOTTLE_BREAST_MILK"
    BREASTFED = "BREASTFED"
    SOLID_FOODS = "SOLID_FOODS"
    MIXED = "MIXED"

class FoodTexture(str, enum.Enum):
    PUREE = "PUREE"
    MASHED = "MASHED"
    SOFT_LUMPS = "SOFT_LUMPS"
    CHOPPED = "CHOPPED"
    FINGER_FOODS = "FINGER_FOODS"
    REGULAR = "REGULAR"

class DietaryRestrictionType(str, enum.Enum):
    VEGETARIAN = "VEGETARIAN"
    VEGAN = "VEGAN"
    HALAL = "HALAL"
    KOSHER = "KOSHER"
    GLUTEN_FREE = "GLUTEN_FREE"
    DAIRY_FREE = "DAIRY_FREE"
    NUT_FREE = "NUT_FREE"
    OTHER = "OTHER"

class ChildFoodProfile(Base):
    __tablename__ = "child_food_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id", ondelete="CASCADE"), nullable=False, unique=True)
    feeding_method = Column(SQLEnum(FeedingMethod), nullable=False)
    bottle_size_ml = Column(Integer)
    formula_brand = Column(String(255))
    breast_milk_notes = Column(Text)
    feeds_per_day = Column(Integer)
    meal_schedule = Column(Text)
    self_feeds = Column(Boolean, default=False)
    needs_help_feeding = Column(Boolean, default=True)
    utensils_preferred = Column(String(255))
    cup_type = Column(String(100))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True

class FoodPreference(Base):
    __tablename__ = "food_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    food_profile_id = Column(UUID(as_uuid=True), ForeignKey("child_food_profiles.id", ondelete="CASCADE"), nullable=False)
    food_name = Column(String(255), nullable=False)
    preference_type = Column(SQLEnum(FoodPreferenceType), nullable=False)
    notes = Column(Text)

    class Config:
        from_attributes = True

class FoodTextureRecord(Base):
    __tablename__ = "food_textures"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    food_profile_id = Column(UUID(as_uuid=True), ForeignKey("child_food_profiles.id", ondelete="CASCADE"), nullable=False)
    texture = Column(SQLEnum(FoodTexture), nullable=False)
    accepted = Column(Boolean, nullable=False)
    notes = Column(Text)

    class Config:
        from_attributes = True

class DietaryRestriction(Base):
    __tablename__ = "dietary_restrictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    food_profile_id = Column(UUID(as_uuid=True), ForeignKey("child_food_profiles.id", ondelete="CASCADE"), nullable=False)
    restriction_type = Column(SQLEnum(DietaryRestrictionType), nullable=False)
    details = Column(Text)
    alternatives_provided = Column(Text)

    class Config:
        from_attributes = True

class Allergy(Base):
    __tablename__ = "allergies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id", ondelete="CASCADE"), nullable=False)
    allergen = Column(String(255), nullable=False)
    severity = Column(SQLEnum(AllergenSeverity), nullable=False)
    reaction_symptoms = Column(Text)
    action_required = Column(Text, nullable=False)
    medication_if_reaction = Column(Text)
    epipen_required = Column(Boolean, default=False)
    epipen_location = Column(Text)
    parent_notified_on_exposure = Column(Boolean, default=True)
    diagnosed_date = Column(DATE)

    class Config:
        from_attributes = True

class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id", ondelete="CASCADE"), nullable=False, unique=True)
    blood_type = Column(String(10))
    doctor_name = Column(String(255))
    doctor_phone = Column(String(50))
    clinic_name = Column(String(255))
    hospital_preference = Column(String(255))
    health_insurance_provider = Column(String(255))
    insurance_number = Column(String(100))
    has_special_needs = Column(Boolean, default=False)
    special_needs_details = Column(Text)
    chronic_conditions = Column(Text)
    medical_notes = Column(Text)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True

class Medication(Base):
    __tablename__ = "medications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id", ondelete="CASCADE"), nullable=False)
    health_profile_id = Column(UUID(as_uuid=True), ForeignKey("health_profiles.id", ondelete="CASCADE"))
    medication_name = Column(String(255), nullable=False)
    dosage = Column(String(100), nullable=False)
    frequency = Column(String(100), nullable=False)
    route = Column(String(100))
    start_date = Column(DATE, nullable=False)
    end_date = Column(DATE)
    reason = Column(Text)
    prescribing_doctor = Column(String(255))
    storage_instructions = Column(Text)
    refrigerate = Column(Boolean, default=False)
    instructions = Column(Text)
    is_active = Column(Boolean, default=True)

    class Config:
        from_attributes = True

class MedicationLog(Base):
    __tablename__ = "medication_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medication_id = Column(UUID(as_uuid=True), ForeignKey("medications.id", ondelete="CASCADE"), nullable=False)
    staff_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    administered_at = Column(DateTime(timezone=True), nullable=False)
    dose_given = Column(String(100))
    observations = Column(Text)
    parent_notified = Column(Boolean, default=False)

    class Config:
        from_attributes = True

class Vaccination(Base):
    __tablename__ = "vaccinations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id", ondelete="CASCADE"), nullable=False)
    health_profile_id = Column(UUID(as_uuid=True), ForeignKey("health_profiles.id", ondelete="CASCADE"))
    vaccine_name = Column(String(255), nullable=False)
    date_given = Column(DATE, nullable=False)
    next_due_date = Column(DATE)
    given_by = Column(String(255))
    is_up_to_date = Column(Boolean, default=True)
    notes = Column(Text)

    class Config:
        from_attributes = True

class IncidentType(str, enum.Enum):
    FALL = "FALL"
    BITE = "BITE"
    SCRATCH = "SCRATCH"
    ALLERGIC_REACTION = "ALLERGIC_REACTION"
    ILLNESS = "ILLNESS"
    BEHAVIOURAL = "BEHAVIOURAL"
    OTHER = "OTHER"

class IncidentReport(Base):
    __tablename__ = "incident_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id", ondelete="CASCADE"), nullable=False)
    staff_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    center_id = Column(UUID(as_uuid=True), ForeignKey("centers.id"), nullable=False)
    incident_type = Column(SQLEnum(IncidentType), nullable=False)
    description = Column(Text, nullable=False)
    action_taken = Column(Text, nullable=False)
    first_aid_given = Column(Text)
    doctor_consulted = Column(Boolean, default=False)
    occurred_at = Column(DateTime(timezone=True), nullable=False)
    parent_notified = Column(Boolean, default=False)
    parent_notified_at = Column(DateTime(timezone=True))
    parent_signed_at = Column(DateTime(timezone=True))
    parent_signature_url = Column(String)

    class Config:
        from_attributes = True
