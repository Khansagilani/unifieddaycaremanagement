from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import date, datetime, time, timedelta
from typing import Optional, List, Tuple
from app.models.base import Child, Room
from app.models.daily_log import Attendance
from app.models.child import (
    HealthProfile, Medication, MedicationLog, Vaccination, IncidentReport
)
from app.models.daily_log import (
    DailyLog, NapRecord, ActivityLog, MealLog, DiaperLog, PottyLog
)
from app.schemas.health_and_daily import (
    HealthProfileCreate, MedicationCreate, MedicationLogCreate, VaccinationCreate,
    IncidentReportCreate, DailyLogCreate, NapRecordCreate, ActivityLogCreate,
    MealLogCreate, DiaperLogCreate, PottyLogCreate, AttendanceCreateRequest,
    CheckInRequest, CheckOutRequest
)


class HealthService:

    # Health Profile
    @staticmethod
    def get_or_create_health_profile(db: Session, child_id: int, center_id: int) -> Optional[HealthProfile]:
        """Get or create health profile"""
        child = db.query(Child).join(Room).filter(
            and_(Child.id == child_id, Room.center_id == center_id)
        ).first()
        if not child:
            return None

        profile = db.query(HealthProfile).filter_by(child_id=child_id).first()
        if not profile:
            profile = HealthProfile(child_id=child_id)
            db.add(profile)
            db.commit()
            db.refresh(profile)

        return profile

    @staticmethod
    def update_health_profile(db: Session, child_id: int, center_id: int, health_data: HealthProfileCreate) -> Optional[HealthProfile]:
        """Update health profile"""
        profile = HealthService.get_or_create_health_profile(
            db, child_id, center_id)
        if not profile:
            return None

        profile.blood_type = health_data.blood_type
        profile.primary_doctor_name = health_data.primary_doctor_name
        profile.primary_doctor_phone = health_data.primary_doctor_phone
        profile.pediatrician_name = health_data.pediatrician_name
        profile.pediatrician_phone = health_data.pediatrician_phone
        profile.medical_conditions = health_data.medical_conditions
        profile.surgical_history = health_data.surgical_history
        profile.immunization_record = health_data.immunization_record

        db.commit()
        db.refresh(profile)
        return profile

    # Medications
    @staticmethod
    def add_medication(db: Session, child_id: int, center_id: int, med_data: MedicationCreate) -> Optional[Medication]:
        """Add medication"""
        child = db.query(Child).join(Room).filter(
            and_(Child.id == child_id, Room.center_id == center_id)
        ).first()
        if not child:
            return None

        medication = Medication(
            child_id=child_id,
            name=med_data.name,
            dosage=med_data.dosage,
            frequency=med_data.frequency,
            purpose=med_data.purpose,
            start_date=med_data.start_date,
            end_date=med_data.end_date,
            instructions=med_data.instructions,
            is_active=med_data.is_active
        )
        db.add(medication)
        db.commit()
        db.refresh(medication)
        return medication

    @staticmethod
    def get_medications(db: Session, child_id: int, center_id: int, active_only: bool = False) -> List[Medication]:
        """Get medications for child"""
        child = db.query(Child).join(Room).filter(
            and_(Child.id == child_id, Room.center_id == center_id)
        ).first()
        if not child:
            return []

        query = db.query(Medication).filter_by(child_id=child_id)
        if active_only:
            query = query.filter_by(is_active=True)

        return query.all()

    @staticmethod
    def log_medication(db: Session, child_id: int, center_id: int, log_data: MedicationLogCreate) -> Optional[MedicationLog]:
        """Log medication administration"""
        child = db.query(Child).join(Room).filter(
            and_(Child.id == child_id, Room.center_id == center_id)
        ).first()
        if not child:
            return None

        med_log = MedicationLog(
            medication_id=log_data.medication_id,
            child_id=child_id,
            administered_by_staff_id=log_data.administered_by_staff_id,
            time_administered=log_data.time_administered,
            notes=log_data.notes
        )
        db.add(med_log)
        db.commit()
        db.refresh(med_log)
        return med_log

    # Vaccinations
    @staticmethod
    def add_vaccination(db: Session, child_id: int, center_id: int, vax_data: VaccinationCreate) -> Optional[Vaccination]:
        """Add vaccination"""
        child = db.query(Child).join(Room).filter(
            and_(Child.id == child_id, Room.center_id == center_id)
        ).first()
        if not child:
            return None

        vaccination = Vaccination(
            child_id=child_id,
            vaccine_name=vax_data.vaccine_name,
            scheduled_date=vax_data.scheduled_date,
            status=vax_data.status,
            administered_date=vax_data.administered_date,
            location=vax_data.location,
            notes=vax_data.notes
        )
        db.add(vaccination)
        db.commit()
        db.refresh(vaccination)
        return vaccination

    @staticmethod
    def get_vaccinations(db: Session, child_id: int, center_id: int) -> List[Vaccination]:
        """Get vaccinations for child"""
        child = db.query(Child).join(Room).filter(
            and_(Child.id == child_id, Room.center_id == center_id)
        ).first()
        if not child:
            return []

        return db.query(Vaccination).filter_by(child_id=child_id).all()

    # Incident Reports
    @staticmethod
    def create_incident_report(db: Session, child_id: int, center_id: int, incident_data: IncidentReportCreate) -> Optional[IncidentReport]:
        """Create incident report"""
        child = db.query(Child).join(Room).filter(
            and_(Child.id == child_id, Room.center_id == center_id)
        ).first()
        if not child:
            return None

        incident = IncidentReport(
            child_id=child_id,
            incident_type=incident_data.incident_type,
            severity=incident_data.severity,
            date_time=incident_data.date_time,
            description=incident_data.description,
            location=incident_data.location,
            witnesses=incident_data.witnesses,
            actions_taken=incident_data.actions_taken,
            parent_notified=incident_data.parent_notified,
            staff_id=incident_data.staff_id,
            injury_description=incident_data.injury_description,
            medical_treatment_needed=incident_data.medical_treatment_needed,
            parent_signature_obtained=incident_data.parent_signature_obtained
        )
        db.add(incident)
        db.commit()
        db.refresh(incident)
        return incident

    @staticmethod
    def get_incident_reports(db: Session, child_id: int, center_id: int) -> List[IncidentReport]:
        """Get incident reports for child"""
        child = db.query(Child).join(Room).filter(
            and_(Child.id == child_id, Room.center_id == center_id)
        ).first()
        if not child:
            return []

        return db.query(IncidentReport).filter_by(child_id=child_id).order_by(IncidentReport.date_time.desc()).all()


