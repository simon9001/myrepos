import React from 'react'
import { Navigate } from 'react-router'
import { useSelector } from 'react-redux'

const AgentRoute = ({ children }) => {
    const { isAuthenticated, user } = useSelector((state) => state.authSlice)

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />
    }

    // Check if user is agent
    if (user.user_type !== 'agent') {

        if (user.user_type === 'admin') {
            return <Navigate to="/admin/dashboard" replace />
        }
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

export default AgentRoute