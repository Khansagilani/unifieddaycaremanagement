import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function ProtectedRoute({ children, role }) {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" replace />

    if (role) {
        const requiredRoles = Array.isArray(role) ? role : [role]
        if (!requiredRoles.includes(user.role)) return <Navigate to="/" replace />
    }

    return children
}
