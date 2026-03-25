/**
 * @fileoverview Top navigation bar.
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * @param {boolean} isActive Active.
 * @return {string} Class name.
 */
function navClass(isActive) {
    return isActive ? 'navLink navLinkActive' : 'navLink';
}

/**
 * PUBLIC_INTERFACE
 * Header navigation with role-aware links.
 *
 * @return {JSX.Element} Header.
 */
export function HeaderNav() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, setDemoUser } = useAuth();

    /**
     * @param {string} role Role.
     * @return {void}
     */
    function switchRole(role) {
        setDemoUser(/** @type {'admin'|'instructor'|'student'} */ (role));
        navigate('/');
    }

    return (
        <header className="header">
            <div className="headerInner">
                <NavLink to="/" className="brand" aria-label="Go to course catalog">
                    <div className="brandMark">L</div>
                    <div className="brandText">
                        <div className="brandTitle">Simple LMS</div>
                        <div className="brandSubtitle">Modern light theme</div>
                    </div>
                </NavLink>

                <nav className="nav" aria-label="Primary">
                    <NavLink to="/" className={({ isActive }) => navClass(isActive)}>
                        Catalog
                    </NavLink>
                    {isAuthenticated ? (
                        <>
                            <NavLink to="/my-learning" className={({ isActive }) => navClass(isActive)}>
                                My Learning
                            </NavLink>
                            {user && (user.role === 'instructor' || user.role === 'admin') ? (
                                <NavLink to="/instructor" className={({ isActive }) => navClass(isActive)}>
                                    Instructor
                                </NavLink>
                            ) : null}
                            {user && user.role === 'admin' ? (
                                <NavLink to="/admin" className={({ isActive }) => navClass(isActive)}>
                                    Admin
                                </NavLink>
                            ) : null}
                            <NavLink to="/profile" className={({ isActive }) => navClass(isActive)}>
                                Profile
                            </NavLink>
                            <button className="btn btnDanger" type="button" onClick={logout}>
                                Sign out
                            </button>
                        </>
                    ) : (
                        <NavLink to="/login" className={({ isActive }) => navClass(isActive)}>
                            Sign in
                        </NavLink>
                    )}
                </nav>

                <div className="userPill" aria-label="Session status">
                    <div>
                        <div className="userPillName">{user ? user.name : 'Guest'}</div>
                        <div className="badge badgePrimary">{user ? user.role : 'anonymous'}</div>
                    </div>
                    <div className="row" aria-label="Demo role switcher">
                        <button className="btn" type="button" onClick={() => switchRole('student')}>
                            Student
                        </button>
                        <button className="btn" type="button" onClick={() => switchRole('instructor')}>
                            Instructor
                        </button>
                        <button className="btn" type="button" onClick={() => switchRole('admin')}>
                            Admin
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
