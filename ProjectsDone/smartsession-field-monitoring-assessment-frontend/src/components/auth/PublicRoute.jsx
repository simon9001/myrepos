import React from 'react'
import { Navigate } from 'react-router'
import { useSelector } from 'react-redux'

const PublicRoute = ({ children }) => {
    const { isAuthenticated, user } = useSelector((state) => state.authSlice)

    // If user is already authenticated, redirect to appropriate dashboard
    if (isAuthenticated && user) {
        if (user.user_type === 'admin') {
            return <Navigate to="/admin/dashboard" replace />
        }
        if (user.user_type === 'agent') {
            return <Navigate to="/agent/dashboard" replace />
        }
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

export default PublicRoute