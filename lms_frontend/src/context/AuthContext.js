/**
 * @fileoverview Auth context for role-aware navigation and protected routes.
 */

import React, { createContext, useContext, useMemo, useState } from 'react';

/**
 * @typedef {'admin'|'instructor'|'student'} Role
 */

/**
 * @typedef {{
 *   isAuthenticated: boolean,
 *   user: { id: string, name: string, role: Role } | null,
 *   login: function(string, string): Promise<void>,
 *   logout: function(): void,
 *   setDemoUser: function(Role): void,
 * }} AuthContextValue
 */

const AuthContext = createContext(/** @type {AuthContextValue|null} */ (null));

/**
 * PUBLIC_INTERFACE
 * Hook to access auth context.
 *
 * @return {AuthContextValue} Auth context value.
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
}

/**
 * PUBLIC_INTERFACE
 * Provider managing minimal auth state.
 * Note: Backend endpoints are not yet available in OpenAPI; we provide demo login to enable UI flows.
 *
 * @param {{ children: React.ReactNode }} props Component props.
 * @return {JSX.Element} Provider.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    /**
     * @param {string} email Email.
     * @param {string} password Password.
     * @return {Promise<void>} Promise.
     */
    async function login(email, password) {
        // Placeholder until backend exposes /api/auth endpoints.
        // For now, treat any login as a student login.
        setUser({
            id: 'demo-user',
            name: email.split('@')[0] || 'Student',
            role: 'student',
        });
        void password;
    }

    /**
     * @return {void}
     */
    function logout() {
        setUser(null);
    }

    /**
     * @param {Role} role Role to emulate.
     * @return {void}
     */
    function setDemoUser(role) {
        setUser({
            id: `demo-${role}`,
            name: role === 'admin' ? 'Admin' : role === 'instructor' ? 'Instructor' : 'Student',
            role,
        });
    }

    const value = useMemo(
        () => ({
            isAuthenticated: Boolean(user),
            user,
            login,
            logout,
            setDemoUser,
        }),
        [user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
