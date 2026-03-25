/**
 * @fileoverview Route wrapper for role-aware access control.
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PUBLIC_INTERFACE
 * Protect nested routes by requiring auth and (optionally) one of allowed roles.
 *
 * @param {{ allowedRoles?: string[] }} props Component props.
 * @return {JSX.Element} Element.
 */
export function ProtectedRoute({ allowedRoles = [] }) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}
