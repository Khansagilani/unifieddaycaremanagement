from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum
from uuid import UUID


# Enums
class GenderEnum(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class ChildStatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    WAITLISTED = "WAITLISTED"
    GRADUATED = "GRADUATED"


# ─── Authorized Pickups ───────────────────────────────────────────────────────

class AuthorizedPickupCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=7, max_length=50)
    link_type: Optional[str] = None
    id_type: Optional[str] = None
    id_number: Optional[str] = None
    is_active: Optional[bool] = True


class AuthorizedPickupResponse(BaseModel):
    id: UUID
    child_id: UUID
    full_name: str
    phone: str
    link_type: Optional[str] = None
    id_type: Optional[str] = None
    id_number: Optional[str] = None
    is_active: Optional[bool] = True

    class Config:
        from_attributes = True


# ─── Emergency Contacts ───────────────────────────────────────────────────────

class EmergencyContactCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    link_type: Optional[str] = None
    phone_primary: str = Field(..., min_length=7, max_length=50)
    phone_secondary: Optional[str] = None
    contact_order: Optional[int] = 1


class EmergencyContactResponse(BaseModel):
    id: UUID
    child_id: UUID
    full_name: str
    link_type: Optional[str] = None
    phone_primary: str
    phone_secondary: Optional[str] = None
    contact_order: Optional[int] = 1

    class Config:
        from_attributes = True


# ─── Allergies ────────────────────────────────────────────────────────────────

class AllergyCreate(BaseModel):
    allergen: str = Field(..., min_length=1, max_length=100)
    severity: Optional[str] = None
    reaction: Optional[str] = None
    notes: Optional[str] = None


class AllergyResponse(BaseModel):
    id: UUID
    child_id: UUID
    allergen: str
    severity: Optional[str] = None
    reaction: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Fears ───────────────────────────────────────────────────────────────────

class ChildFearCreate(BaseModel):
    fear_description: str = Field(..., min_length=1, max_length=500)
    severity: Optional[str] = None
    triggers: Optional[str] = None
    coping_strategy: Optional[str] = None
    staff_notes: Optional[str] = None


class ChildFearResponse(BaseModel):
    id: UUID
    child_id: UUID
    fear_description: str
    severity: Optional[str] = None
    triggers: Optional[str] = None
    coping_strategy: Optional[str] = None
    staff_notes: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Interests ────────────────────────────────────────────────────────────────

class ChildInterestCreate(BaseModel):
    interest_category: Optional[str] = None
    specific_interest: str = Field(..., min_length=1, max_length=255)
    enthusiasm_level: Optional[str] = None
    notes: Optional[str] = None


class ChildInterestResponse(BaseModel):
    id: UUID
    child_id: UUID
    interest_category: Optional[str] = None
    specific_interest: str
    enthusiasm_level: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Routines ────────────────────────────────────────────────────────────────

class ChildRoutineCreate(BaseModel):
    usual_wake_time: Optional[str] = None
    usual_sleep_time: Optional[str] = None
    nap_duration_minutes: Optional[int] = None
    nap_preferences: Optional[str] = None
    bedtime_rituals: Optional[str] = None
    morning_mood: Optional[str] = None
    potty_training_stage: Optional[str] = None
    uses_pacifier: Optional[bool] = False
    uses_comfort_blanket: Optional[bool] = False
    comfort_blanket_desc: Optional[str] = None
    special_routines: Optional[str] = None


class ChildRoutineResponse(BaseModel):
    id: UUID
    child_id: UUID
    usual_wake_time: Optional[str] = None
    usual_sleep_time: Optional[str] = None
    nap_duration_minutes: Optional[int] = None
    nap_preferences: Optional[str] = None
    bedtime_rituals: Optional[str] = None
    morning_mood: Optional[str] = None
    potty_training_stage: Optional[str] = None
    uses_pacifier: Optional[bool] = False
    uses_comfort_blanket: Optional[bool] = False
    comfort_blanket_desc: Optional[str] = None
    special_routines: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Personality ─────────────────────────────────────────────────────────────

class ChildPersonalityCreate(BaseModel):
    favorite_toys: Optional[str] = None
    favorite_activities: Optional[str] = None
    favorite_sports: Optional[str] = None
    favorite_books: Optional[str] = None
    favorite_songs: Optional[str] = None
    comfort_objects: Optional[str] = None
    dislikes: Optional[str] = None
    things_that_calm_them: Optional[str] = None
    things_that_excite_them: Optional[str] = None
    social_style: Optional[str] = None
    learning_style: Optional[str] = None
    temperament_notes: Optional[str] = None


