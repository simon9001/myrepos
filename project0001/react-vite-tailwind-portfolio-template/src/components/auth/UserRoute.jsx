import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../features/Slice/AuthSlice';

const UserRoute = ({ children }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login page while saving the attempted url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default UserRoute;
