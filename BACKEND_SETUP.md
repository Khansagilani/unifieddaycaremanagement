# NestCare Backend Setup Guide

## Prerequisites
- Python 3.11+
- PostgreSQL 12+
- pip (Python package manager)

## Installation Steps

### 1. Create and Activate Virtual Environment
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Setup PostgreSQL Database

#### Option A: Using pgAdmin (Recommended)
1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name: `nestcare`
4. Owner: `postgres`
5. Open Query Tool on `nestcare` database
6. Copy and paste the entire contents of `../database_schema.sql`
7. Execute the query

#### Option B: Using psql Command Line
```bash
# Create database
createdb -U postgres nestcare

# Run schema
psql -U postgres -d nestcare -f ../database_schema.sql
```

### 4. Verify Environment Variables
Check `.env` file contains:
```
DATABASE_URL=postgresql://postgres:khansa1086@localhost:5432/nestcare
SECRET_KEY=nestcare-secret-key-change-this-in-production-2024
(other variables...)
```

### 5. Seed Database with Test Data
```bash
python seed.py
```

Expected output:
```
✓ Database seeded successfully!
✓ Created 1 center, 4 rooms, 1 admin, 2 staff, 2 parents, 3 children
✓ Test credentials:
  Admin: admin@nestcare.com / Admin1234!
  Staff: staff1@nestcare.com / Staff1234!
  Parent: parent1@nestcare.com / Parent1234!
```

### 6. Run FastAPI Server
```bash
uvicorn main:app --reload --port 8000
```

Server will be available at: `http://localhost:8000`

### 7. Access API Documentation
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## Project Structure
```
backend/
├── main.py                 # FastAPI entry point
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables
├── seed.py               # Database seeding script
├── app/
│   ├── database.py       # SQLAlchemy setup
│   ├── models/           # SQLAlchemy ORM models
│   ├── schemas/          # Pydantic request/response schemas
│   ├── routers/          # FastAPI route handlers
│   ├── services/         # Business logic
│   ├── core/
│   │   ├── config.py     # Settings
│   │   ├── security.py   # JWT & password hashing
│   │   ├── dependencies.py  # FastAPI dependencies
│   │   └── websocket_manager.py  # WebSocket handling
│   └── utils/
│       ├── response.py   # Standard response format
│       └── pagination.py # Pagination helper
```

## Testing Endpoints

### Login with cURL
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nestcare.com","password":"Admin1234!"}'
```

### Health Check
```bash
curl http://localhost:8000/api/health
```

## Database Schema
The database includes 40+ tables organized as:
- **Core:** users, centers, rooms
- **Children:** child profiles, food, health, daily logs, media
- **Operations:** attendance, messaging, billing
- **Compliance:** certifications, checklists, audit logs

## API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /login` - Login
- `POST /refresh` - Refresh token
- `POST /logout` - Logout
- `GET /me` - Get current user
- `PUT /change-password` - Change password
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

## Key Design Decisions

1. **JWT Authentication:** Access token (15 min) + Refresh token (7 days)
2. **Center Isolation:** All data scoped to center_id from JWT
3. **Role-Based Access:** ADMIN, STAFF, PARENT with different permissions
4. **Parent Data Isolation:** Parents only see their linked children
5. **Timestamps:** All stored as UTC with timezone
6. **Standard Response Format:** `{success, data, pagination, error}`

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Confirm password is correct

### ModuleNotFoundError
- Ensure venv is activated
- Run `pip install -r requirements.txt` again

### Port Already in Use
```bash
# Change port:
uvicorn main:app --reload --port 8001
```

## Next Steps
1. Implement all routers (children, daily_logs, attendance, etc.)
2. Add more services for business logic
3. Implement WebSocket for real-time updates
4. Add Cloudinary integration for media uploads
5. Create frontend React application

## Support
For issues, check:
1. FastAPI docs: https://fastapi.tiangolo.com
2. SQLAlchemy docs: https://docs.sqlalchemy.org
3. Database logs: Check PostgreSQL logs
