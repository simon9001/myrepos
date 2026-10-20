import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate} from 'react-router'

const AdminRoute = ({ children }) => {
    const { isAuthenticated, user } = useSelector((state) => state.authSlice)
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />
    }

    // Check if user is admin
    if (user.user_type !== 'admin') {
        // Redirect non-admin users to user dashboard
        if (user.user_type === 'agent') {
            return <Navigate to="/agent/dashboard" replace />
        }
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

export default AdminRoute