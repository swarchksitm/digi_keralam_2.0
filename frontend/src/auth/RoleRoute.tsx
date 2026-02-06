import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../auth/store';

interface RoleRouteProps {
    allowedRoles: string[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default RoleRoute;
