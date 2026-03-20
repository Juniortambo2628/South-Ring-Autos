import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = true }) => {
    const location = useLocation();
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const token = localStorage.getItem('auth_token');

    if (!token || !user) {
        // Not logged in
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && user.role !== 'admin') {
        // Not an admin
        return <Navigate to="/" replace />;
    }

    if (!user.profile_completed && location.pathname !== '/complete-profile') {
        // Profile not completed
        return <Navigate to="/complete-profile" replace />;
    }

    return children;
};

export default ProtectedRoute;
