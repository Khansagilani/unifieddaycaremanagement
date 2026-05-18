from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User
from app.services.child_service import ChildService
from app.schemas.children import (
    ChildCreate, ChildUpdate, ChildResponse, ChildListResponse, ChildProfileResponse,
    AuthorizedPickupCreate, AuthorizedPickupResponse,
    EmergencyContactCreate, EmergencyContactResponse,
    AllergyCreate, AllergyResponse,
    ChildFearCreate, ChildFearResponse,
    ChildInterestCreate, ChildInterestResponse,
    ChildRoutineCreate, ChildRoutineResponse,
    ChildPersonalityCreate, ChildPersonalityResponse,
    ChildFoodProfileCreate, ChildFoodProfileResponse,
    ChildDevelopmentCreate, ChildDevelopmentResponse,
    EmotionalSupportPlanCreate, EmotionalSupportPlanResponse
)
from app.utils.response import success_response, error_response
from app.utils.pagination import PaginationResponse

router = APIRouter(prefix="/api/children", tags=["children"])

# Children CRUD
@router.get("", response_model=PaginationResponse)
def list_children(
    current_user: User = Depends(get_current_user),
    room_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all children for center"""
    children, total = ChildService.get_children(
        db, current_user.center_id, room_id, status, skip, limit
    )
    return {
        "success": True,
        "data": [ChildListResponse.from_orm(c) for c in children],
        "pagination": {"skip": skip, "limit": limit, "total": total}
    }

@router.post("", response_model=dict)
def create_child(
    child_data: ChildCreate,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Create new child"""
    child = ChildService.create_child(db, current_user.center_id, child_data)
    return success_response(ChildResponse.from_orm(child), "Child created successfully")

@router.get("/{child_id}", response_model=dict)
def get_child(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get child by ID"""
    child = ChildService.get_child_by_id(db, child_id, current_user.center_id)
    if not child:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    
    return success_response(ChildResponse.from_orm(child))

@router.get("/{child_id}/profile", response_model=dict)
def get_child_profile(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get complete child profile with all related data"""
    child = ChildService.get_child_full_profile(db, child_id, current_user.center_id)
    if not child:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    
    # Build complete response
    profile = ChildProfileResponse(
        id=child.id,
        first_name=child.first_name,
        last_name=child.last_name,
        date_of_birth=child.date_of_birth,
        gender=child.gender,
        room_id=child.room_id,
        status=child.status,
        photo_url=child.photo_url,
        enrollment_date=child.enrollment_date,
        personality=ChildPersonalityResponse.from_orm(child.personality) if child.personality else None,
        food_profile=ChildFoodProfileResponse.from_orm(child.food_profile) if child.food_profile else None,
        development=ChildDevelopmentResponse.from_orm(child.development) if child.development else None,
        emotional_support_plan=EmotionalSupportPlanResponse.from_orm(child.emotional_support_plan) if child.emotional_support_plan else None,
        allergies=[AllergyResponse.from_orm(a) for a in child.allergies],
        fears=[ChildFearResponse.from_orm(f) for f in child.fears],
        interests=[ChildInterestResponse.from_orm(i) for i in child.interests],
        routines=[ChildRoutineResponse.from_orm(r) for r in child.routines],
        authorized_pickups=[AuthorizedPickupResponse.from_orm(p) for p in child.authorized_pickups],
        emergency_contacts=[EmergencyContactResponse.from_orm(c) for c in child.emergency_contacts],
        created_at=child.created_at,
        updated_at=child.updated_at
    )
    
    return success_response(profile)

@router.put("/{child_id}", response_model=dict)
def update_child(
    child_id: int,
    child_data: ChildUpdate,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Update child information"""
    child = ChildService.update_child(db, child_id, current_user.center_id, child_data)
    if not child:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    
    return success_response(ChildResponse.from_orm(child), "Child updated successfully")

@router.delete("/{child_id}", response_model=dict)
def delete_child(
    child_id: int,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Delete (deactivate) child"""
    if not ChildService.delete_child(db, child_id, current_user.center_id):
        return error_response("CHILD_NOT_FOUND", "Child not found")
    
    return success_response(None, "Child deleted successfully")

# Authorized Pickups
@router.post("/{child_id}/authorized-pickups", response_model=dict)
def add_authorized_pickup(
    child_id: int,
    pickup_data: AuthorizedPickupCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    """Add authorized pickup person"""
    pickup = ChildService.add_authorized_pickup(db, child_id, current_user.center_id, pickup_data)
    if not pickup:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    
    return success_response(AuthorizedPickupResponse.from_orm(pickup), "Pickup person added")

@router.get("/{child_id}/authorized-pickups", response_model=dict)
def get_authorized_pickups(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get authorized pickup persons for child"""
    pickups = ChildService.get_authorized_pickups(db, child_id, current_user.center_id)
    return success_response([AuthorizedPickupResponse.from_orm(p) for p in pickups])

@router.delete("/{child_id}/authorized-pickups/{pickup_id}", response_model=dict)
def remove_authorized_pickup(
    child_id: int,
    pickup_id: int,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Remove authorized pickup person"""
    if not ChildService.remove_authorized_pickup(db, pickup_id, child_id, current_user.center_id):
        return error_response("PICKUP_NOT_FOUND", "Pickup person not found")
    
    return success_response(None, "Pickup person removed")

# Emergency Contacts
@router.post("/{child_id}/emergency-contacts", response_model=dict)
def add_emergency_contact(
    child_id: int,
    contact_data: EmergencyContactCreate,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Add emergency contact"""
    contact = ChildService.add_emergency_contact(db, child_id, current_user.center_id, contact_data)
    if not contact:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    
    return success_response(EmergencyContactResponse.from_orm(contact), "Emergency contact added")

@router.get("/{child_id}/emergency-contacts", response_model=dict)
def get_emergency_contacts(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get emergency contacts for child"""
    contacts = ChildService.get_emergency_contacts(db, child_id, current_user.center_id)
    return success_response([EmergencyContactResponse.from_orm(c) for c in contacts])

# Allergies
@router.post("/{child_id}/allergies", response_model=dict)
def add_allergy(
    child_id: int,
    allergy_data: AllergyCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    """Add allergy"""
    allergy = ChildService.add_allergy(db, child_id, current_user.center_id, allergy_data)
    if not allergy:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    
    return success_response(AllergyResponse.from_orm(allergy), "Allergy added")

@router.get("/{child_id}/allergies", response_model=dict)
def get_allergies(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get allergies for child"""
    allergies = ChildService.get_allergies(db, child_id, current_user.center_id)
    return success_response([AllergyResponse.from_orm(a) for a in allergies])

@router.delete("/{child_id}/allergies/{allergy_id}", response_model=dict)
def remove_allergy(
    child_id: int,
    allergy_id: int,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Remove allergy"""
    if not ChildService.remove_allergy(db, allergy_id, child_id, current_user.center_id):
        return error_response("ALLERGY_NOT_FOUND", "Allergy not found")
    
    return success_response(None, "Allergy removed")

# Fears
@router.post("/{child_id}/fears", response_model=dict)
def add_fear(
    child_id: int,
    fear_data: ChildFearCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    """Add child fear"""
    fear = ChildService.add_fear(db, child_id, current_user.center_id, fear_data)
    if not fear:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    
    return success_response(ChildFearResponse.from_orm(fear), "Fear added")

@router.get("/{child_id}/fears", response_model=dict)
def get_fears(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get fears for child"""
    fears = ChildService.get_fears(db, child_id, current_user.center_id)
    return success_response([ChildFearResponse.from_orm(f) for f in fears])

@router.delete("/{child_id}/fears/{fear_id}", response_model=dict)
def remove_fear(
    child_id: int,
    fear_id: int,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Remove fear"""
    if not ChildService.remove_fear(db, fear_id, child_id, current_user.center_id):
        return error_response("FEAR_NOT_FOUND", "Fear not found")
    
    return success_response(None, "Fear removed")

# Interests
@router.post("/{child_id}/interests", response_model=dict)
def add_interest(
    child_id: int,
    interest_data: ChildInterestCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    """Add child interest"""
    interest = ChildService.add_interest(db, child_id, current_user.center_id, interest_data)
    if not interest:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    
    return success_response(ChildInterestResponse.from_orm(interest), "Interest added")

@router.get("/{child_id}/interests", response_model=dict)
def get_interests(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get interests for child"""
    interests = ChildService.get_interests(db, child_id, current_user.center_id)
    return success_response([ChildInterestResponse.from_orm(i) for i in interests])

# Routines
@router.post("/{child_id}/routines", response_model=dict)
def add_routine(
    child_id: int,
    routine_data: ChildRoutineCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    """Add child routine"""
    routine = ChildService.add_routine(db, child_id, current_user.center_id, routine_data)
    if not routine:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    
    return success_response(ChildRoutineResponse.from_orm(routine), "Routine added")

@router.get("/{child_id}/routines", response_model=dict)
def get_routines(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get routines for child"""
    routines = ChildService.get_routines(db, child_id, current_user.center_id)
    return success_response([ChildRoutineResponse.from_orm(r) for r in routines])

# Personality
@router.put("/{child_id}/personality", response_model=dict)
def update_personality(
    child_id: int,
    personality_data: ChildPersonalityCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    """Update child personality profile"""
    personality = ChildService.update_personality(db, child_id, current_user.center_id, personality_data)
    if not personality:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    
    return success_response(ChildPersonalityResponse.from_orm(personality), "Personality updated")

@router.get("/{child_id}/personality", response_model=dict)
def get_personality(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get child personality profile"""
    child = ChildService.get_child_by_id(db, child_id, current_user.center_id)
    if not child or not child.personality:
        return error_response("NOT_FOUND", "Personality profile not found")
    
    return success_response(ChildPersonalityResponse.from_orm(child.personality))

# Food Profile
@router.put("/{child_id}/food-profile", response_model=dict)
def update_food_profile(
    child_id: int,
    food_data: ChildFoodProfileCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    """Update child food profile"""
    food_profile = ChildService.update_food_profile(db, child_id, current_user.center_id, food_data)
    if not food_profile:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    
    return success_response(ChildFoodProfileResponse.from_orm(food_profile), "Food profile updated")

@router.get("/{child_id}/food-profile", response_model=dict)
def get_food_profile(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get child food profile"""
    child = ChildService.get_child_by_id(db, child_id, current_user.center_id)
    if not child or not child.food_profile:
        return error_response("NOT_FOUND", "Food profile not found")
    
    return success_response(ChildFoodProfileResponse.from_orm(child.food_profile))

# Development
@router.put("/{child_id}/development", response_model=dict)
def update_development(
    child_id: int,
    dev_data: ChildDevelopmentCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    """Update child development profile"""
    development = ChildService.update_development(db, child_id, current_user.center_id, dev_data)
    if not development:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    
    return success_response(ChildDevelopmentResponse.from_orm(development), "Development updated")

@router.get("/{child_id}/development", response_model=dict)
def get_development(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get child development profile"""
    child = ChildService.get_child_by_id(db, child_id, current_user.center_id)
    if not child or not child.development:
        return error_response("NOT_FOUND", "Development profile not found")
    
    return success_response(ChildDevelopmentResponse.from_orm(child.development))

# Emotional Support Plan
@router.put("/{child_id}/emotional-support-plan", response_model=dict)
def update_emotional_support_plan(
    child_id: int,
    esp_data: EmotionalSupportPlanCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db)
):
    """Update child emotional support plan"""
    esp = ChildService.update_emotional_support_plan(db, child_id, current_user.center_id, esp_data)
    if not esp:
        return error_response("CHILD_NOT_FOUND", "Child not found")
    
    return success_response(EmotionalSupportPlanResponse.from_orm(esp), "Emotional support plan updated")

@router.get("/{child_id}/emotional-support-plan", response_model=dict)
def get_emotional_support_plan(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get child emotional support plan"""
    child = ChildService.get_child_by_id(db, child_id, current_user.center_id)
    if not child or not child.emotional_support_plan:
        return error_response("NOT_FOUND", "Emotional support plan not found")
    
    return success_response(EmotionalSupportPlanResponse.from_orm(child.emotional_support_plan))
