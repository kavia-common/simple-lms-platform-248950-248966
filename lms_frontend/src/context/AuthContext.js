/**
 * @fileoverview Auth context for role-aware navigation and protected routes.
 *
 * This file now wires to backend auth APIs:
 * - POST /api/auth/login -> JWT
 * - GET  /api/auth/me    -> current user + roles
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiLogin, apiMe } from '../api/lmsApi';

/**
 * @typedef {'admin'|'instructor'|'student'} Role
 */

/**
 * @typedef {{
 *   isAuthenticated: boolean,
 *   user: { id: string, name: string, role: Role, roles?: string[] } | null,
 *   token: string | null,
 *   login: function(string, string): Promise<void>,
 *   logout: function(): void,
 *   setDemoUser: function(Role): void,
 * }} AuthContextValue
 */

const AuthContext = createContext(/** @type {AuthContextValue|null} */ (null));

const TOKEN_STORAGE_KEY = 'lms_access_token';

/**
 * Convert backend roles -> single primary UI role.
 *
 * @param {string[]} roles Backend roles.
 * @return {Role} Primary role used for navigation guards.
 */
function primaryRole(roles) {
    if (roles.includes('admin')) {
        return 'admin';
    }
    if (roles.includes('instructor')) {
        return 'instructor';
    }
    return 'student';
}

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
 * Provider managing auth state + JWT persistence.
 *
 * @param {{ children: React.ReactNode }} props Component props.
 * @return {JSX.Element} Provider.
 */
export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_STORAGE_KEY));
    const [user, setUser] = useState(null);
    const [bootstrapping, setBootstrapping] = useState(true);

    // Bootstrap user from stored token (if any).
    useEffect(() => {
        let isMounted = true;
        async function bootstrap() {
            if (!token) {
                if (isMounted) {
                    setUser(null);
                    setBootstrapping(false);
                }
                return;
            }
            try {
                const me = await apiMe(token);
                if (!isMounted) return;

                setUser({
                    id: String(me.id),
                    name: me.full_name || me.username || me.email,
                    role: primaryRole(me.roles || []),
                    roles: me.roles || [],
                });
            } catch (e) {
                // Token invalid/expired -> clear session.
                window.localStorage.removeItem(TOKEN_STORAGE_KEY);
                if (isMounted) {
                    setToken(null);
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setBootstrapping(false);
                }
            }
        }
        void bootstrap();
        return () => {
            isMounted = false;
        };
    }, [token]);

    /**
     * @param {string} email Email.
     * @param {string} password Password.
     * @return {Promise<void>} Promise.
     */
    async function login(email, password) {
        const resp = await apiLogin(email, password);
        const nextToken = resp.access_token;
        window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
        setToken(nextToken);

        // Immediately fetch /me so UI role links are correct.
        const me = await apiMe(nextToken);
        setUser({
            id: String(me.id),
            name: me.full_name || me.username || me.email,
            role: primaryRole(me.roles || []),
            roles: me.roles || [],
        });
    }

    /**
     * @return {void}
     */
    function logout() {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
    }

    /**
     * Keep demo role switcher for quick UI preview, but do not treat it as real auth.
     * (Useful when backend isn't running; also useful for stakeholder demos.)
     *
     * @param {Role} role Role to emulate.
     * @return {void}
     */
    function setDemoUser(role) {
        setToken(null);
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser({
            id: `demo-${role}`,
            name: role === 'admin' ? 'Admin' : role === 'instructor' ? 'Instructor' : 'Student',
            role,
            roles: [role],
        });
    }

    const value = useMemo(
        () => ({
            isAuthenticated: Boolean(token && user) && !bootstrapping,
            user,
            token,
            login,
            logout,
            setDemoUser,
        }),
        [token, user, bootstrapping]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
