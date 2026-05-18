# 🏥 NestCare — Daycare Management Platform

**A unified daycare management and parent communication platform with staff operations, child profiling, real-time updates, and comprehensive billing.**

## 📋 Overview

NestCare is a complete platform designed to streamline daycare operations by putting the child at the center of everything. Staff log each child's entire day, parents receive live updates, and administrators manage the center efficiently.

**Key Audience:** The platform serves three primary users:
- **Admins** — Manage enrollment, staff, billing, reports
- **Staff** — Log daily activities, track attendance, communicate with parents
- **Parents** — Monitor their child's day, receive updates, manage invoices

---

## 🎯 Current Status

### ✅ PHASES 1-4 COMPLETE (Foundation Ready)

- [x] **Phase 1:** Complete PostgreSQL database schema (40+ tables)
- [x] **Phase 2:** Backend infrastructure with SQLAlchemy models
- [x] **Phase 3:** Authentication system (JWT, password reset, roles)
- [x] **Phase 4:** Test data seeding

### ⏳ PHASES 5-11 READY FOR IMPLEMENTATION

- [ ] Phase 5: Core backend API endpoints
- [ ] Phase 6: React + Vite frontend setup
- [ ] Phase 7-9: Frontend pages for all three roles
- [ ] Phase 10: Real-time WebSocket integration
- [ ] Phase 11: Testing and polish

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Python 3.11+
- PostgreSQL 12+
- pgAdmin (recommended)

### Setup
1. **Database Setup**
   ```bash
   # In pgAdmin, run database_schema.sql on new 'nestcare' database
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows or source venv/bin/activate (macOS/Linux)
   pip install -r requirements.txt
   ```

3. **Populate Test Data**
   ```bash
   python seed.py
   ```

4. **Start Server**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

5. **Access API**
   - Visit: http://localhost:8000/docs
   - Login with: admin@nestcare.com / Admin1234!

**Total time: ~5 minutes to working backend**

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **QUICK_START.md** | 5-minute setup guide |
| **BACKEND_SETUP.md** | Detailed backend setup |
| **PROJECT_STATUS.md** | Complete status report |
| **IMPLEMENTATION_SUMMARY.md** | What was built |
| **DELIVERABLES.md** | File inventory |

---

## 🏗️ Architecture

### Backend Stack
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy 2.0
- **Auth:** JWT + Bcrypt
- **Real-time:** WebSockets
- **Media:** Cloudinary
- **Validation:** Pydantic

### Frontend Stack (Ready to build)
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **State:** Zustand
- **HTTP:** Axios
- **Forms:** React Hook Form + Zod
- **Real-time:** Socket.io-client
- **Icons:** Lucide React

---

## 🗂️ Project Structure

```
nestcare/
├── 📚 Documentation (4 files)
├── 🗄️ database_schema.sql
└── 🐍 backend/
    ├── main.py
    ├── seed.py
    ├── requirements.txt
    ├── .env
    └── app/
        ├── models/ (8 files, all ORM models)
        ├── schemas/ (Pydantic validation)
        ├── routers/ (API endpoints)
        ├── services/ (Business logic)
        ├── core/ (Config, security, dependencies)
        └── utils/ (Helpers)
```

---

## 🔐 Core Features

### Authentication ✅
- [x] Email/password login
- [x] JWT tokens (access + refresh)
- [x] Password reset
- [x] Password change
- [x] Role-based access control
- [x] Center isolation

### Database ✅
- [x] 40+ tables
- [x] Complete schema
- [x] Foreign key relationships
- [x] Cascade delete rules
- [x] Performance indexes

### Data Models ✅
- [x] User and roles
- [x] Children with complete profiles
- [x] Food & allergies
- [x] Health & medications
- [x] Daily logs
- [x] Attendance
- [x] Messaging
- [x] Billing
- [x] Compliance

### Utilities ✅
- [x] Standard response format
- [x] Pagination helper
- [x] WebSocket manager
- [x] Environment configuration
- [x] Error handling

---

## 🧪 Test Credentials

After running `seed.py`:

```
Admin:  admin@nestcare.com / Admin1234!
Staff:  staff1@nestcare.com / Staff1234!
Parent: parent1@nestcare.com / Parent1234!
```

---

## 📊 API Endpoints (Phase 3 Complete)

### Authentication (`/api/auth`)
```
POST   /api/auth/login                 Login
POST   /api/auth/refresh               Refresh token
POST   /api/auth/logout                Logout
GET    /api/auth/me                    Current user
PUT    /api/auth/change-password       Change password
POST   /api/auth/forgot-password       Request reset
POST   /api/auth/reset-password        Complete reset
```

### Other Endpoints (Phase 5+)
- Children CRUD
- Child profiles
- Food & allergies
- Health & medications
- Daily logs
- Attendance
- Messaging
- Billing
- Reports
- WebSocket

---

## 🔄 Data Flow

```
User (Login)
    ↓
Auth Service (Validate credentials)
    ↓
JWT Tokens (Generate tokens)
    ↓
Client Store (Save tokens)
    ↓
Protected Routes (Check token)
    ↓
Role-based Access (Admin/Staff/Parent)
    ↓
Data Isolation (By center & parent)
```

---

## 📈 Implementation Status

| Component | Status | Files | Lines |
|-----------|--------|-------|-------|
| Database | ✅ | 1 | 1,000+ |
| Models | ✅ | 8 | 1,200+ |
| Auth | ✅ | 3 | 300+ |
| Config | ✅ | 4 | 200+ |
| Utils | ✅ | 2 | 40 |
| Seed | ✅ | 1 | 400+ |
| **Backend Total** | **✅** | **~20** | **3,200+** |
| **Frontend** | ⏳ | 0 | 0 |

