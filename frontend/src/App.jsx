import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import axios from 'axios'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import ProtectedRoute from './components/ProtectedRoute'
import ChildrenList from './pages/ChildrenList'
import ChildDetail from './pages/ChildDetail'
import AdminDashboard from './pages/AdminDashboard'
import AdminChildren from './pages/AdminChildren'
import AdminFeePlans from './pages/AdminFeePlans'
import AdminStaff from './pages/AdminStaff'
import AdminReports from './pages/AdminReports'
import AdminInvoices from './pages/AdminInvoices'
import InvoicePay from './pages/InvoicePay'
import StaffDashboard from './pages/StaffDashboard'
import Attendance from './pages/Attendance'
import DailyLog from './pages/DailyLog'
import StaffMessages from './pages/StaffMessages'
import ParentDashboard from './pages/ParentDashboard'
import ChildFeed from './pages/ChildFeed'
import ParentMessages from './pages/ParentMessages'
import LandingPage from './pages/LandingPage'
import useAuth from './hooks/useAuth'
import EditChildProfile from './pages/EditChildProfile'
import ParentRegister from './pages/ParentRegister'
import AdminLinkRequests from './pages/AdminLinkRequests'
import AdminStaffAttendance from './pages/AdminStaffAttendance'
import NotificationsPage from './pages/NotificationsPage'

// Redirect logged-in users to their dashboard, otherwise show login
function LoginGuard({ children }) {
    const { user } = useAuth()
    if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />
    if (user?.role === 'STAFF') return <Navigate to="/staff" replace />
    if (user?.role === 'PARENT') return <Navigate to="/parent" replace />
    return children
}

// Show role dashboard if logged in and correct role, otherwise show login
function PortalGuard({ role, children }) {
    const { user } = useAuth()
    if (!user) return children   // e.g. staff login page shown
    if (user.role !== role) return <Navigate to="/" replace />
    return children
}

export default function App() {
    useEffect(() => {
        const url = import.meta.env.VITE_API_URL || 'http://localhost:8001'
        axios.get(`${url}/api/health`, { timeout: 60000 }).catch(() => {})
    }, [])

    return (
        <ErrorBoundary>
            <Routes>
                {/* Public landing page */}
                <Route path="/" element={<LandingPage />} />

                {/* Public login — Parent & Staff only */}
                <Route path="/login" element={<LoginGuard><Login /></LoginGuard>} />

                {/* Secret admin login — not linked from anywhere public */}
                <Route path="/nestcare-admin-portal-10863" element={<AdminLogin />} />

                {/* Parent register */}
                <Route path="/register" element={<ParentRegister />} />

                {/* Staff Routes */}
                <Route path="/staff" element={<PortalGuard role="STAFF"><StaffDashboard /></PortalGuard>} />
                <Route path="/staff/attendance" element={<ProtectedRoute role="STAFF"><Attendance /></ProtectedRoute>} />
                <Route path="/staff/daily-log" element={<ProtectedRoute role="STAFF"><DailyLog /></ProtectedRoute>} />
                <Route path="/staff/messages" element={<ProtectedRoute role="STAFF"><StaffMessages /></ProtectedRoute>} />

                {/* Parent Routes */}
                <Route path="/parent" element={<PortalGuard role="PARENT"><ParentDashboard /></PortalGuard>} />
                <Route path="/parent/feed" element={<ProtectedRoute role="PARENT"><ChildFeed /></ProtectedRoute>} />
                <Route path="/parent/messages" element={<ProtectedRoute role="PARENT"><ParentMessages /></ProtectedRoute>} />

                {/* Admin Routes — protected, only reachable after admin login */}
                <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/children" element={<ProtectedRoute role="ADMIN"><AdminChildren /></ProtectedRoute>} />
                <Route path="/admin/fee-plans" element={<ProtectedRoute role="ADMIN"><AdminFeePlans /></ProtectedRoute>} />
                <Route path="/admin/staff" element={<ProtectedRoute role="ADMIN"><AdminStaff /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute role="ADMIN"><AdminReports /></ProtectedRoute>} />
                <Route path="/admin/invoices" element={<ProtectedRoute role="ADMIN"><AdminInvoices /></ProtectedRoute>} />
                <Route path="/admin/link-requests" element={<ProtectedRoute role="ADMIN"><AdminLinkRequests /></ProtectedRoute>} />
                <Route path="/admin/staff-attendance" element={<ProtectedRoute role="ADMIN"><AdminStaffAttendance /></ProtectedRoute>} />

                {/* Shared Routes */}
                <Route path="/children" element={<ProtectedRoute role={["STAFF", "PARENT", "ADMIN"]}><ChildrenList /></ProtectedRoute>} />
                <Route path="/children/:id" element={<ProtectedRoute role={["STAFF", "PARENT", "ADMIN"]}><ChildDetail /></ProtectedRoute>} />
                <Route path="/children/:id/edit" element={<ProtectedRoute role={["ADMIN", "PARENT", "STAFF"]}><EditChildProfile /></ProtectedRoute>} />
                <Route path="/invoices" element={<ProtectedRoute role={["ADMIN", "PARENT"]}><AdminInvoices /></ProtectedRoute>} />
                <Route path="/invoices/:id/pay" element={<ProtectedRoute role={["ADMIN", "PARENT"]}><InvoicePay /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute role={["ADMIN", "PARENT", "STAFF"]}><NotificationsPage /></ProtectedRoute>} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </ErrorBoundary>
    )
}
