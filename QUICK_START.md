# NestCare — Quick Start Guide

## ⚡ Get Running in 10 Minutes

### What You Need
- Python 3.11+
- PostgreSQL running locally
- pgAdmin (optional but recommended)
- Terminal/Command Prompt

### Files You Have
```
nestcare/
├── database_schema.sql          ← Run this in pgAdmin first
├── backend/
│   ├── main.py                  ← FastAPI server
│   ├── requirements.txt         ← Install these
│   ├── .env                     ← Already configured
│   └── seed.py                  ← Creates test data
├── BACKEND_SETUP.md             ← Detailed instructions
└── PROJECT_STATUS.md            ← Complete status
```

---

## 🚀 Quick Setup

### 1️⃣ Database Setup (2 minutes)
**Using pgAdmin:**
1. Open pgAdmin → Right-click Databases → Create Database
2. Name: `nestcare` → Owner: `postgres` → Save
3. Right-click `nestcare` → Query Tool
4. Open `database_schema.sql` file
5. Copy ALL contents → Paste into Query Tool → Execute (F5)
6. ✓ Done! 40+ tables created

### 2️⃣ Python Environment (3 minutes)
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3️⃣ Populate Test Data (1 minute)
```bash
python seed.py
```

Expected output:
```
✓ Database seeded successfully!
✓ Test credentials:
  Admin: admin@nestcare.com / Admin1234!
  Staff: staff1@nestcare.com / Staff1234!
  Parent: parent1@nestcare.com / Parent1234!
```

### 4️⃣ Start Server (1 minute)
```bash
uvicorn main:app --reload --port 8000
```

Output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
Press CTRL+C to quit
```

### 5️⃣ Test It Works (1 minute)
Visit: **http://localhost:8000/docs**

You'll see Swagger UI with all endpoints!

**Test login:**
1. Find "POST /api/auth/login" → Try it out
2. Email: `admin@nestcare.com`
3. Password: `Admin1234!`
4. Click Execute

Result:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "access_token": "eyJ0eXAi...",
    "refresh_token": "eyJ0eXAi...",
    "token_type": "bearer",
    "expires_in": 900
  }
}
```

✓ **Backend is running!**

---

## 📊 Database Verification

**In pgAdmin:**
1. Left sidebar → Servers → postgres → Databases → nestcare → Schemas → public → Tables
2. You should see tables like:
   - `users`
   - `children`
   - `daily_logs`
   - `allergies`
   - `invoices`
   - ... and 30+ more

**Verify test data:**
```sql
-- In Query Tool:
SELECT * FROM users;
SELECT * FROM children;
SELECT * FROM allergies;
```

You should see:
- 1 center
- 3 users (1 admin, 1 staff)
- 3 children
- 2 parents
- allergies with SEVERE and ANAPHYLACTIC severities

---

## 🔧 Troubleshooting

### ❌ "Can't connect to database"
```bash
# Check PostgreSQL is running
psql -U postgres

# Check connection string in .env
DATABASE_URL=postgresql://postgres:khansa1086@localhost:5432/nestcare
```

### ❌ "ModuleNotFoundError"
```bash
# Make sure venv is activated
which python  # Should show path inside venv folder

# Reinstall dependencies
pip install -r requirements.txt
```

### ❌ "Port 8000 already in use"
```bash
# Use different port
uvicorn main:app --reload --port 8001
```

### ❌ "seed.py failed"
```bash
# Delete all data first
# In pgAdmin Query Tool:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# Re-run schema
-- paste database_schema.sql

# Then seed again
python seed.py
```

---

## 📝 Test Credentials

After seeding, use these to login:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@nestcare.com | Admin1234! |
| **Staff** | staff1@nestcare.com | Staff1234! |
| **Parent** | parent1@nestcare.com | Parent1234! |

---

## 📍 Important URLs

| What | URL |
|------|-----|
| **Swagger UI** | http://localhost:8000/docs |
| **ReDoc** | http://localhost:8000/redoc |
| **Health Check** | http://localhost:8000/api/health |
| **pgAdmin** | http://localhost:5050 (if running) |

---

## ✅ Verify Everything Works

```bash
# 1. Check database
curl http://localhost:8000/api/health

# Expected response:
# {"status":"ok","service":"NestCare API"}

# 2. Try login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nestcare.com","password":"Admin1234!"}'

# 3. Get current user (replace TOKEN with actual access_token from login)
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## 🎯 What's Ready

✓ Database with 40+ tables  
✓ Authentication system  
✓ Test data  
✓ Swagger UI for testing  
✓ All core models and schemas  

---

## 📦 What's Next

Once backend is verified:

1. **Phase 5** - Implement remaining API endpoints (children, daily logs, attendance, etc.)
2. **Phase 6** - Create React frontend with Vite
3. **Phase 7-9** - Build UI for admin, staff, parent roles
4. **Phase 10** - Add real-time WebSocket updates
5. **Phase 11** - Testing and polish

---

## 💡 Key Files to Know

| File | Purpose |
|------|---------|
| `main.py` | FastAPI entry point |
| `app/database.py` | Database connection |
| `app/models/` | All data models |
| `app/routers/auth.py` | Login/auth endpoints |
| `app/services/auth_service.py` | Auth business logic |
| `.env` | Configuration |
| `seed.py` | Creates test data |

---

## 📞 Common Commands

```bash
# Start virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Install requirements
pip install -r requirements.txt

# Run seed
python seed.py

# Start server
uvicorn main:app --reload

# Check database
psql -U postgres -d nestcare

# Deactivate venv
deactivate
```

---

## ⏱️ Timeline

- **Database setup:** 2 min
- **Python venv:** 3 min
- **Seed data:** 1 min
- **Start server:** 1 min
- **Total:** ~7 minutes to working system

---

## 🎉 Success!

If you see the Swagger UI and can login with test credentials, you're done with phases 1-4!

**Next:** Read `BACKEND_SETUP.md` for detailed next steps on implementing Phase 5 endpoints.

---

## 📖 Documentation Files

- `PROJECT_STATUS.md` - Complete implementation status
- `BACKEND_SETUP.md` - Detailed backend setup
- `database_schema.sql` - Database schema
- `requirements.txt` - Python dependencies

---

**Questions?** Check the documentation files or review the code comments in the model files.

Good luck! 🚀
