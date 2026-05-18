from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date, time
from enum import Enum

# Enums
class VaccineStatusEnum(str, Enum):
    DUE = "DUE"
    COMPLETED = "COMPLETED"
    OVERDUE = "OVERDUE"

class MedicationFrequencyEnum(str, Enum):
    ONCE_DAILY = "ONCE_DAILY"
    TWICE_DAILY = "TWICE_DAILY"
    THREE_TIMES_DAILY = "THREE_TIMES_DAILY"
    FOUR_TIMES_DAILY = "FOUR_TIMES_DAILY"
    AS_NEEDED = "AS_NEEDED"

class IncidentSeverityEnum(str, Enum):
    MINOR = "MINOR"
    MODERATE = "MODERATE"
    SEVERE = "SEVERE"

class CheckinMethodEnum(str, Enum):
    QR_CODE = "QR_CODE"
    PIN = "PIN"
    MANUAL = "MANUAL"

class ActivityTypeEnum(str, Enum):
    OUTDOOR_PLAY = "OUTDOOR_PLAY"
    INDOOR_PLAY = "INDOOR_PLAY"
    LEARNING = "LEARNING"
    ARTS_CRAFTS = "ARTS_CRAFTS"
    MUSIC = "MUSIC"
    STORY_TIME = "STORY_TIME"
    SPORTS = "SPORTS"
    FREE_PLAY = "FREE_PLAY"

# Health Models
class HealthProfileCreate(BaseModel):
    blood_type: Optional[str] = Field(None, max_length=10)
    primary_doctor_name: Optional[str] = None
    primary_doctor_phone: Optional[str] = None
    pediatrician_name: Optional[str] = None
    pediatrician_phone: Optional[str] = None
    medical_conditions: Optional[str] = None
    surgical_history: Optional[str] = None
    immunization_record: Optional[str] = None

class HealthProfileResponse(HealthProfileCreate):
    id: int
    child_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class MedicationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    dosage: str = Field(..., min_length=1, max_length=100)
    frequency: MedicationFrequencyEnum
    purpose: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    instructions: Optional[str] = None
    is_active: bool = True

class MedicationResponse(MedicationCreate):
    id: int
    child_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class MedicationLogCreate(BaseModel):
    medication_id: int
    administered_by_staff_id: int
    time_administered: datetime
    notes: Optional[str] = None

class MedicationLogResponse(MedicationLogCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class VaccinationCreate(BaseModel):
    vaccine_name: str = Field(..., min_length=1, max_length=200)
    scheduled_date: date
    status: VaccineStatusEnum = VaccineStatusEnum.DUE
    administered_date: Optional[date] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class VaccinationResponse(VaccinationCreate):
    id: int
    child_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class IncidentReportCreate(BaseModel):
    incident_type: str = Field(..., min_length=1, max_length=100)
    severity: IncidentSeverityEnum
    date_time: datetime
    description: str = Field(..., min_length=10, max_length=1000)
    location: Optional[str] = None
    witnesses: Optional[str] = None
    actions_taken: Optional[str] = None
    parent_notified: bool = False
    staff_id: int
    injury_description: Optional[str] = None
    medical_treatment_needed: bool = False
    parent_signature_obtained: bool = False

class IncidentReportResponse(IncidentReportCreate):
    id: int
    child_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Daily Log Models
class NapRecordCreate(BaseModel):
    start_time: time
    end_time: time
    quality: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None

class NapRecordResponse(NapRecordCreate):
    id: int
    daily_log_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ActivityLogCreate(BaseModel):
    activity_type: ActivityTypeEnum
    start_time: time
    end_time: time
    description: Optional[str] = None
    participation_level: Optional[str] = None
    notes: Optional[str] = None

class ActivityLogResponse(ActivityLogCreate):
    id: int
    daily_log_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class MealLogCreate(BaseModel):
    meal_type: str = Field(..., min_length=1, max_length=50)
    time: time
    description: Optional[str] = None
    amount_consumed: Optional[str] = None
    appetite: Optional[str] = None
    notes: Optional[str] = None

class MealLogResponse(MealLogCreate):
    id: int
    daily_log_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class DiaperLogCreate(BaseModel):
    time: time
    diaper_type: str = Field(..., min_length=1, max_length=50)
    contents: str = Field(..., min_length=1, max_length=50)
    notes: Optional[str] = None

class DiaperLogResponse(DiaperLogCreate):
    id: int
    daily_log_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PottyLogCreate(BaseModel):
    time: time
    result_type: str = Field(..., min_length=1, max_length=50)
    success: bool
    accidents: int = 0
    notes: Optional[str] = None

class PottyLogResponse(PottyLogCreate):
    id: int
    daily_log_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class DailyLogCreate(BaseModel):
    child_id: int
    log_date: date
    overall_mood: Optional[str] = Field(None, max_length=100)
    behavior: Optional[str] = None
    weather: Optional[str] = None
    notes: Optional[str] = None

class DailyLogResponse(DailyLogCreate):
    id: int
    staff_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DailyLogDetailResponse(BaseModel):
    """Complete daily log with all sub-entries"""
    id: int
    child_id: int
    staff_id: int
    log_date: date
    overall_mood: Optional[str]
    behavior: Optional[str]
    weather: Optional[str]
    notes: Optional[str]
    
    naps: List[NapRecordResponse] = []
    activities: List[ActivityLogResponse] = []
    meals: List[MealLogResponse] = []
    diapers: List[DiaperLogResponse] = []
    potty: List[PottyLogResponse] = []
    
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Attendance Models
class AttendanceCreateRequest(BaseModel):
    child_id: int
    check_in_method: CheckinMethodEnum
    check_in_time: Optional[datetime] = None
    check_out_method: Optional[CheckinMethodEnum] = None
    check_out_time: Optional[datetime] = None
    pickup_person: Optional[str] = None
    notes: Optional[str] = None

class AttendanceResponse(BaseModel):
    id: int
    child_id: int
    check_in_date: date
    check_in_time: Optional[datetime]
    check_in_method: CheckinMethodEnum
    check_out_time: Optional[datetime]
    check_out_method: Optional[CheckinMethodEnum]
    pickup_person: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class AttendanceSummaryResponse(BaseModel):
    """Attendance summary for a date range"""
    child_id: int
    present_days: int
    absent_days: int
    half_days: int
    total_hours: float
    attendance_rate: float

class CheckInRequest(BaseModel):
    child_id: int
    check_in_method: CheckinMethodEnum
    notes: Optional[str] = None

class CheckOutRequest(BaseModel):
    child_id: int
    check_out_method: CheckinMethodEnum
    pickup_person: Optional[str] = None
    notes: Optional[str] = None
