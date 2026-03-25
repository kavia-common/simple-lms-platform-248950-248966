/**
 * @fileoverview Profile page.
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * PUBLIC_INTERFACE
 * Profile page.
 *
 * @return {JSX.Element} Page.
 */
export function ProfilePage() {
    const { user } = useAuth();

    return (
        <div className="card cardPad">
            <h1 className="h1">Profile</h1>
            <p className="p">Your account details and role.</p>

            <div className="divider" />

            <table className="table" aria-label="Profile table">
                <tbody>
                    <tr>
                        <th style={{ width: '180px' }}>Name</th>
                        <td>{user.name}</td>
                    </tr>
                    <tr>
                        <th>Email (demo)</th>
                        <td>{user.id === 'demo-user' ? 'demo@student' : `${user.id}@example.com`}</td>
                    </tr>
                    <tr>
                        <th>Role</th>
                        <td>
                            <span className="badge badgePrimary">{user.role}</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className="divider" />

            <div className="notice noticeInfo">
                Use the demo role switcher in the header to preview role-aware navigation and protected pages.
            </div>
        </div>
    );
}
