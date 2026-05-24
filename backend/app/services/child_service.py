from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import date
import datetime
from typing import Optional, List
from uuid import UUID
from app.models.base import Child, AuthorizedPickup, EmergencyContact, ParentChild
from app.models.child import (
    Allergy, ChildFoodProfile
)
from app.models.child_profile import (
    ChildPersonality, ChildFear, ChildInterest,
    ChildRoutine, ChildDevelopment, EmotionalSupportPlan
)
from app.schemas.children import (
    ChildCreate, ChildUpdate, AuthorizedPickupCreate, EmergencyContactCreate,
    AllergyCreate, ChildFearCreate, ChildInterestCreate, ChildRoutineCreate,
    ChildPersonalityCreate, ChildFoodProfileCreate, ChildDevelopmentCreate,
    EmotionalSupportPlanCreate
)


def _apply_schema(orm_obj, schema_obj):
    """Set ORM object fields from Pydantic schema, skipping fields that don't exist on the model."""
    data = schema_obj.model_dump(exclude_unset=True) if hasattr(schema_obj, 'model_dump') else schema_obj.dict(exclude_unset=True)
    for field, value in data.items():
        if hasattr(orm_obj, field):
            if value == "":
                value = None
            setattr(orm_obj, field, value)


class ChildService:

    @staticmethod
    def _generate_registration_number(db: Session, center_id: UUID) -> str:
        year = datetime.date.today().year
        prefix = f"NC-{year}-"
        existing = db.query(Child).filter(
            Child.center_id == center_id,
            Child.registration_number.like(f"{prefix}%")
        ).count()
        # Keep incrementing until we find a unique number
        sequence = existing + 1
        while True:
            candidate = f"{prefix}{str(sequence).zfill(5)}"
            conflict = db.query(Child).filter(Child.registration_number == candidate).first()
            if not conflict:
                return candidate
            sequence += 1

    @staticmethod
    def get_children(
        db: Session,
        center_id: UUID,
        room_name: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[Child], int]:
        """Get children for center with optional filters"""
        query = db.query(Child).filter(Child.center_id == center_id)

        if room_name:
            query = query.filter(Child.room_name == room_name)
        if status:
            query = query.filter(Child.status == status)

        total = query.count()
        children = query.offset(skip).limit(limit).all()
        return children, total

    @staticmethod
    def get_child_by_id(db: Session, child_id: UUID, center_id: UUID) -> Optional[Child]:
        """Get child by ID with center isolation"""
        return db.query(Child).filter(
            and_(Child.id == child_id, Child.center_id == center_id)
        ).first()

    @staticmethod
    def create_child(db: Session, center_id: UUID, child_data: ChildCreate) -> Child:
        """Create new child"""
        reg_number = child_data.registration_number
        if not reg_number:
            reg_number = ChildService._generate_registration_number(db, center_id)

        child = Child(
            center_id=center_id,
            first_name=child_data.first_name,
            last_name=child_data.last_name,
            date_of_birth=child_data.date_of_birth,
            gender=child_data.gender,
            room_name=child_data.room_name,
            status="ACTIVE",
            enrollment_date=child_data.enrollment_date or date.today(),
            registration_number=reg_number,
            photo_url=child_data.photo_url,
        )
        db.add(child)
        db.flush()

        # Create related records if needed
        if not db.query(ChildPersonality).filter_by(child_id=child.id).first():
            personality = ChildPersonality(child_id=child.id)
            db.add(personality)

        db.commit()
        db.refresh(child)
        return child

    @staticmethod
    def update_child(db: Session, child_id: UUID, center_id: UUID, child_data: ChildUpdate) -> Optional[Child]:
        """Update child information"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        if child_data.first_name:
            child.first_name = child_data.first_name
        if child_data.last_name:
            child.last_name = child_data.last_name
        if child_data.room_name:
            child.room_name = child_data.room_name
        if child_data.status:
            child.status = child_data.status

        db.commit()
        db.refresh(child)
        return child

    @staticmethod
    def delete_child(db: Session, child_id: UUID, center_id: UUID) -> bool:
        """Soft delete child by changing status"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return False

        child.status = "INACTIVE"
        db.commit()
        return True

    # Authorized Pickups
    @staticmethod
    def add_authorized_pickup(db: Session, child_id: UUID, center_id: UUID, pickup_data: AuthorizedPickupCreate) -> Optional[AuthorizedPickup]:
        """Add authorized pickup person"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        pickup = AuthorizedPickup(
            child_id=child_id,
            full_name=pickup_data.full_name,
            phone=pickup_data.phone,
            link_type=pickup_data.link_type,
            id_type=pickup_data.id_type,
            id_number=pickup_data.id_number,
            is_active=pickup_data.is_active if pickup_data.is_active is not None else True,
        )
        db.add(pickup)
        db.commit()
        db.refresh(pickup)
        return pickup

    @staticmethod
    def get_authorized_pickups(db: Session, child_id: UUID, center_id: UUID) -> List[AuthorizedPickup]:
        """Get authorized pickups for child"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return []

        return db.query(AuthorizedPickup).filter_by(child_id=child_id).all()

    @staticmethod
    def remove_authorized_pickup(db: Session, pickup_id: UUID, child_id: UUID, center_id: UUID) -> bool:
        """Remove authorized pickup"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return False

        pickup = db.query(AuthorizedPickup).filter_by(
            id=pickup_id, child_id=child_id).first()
        if not pickup:
            return False

        db.delete(pickup)
        db.commit()
        return True

    # Emergency Contacts
    @staticmethod
    def add_emergency_contact(db: Session, child_id: UUID, center_id: UUID, contact_data: EmergencyContactCreate) -> Optional[EmergencyContact]:
        """Add emergency contact"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        contact = EmergencyContact(
            child_id=child_id,
            full_name=contact_data.full_name,
            link_type=contact_data.link_type,
            phone_primary=contact_data.phone_primary,
            phone_secondary=contact_data.phone_secondary,
            contact_order=contact_data.contact_order if contact_data.contact_order is not None else 1,
        )
        db.add(contact)
        db.commit()
        db.refresh(contact)
        return contact

    @staticmethod
    def get_emergency_contacts(db: Session, child_id: UUID, center_id: UUID) -> List[EmergencyContact]:
        """Get emergency contacts for child"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return []

        return db.query(EmergencyContact).filter_by(child_id=child_id).order_by(EmergencyContact.contact_order.asc()).all()

    # Allergies
    @staticmethod
    def add_allergy(db: Session, child_id: UUID, center_id: UUID, allergy_data: AllergyCreate) -> Optional[Allergy]:
        """Add allergy"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        allergy = Allergy(
            child_id=child_id,
            allergen=allergy_data.allergen,
            severity=allergy_data.severity or "MILD",
            reaction_symptoms=allergy_data.reaction,
            action_required=allergy_data.notes or "Notify staff and parents immediately",
        )
        db.add(allergy)
        db.commit()
        db.refresh(allergy)
        return allergy

    @staticmethod
    def get_allergies(db: Session, child_id: UUID, center_id: UUID) -> List[Allergy]:
        """Get allergies for child"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return []

        return db.query(Allergy).filter_by(child_id=child_id).all()

    @staticmethod
    def remove_allergy(db: Session, allergy_id: UUID, child_id: UUID, center_id: UUID) -> bool:
        """Remove allergy"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return False

        allergy = db.query(Allergy).filter_by(
            id=allergy_id, child_id=child_id).first()
        if not allergy:
            return False

        db.delete(allergy)
        db.commit()
        return True

    # Fears
    @staticmethod
    def add_fear(db: Session, child_id: UUID, center_id: UUID, fear_data: ChildFearCreate) -> Optional[ChildFear]:
        """Add child fear"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        fear = ChildFear(
            child_id=child_id,
            fear_description=fear_data.fear_description,
            severity=fear_data.severity or "MILD",
            triggers=fear_data.triggers,
            coping_strategy=fear_data.coping_strategy,
            staff_notes=fear_data.staff_notes,
        )
        db.add(fear)
        db.commit()
        db.refresh(fear)
        return fear

    @staticmethod
    def get_fears(db: Session, child_id: UUID, center_id: UUID) -> List[ChildFear]:
        """Get fears for child"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return []

        return db.query(ChildFear).filter_by(child_id=child_id).all()

    @staticmethod
    def remove_fear(db: Session, fear_id: UUID, child_id: UUID, center_id: UUID) -> bool:
        """Remove fear"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return False

        fear = db.query(ChildFear).filter_by(
            id=fear_id, child_id=child_id).first()
        if not fear:
            return False

        db.delete(fear)
        db.commit()
        return True

    # Interests
    @staticmethod
    def add_interest(db: Session, child_id: UUID, center_id: UUID, interest_data: ChildInterestCreate) -> Optional[ChildInterest]:
        """Add child interest"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        interest = ChildInterest(
            child_id=child_id,
            interest_category=interest_data.interest_category or "OTHER",
            specific_interest=interest_data.specific_interest,
            enthusiasm_level=interest_data.enthusiasm_level or "LIKES",
            notes=interest_data.notes,
        )
        db.add(interest)
        db.commit()
        db.refresh(interest)
        return interest

    @staticmethod
    def get_interests(db: Session, child_id: UUID, center_id: UUID) -> List[ChildInterest]:
        """Get interests for child"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return []

        return db.query(ChildInterest).filter_by(child_id=child_id).all()

    # Routines
    @staticmethod
    def add_routine(db: Session, child_id: UUID, center_id: UUID, routine_data: ChildRoutineCreate) -> Optional[ChildRoutine]:
        """Add child routine"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        routine = db.query(ChildRoutine).filter_by(child_id=child_id).first()
        if not routine:
            routine = ChildRoutine(child_id=child_id)
            db.add(routine)
        _apply_schema(routine, routine_data)
        db.commit()
        db.refresh(routine)
        return routine

    @staticmethod
    def get_routines(db: Session, child_id: UUID, center_id: UUID) -> List[ChildRoutine]:
        """Get routines for child"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return []

        return db.query(ChildRoutine).filter_by(child_id=child_id).all()

    # Personality
    @staticmethod
    def update_personality(db: Session, child_id: UUID, center_id: UUID, personality_data: ChildPersonalityCreate) -> Optional[ChildPersonality]:
        """Update child personality"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        personality = db.query(ChildPersonality).filter_by(
            child_id=child_id).first()
        if not personality:
            personality = ChildPersonality(child_id=child_id)
            db.add(personality)

        _apply_schema(personality, personality_data)
        db.commit()
        db.refresh(personality)
        return personality

    # Food Profile
    @staticmethod
    def update_food_profile(db: Session, child_id: UUID, center_id: UUID, food_data: ChildFoodProfileCreate) -> Optional[ChildFoodProfile]:
        """Update child food profile"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        food_profile = db.query(ChildFoodProfile).filter_by(
            child_id=child_id).first()
        if not food_profile:
            food_profile = ChildFoodProfile(child_id=child_id, feeding_method="SOLID_FOODS")
            db.add(food_profile)

        _apply_schema(food_profile, food_data)
        db.commit()
        db.refresh(food_profile)
        return food_profile

    # Development
    @staticmethod
    def update_development(db: Session, child_id: UUID, center_id: UUID, dev_data: ChildDevelopmentCreate) -> Optional[ChildDevelopment]:
        """Update child development"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        development = db.query(ChildDevelopment).filter_by(
            child_id=child_id).first()
        if not development:
            development = ChildDevelopment(child_id=child_id)
            db.add(development)

        _apply_schema(development, dev_data)
        db.commit()
        db.refresh(development)
        return development

    # Emotional Support Plan
    @staticmethod
    def update_emotional_support_plan(db: Session, child_id: UUID, center_id: UUID, esp_data: EmotionalSupportPlanCreate) -> Optional[EmotionalSupportPlan]:
        """Update emotional support plan"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        esp = db.query(EmotionalSupportPlan).filter_by(
            child_id=child_id).first()
        if not esp:
            esp = EmotionalSupportPlan(child_id=child_id)
            db.add(esp)

        _apply_schema(esp, esp_data)
        db.commit()
        db.refresh(esp)
        return esp

    # Get full profile
    @staticmethod
    def get_child_full_profile(db: Session, child_id: UUID, center_id: UUID) -> Optional[Child]:
        """Get child with all related data"""
        return ChildService.get_child_by_id(db, child_id, center_id)
