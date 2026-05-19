from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import date
from typing import Optional, List
from app.models.base import Child, Room, AuthorizedPickup, EmergencyContact, ParentChild
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


class ChildService:

    @staticmethod
    def get_children(
        db: Session,
        center_id: int,
        room_id: Optional[int] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[Child], int]:
        """Get children for center with optional filters"""
        query = db.query(Child).filter(Child.center_id == center_id)

        if room_id:
            query = query.filter(Child.room_id == room_id)
        if status:
            query = query.filter(Child.status == status)

        total = query.count()
        children = query.offset(skip).limit(limit).all()
        return children, total

    @staticmethod
    def get_child_by_id(db: Session, child_id: int, center_id: int) -> Optional[Child]:
        """Get child by ID with center isolation"""
        return db.query(Child).join(Room).filter(
            and_(Child.id == child_id, Room.center_id == center_id)
        ).first()

    @staticmethod
    def create_child(db: Session, center_id: int, child_data: ChildCreate) -> Child:
        """Create new child"""
        child = Child(
            first_name=child_data.first_name,
            last_name=child_data.last_name,
            date_of_birth=child_data.date_of_birth,
            gender=child_data.gender,
            room_id=child_data.room_id,
            status="ACTIVE",
            enrollment_date=child_data.enrollment_date or date.today()
        )
        db.add(child)
        db.flush()

        # Create related records if needed
        if not db.query(ChildPersonality).filter_by(child_id=child.id).first():
            personality = ChildPersonality(child_id=child.id)
            db.add(personality)

        if not db.query(ChildFoodProfile).filter_by(child_id=child.id).first():
            food_profile = ChildFoodProfile(child_id=child.id)
            db.add(food_profile)

        db.commit()
        db.refresh(child)
        return child

    @staticmethod
    def update_child(db: Session, child_id: int, center_id: int, child_data: ChildUpdate) -> Optional[Child]:
        """Update child information"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        if child_data.first_name:
            child.first_name = child_data.first_name
        if child_data.last_name:
            child.last_name = child_data.last_name
        if child_data.room_id:
            child.room_id = child_data.room_id
        if child_data.status:
            child.status = child_data.status

        db.commit()
        db.refresh(child)
        return child

    @staticmethod
    def delete_child(db: Session, child_id: int, center_id: int) -> bool:
        """Soft delete child by changing status"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return False

        child.status = "INACTIVE"
        db.commit()
        return True

    # Authorized Pickups
    @staticmethod
    def add_authorized_pickup(db: Session, child_id: int, center_id: int, pickup_data: AuthorizedPickupCreate) -> Optional[AuthorizedPickup]:
        """Add authorized pickup person"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        pickup = AuthorizedPickup(
            child_id=child_id,
            name=pickup_data.name,
            relationship=pickup_data.relationship,
            phone=pickup_data.phone,
            email=pickup_data.email,
            notes=pickup_data.notes
        )
        db.add(pickup)
        db.commit()
        db.refresh(pickup)
        return pickup

    @staticmethod
    def get_authorized_pickups(db: Session, child_id: int, center_id: int) -> List[AuthorizedPickup]:
        """Get authorized pickups for child"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return []

        return db.query(AuthorizedPickup).filter_by(child_id=child_id).all()

    @staticmethod
    def remove_authorized_pickup(db: Session, pickup_id: int, child_id: int, center_id: int) -> bool:
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
    def add_emergency_contact(db: Session, child_id: int, center_id: int, contact_data: EmergencyContactCreate) -> Optional[EmergencyContact]:
        """Add emergency contact"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        # If this is primary, remove primary from others
        if contact_data.is_primary:
            db.query(EmergencyContact).filter_by(child_id=child_id,
                                                 is_primary=True).update({"is_primary": False})

        contact = EmergencyContact(
            child_id=child_id,
            name=contact_data.name,
            relationship=contact_data.relationship,
            phone=contact_data.phone,
            email=contact_data.email,
            is_primary=contact_data.is_primary
        )
        db.add(contact)
        db.commit()
        db.refresh(contact)
        return contact

    @staticmethod
    def get_emergency_contacts(db: Session, child_id: int, center_id: int) -> List[EmergencyContact]:
        """Get emergency contacts for child"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return []

        return db.query(EmergencyContact).filter_by(child_id=child_id).order_by(EmergencyContact.is_primary.desc()).all()

    # Allergies
    @staticmethod
    def add_allergy(db: Session, child_id: int, center_id: int, allergy_data: AllergyCreate) -> Optional[Allergy]:
        """Add allergy"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        allergy = Allergy(
            child_id=child_id,
            allergen=allergy_data.allergen,
            severity=allergy_data.severity,
            symptoms=allergy_data.symptoms,
            reaction_history=allergy_data.reaction_history,
            treatment=allergy_data.treatment
        )
        db.add(allergy)
        db.commit()
        db.refresh(allergy)
        return allergy

    @staticmethod
    def get_allergies(db: Session, child_id: int, center_id: int) -> List[Allergy]:
        """Get allergies for child"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return []

        return db.query(Allergy).filter_by(child_id=child_id).all()

    @staticmethod
    def remove_allergy(db: Session, allergy_id: int, child_id: int, center_id: int) -> bool:
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
    def add_fear(db: Session, child_id: int, center_id: int, fear_data: ChildFearCreate) -> Optional[ChildFear]:
        """Add child fear"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        fear = ChildFear(
            child_id=child_id,
            category=fear_data.category,
            description=fear_data.description,
            trigger=fear_data.trigger,
            coping_strategy=fear_data.coping_strategy,
            comfort_object=fear_data.comfort_object
        )
        db.add(fear)
        db.commit()
        db.refresh(fear)
        return fear

    @staticmethod
    def get_fears(db: Session, child_id: int, center_id: int) -> List[ChildFear]:
        """Get fears for child"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return []

        return db.query(ChildFear).filter_by(child_id=child_id).all()

    @staticmethod
    def remove_fear(db: Session, fear_id: int, child_id: int, center_id: int) -> bool:
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
    def add_interest(db: Session, child_id: int, center_id: int, interest_data: ChildInterestCreate) -> Optional[ChildInterest]:
        """Add child interest"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        interest = ChildInterest(
            child_id=child_id,
            interest=interest_data.interest,
            activity_type=interest_data.activity_type,
            skill_level=interest_data.skill_level
        )
        db.add(interest)
        db.commit()
        db.refresh(interest)
        return interest

    @staticmethod
    def get_interests(db: Session, child_id: int, center_id: int) -> List[ChildInterest]:
        """Get interests for child"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return []

        return db.query(ChildInterest).filter_by(child_id=child_id).all()

    # Routines
    @staticmethod
    def add_routine(db: Session, child_id: int, center_id: int, routine_data: ChildRoutineCreate) -> Optional[ChildRoutine]:
        """Add child routine"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        routine = ChildRoutine(
            child_id=child_id,
            routine_name=routine_data.routine_name,
            description=routine_data.description,
            time_of_day=routine_data.time_of_day,
            notes=routine_data.notes
        )
        db.add(routine)
        db.commit()
        db.refresh(routine)
        return routine

    @staticmethod
    def get_routines(db: Session, child_id: int, center_id: int) -> List[ChildRoutine]:
        """Get routines for child"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return []

        return db.query(ChildRoutine).filter_by(child_id=child_id).all()

    # Personality
    @staticmethod
    def update_personality(db: Session, child_id: int, center_id: int, personality_data: ChildPersonalityCreate) -> Optional[ChildPersonality]:
        """Update child personality"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        personality = db.query(ChildPersonality).filter_by(
            child_id=child_id).first()
        if not personality:
            personality = ChildPersonality(child_id=child_id)
            db.add(personality)

        personality.temperament = personality_data.temperament
        personality.communication_style = personality_data.communication_style
        personality.social_skills = personality_data.social_skills
        personality.strengths = personality_data.strengths
        personality.comfort_objects = personality_data.comfort_objects
        personality.preferred_activities = personality_data.preferred_activities

        db.commit()
        db.refresh(personality)
        return personality

    # Food Profile
    @staticmethod
    def update_food_profile(db: Session, child_id: int, center_id: int, food_data: ChildFoodProfileCreate) -> Optional[ChildFoodProfile]:
        """Update child food profile"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        food_profile = db.query(ChildFoodProfile).filter_by(
            child_id=child_id).first()
        if not food_profile:
            food_profile = ChildFoodProfile(child_id=child_id)
            db.add(food_profile)

        food_profile.foods_liked = food_data.foods_liked
        food_profile.foods_disliked = food_data.foods_disliked
        food_profile.dietary_restrictions = food_data.dietary_restrictions
        food_profile.feeding_method = food_data.feeding_method
        food_profile.bottle_preference = food_data.bottle_preference
        food_profile.special_meals_provided = food_data.special_meals_provided

        db.commit()
        db.refresh(food_profile)
        return food_profile

    # Development
    @staticmethod
    def update_development(db: Session, child_id: int, center_id: int, dev_data: ChildDevelopmentCreate) -> Optional[ChildDevelopment]:
        """Update child development"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        development = db.query(ChildDevelopment).filter_by(
            child_id=child_id).first()
        if not development:
            development = ChildDevelopment(child_id=child_id)
            db.add(development)

        development.age_in_months = dev_data.age_in_months
        development.walking_stage = dev_data.walking_stage
        development.talking_stage = dev_data.talking_stage
        development.eating_stage = dev_data.eating_stage
        development.toileting_stage = dev_data.toileting_stage
        development.notes = dev_data.notes

        db.commit()
        db.refresh(development)
        return development

    # Emotional Support Plan
    @staticmethod
    def update_emotional_support_plan(db: Session, child_id: int, center_id: int, esp_data: EmotionalSupportPlanCreate) -> Optional[EmotionalSupportPlan]:
        """Update emotional support plan"""
        child = ChildService.get_child_by_id(db, child_id, center_id)
        if not child:
            return None

        esp = db.query(EmotionalSupportPlan).filter_by(
            child_id=child_id).first()
        if not esp:
            esp = EmotionalSupportPlan(child_id=child_id)
            db.add(esp)

        esp.triggers = esp_data.triggers
        esp.de_escalation_techniques = esp_data.de_escalation_techniques
        esp.support_strategies = esp_data.support_strategies
        esp.reward_preferences = esp_data.reward_preferences
        esp.staff_notes = esp_data.staff_notes

        db.commit()
        db.refresh(esp)
        return esp

    # Get full profile
    @staticmethod
    def get_child_full_profile(db: Session, child_id: int, center_id: int) -> Optional[Child]:
        """Get child with all related data"""
        return ChildService.get_child_by_id(db, child_id, center_id)