class DailyLogService:

    @staticmethod
    def get_or_create_daily_log(db: Session, child_id: int, center_id: int, staff_id: int, log_date: date) -> Optional[DailyLog]:
        """Get or create daily log for child on date"""
        child = db.query(Child).join(Room).filter(
            and_(Child.id == child_id, Room.center_id == center_id)
        ).first()
        if not child:
            return None

        daily_log = db.query(DailyLog).filter_by(
            child_id=child_id, log_date=log_date).first()
        if not daily_log:
            daily_log = DailyLog(
                child_id=child_id,
                staff_id=staff_id,
                log_date=log_date
            )
            db.add(daily_log)
            db.commit()
            db.refresh(daily_log)

        return daily_log

    @staticmethod
    def update_daily_log(db: Session, child_id: int, center_id: int, log_date: date, log_data: DailyLogCreate) -> Optional[DailyLog]:
        """Update daily log"""
        daily_log = db.query(DailyLog).filter_by(
            child_id=child_id, log_date=log_date).first()
        if not daily_log:
            return None

        daily_log.overall_mood = log_data.overall_mood
        daily_log.behavior = log_data.behavior
        daily_log.weather = log_data.weather
        daily_log.notes = log_data.notes

        db.commit()
        db.refresh(daily_log)
        return daily_log

    @staticmethod
    def add_nap_record(db: Session, child_id: int, center_id: int, log_date: date, staff_id: int, nap_data: NapRecordCreate) -> Optional[NapRecord]:
        """Add nap record"""
        daily_log = DailyLogService.get_or_create_daily_log(
            db, child_id, center_id, staff_id, log_date)
        if not daily_log:
            return None

        nap = NapRecord(
            daily_log_id=daily_log.id,
            start_time=nap_data.start_time,
            end_time=nap_data.end_time,
            quality=nap_data.quality,
            notes=nap_data.notes
        )
        db.add(nap)
        db.commit()
        db.refresh(nap)
        return nap

    @staticmethod
    def add_activity_log(db: Session, child_id: int, center_id: int, log_date: date, staff_id: int, activity_data: ActivityLogCreate) -> Optional[ActivityLog]:
        """Add activity log"""
        daily_log = DailyLogService.get_or_create_daily_log(
            db, child_id, center_id, staff_id, log_date)
        if not daily_log:
            return None

        activity = ActivityLog(
            daily_log_id=daily_log.id,
            activity_type=activity_data.activity_type,
            start_time=activity_data.start_time,
            end_time=activity_data.end_time,
            description=activity_data.description,
            participation_level=activity_data.participation_level,
            notes=activity_data.notes
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity

    @staticmethod
    def add_meal_log(db: Session, child_id: int, center_id: int, log_date: date, staff_id: int, meal_data: MealLogCreate) -> Optional[MealLog]:
        """Add meal log"""
        daily_log = DailyLogService.get_or_create_daily_log(
            db, child_id, center_id, staff_id, log_date)
        if not daily_log:
            return None

        meal = MealLog(
            daily_log_id=daily_log.id,
            meal_type=meal_data.meal_type,
            time=meal_data.time,
            description=meal_data.description,
            amount_consumed=meal_data.amount_consumed,
            appetite=meal_data.appetite,
            notes=meal_data.notes
        )
        db.add(meal)
        db.commit()
        db.refresh(meal)
        return meal

    @staticmethod
    def add_diaper_log(db: Session, child_id: int, center_id: int, log_date: date, staff_id: int, diaper_data: DiaperLogCreate) -> Optional[DiaperLog]:
        """Add diaper log"""
        daily_log = DailyLogService.get_or_create_daily_log(
            db, child_id, center_id, staff_id, log_date)
        if not daily_log:
            return None

        diaper = DiaperLog(
            daily_log_id=daily_log.id,
            time=diaper_data.time,
            diaper_type=diaper_data.diaper_type,
            contents=diaper_data.contents,
            notes=diaper_data.notes
        )
        db.add(diaper)
        db.commit()
        db.refresh(diaper)
        return diaper

    @staticmethod
    def add_potty_log(db: Session, child_id: int, center_id: int, log_date: date, staff_id: int, potty_data: PottyLogCreate) -> Optional[PottyLog]:
        """Add potty log"""
        daily_log = DailyLogService.get_or_create_daily_log(
            db, child_id, center_id, staff_id, log_date)
        if not daily_log:
            return None

        potty = PottyLog(
            daily_log_id=daily_log.id,
            time=potty_data.time,
            result_type=potty_data.result_type,
            success=potty_data.success,
            accidents=potty_data.accidents,
            notes=potty_data.notes
        )
        db.add(potty)
        db.commit()
        db.refresh(potty)
        return potty

    @staticmethod
    def get_daily_logs(db: Session, child_id: int, center_id: int, start_date: date, end_date: date) -> List[DailyLog]:
        """Get daily logs for date range"""
        child = db.query(Child).join(Room).filter(
            and_(Child.id == child_id, Room.center_id == center_id)
        ).first()
        if not child:
            return []

        return db.query(DailyLog).filter(
            and_(
                DailyLog.child_id == child_id,
                DailyLog.log_date >= start_date,
                DailyLog.log_date <= end_date
            )
        ).order_by(DailyLog.log_date.desc()).all()

    @staticmethod
    def get_daily_log(db: Session, child_id: int, center_id: int, log_date: date) -> Optional[DailyLog]:
        """Get daily log for specific date"""
        child = db.query(Child).join(Room).filter(
            and_(Child.id == child_id, Room.center_id == center_id)
        ).first()
        if not child:
            return None

        return db.query(DailyLog).filter_by(child_id=child_id, log_date=log_date).first()


class AttendanceService:

    @staticmethod
    def check_in(db: Session, child_id: int, center_id: int, check_in_data: CheckInRequest, staff_id: int) -> Optional[Attendance]:
        """Check in child"""
        child = db.query(Child).join(Room).filter(
            and_(Child.id == child_id, Room.center_id == center_id)
        ).first()
        if not child:
            return None

        today = date.today()
        attendance = db.query(Attendance).filter_by(
            child_id=child_id,
            check_in_date=today
        ).first()

        if not attendance:
            attendance = Attendance(
                child_id=child_id,
                check_in_date=today,
                check_in_time=datetime.now(),
                check_in_method=check_in_data.check_in_method,
                notes=check_in_data.notes
            )
            db.add(attendance)
        else:
            attendance.check_in_time = datetime.now()
            attendance.check_in_method = check_in_data.check_in_method

        db.commit()
        db.refresh(attendance)
        return attendance

    @staticmethod
    def check_out(db: Session, child_id: int, center_id: int, check_out_data: CheckOutRequest) -> Optional[Attendance]:
        """Check out child"""
        child = db.query(Child).join(Room).filter(
            and_(Child.id == child_id, Room.center_id == center_id)
        ).first()
        if not child:
            return None

        today = date.today()
        attendance = db.query(Attendance).filter_by(
            child_id=child_id,
            check_in_date=today
        ).first()

        if not attendance:
            return None

        attendance.check_out_time = datetime.now()
        attendance.check_out_method = check_out_data.check_out_method
        attendance.pickup_person = check_out_data.pickup_person

        db.commit()
        db.refresh(attendance)
        return attendance

    @staticmethod
    def get_attendance(db: Session, child_id: int, center_id: int, start_date: date, end_date: date) -> List[Attendance]:
        """Get attendance for date range"""
        child = db.query(Child).join(Room).filter(
            and_(Child.id == child_id, Room.center_id == center_id)
        ).first()
        if not child:
            return []

        return db.query(Attendance).filter(
            and_(
                Attendance.child_id == child_id,
                Attendance.check_in_date >= start_date,
                Attendance.check_in_date <= end_date
            )
        ).order_by(Attendance.check_in_date.desc()).all()

    @staticmethod
    def get_today_attendance(db: Session, child_id: int, center_id: int) -> Optional[Attendance]:
        """Get today's attendance"""
        today = date.today()
        child = db.query(Child).join(Room).filter(
            and_(Child.id == child_id, Room.center_id == center_id)
        ).first()
        if not child:
            return None

        return db.query(Attendance).filter_by(
            child_id=child_id,
            check_in_date=today
        ).first()
