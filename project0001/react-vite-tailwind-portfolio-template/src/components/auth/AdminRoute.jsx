import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../features/Slice/AuthSlice';

const AdminRoute = ({ children }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectCurrentUser);
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login page while saving the attempted url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user?.role !== 'admin') {
        // Redirect to home or a standard dashboard if not an admin
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