class ChildPersonalityResponse(BaseModel):
    id: UUID
    child_id: UUID
    favorite_toys: Optional[str] = None
    favorite_activities: Optional[str] = None
    favorite_sports: Optional[str] = None
    favorite_books: Optional[str] = None
    favorite_songs: Optional[str] = None
    comfort_objects: Optional[str] = None
    dislikes: Optional[str] = None
    things_that_calm_them: Optional[str] = None
    things_that_excite_them: Optional[str] = None
    social_style: Optional[str] = None
    learning_style: Optional[str] = None
    temperament_notes: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Development ─────────────────────────────────────────────────────────────

class ChildDevelopmentCreate(BaseModel):
    walking_stage: Optional[str] = None
    talking_stage: Optional[str] = None
    feeding_stage: Optional[str] = None
    toilet_stage: Optional[str] = None
    milestones_achieved: Optional[str] = None
    areas_to_support: Optional[str] = None
    staff_observations: Optional[str] = None


class ChildDevelopmentResponse(BaseModel):
    id: UUID
    child_id: UUID
    walking_stage: Optional[str] = None
    talking_stage: Optional[str] = None
    feeding_stage: Optional[str] = None
    toilet_stage: Optional[str] = None
    milestones_achieved: Optional[str] = None
    areas_to_support: Optional[str] = None
    staff_observations: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Food Profile ─────────────────────────────────────────────────────────────

class ChildFoodProfileCreate(BaseModel):
    diet_type: Optional[str] = None
    meal_preferences: Optional[str] = None
    food_restrictions: Optional[str] = None
    feeding_notes: Optional[str] = None


class ChildFoodProfileResponse(BaseModel):
    id: UUID
    child_id: UUID
    diet_type: Optional[str] = None
    meal_preferences: Optional[str] = None
    food_restrictions: Optional[str] = None
    feeding_notes: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Emotional Support Plan ───────────────────────────────────────────────────

class EmotionalSupportPlanCreate(BaseModel):
    separation_anxiety_notes: Optional[str] = None
    calming_techniques: Optional[str] = None
    triggers_to_avoid: Optional[str] = None
    positive_reinforcements: Optional[str] = None
    behavioral_notes: Optional[str] = None
    staff_guidance: Optional[str] = None


class EmotionalSupportPlanResponse(BaseModel):
    id: UUID
    child_id: UUID
    separation_anxiety_notes: Optional[str] = None
    calming_techniques: Optional[str] = None
    triggers_to_avoid: Optional[str] = None
    positive_reinforcements: Optional[str] = None
    behavioral_notes: Optional[str] = None
    staff_guidance: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Full Profile ─────────────────────────────────────────────────────────────

class ChildProfileResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    date_of_birth: date
    gender: GenderEnum
    room_name: Optional[str] = None
    status: Optional[str] = None
    photo_url: Optional[str] = None
    enrollment_date: date

    personality: Optional[ChildPersonalityResponse] = None
    food_profile: Optional[ChildFoodProfileResponse] = None
    development: Optional[ChildDevelopmentResponse] = None
    emotional_support_plan: Optional[EmotionalSupportPlanResponse] = None
    allergies: List[AllergyResponse] = []
    fears: List[ChildFearResponse] = []
    interests: List[ChildInterestResponse] = []
    routines: Optional[ChildRoutineResponse] = None
    authorized_pickups: List[AuthorizedPickupResponse] = []
    emergency_contacts: List[EmergencyContactResponse] = []

    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Child CRUD ───────────────────────────────────────────────────────────────

class ChildCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: date
    gender: GenderEnum
    room_name: Optional[str] = Field(None, max_length=100)
    enrollment_date: Optional[date] = None


class ChildUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    room_name: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = None


class ChildListResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    date_of_birth: date
    gender: GenderEnum
    room_name: Optional[str] = None
    status: Optional[str] = None
    photo_url: Optional[str] = None
    enrollment_date: date
    created_at: datetime

    class Config:
        from_attributes = True


class ChildResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    date_of_birth: date
    gender: GenderEnum
    room_name: Optional[str] = None
    status: Optional[str] = None
    photo_url: Optional[str] = None
    enrollment_date: date
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Pagination ───────────────────────────────────────────────────────────────

class PaginationResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
