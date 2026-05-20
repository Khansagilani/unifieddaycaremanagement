from app.models import base, child, child_profile, daily_log, messaging, compliance, user
from app.database import Base, engine, SessionLocal
from app.models.base import Center
from app.models.user import User, UserRole
from app.core.security import hash_password
import uuid

# Create all tables
Base.metadata.create_all(bind=engine)
print("Tables created!")

# Create admin only if doesn't exist
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