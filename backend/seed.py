"""
Seed script to populate NestCare database with test data
Run: python seed.py from the backend directory
"""
import uuid
from datetime import datetime, date, timezone, timedelta
from app.database import SessionLocal, engine
from app.database import Base
from app.models.base import Center, UserRole, User, Room, ParentChild, RelationshipType, AuthorizedPickup, EmergencyContact
from app.models.child import (
    Child, ChildStatus, Gender, ChildFoodProfile, FeedingMethod, FoodPreference, FoodPreferenceType,
    Allergy, AllergenSeverity, HealthProfile, Medication, Vaccination, IncidentReport, IncidentType
)
from app.models.child_profile import (
    ChildPersonality, ChildFear, FearSeverity, ChildInterest, InterestCategory, EnthusiasmLevel,
    EmotionalSupportPlan, ChildRoutine, ToiletStage, ChildDevelopment, WalkingStage, TalkingStage, FeedingStage
)
from app.models.daily_log import (
    DailyLog, ArrivalMood, MoodType, NapRecord, NapQuality, ActivityLog, ActivityType, EngagementLevel,
    MealLog, MealType, PortionEaten, DiaperLog, DiaperType, MediaPost, MediaType, Attendance, CheckinMethod
)
from app.models.messaging import (
    FeePlan, BillingCycle, Invoice, InvoiceStatus, Payment, PaymentMethod, PaymentStatus
)
from app.core.security import hash_password
from app.core.config import settings

