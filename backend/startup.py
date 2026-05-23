from app.models import base, child, child_profile, daily_log, messaging, compliance, user
from app.database import Base, engine, SessionLocal
from app.models.base import Center
from app.models.user import User, UserRole
from app.core.security import hash_password
from sqlalchemy import text
from alembic.config import Config
from alembic import command
import uuid
import os

# Run Alembic migrations
alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "alembic.ini"))
command.upgrade(alembic_cfg, "head")
print("Migrations applied!")

# Create raw SQL tables not managed by ORM
with engine.connect() as conn:
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT,
            type VARCHAR(100),
            related_id UUID,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """))
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS parent_link_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            parent_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
            child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
            registration_number VARCHAR(100),
            status VARCHAR(50) DEFAULT 'PENDING',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """))
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS staff_attendance (
            id UUID PRIMARY KEY,
            staff_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
            center_id UUID REFERENCES centers(id) ON DELETE CASCADE NOT NULL,
            date DATE NOT NULL,
            checked_in_at TIMESTAMPTZ,
            checked_out_at TIMESTAMPTZ,
            status VARCHAR(20) DEFAULT 'PRESENT',
            UNIQUE(staff_id, date)
        )
    """))
    conn.commit()
print("Extra tables ensured!")

# Create default admin if not exists
db = SessionLocal()
existing = db.query(User).filter(User.email == "admin@nestcare.com").first()
if not existing:
    center = Center(
        id=uuid.uuid4(),
        name='NestCare Daycare',
        address='123 Main Street',
        phone='123-456-7890',
        email='info@nestcare.com',
        license_number='NC-001',
        capacity=50
    )
    db.add(center)
    db.flush()
    admin = User(
        id=uuid.uuid4(),
        center_id=center.id,
        full_name='Admin User',
        email='admin@nestcare.com',
        phone='123-456-7890',
        role=UserRole.ADMIN,
        password_hash=hash_password('Admin123'),
        is_active=True
    )
    db.add(admin)
    db.commit()
    print("Admin created!")
else:
    print("Admin already exists")
db.close()
