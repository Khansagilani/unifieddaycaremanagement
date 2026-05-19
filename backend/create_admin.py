from app.models import base, child, child_profile, daily_log, messaging, compliance, user
from app.database import SessionLocal
from app.models.base import Center
from app.models.user import User, UserRole
from app.core.security import hash_password
import uuid

db = SessionLocal()

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
print('Done! Email: admin@nestcare.com Password: Admin123')