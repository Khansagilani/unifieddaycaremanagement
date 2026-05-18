# NestCare Platform - API Documentation

## Base URL
```
http://localhost:8000 (development)
https://api.nestcare.com (production)
```

## Authentication
All endpoints (except `/api/auth/login`) require a Bearer token in the Authorization header:
```
Authorization: Bearer {access_token}
```

## Authentication Endpoints

### POST /api/auth/login
Login with email and password
```json
Request:
{
  "email": "staff@center.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": { "id": "...", "full_name": "...", "role": "STAFF" },
    "access_token": "...",
    "refresh_token": "...",
    "expires_in": 3600
  }
}
```

### POST /api/auth/register
Admin creates new user
```json
Request (admin only):
{
  "email": "newstaff@center.com",
  "password": "password123",
  "full_name": "Jane Staff",
  "phone": "555-0123",
  "role": "STAFF"
}
```

### GET /api/users?role=STAFF
List users by role (admin only)

### POST /api/auth/refresh
Refresh access token

## Children Endpoints

### GET /api/children
List all children for center (staff/parent/admin)
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "Alice",
      "last_name": "Smith",
      "date_of_birth": "2020-01-15",
      "gender": "FEMALE",
      "room_id": 1,
      "status": "ACTIVE"
    }
  ],
  "pagination": { "skip": 0, "limit": 50, "total": 10 }
}
```

### POST /api/children
Create new child (admin only)
```json
Request:
{
  "first_name": "Bob",
  "last_name": "Johnson",
  "date_of_birth": "2020-06-20",
  "gender": "MALE",
  "room_id": 1,
  "enrollment_date": "2024-01-01"
}
```

### GET /api/children/{id}/profile
Get complete child profile with all relations

### PUT /api/children/{id}
Update child information (admin only)

## Attendance Endpoints

### POST /api/health/attendance/check-in
Check child in
```json
Request:
{
  "child_id": 1,
  "check_in_time": "2024-05-18T08:30:00Z"
}
```

### POST /api/health/attendance/check-out
Check child out
```json
Request:
{
  "child_id": 1,
  "check_out_time": "2024-05-18T16:30:00Z"
}
```

### GET /api/health/attendance/{child_id}
Get attendance records
```
Query params:
- start_date: YYYY-MM-DD
- end_date: YYYY-MM-DD
```

## Daily Log Endpoints

### POST /api/health/daily-logs
Create/update daily log (staff only)
```json
Request:
{
  "child_id": 1,
  "log_date": "2024-05-18",
  "notes": "Great day today!"
}
```

### GET /api/health/daily-logs/{child_id}
Get child's daily logs
```
Query params:
- start_date: YYYY-MM-DD
- end_date: YYYY-MM-DD
```

### POST /api/health/daily-logs/{child_id}/meals
Add meal record
```json
Request:
{
  "log_date": "2024-05-18",
  "meal_type": "BREAKFAST",
  "quantity": "full bowl",
  "notes": "Ate well"
}
```

## Media Endpoints

### POST /api/media/upload-cloudinary
Upload image/video to Cloudinary
```
Content-Type: multipart/form-data
Fields:
- file: binary
- filename: string
- child_id: integer
```

### GET /api/media/children/{child_id}
Get all media for a child

## Messaging Endpoints

### POST /api/messages/conversations
Create conversation
```json
Request:
{
  "member_ids": [2, 3],
  "name": "Alice's Teachers"
}
```

### POST /api/messages/messages
Send message
```json
Request:
{
  "conversation_id": 1,
  "content": "How is Alice today?"
}
```

### GET /api/messages/conversations/{id}
Get conversation messages

## Billing Endpoints

### POST /api/billing/fee-plans
Create fee plan (admin only)
```json
Request:
{
  "name": "Monthly Tuition",
  "amount_cents": 100000,
  "billing_cycle": "MONTHLY",
  "description": "Standard monthly tuition"
}
```

### GET /api/billing/fee-plans
List fee plans for center

### POST /api/billing/invoices
Create invoice (admin only)
```json
Request:
{
  "child_id": 1,
  "fee_plan_id": 1,
  "due_date": "2024-06-18"
}
```

### GET /api/billing/invoices
List invoices (filtered by role)

### POST /api/billing/stripe/create-payment-intent
Create Stripe payment for invoice
```json
Request:
{
  "invoice_id": 1
}

Response:
{
  "client_secret": "pi_xxxxx"
}
```

## WebSocket Endpoint

### WS /api/ws
Connect to WebSocket for real-time updates
```
URL: ws://localhost:8000/api/ws?token={access_token}

Message types:
- message: incoming chat message
- attendance_update: check-in/out event
- invoice:issued: new invoice created
```

## Error Responses

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect"
  }
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error
