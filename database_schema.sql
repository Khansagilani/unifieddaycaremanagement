-- ─────────────────────────────────
-- NESTCARE DATABASE SCHEMA
-- Run this in pgAdmin Query Tool on the 'nestcare' database
-- ─────────────────────────────────

-- ─────────────────────────────────
-- ENUMS
-- ─────────────────────────────────

CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF', 'PARENT');
CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE child_status AS ENUM ('ACTIVE', 'INACTIVE', 'WAITLISTED', 'GRADUATED');
CREATE TYPE feeding_method AS ENUM ('BOTTLE_FORMULA', 'BOTTLE_BREAST_MILK', 'BREASTFED', 'SOLID_FOODS', 'MIXED');
CREATE TYPE food_preference_type AS ENUM ('LOVES', 'LIKES', 'DISLIKES', 'REFUSES', 'ALLERGIC');
CREATE TYPE food_texture AS ENUM ('PUREE', 'MASHED', 'SOFT_LUMPS', 'CHOPPED', 'FINGER_FOODS', 'REGULAR');
CREATE TYPE allergen_severity AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'ANAPHYLACTIC');
CREATE TYPE dietary_restriction_type AS ENUM ('VEGETARIAN', 'VEGAN', 'HALAL', 'KOSHER', 'GLUTEN_FREE', 'DAIRY_FREE', 'NUT_FREE', 'OTHER');
CREATE TYPE meal_type AS ENUM ('MORNING_BOTTLE', 'BREAKFAST', 'MID_MORNING_SNACK', 'LUNCH', 'AFTERNOON_BOTTLE', 'AFTERNOON_SNACK', 'DINNER', 'EVENING_BOTTLE');
CREATE TYPE portion_eaten AS ENUM ('ALL', 'MOST', 'HALF', 'LITTLE', 'NONE', 'REFUSED');
CREATE TYPE nap_quality AS ENUM ('EXCELLENT', 'GOOD', 'RESTLESS', 'REFUSED');
CREATE TYPE diaper_type AS ENUM ('WET', 'DIRTY', 'BOTH', 'DRY');
CREATE TYPE activity_type AS ENUM ('OUTDOOR_PLAY', 'INDOOR_PLAY', 'ARTS_AND_CRAFTS', 'STORY_TIME', 'MUSIC', 'SENSORY_PLAY', 'TUMMY_TIME', 'PHYSICAL_EXERCISE', 'EDUCATIONAL', 'FREE_PLAY', 'SOCIAL_ACTIVITY', 'OTHER');
CREATE TYPE engagement_level AS ENUM ('VERY_ENGAGED', 'ENGAGED', 'NEUTRAL', 'DISENGAGED', 'REFUSED');
CREATE TYPE arrival_mood AS ENUM ('HAPPY', 'NEUTRAL', 'FUSSY', 'CRYING', 'TIRED');
CREATE TYPE mood_type AS ENUM ('VERY_HAPPY', 'HAPPY', 'NEUTRAL', 'FUSSY', 'SAD', 'TIRED', 'SICK');
CREATE TYPE media_type AS ENUM ('PHOTO', 'VIDEO');
CREATE TYPE incident_type AS ENUM ('FALL', 'BITE', 'SCRATCH', 'ALLERGIC_REACTION', 'ILLNESS', 'BEHAVIOURAL', 'OTHER');
CREATE TYPE checkin_method AS ENUM ('QR_CODE', 'PIN', 'MANUAL');
CREATE TYPE conversation_type AS ENUM ('DIRECT', 'GROUP', 'ANNOUNCEMENT');
CREATE TYPE message_type AS ENUM ('TEXT', 'IMAGE', 'DOCUMENT', 'ANNOUNCEMENT');
CREATE TYPE audience_type AS ENUM ('ALL_PARENTS', 'ALL_STAFF', 'SPECIFIC_ROOM', 'INDIVIDUAL');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'CHEQUE', 'ONLINE');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE billing_cycle AS ENUM ('MONTHLY', 'WEEKLY', 'DAILY');
CREATE TYPE walking_stage AS ENUM ('NOT_WALKING', 'SUPPORTED', 'CRUISING', 'INDEPENDENT');
CREATE TYPE talking_stage AS ENUM ('BABBLING', 'FIRST_WORDS', 'TWO_WORDS', 'SENTENCES', 'FLUENT');
CREATE TYPE toilet_stage AS ENUM ('NOT_STARTED', 'AWARE', 'IN_TRAINING', 'MOSTLY_TRAINED', 'FULLY_TRAINED');
CREATE TYPE feeding_stage AS ENUM ('MILK_ONLY', 'INTRODUCING_SOLIDS', 'MIXED', 'TABLE_FOOD');
CREATE TYPE fear_severity AS ENUM ('MILD', 'MODERATE', 'SEVERE');
CREATE TYPE enthusiasm_level AS ENUM ('LOVES', 'LIKES', 'NEUTRAL');
CREATE TYPE interest_category AS ENUM ('SPORTS', 'ARTS', 'MUSIC', 'ANIMALS', 'VEHICLES', 'NATURE', 'BOOKS', 'TECHNOLOGY', 'DANCE', 'COOKING', 'OTHER');
CREATE TYPE relationship_type AS ENUM ('MOTHER', 'FATHER', 'GRANDMOTHER', 'GRANDFATHER', 'AUNT', 'UNCLE', 'GUARDIAN', 'OTHER');
CREATE TYPE age_group AS ENUM ('NEWBORN', 'INFANT', 'TODDLER', 'PRESCHOOL');
CREATE TYPE cert_status AS ENUM ('VALID', 'EXPIRING_SOON', 'EXPIRED');
CREATE TYPE checklist_status AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE');
CREATE TYPE checklist_frequency AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY');

