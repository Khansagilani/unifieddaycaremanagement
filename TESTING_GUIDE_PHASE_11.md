# NestCare Testing & Validation Guide

## Frontend Testing

### Unit Tests to Implement
1. **useWebSocket Hook** - Test connection, message handling, reconnection
2. **useAuth Hook** - Test login/logout, token persistence
3. **ProtectedRoute** - Test role-based access, redirects
4. **API Interceptors** - Test token refresh, error handling

### Component Tests
- Login component (valid/invalid credentials)
- AdminDashboard (stats loading)
- Attendance (check-in/out)
- ParentMessages (message sending with WebSocket)

### Example Test (Jest + React Testing Library)
```javascript
import { render, screen } from '@testing-library/react'
import AdminDashboard from '../pages/AdminDashboard'

test('loads stats on mount', async () => {
  render(<AdminDashboard />)
  expect(screen.getByText('Active Children')).toBeInTheDocument()
})
```

## Backend Testing

### API Endpoint Tests
1. **Authentication**
   - POST /api/auth/login - valid/invalid credentials
   - POST /api/auth/register - admin creates user
   - GET /api/auth/me - authenticated user info

2. **Children Management**
   - GET /api/children - list with pagination
   - POST /api/children - admin creates child
   - GET /api/children/{id}/profile - full profile

3. **Attendance**
   - POST /api/health/attendance/check-in
   - POST /api/health/attendance/check-out
   - GET /api/health/attendance - get attendance records

4. **Billing**
   - POST /api/billing/fee-plans - create fee plan
   - GET /api/billing/fee-plans - list fee plans
   - POST /api/billing/invoices - create invoice
   - POST /api/billing/stripe/create-payment-intent - Stripe integration

5. **Messaging**
   - POST /api/messages/conversations - create conversation
   - POST /api/messages/messages - send message
   - GET /api/messages/conversations/{id} - get conversation messages

### WebSocket Tests
- Connection with valid token
- Message broadcasting
- Real-time attendance updates
- Disconnection/reconnection

## Manual Testing Checklist

### Staff Workflow
- [ ] Staff logs in with STAFF role
- [ ] Check-in/out children (with WebSocket sync)
- [ ] Add daily log entries
- [ ] Send messages to parents in real-time
- [ ] View messages from parents

### Parent Workflow
- [ ] Parent logs in and sees enrolled children
- [ ] View child activity feed with media/logs
- [ ] Send messages to staff (real-time)
- [ ] View and pay invoices via Stripe
- [ ] Receive live notifications

### Admin Workflow
- [ ] Create new children and staff
- [ ] Manage fee plans
- [ ] View reports and analytics
- [ ] Issue invoices
- [ ] Monitor real-time attendance

## Performance Optimization

### Frontend
- Code splitting by route
- Image lazy loading
- Debounce WebSocket message handlers
- Optimize re-renders with React.memo

### Backend
- Database indexing on frequently queried fields
- API response pagination
- Cache fee plans and center config
- Connection pooling for database

## Security Validation

### Checks to Perform
- [ ] JWT tokens expire and refresh correctly
- [ ] Role-based access enforced on all endpoints
- [ ] SQL injection prevention in queries
- [ ] CORS properly configured
- [ ] Sensitive data not logged
- [ ] Stripe keys not exposed in frontend
- [ ] Password hashed with bcrypt
- [ ] WebSocket token validation

## Deployment Checklist

- [ ] Environment variables configured (.env files)
- [ ] Database migrations run
- [ ] Frontend built for production
- [ ] Backend error logging configured
- [ ] HTTPS enabled
- [ ] Database backups scheduled
- [ ] Monitoring/alerting set up