def seed_database():
    """Seed database with test data"""
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        center_count = db.query(Center).count()
        if center_count > 0:
            print("Database already seeded. Skipping...")
            return
        
        # Create a center
        print("Creating center...")
        center = Center(
            id=uuid.uuid4(),
            name="Sunshine Daycare Center",
            address="123 Main Street, Happy City, HC 12345",
            phone="555-0100",
            email="contact@sunshinecare.com",
            license_number="DC-2024-001",
            capacity=50,
            operating_hours="7:00 AM - 6:00 PM"
        )
        db.add(center)
        db.flush()
        
        # Create rooms
        print("Creating rooms...")
        rooms = [
            Room(id=uuid.uuid4(), center_id=center.id, name="Newborn Room", age_group="NEWBORN", max_capacity=8, min_age_months=0, max_age_months=6),
            Room(id=uuid.uuid4(), center_id=center.id, name="Infant Room", age_group="INFANT", max_capacity=10, min_age_months=6, max_age_months=18),
            Room(id=uuid.uuid4(), center_id=center.id, name="Toddler Room", age_group="TODDLER", max_capacity=15, min_age_months=18, max_age_months=36),
            Room(id=uuid.uuid4(), center_id=center.id, name="Preschool Room", age_group="PRESCHOOL", max_capacity=20, min_age_months=36, max_age_months=60),
        ]
        db.add_all(rooms)
        db.flush()
        
        # Create admin user
        print("Creating admin user...")
        admin_user = User(
            id=uuid.uuid4(),
            center_id=center.id,
            full_name="Admin User",
            email="admin@nestcare.com",
            phone="555-0101",
            role=UserRole.ADMIN,
            password_hash=hash_password("Admin1234!"),
            is_active=True
        )
        db.add(admin_user)
        db.flush()
        
        # Create staff users
        print("Creating staff users...")
        staff_users = []
        for i in range(2):
            staff = User(
                id=uuid.uuid4(),
                center_id=center.id,
                full_name=f"Staff Member {i+1}",
                email=f"staff{i+1}@nestcare.com",
                phone=f"555-010{2+i}",
                role=UserRole.STAFF,
                password_hash=hash_password("Staff1234!"),
                is_active=True
            )
            db.add(staff)
            staff_users.append(staff)
        db.flush()
        
        # Create parent users
        print("Creating parent users...")
        parent_users = []
        for i in range(2):
            parent = User(
                id=uuid.uuid4(),
                center_id=center.id,
                full_name=f"Parent {i+1}",
                email=f"parent{i+1}@nestcare.com",
                phone=f"555-011{i}",
                role=UserRole.PARENT,
                password_hash=hash_password("Parent1234!"),
                is_active=True
            )
            db.add(parent)
            parent_users.append(parent)
        db.flush()
        
        # Create children
        print("Creating children...")
        children = []
        
        # Newborn
        child1 = Child(
            id=uuid.uuid4(),
            center_id=center.id,
            first_name="Emma",
            last_name="Johnson",
            date_of_birth=date.today() - timedelta(days=60),
            gender=Gender.FEMALE,
            room_name="Newborn Room",
            status=ChildStatus.ACTIVE,
            enrollment_date=date.today() - timedelta(days=30),
            home_language="English",
            religion="Christian"
        )
        db.add(child1)
        children.append(child1)
        
        # Toddler
        child2 = Child(
            id=uuid.uuid4(),
            center_id=center.id,
            first_name="Lucas",
            last_name="Smith",
            date_of_birth=date.today() - timedelta(days=500),
            gender=Gender.MALE,
            room_name="Toddler Room",
            status=ChildStatus.ACTIVE,
            enrollment_date=date.today() - timedelta(days=60),
            home_language="English"
        )
        db.add(child2)
        children.append(child2)
        
        # Preschooler
        child3 = Child(
            id=uuid.uuid4(),
            center_id=center.id,
            first_name="Sophie",
            last_name="Williams",
            date_of_birth=date.today() - timedelta(days=1000),
            gender=Gender.FEMALE,
            room_name="Preschool Room",
            status=ChildStatus.ACTIVE,
            enrollment_date=date.today() - timedelta(days=120),
            home_language="English",
            religion="Jewish"
        )
        db.add(child3)
        children.append(child3)
        
        db.flush()
        
        # Link parents to children
        print("Linking parents to children...")
        for i, child in enumerate(children):
            parent_link = ParentChild(
                id=uuid.uuid4(),
                user_id=parent_users[i % len(parent_users)].id,
                child_id=child.id,
                relationship=RelationshipType.MOTHER,
                is_primary_contact=True,
                can_pickup=True,
                receives_updates=True,
                receives_invoices=True
            )
            db.add(parent_link)
        db.flush()
        
        # Create child food profiles
        print("Creating food profiles...")
        for child in children:
            food_profile = ChildFoodProfile(
                id=uuid.uuid4(),
                child_id=child.id,
                feeding_method=FeedingMethod.BOTTLE_FORMULA if child == children[0] else FeedingMethod.MIXED,
                bottle_size_ml=250 if child == children[0] else None,
                formula_brand="Similac" if child == children[0] else None,
                feeds_per_day=5,
                self_feeds=True if child != children[0] else False,
                needs_help_feeding=True
            )
            db.add(food_profile)
            
            # Add food preferences
            food_pref = FoodPreference(
                id=uuid.uuid4(),
                food_profile_id=food_profile.id,
                food_name="Carrots",
                preference_type=FoodPreferenceType.LOVES
            )
            db.add(food_pref)
        
        db.flush()
        
        # Create allergies
        print("Creating allergies...")
        allergy = Allergy(
            id=uuid.uuid4(),
            child_id=children[0].id,
            allergen="Peanuts",
            severity=AllergenSeverity.SEVERE,
            reaction_symptoms="Swelling, difficulty breathing",
            action_required="Do not serve peanuts or peanut products",
            epipen_required=True,
            epipen_location="Classroom shelf"
        )
        db.add(allergy)
        
        allergy2 = Allergy(
            id=uuid.uuid4(),
            child_id=children[2].id,
            allergen="Dairy",
            severity=AllergenSeverity.MODERATE,
            reaction_symptoms="Stomach upset, rash",
            action_required="No dairy products"
        )
        db.add(allergy2)
        db.flush()
        
        # Create health profiles
        print("Creating health profiles...")
        for child in children:
            health_profile = HealthProfile(
                id=uuid.uuid4(),
                child_id=child.id,
                blood_type="O+",
                doctor_name="Dr. Johnson",
                doctor_phone="555-0200",
                clinic_name="Happy Kids Clinic",
                hospital_preference="City General Hospital",
                health_insurance_provider="Blue Cross",
                insurance_number="BC123456789"
            )
            db.add(health_profile)
            
            # Add medication for first child
            if child == children[0]:
                med = Medication(
                    id=uuid.uuid4(),
                    child_id=child.id,
                    health_profile_id=health_profile.id,
                    medication_name="Vitamin D",
                    dosage="400 IU",
                    frequency="Once daily",
                    start_date=date.today() - timedelta(days=30),
                    reason="Vitamin D supplementation",
                    prescribing_doctor="Dr. Johnson",
                    instructions="Give with breakfast",
                    is_active=True
                )
                db.add(med)
            
            # Add vaccination
            vac = Vaccination(
                id=uuid.uuid4(),
                child_id=child.id,
                health_profile_id=health_profile.id,
                vaccine_name="DTaP",
                date_given=date.today() - timedelta(days=60),
                next_due_date=date.today() + timedelta(days=60),
                given_by="Nurse Smith",
                is_up_to_date=True
            )
            db.add(vac)
        
        db.flush()
        
        # Create child personalities
        print("Creating child personalities...")
        for child in children:
            personality = ChildPersonality(
                id=uuid.uuid4(),
                child_id=child.id,
                favorite_toys="Soft blocks, rattles",
                favorite_activities="Tummy time, singing",
                comfort_objects="Blue teddy bear",
                dislikes="Loud noises",
                things_that_calm_them="Soft music, cuddles",
                things_that_excite_them="Colorful toys",
                temperament_notes="Calm and observant"
            )
            db.add(personality)
        
        db.flush()
        
        # Create emotional support plans
        print("Creating emotional support plans...")
        for child in children:
            plan = EmotionalSupportPlan(
                id=uuid.uuid4(),
                child_id=child.id,
                separation_anxiety_notes="Some fussiness at dropoff",
                calming_techniques="Consistent goodbye routine",
                positive_reinforcements="Praise and hugs",
                behavioral_notes="Responds well to routine"
            )
            db.add(plan)
        
        db.flush()
        
        # Create routines
        print("Creating child routines...")
        for child in children:
            routine = ChildRoutine(
                id=uuid.uuid4(),
                child_id=child.id,
                usual_wake_time="07:00:00",
                usual_sleep_time="19:00:00",
                nap_duration_minutes=90,
                nap_preferences="Darkened room, white noise",
                bedtime_rituals="Story time",
                potty_training_stage=ToiletStage.NOT_STARTED if child in [children[0], children[1]] else ToiletStage.IN_TRAINING,
                uses_pacifier=True if child in [children[0], children[1]] else False,
                uses_comfort_blanket=True,
                comfort_blanket_desc="Blue cotton blanket"
            )
            db.add(routine)
        
        db.flush()
        
        # Create development profiles
        print("Creating development profiles...")
        for child in children:
            walking = WalkingStage.NOT_WALKING if child == children[0] else WalkingStage.SUPPORTED if child == children[1] else WalkingStage.INDEPENDENT
            dev = ChildDevelopment(
                id=uuid.uuid4(),
                child_id=child.id,
                walking_stage=walking,
                talking_stage=TalkingStage.BABBLING if child in [children[0], children[1]] else TalkingStage.TWO_WORDS,
                feeding_stage=FeedingStage.MILK_ONLY if child == children[0] else FeedingStage.INTRODUCING_SOLIDS if child == children[1] else FeedingStage.MIXED,
                toilet_stage=ToiletStage.NOT_STARTED if child in [children[0], children[1]] else ToiletStage.IN_TRAINING,
                milestones_achieved="Smiling, cooing",
                areas_to_support="Tummy time strength"
            )
            db.add(dev)
        
        db.flush()
        
        # Create authorized pickups
        print("Creating authorized pickups...")
        for child in children:
            pickup = AuthorizedPickup(
                id=uuid.uuid4(),
                child_id=child.id,
                full_name="Grandpa John",
                phone="555-0300",
                relationship="Grandfather",
                is_active=True
            )
            db.add(pickup)
        
        db.flush()
        
        # Create emergency contacts
        print("Creating emergency contacts...")
        for child in children:
            ec = EmergencyContact(
                id=uuid.uuid4(),
                child_id=child.id,
                full_name="Aunt Mary",
                relationship="Aunt",
                phone_primary="555-0400",
                phone_secondary="555-0405",
                contact_order=1
            )
            db.add(ec)
        
        db.flush()
        
        # Create daily logs
        print("Creating daily logs...")
        for child in children:
            daily_log = DailyLog(
                id=uuid.uuid4(),
                child_id=child.id,
                staff_id=staff_users[0].id,
                log_date=date.today(),
                arrival_mood=ArrivalMood.HAPPY,
                departure_mood=MoodType.HAPPY,
                overall_notes="Great day! Lots of smiles.",
                had_good_day=True
            )
            db.add(daily_log)
            
            # Add nap record
            nap = NapRecord(
                id=uuid.uuid4(),
                daily_log_id=daily_log.id,
                staff_id=staff_users[0].id,
                sleep_start=datetime.now(timezone.utc).replace(hour=13, minute=0),
                sleep_end=datetime.now(timezone.utc).replace(hour=14, minute=30),
                duration_minutes=90,
                sleep_quality=NapQuality.GOOD,
                notes="Slept well"
            )
            db.add(nap)
            
            # Add meal log
            meal = MealLog(
                id=uuid.uuid4(),
                daily_log_id=daily_log.id,
                child_id=child.id,
                staff_id=staff_users[0].id,
                meal_type=MealType.LUNCH,
                items_served="Chicken, veggies, rice",
                portion_eaten=PortionEaten.MOST,
                notes="Ate most of lunch, left some carrots"
            )
            db.add(meal)
            
            # Add diaper log
            diaper = DiaperLog(
                id=uuid.uuid4(),
                daily_log_id=daily_log.id,
                staff_id=staff_users[0].id,
                changed_at=datetime.now(timezone.utc),
                type=DiaperType.WET,
                notes="Normal"
            )
            db.add(diaper)
            
            # Add activity log
            activity = ActivityLog(
                id=uuid.uuid4(),
                daily_log_id=daily_log.id,
                staff_id=staff_users[0].id,
                activity_type=ActivityType.OUTDOOR_PLAY,
                activity_name="Playground time",
                description="Played on the grass and looked at clouds",
                engagement_level=EngagementLevel.VERY_ENGAGED,
                occurred_at=datetime.now(timezone.utc).replace(hour=15, minute=0),
                staff_notes="Very engaged and happy"
            )
            db.add(activity)
        
        db.flush()
        
        # Create attendance
        print("Creating attendance...")
        for child in children:
            att = Attendance(
                id=uuid.uuid4(),
                child_id=child.id,
                center_id=center.id,
                date=date.today(),
                checkin_at=datetime.now(timezone.utc).replace(hour=8, minute=0),
                checkin_by="Parent",
                checkin_method=CheckinMethod.MANUAL,
                checkout_at=datetime.now(timezone.utc).replace(hour=17, minute=0),
                checkout_by="Grandpa John"
            )
            db.add(att)
        
        db.flush()
        
        # Create fee plan
        print("Creating fee plan...")
        fee_plan = FeePlan(
            id=uuid.uuid4(),
            center_id=center.id,
            name="Standard Monthly Plan",
            monthly_amount=1200.00,
            registration_fee=150.00,
            sibling_discount=True,
            sibling_discount_pct=10.00,
            billing_cycle=BillingCycle.MONTHLY
        )
        db.add(fee_plan)
        db.flush()
        
        # Create invoices
        print("Creating invoices...")
        inv1 = Invoice(
            id=uuid.uuid4(),
            child_id=children[0].id,
            center_id=center.id,
            fee_plan_id=fee_plan.id,
            invoice_number=f"NC-{date.today().year}-{date.today().month:02d}-0001",
            amount_due=1200.00,
            amount_paid=1200.00,
            due_date=date.today() - timedelta(days=5),
            status=InvoiceStatus.PAID,
            paid_at=datetime.now(timezone.utc)
        )
        db.add(inv1)
        
        inv2 = Invoice(
            id=uuid.uuid4(),
            child_id=children[1].id,
            center_id=center.id,
            fee_plan_id=fee_plan.id,
            invoice_number=f"NC-{date.today().year}-{date.today().month:02d}-0002",
            amount_due=1200.00,
            amount_paid=0.00,
            due_date=date.today() - timedelta(days=10),
            status=InvoiceStatus.OVERDUE
        )
        db.add(inv2)
        
        db.flush()
        
        # Commit all changes
        db.commit()
        print("\n✓ Database seeded successfully!")
        print(f"✓ Created 1 center, 4 rooms, 1 admin, 2 staff, 2 parents, 3 children")
        print(f"✓ Test credentials:")
        print(f"  Admin: admin@nestcare.com / Admin1234!")
        print(f"  Staff: staff1@nestcare.com / Staff1234!")
        print(f"  Parent: parent1@nestcare.com / Parent1234!")
        
    except Exception as e:
        db.rollback()
        print(f"✗ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