-- ─────────────────────────────────
-- CORE TABLES
-- ─────────────────────────────────

CREATE TABLE centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    license_number VARCHAR(100),
    capacity INTEGER DEFAULT 50,
    operating_hours VARCHAR(255),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    role user_role NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    preferred_language VARCHAR(10) DEFAULT 'en',
    push_notifications BOOLEAN DEFAULT TRUE,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age_group age_group NOT NULL,
    max_capacity INTEGER NOT NULL,
    min_age_months INTEGER,
    max_age_months INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

-- ─────────────────────────────────
-- CHILDREN
-- ─────────────────────────────────

CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender_type,
    photo_url TEXT,
    room_name VARCHAR(100),
    status child_status DEFAULT 'ACTIVE',
    enrollment_date DATE NOT NULL,
    exit_date DATE,
    home_language VARCHAR(100),
    religion VARCHAR(100),
    cultural_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE parent_child (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    relationship relationship_type NOT NULL,
    is_primary_contact BOOLEAN DEFAULT FALSE,
    can_pickup BOOLEAN DEFAULT TRUE,
    receives_updates BOOLEAN DEFAULT TRUE,
    receives_invoices BOOLEAN DEFAULT FALSE,
    is_emergency_contact BOOLEAN DEFAULT FALSE,
    contact_priority INTEGER DEFAULT 1,
    UNIQUE(user_id, child_id)
);

CREATE TABLE authorized_pickups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    photo_url TEXT,
    relationship VARCHAR(100),
    id_type VARCHAR(50),
    id_number VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    phone_primary VARCHAR(50) NOT NULL,
    phone_secondary VARCHAR(50),
    contact_order INTEGER DEFAULT 1
);

-- ─────────────────────────────────
-- CHILD PERSONALITY & CARE PROFILE
-- ─────────────────────────────────

CREATE TABLE child_personalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
    favorite_toys TEXT,
    favorite_activities TEXT,
    favorite_sports TEXT,
    favorite_books TEXT,
    favorite_songs TEXT,
    comfort_objects TEXT,
    dislikes TEXT,
    things_that_calm_them TEXT,
    things_that_excite_them TEXT,
    social_style TEXT,
    learning_style TEXT,
    temperament_notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE child_fears (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    fear_description TEXT NOT NULL,
    severity fear_severity DEFAULT 'MILD',
    triggers TEXT,
    coping_strategy TEXT,
    staff_notes TEXT
);

CREATE TABLE child_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    interest_category interest_category NOT NULL,
    specific_interest VARCHAR(255) NOT NULL,
    enthusiasm_level enthusiasm_level DEFAULT 'LIKES',
    notes TEXT
);

