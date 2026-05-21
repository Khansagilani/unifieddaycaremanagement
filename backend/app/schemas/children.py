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


class AllergySeverityEnum(str, Enum):
    MILD = "MILD"
    MODERATE = "MODERATE"
    SEVERE = "SEVERE"
    ANAPHYLACTIC = "ANAPHYLACTIC"


class FearCategoryEnum(str, Enum):
    ANIMALS = "ANIMALS"
    WEATHER = "WEATHER"
    SEPARATION = "SEPARATION"
    HEIGHTS = "HEIGHTS"
    DARK = "DARK"
    CROWDS = "CROWDS"
    NEEDLES = "NEEDLES"
    OTHER = "OTHER"


class DevelopmentStageEnum(str, Enum):
    NOT_YET = "NOT_YET"
    IN_PROGRESS = "IN_PROGRESS"
    ACHIEVED = "ACHIEVED"

# Request/Response Models


class AuthorizedPickupCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    relationship: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    notes: Optional[str] = None


class AuthorizedPickupResponse(AuthorizedPickupCreate):
    id: UUID
    child_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class EmergencyContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    relationship: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    is_primary: bool = False


class EmergencyContactResponse(EmergencyContactCreate):
    id: UUID
    child_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class AllergyCreate(BaseModel):
    allergen: str = Field(..., min_length=1, max_length=100)
    severity: AllergySeverityEnum
    symptoms: Optional[str] = None
    reaction_history: Optional[str] = None
    treatment: Optional[str] = None


class AllergyResponse(AllergyCreate):
    id: UUID
    child_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ChildFearCreate(BaseModel):
    category: FearCategoryEnum
    description: str = Field(..., min_length=1, max_length=500)
    trigger: Optional[str] = None
    coping_strategy: Optional[str] = None
    comfort_object: Optional[str] = None


class ChildFearResponse(ChildFearCreate):
    id: UUID
    child_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ChildInterestCreate(BaseModel):
    interest: str = Field(..., min_length=1, max_length=200)
    activity_type: Optional[str] = None
    skill_level: Optional[str] = None


class ChildInterestResponse(ChildInterestCreate):
    id: UUID
    child_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ChildRoutineCreate(BaseModel):
    routine_name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    time_of_day: Optional[str] = None
    notes: Optional[str] = None


class ChildRoutineResponse(ChildRoutineCreate):
    id: UUID
    child_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ChildPersonalityCreate(BaseModel):
    temperament: Optional[str] = Field(None, max_length=200)
    communication_style: Optional[str] = Field(None, max_length=200)
    social_skills: Optional[str] = None
    strengths: Optional[str] = None
    comfort_objects: Optional[str] = None
    preferred_activities: Optional[str] = None


class ChildPersonalityResponse(ChildPersonalityCreate):
    id: UUID
    child_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ChildDevelopmentCreate(BaseModel):
    age_in_months: int = Field(..., ge=0, le=120)
    walking_stage: DevelopmentStageEnum = DevelopmentStageEnum.NOT_YET
    talking_stage: DevelopmentStageEnum = DevelopmentStageEnum.NOT_YET
    eating_stage: DevelopmentStageEnum = DevelopmentStageEnum.NOT_YET
    toileting_stage: DevelopmentStageEnum = DevelopmentStageEnum.NOT_YET
    notes: Optional[str] = None


class ChildDevelopmentResponse(ChildDevelopmentCreate):
    id: UUID
    child_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ChildFoodProfileCreate(BaseModel):
    foods_liked: Optional[str] = None
    foods_disliked: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    feeding_method: Optional[str] = Field(None, max_length=100)
    bottle_preference: Optional[str] = None
    special_meals_provided: Optional[bool] = False


class ChildFoodProfileResponse(ChildFoodProfileCreate):
    id: UUID
    child_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class EmotionalSupportPlanCreate(BaseModel):
    triggers: Optional[str] = None
    de_escalation_techniques: Optional[str] = None
    support_strategies: Optional[str] = None
    reward_preferences: Optional[str] = None
    staff_notes: Optional[str] = None


class EmotionalSupportPlanResponse(EmotionalSupportPlanCreate):
    id: UUID
    child_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ChildProfileResponse(BaseModel):
    """Complete child profile with all sub-resources"""
    id: UUID
    first_name: str
    last_name: str
    date_of_birth: date
    gender: GenderEnum
    room_name: Optional[str] = None
    status: str
    photo_url: Optional[str]
    enrollment_date: date

    # Sub-resources
    personality: Optional[ChildPersonalityResponse] = None
    food_profile: Optional[ChildFoodProfileResponse] = None
    development: Optional[ChildDevelopmentResponse] = None
    emotional_support_plan: Optional[EmotionalSupportPlanResponse] = None
    allergies: List[AllergyResponse] = []
    fears: List[ChildFearResponse] = []
    interests: List[ChildInterestResponse] = []
    routines: List[ChildRoutineResponse] = []
    authorized_pickups: List[AuthorizedPickupResponse] = []
    emergency_contacts: List[EmergencyContactResponse] = []

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


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
    status: str
    photo_url: Optional[str]
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
    status: str
    photo_url: Optional[str]
    enrollment_date: date
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
