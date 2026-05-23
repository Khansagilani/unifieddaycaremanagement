import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './pages/Login'
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
import NotificationsPage from './pages/NotificationsPage'

function PublicOrDashboard({ role, children }) {
    const { user } = useAuth()
    if (!user) return <LandingPage role={role.toLowerCase()} />
    if (user.role !== role) return <Navigate to="/" replace />
    return children
}

export default function App() {
    return (
        <ErrorBoundary>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<LandingPage role="parent" />} />
                <Route path="/parents" element={<LandingPage role="parent" />} />

                {/* Staff Routes */}
                <Route path="/staff" element={<PublicOrDashboard role="STAFF"><StaffDashboard /></PublicOrDashboard>} />
                <Route path="/staff/attendance" element={<ProtectedRoute role="STAFF"><Attendance /></ProtectedRoute>} />
                <Route path="/staff/daily-log" element={<ProtectedRoute role="STAFF"><DailyLog /></ProtectedRoute>} />
                <Route path="/staff/messages" element={<ProtectedRoute role="STAFF"><StaffMessages /></ProtectedRoute>} />

                {/* Parent Routes */}
                <Route path="/parent" element={<PublicOrDashboard role="PARENT"><ParentDashboard /></PublicOrDashboard>} />
                <Route path="/parent/feed" element={<ProtectedRoute role="PARENT"><ChildFeed /></ProtectedRoute>} />
                <Route path="/parent/messages" element={<ProtectedRoute role="PARENT"><ParentMessages /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<PublicOrDashboard role="ADMIN"><AdminDashboard /></PublicOrDashboard>} />
                <Route path="/admin/children" element={<ProtectedRoute role="ADMIN"><AdminChildren /></ProtectedRoute>} />
                <Route path="/admin/fee-plans" element={<ProtectedRoute role="ADMIN"><AdminFeePlans /></ProtectedRoute>} />
                <Route path="/admin/staff" element={<ProtectedRoute role="ADMIN"><AdminStaff /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute role="ADMIN"><AdminReports /></ProtectedRoute>} />
                <Route path="/admin/invoices" element={<ProtectedRoute role="ADMIN"><AdminInvoices /></ProtectedRoute>} />
                <Route path="/admin/link-requests" element={<ProtectedRoute role="ADMIN"><AdminLinkRequests /></ProtectedRoute>} />

                {/* Shared Routes */}
                <Route path="/children" element={<ProtectedRoute role={["STAFF", "PARENT", "ADMIN"]}><ChildrenList /></ProtectedRoute>} />
                <Route path="/children/:id" element={<ProtectedRoute role={["STAFF", "PARENT", "ADMIN"]}><ChildDetail /></ProtectedRoute>} />
                <Route path="/children/:id/edit" element={<ProtectedRoute role={["ADMIN", "PARENT", "STAFF"]}><EditChildProfile /></ProtectedRoute>} />
                <Route path="/invoices" element={<ProtectedRoute role={["ADMIN", "PARENT"]}><AdminInvoices /></ProtectedRoute>} />
                <Route path="/invoices/:id/pay" element={<ProtectedRoute role={["ADMIN", "PARENT"]}><InvoicePay /></ProtectedRoute>} />
                <Route path="/register" element={<ParentRegister />} />
                <Route path="/notifications" element={<ProtectedRoute role={["ADMIN", "PARENT", "STAFF"]}><NotificationsPage /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </ErrorBoundary>
    )
}