CREATE TABLE emotional_support_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
    separation_anxiety_notes TEXT,
    calming_techniques TEXT,
    triggers_to_avoid TEXT,
    positive_reinforcements TEXT,
    behavioral_notes TEXT,
    staff_guidance TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE child_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
    usual_wake_time TIME,
    usual_sleep_time TIME,
    nap_duration_minutes INTEGER,
    nap_preferences TEXT,
    bedtime_rituals TEXT,
    morning_mood TEXT,
    potty_training_stage toilet_stage DEFAULT 'NOT_STARTED',
    uses_pacifier BOOLEAN DEFAULT FALSE,
    uses_comfort_blanket BOOLEAN DEFAULT FALSE,
    comfort_blanket_desc TEXT,
    special_routines TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE child_development (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
    walking_stage walking_stage DEFAULT 'NOT_WALKING',
    talking_stage talking_stage DEFAULT 'BABBLING',
    feeding_stage feeding_stage DEFAULT 'MILK_ONLY',
    toilet_stage toilet_stage DEFAULT 'NOT_STARTED',
    milestones_achieved TEXT,
    areas_to_support TEXT,
    staff_observations TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────
-- FOOD & FEEDING
-- ─────────────────────────────────

CREATE TABLE child_food_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
    feeding_method feeding_method NOT NULL,
    bottle_size_ml INTEGER,
    formula_brand VARCHAR(255),
    breast_milk_notes TEXT,
    feeds_per_day INTEGER,
    meal_schedule TEXT,
    self_feeds BOOLEAN DEFAULT FALSE,
    needs_help_feeding BOOLEAN DEFAULT TRUE,
    utensils_preferred VARCHAR(255),
    cup_type VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE food_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_profile_id UUID NOT NULL REFERENCES child_food_profiles(id) ON DELETE CASCADE,
    food_name VARCHAR(255) NOT NULL,
    preference_type food_preference_type NOT NULL,
    notes TEXT
);

CREATE TABLE food_textures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_profile_id UUID NOT NULL REFERENCES child_food_profiles(id) ON DELETE CASCADE,
    texture food_texture NOT NULL,
    accepted BOOLEAN NOT NULL,
    notes TEXT
);

CREATE TABLE dietary_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_profile_id UUID NOT NULL REFERENCES child_food_profiles(id) ON DELETE CASCADE,
    restriction_type dietary_restriction_type NOT NULL,
    details TEXT,
    alternatives_provided TEXT
);

CREATE TABLE allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    allergen VARCHAR(255) NOT NULL,
    severity allergen_severity NOT NULL,
    reaction_symptoms TEXT,
    action_required TEXT NOT NULL,
    medication_if_reaction TEXT,
    epipen_required BOOLEAN DEFAULT FALSE,
    epipen_location TEXT,
    parent_notified_on_exposure BOOLEAN DEFAULT TRUE,
    diagnosed_date DATE
);

-- ─────────────────────────────────
-- HEALTH & MEDICAL
-- ─────────────────────────────────

CREATE TABLE health_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
    blood_type VARCHAR(10),
    doctor_name VARCHAR(255),
    doctor_phone VARCHAR(50),
    clinic_name VARCHAR(255),
    hospital_preference VARCHAR(255),
    health_insurance_provider VARCHAR(255),
    insurance_number VARCHAR(100),
    has_special_needs BOOLEAN DEFAULT FALSE,
    special_needs_details TEXT,
    chronic_conditions TEXT,
    medical_notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    health_profile_id UUID REFERENCES health_profiles(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    route VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    reason TEXT,
    prescribing_doctor VARCHAR(255),
    storage_instructions TEXT,
    refrigerate BOOLEAN DEFAULT FALSE,
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE medication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id),
    administered_at TIMESTAMP WITH TIME ZONE NOT NULL,
    dose_given VARCHAR(100),
    observations TEXT,
    parent_notified BOOLEAN DEFAULT FALSE
);

CREATE TABLE vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    health_profile_id UUID REFERENCES health_profiles(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    date_given DATE NOT NULL,
    next_due_date DATE,
    given_by VARCHAR(255),
    is_up_to_date BOOLEAN DEFAULT TRUE,
    notes TEXT
);

CREATE TABLE incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id),
    center_id UUID NOT NULL REFERENCES centers(id),
    incident_type incident_type NOT NULL,
    description TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    first_aid_given TEXT,
    doctor_consulted BOOLEAN DEFAULT FALSE,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    parent_notified BOOLEAN DEFAULT FALSE,
    parent_notified_at TIMESTAMP WITH TIME ZONE,
    parent_signed_at TIMESTAMP WITH TIME ZONE,
    parent_signature_url TEXT
);

-- ─────────────────────────────────
-- DAILY LOGS
-- ─────────────────────────────────

CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id),
    log_date DATE NOT NULL,
    arrival_mood arrival_mood,
    departure_mood mood_type,
    overall_notes TEXT,
    had_good_day BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(child_id, log_date)
);