---

## 🎯 User Roles & Permissions

### ADMIN
- Enroll children
- Manage staff
- View billing
- Generate reports
- Send announcements
- Access all data

### STAFF
- Check children in/out
- Fill daily logs
- Upload photos/videos
- Message parents
- Record incidents
- View assigned children

### PARENT
- View child's daily feed
- Receive live updates
- Message staff
- View photos/videos
- Check invoices
- See child profile

---

## 📱 Key Differentiators

✨ **Child-Centric Design**
- Everything centers on the child
- Complete personality and care profiles
- Allergy tracking with severity levels

✨ **Real-time Updates**
- WebSocket for live feed
- Parents see updates instantly
- No need to refresh

✨ **Role-Based Interfaces**
- Admin dashboard with analytics
- Staff tablet-friendly daily log
- Parent mobile-first feed

✨ **Comprehensive Profiling**
- Food preferences & restrictions
- Health & medications
- Personality & fears
- Routines & development
- Authorized pickups & emergencies

✨ **Business Management**
- Automated billing
- Incident reporting
- Compliance tracking
- Staff certifications
- Room ratios

---

## 🛠️ Installation

### Full Setup (10 minutes)

1. **Clone/Download Project**
   ```bash
   # Already set up in the workspace
   cd "A unified Daycare Management & Parent Communication Platform"
   ```

2. **Database (2 minutes)**
   ```
   Run database_schema.sql in pgAdmin on new 'nestcare' database
   ```

3. **Backend (5 minutes)**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   python seed.py
   ```

4. **Start (1 minute)**
   ```bash
   uvicorn main:app --reload
   ```

5. **Verify (1 minute)**
   - Visit http://localhost:8000/docs
   - Login and test endpoints

---

## 🔍 Project Files

### Must Read First
1. **QUICK_START.md** — Get running immediately
2. **PROJECT_STATUS.md** — Understand what's done
3. **BACKEND_SETUP.md** — Detailed setup

### Reference
- **database_schema.sql** — Database structure
- **DELIVERABLES.md** — Complete file list
- **IMPLEMENTATION_SUMMARY.md** — What was built

---

## 🚦 Getting Help

### Common Issues

**Database connection error?**
→ Check PostgreSQL is running, verify credentials in .env

**ModuleNotFoundError?**
→ Ensure venv is activated, run `pip install -r requirements.txt`

**Port 8000 already in use?**
→ Use different port: `uvicorn main:app --reload --port 8001`

### Documentation
- Full backend setup: See BACKEND_SETUP.md
- All endpoints: See PROJECT_STATUS.md
- File structure: See DELIVERABLES.md

---

## 🎓 Code Quality

✅ Type hints on all functions  
✅ Comprehensive docstrings  
✅ Error handling with proper messages  
✅ Separation of concerns (models, services, routers)  
✅ Standard response format  
✅ Database constraints and indexes  
✅ Environment configuration  
✅ Production-ready code  

---

## 🔐 Security Features

✅ Bcrypt password hashing (12 rounds)  
✅ JWT token validation  
✅ Role-based access control  
✅ Center data isolation  
✅ Secure refresh token flow  
✅ CORS configuration  
✅ Input validation with Pydantic  
✅ SQL injection prevention (SQLAlchemy)  
✅ Error handling without data leaks  

---

## 📞 Contact & Support

**Questions about the setup?**
1. Check QUICK_START.md
2. Check BACKEND_SETUP.md
3. Review PROJECT_STATUS.md

**Ready to implement Phase 5?**
→ Follow the same pattern used in the auth module

---

## 📜 License

NestCare Platform v2.0

---

## 🎉 Next Steps

1. ✅ Read QUICK_START.md (5 min)
2. ✅ Run setup (5 min)
3. ✅ Test API in Swagger (1 min)
4. ✅ Review code structure
5. ⏳ Implement Phase 5 endpoints
6. ⏳ Build React frontend
7. ⏳ Connect real-time updates
8. ⏳ Deploy to production

---

## 📊 Stats

- **Database Tables:** 40+
- **Enums:** 25+
- **API Endpoints (Phase 3):** 7
- **ORM Models:** 8 files
- **Test Users:** 3
- **Test Children:** 3
- **Code Lines:** 4,400+
- **Documentation:** 4 files
- **Setup Time:** 5 minutes

---

## ✨ Highlights

🏆 **Production-Ready Foundation**
- Complete database schema
- Secure authentication
- Role-based access
- Standard patterns
- Comprehensive documentation

🏆 **Ready to Extend**
- All models in place
- Pattern established
- Services layer ready
- Dependency injection set up
- Error handling configured

🏆 **Developer-Friendly**
- Clear folder structure
- Comprehensive comments
- Swagger UI documentation
- Test data included
- Setup guides provided

---

## 🚀 Ready to Launch

**The NestCare platform foundation is complete!**

Everything is in place to:
- ✅ Run a working backend (right now)
- ✅ Test authentication (right now)
- ✅ Seed test data (right now)
- ⏳ Implement remaining endpoints (Phase 5)
- ⏳ Build the frontend (Phase 6-9)
- ⏳ Add real-time features (Phase 10)

**Status:** Foundation Complete  
**Timeline:** 5 minutes to working system  
**Next:** Phase 5 implementation

---

**Created:** May 18, 2026  
**Version:** 2.0  
**Status:** ✅ Phases 1-4 Complete

#   A - u n i f i e d - D a y c a r e - M a n a g e m e n t - P a r e n t - C o m m u n i c a t i o n - P l a t f o r m  
 