# NestCare Testing Guide - Payment Flow & Phase 7

## Prerequisites
1. Backend running: `python -m uvicorn app.main:app --reload` on port 8000
2. Frontend running: `npm run dev` on port 5173
3. Database seeded with test data (run `python app/seed.py` if not done)

## Backend Setup

### 1. Install Missing Packages
```bash
cd backend
pip install cloudinary python-dotenv
```

### 2. Set Environment Variables (`.env`)
```
DATABASE_URL=postgresql://postgres:khansa1086@localhost:5432/nestcare
SECRET_KEY=your-secret-key-change-in-production
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:8000
```

### 3. Start Backend
```bash
python -m uvicorn app.main:app --reload
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Set Environment Variables (`.env.local`)
```
# No external payment provider key required for current invoice flow
```

### 3. Start Frontend
```bash
npm run dev
```

## Test Billing Flow

### Step 1: Login
- URL: `http://localhost:5173/login`
- Credentials (from seed data):
  - **Admin**: email=`admin@nestcare.com`, password=`password123`
  - **Staff**: email=`staff@nestcare.com`, password=`password123`
  - **Parent**: email=`parent@nestcare.com`, password=`password123`

### Step 2: View Invoices
- Navigate to `/invoices` (Admin or Parent role)
- You should see a list of invoices created during seeding

### Step 3: Verify Invoice Details
- Click on an invoice
- Confirm the invoice amount, due date, and status
- No external payment provider is configured in this version

### Step 4: Confirm Invoice Status
- Invoice status may remain as created until a manual payment workflow is added
- No webhook testing is needed for current flow

### Staff Dashboard (`/staff`)
- Shows today's check-ins, check-outs, daily logs count
- Lists children present and recent daily logs
- Quick action buttons to Check In/Out, Add Daily Log, Messages

### Attendance (`/staff/attendance`)
- Shows all children with check-in/check-out buttons
- Displays current check-in/out times for today
- QR scanner is a placeholder for future enhancement

### Daily Log (`/staff/daily-log`)
- 7-section form for logging child activities:
  1. **Naps** - Time
  2. **Meals** - Consumption level (Full/Half/Light/None)
  3. **Activities** - Text field (e.g., "Played in sandbox")
  4. **Diapers** - Type (Wet/Soiled/Both)
  5. **Potty** - Type (Wet/BM/Both)
  6. **Incidents** - Text field for minor incidents
  7. **General Notes** - Longer text for parent communication

### Messages (`/staff/messages`)
- List of conversations with parents/admin
- Select conversation to view message thread
- Send new messages to parents

## Troubleshooting

### "Module not found: cloudinary"
- Solution: `pip install cloudinary`

### Invoice payment flow not configured
- Payment is currently handled through invoice status only.

### Webhook doesn't trigger
- No webhook is required for the current invoice workflow.

### Invoice payment succeeds but status doesn't update
- Check backend billing endpoint logic and invoice status field

## Next Steps (Phase 8-9)
After Phase 7 validation:
- Phase 8: Parent frontend pages (Child Feed, Messages, Invoices)
- Phase 9: Admin frontend pages (Children management, Staff, Billing, Reports)
- Phase 10: WebSocket live updates
- Phase 11: Polish, testing, error boundaries