CREATE TABLE nap_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id),
    sleep_start TIMESTAMP WITH TIME ZONE NOT NULL,
    sleep_end TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    sleep_quality nap_quality,
    notes TEXT
);

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id),
    activity_type activity_type NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    description TEXT,
    engagement_level engagement_level,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    staff_notes TEXT
);

CREATE TABLE meal_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id),
    staff_id UUID NOT NULL REFERENCES users(id),
    meal_type meal_type NOT NULL,
    items_served TEXT NOT NULL,
    portion_eaten portion_eaten NOT NULL,
    refused_items TEXT,
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE diaper_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    type diaper_type NOT NULL,
    notes TEXT
);

CREATE TABLE potty_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id),
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    successful BOOLEAN NOT NULL,
    notes TEXT
);

CREATE TABLE media_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id),
    daily_log_id UUID REFERENCES daily_logs(id),
    media_type media_type NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    visible_to_parents BOOLEAN DEFAULT TRUE,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────
-- ATTENDANCE
-- ─────────────────────────────────

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    center_id UUID NOT NULL REFERENCES centers(id),
    date DATE NOT NULL,
    checkin_at TIMESTAMP WITH TIME ZONE,
    checkin_by VARCHAR(255),
    checkin_method checkin_method,
    checkout_at TIMESTAMP WITH TIME ZONE,
    checkout_by VARCHAR(255),
    late_pickup_alert BOOLEAN DEFAULT FALSE,
    notes TEXT,
    UNIQUE(child_id, date)
);

-- ─────────────────────────────────
-- MESSAGING
-- ─────────────────────────────────

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    type conversation_type NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    center_id UUID NOT NULL REFERENCES centers(id),
    body TEXT NOT NULL,
    message_type message_type DEFAULT 'TEXT',
    attachment_url TEXT,
    is_announcement BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE message_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    audience audience_type NOT NULL,
    room_target VARCHAR(100),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────
-- BILLING
-- ─────────────────────────────────

CREATE TABLE fee_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    monthly_amount NUMERIC(10, 2) NOT NULL,
    registration_fee NUMERIC(10, 2),
    sibling_discount BOOLEAN DEFAULT FALSE,
    sibling_discount_pct NUMERIC(5, 2),
    billing_cycle billing_cycle DEFAULT 'MONTHLY'
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    center_id UUID NOT NULL REFERENCES centers(id),
    fee_plan_id UUID REFERENCES fee_plans(id),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount_due NUMERIC(10, 2) NOT NULL,
    amount_paid NUMERIC(10, 2) DEFAULT 0,
    due_date DATE NOT NULL,
    status invoice_status DEFAULT 'DRAFT',
    notes TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    transaction_ref VARCHAR(255),
    status payment_status DEFAULT 'PENDING',
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────
-- COMPLIANCE & OPERATIONS
-- ─────────────────────────────────

CREATE TABLE staff_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    certification_name VARCHAR(255) NOT NULL,
    issued_by VARCHAR(255),
    issued_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    document_url TEXT,
    status cert_status DEFAULT 'VALID'
);

CREATE TABLE room_ratio_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    room_name VARCHAR(100) NOT NULL,
    child_count INTEGER NOT NULL,
    staff_count INTEGER NOT NULL,
    ratio NUMERIC(5, 2) NOT NULL,
    within_limit BOOLEAN NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE regulatory_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    checklist_name VARCHAR(255) NOT NULL,
    frequency checklist_frequency NOT NULL,
    due_date DATE NOT NULL,
    completed_date DATE,
    completed_by UUID REFERENCES users(id),
    status checklist_status DEFAULT 'PENDING',
    notes TEXT
);

CREATE TABLE enrollment_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id)
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────
-- INDEXES FOR PERFORMANCE
-- ─────────────────────────────────

CREATE INDEX idx_users_center_id ON users(center_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_children_center_id ON children(center_id);
CREATE INDEX idx_parent_child_user_id ON parent_child(user_id);
CREATE INDEX idx_parent_child_child_id ON parent_child(child_id);
CREATE INDEX idx_daily_logs_child_id ON daily_logs(child_id);
CREATE INDEX idx_daily_logs_log_date ON daily_logs(log_date);
CREATE INDEX idx_attendance_child_id ON attendance(child_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);
CREATE INDEX idx_invoices_child_id ON invoices(child_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_allergies_child_id ON allergies(child_id);
CREATE INDEX idx_medications_child_id ON medications(child_id);
