from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import Optional
from app.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User
from app.services.health_and_daily_service import HealthService, DailyLogService, AttendanceService
from app.schemas.health_and_daily import (
    HealthProfileCreate, HealthProfileResponse, MedicationCreate, MedicationResponse,
    MedicationLogCreate, MedicationLogResponse, VaccinationCreate, VaccinationResponse,
    IncidentReportCreate, IncidentReportResponse, DailyLogCreate, DailyLogResponse,
    DailyLogDetailResponse, NapRecordCreate, NapRecordResponse, ActivityLogCreate,
    ActivityLogResponse, MealLogCreate, MealLogResponse, DiaperLogCreate, DiaperLogResponse,
    PottyLogCreate, PottyLogResponse, AttendanceResponse, CheckInRequest, CheckOutRequest
)
from app.utils.response import success_response, error_response

router = APIRouter(prefix="/api/health", tags=["health"])

# Health profile


@router.put("/{child_id}/profile", response_model=dict)
def update_health_profile(
    child_id: int,
    health_data: HealthProfileCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    profile = HealthService.update_health_profile(
        db, child_id, current_user.center_id, health_data)
    if not profile:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    return success_response(HealthProfileResponse.from_orm(profile), "Health profile updated")


@router.get("/{child_id}/profile", response_model=dict)
def get_health_profile(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = HealthService.get_or_create_health_profile(
        db, child_id, current_user.center_id)
    if not profile:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    return success_response(HealthProfileResponse.from_orm(profile))

# Medications


@router.post("/{child_id}/medications", response_model=dict)
def add_medication(
    child_id: int,
    med_data: MedicationCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    medication = HealthService.add_medication(
        db, child_id, current_user.center_id, med_data)
    if not medication:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    return success_response(MedicationResponse.from_orm(medication), "Medication added")


@router.get("/{child_id}/medications", response_model=dict)
def get_medications(
    child_id: int,
    active: Optional[bool] = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    medications = HealthService.get_medications(
        db, child_id, current_user.center_id, active)
    return success_response([MedicationResponse.from_orm(m) for m in medications])


@router.post("/{child_id}/medications/logs", response_model=dict)
def log_medication(
    child_id: int,
    med_log_data: MedicationLogCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    medication_log = HealthService.log_medication(
        db, child_id, current_user.center_id, med_log_data)
    if not medication_log:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    return success_response(MedicationLogResponse.from_orm(medication_log), "Medication logged")

# Vaccinations


@router.post("/{child_id}/vaccinations", response_model=dict)
def add_vaccination(
    child_id: int,
    vax_data: VaccinationCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    vaccination = HealthService.add_vaccination(
        db, child_id, current_user.center_id, vax_data)
    if not vaccination:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    return success_response(VaccinationResponse.from_orm(vaccination), "Vaccination added")


@router.get("/{child_id}/vaccinations", response_model=dict)
def get_vaccinations(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vaccinations = HealthService.get_vaccinations(
        db, child_id, current_user.center_id)
    return success_response([VaccinationResponse.from_orm(v) for v in vaccinations])

# Incident reports


@router.post("/{child_id}/incidents", response_model=dict)
def create_incident(
    child_id: int,
    incident_data: IncidentReportCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    incident = HealthService.create_incident_report(
        db, child_id, current_user.center_id, incident_data)
    if not incident:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    return success_response(IncidentReportResponse.from_orm(incident), "Incident created")


@router.get("/{child_id}/incidents", response_model=dict)
def get_incidents(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incidents = HealthService.get_incident_reports(
        db, child_id, current_user.center_id)
    return success_response([IncidentReportResponse.from_orm(i) for i in incidents])

# Daily logs


@router.post("/daily-logs", response_model=dict)
def create_daily_log(
    log_data: DailyLogCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    daily_log = DailyLogService.get_or_create_daily_log(
        db, log_data.child_id, current_user.center_id, current_user.id, log_data.log_date)
    if not daily_log:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    return success_response(DailyLogResponse.from_orm(daily_log), "Daily log created")


@router.put("/daily-logs/{child_id}/{log_date}", response_model=dict)
def update_daily_log(
    child_id: int,
    log_date: date,
    log_data: DailyLogCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    daily_log = DailyLogService.update_daily_log(
        db, child_id, current_user.center_id, log_date, log_data)
    if not daily_log:
        return error_response("DAILY_LOG_NOT_FOUND", "Daily log not found")
    return success_response(DailyLogResponse.from_orm(daily_log), "Daily log updated")


@router.get("/daily-logs/{child_id}", response_model=dict)
def get_daily_logs(
    child_id: int,
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    daily_logs = DailyLogService.get_daily_logs(
        db, child_id, current_user.center_id, start_date, end_date)
    return success_response([DailyLogResponse.from_orm(dl) for dl in daily_logs])


@router.get("/daily-logs/{child_id}/{log_date}", response_model=dict)
def get_daily_log(
    child_id: int,
    log_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    daily_log = DailyLogService.get_daily_log(
        db, child_id, current_user.center_id, log_date)
    if not daily_log:
        return error_response("DAILY_LOG_NOT_FOUND", "Daily log not found")
    return success_response(DailyLogDetailResponse.from_orm(daily_log))

# Nap records


@router.post("/daily-logs/{child_id}/{log_date}/naps", response_model=dict)
def add_nap_record(
    child_id: int,
    log_date: date,
    nap_data: NapRecordCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    nap = DailyLogService.add_nap_record(
        db, child_id, current_user.center_id, log_date, current_user.id, nap_data)
    if not nap:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    return success_response(NapRecordResponse.from_orm(nap), "Nap record added")

# Activity logs


@router.post("/daily-logs/{child_id}/{log_date}/activities", response_model=dict)
def add_activity_log(
    child_id: int,
    log_date: date,
    activity_data: ActivityLogCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    activity = DailyLogService.add_activity_log(
        db, child_id, current_user.center_id, log_date, current_user.id, activity_data)
    if not activity:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    return success_response(ActivityLogResponse.from_orm(activity), "Activity log added")

# Meal logs


@router.post("/daily-logs/{child_id}/{log_date}/meals", response_model=dict)
def add_meal_log(
    child_id: int,
    log_date: date,
    meal_data: MealLogCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    meal = DailyLogService.add_meal_log(
        db, child_id, current_user.center_id, log_date, current_user.id, meal_data)
    if not meal:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    return success_response(MealLogResponse.from_orm(meal), "Meal log added")

# Diaper logs


@router.post("/daily-logs/{child_id}/{log_date}/diapers", response_model=dict)
def add_diaper_log(
    child_id: int,
    log_date: date,
    diaper_data: DiaperLogCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    diaper = DailyLogService.add_diaper_log(
        db, child_id, current_user.center_id, log_date, current_user.id, diaper_data)
    if not diaper:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    return success_response(DiaperLogResponse.from_orm(diaper), "Diaper log added")

# Potty logs


@router.post("/daily-logs/{child_id}/{log_date}/potty", response_model=dict)
def add_potty_log(
    child_id: int,
    log_date: date,
    potty_data: PottyLogCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    potty = DailyLogService.add_potty_log(
        db, child_id, current_user.center_id, log_date, current_user.id, potty_data)
    if not potty:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    return success_response(PottyLogResponse.from_orm(potty), "Potty log added")

# Attendance


@router.post("/attendance/check-in", response_model=dict)
def check_in(
    checkin_data: CheckInRequest,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    attendance = AttendanceService.check_in(
        db, checkin_data.child_id, current_user.center_id, checkin_data, current_user.id)
    if not attendance:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    return success_response(AttendanceResponse.from_orm(attendance), "Checked in successfully")


@router.post("/attendance/check-out", response_model=dict)
def check_out(
    checkout_data: CheckOutRequest,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    attendance = AttendanceService.check_out(
        db, checkout_data.child_id, current_user.center_id, checkout_data)
    if not attendance:
        return error_response("ATTENDANCE_NOT_FOUND", "Attendance record not found")
    return success_response(AttendanceResponse.from_orm(attendance), "Checked out successfully")


@router.get("/attendance/{child_id}", response_model=dict)
def get_attendance(
    child_id: int,
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attendance = AttendanceService.get_attendance(
        db, child_id, current_user.center_id, start_date, end_date)
    return success_response([AttendanceResponse.from_orm(a) for a in attendance])


@router.get("/attendance/{child_id}/today", response_model=dict)
def get_today_attendance(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attendance = AttendanceService.get_today_attendance(
        db, child_id, current_user.center_id)
    if not attendance:
        return success_response(None, "No attendance for today")
    return success_response(AttendanceResponse.from_orm(attendance))
