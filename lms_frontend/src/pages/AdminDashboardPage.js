/**
 * @fileoverview Admin dashboard page.
 */

import React from 'react';
import { Sidebar } from '../components/Sidebar';

/**
 * PUBLIC_INTERFACE
 * Admin dashboard page (demo UI).
 *
 * @return {JSX.Element} Page.
 */
export function AdminDashboardPage() {
    const links = [
        { to: '/admin', label: 'Overview' },
        { to: '/instructor', label: 'Instructor panel' },
    ];

    return (
        <div className="mainGrid">
            <Sidebar title="Admin Panel" links={links} />
            <div className="card cardPad">
                <h1 className="h1">Admin Dashboard</h1>
                <p className="p">Manage users and courses. This is a frontend UI scaffold until backend admin APIs are available.</p>

                <div className="divider" />

                <div className="gridCards" aria-label="Admin stats">
                    <div className="card cardPad">
                        <div className="badge badgePrimary">Users</div>
                        <h2 className="h2" style={{ marginTop: '10px' }}>
                            3 (demo)
                        </h2>
                        <p className="help">Admin, Instructor, Student</p>
                    </div>
                    <div className="card cardPad">
                        <div className="badge badgePrimary">Courses</div>
                        <h2 className="h2" style={{ marginTop: '10px' }}>
                            2 (demo)
                        </h2>
                        <p className="help">Catalog courses (in-memory)</p>
                    </div>
                    <div className="card cardPad">
                        <div className="badge badgePrimary">System</div>
                        <h2 className="h2" style={{ marginTop: '10px' }}>
                            Healthy
                        </h2>
                        <p className="help">Backend health endpoint currently only</p>
                    </div>
                </div>

                <div className="divider" />

                <h2 className="h2">Users</h2>
                <table className="table" aria-label="Users table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Admin</td>
                            <td>
                                <span className="badge badgePrimary">admin</span>
                            </td>
                            <td>
                                <span className="badge badgeSuccess">active</span>
                            </td>
                            <td>
                                <button className="btn" type="button" disabled>
                                    Edit (coming soon)
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>Instructor</td>
                            <td>
                                <span className="badge badgePrimary">instructor</span>
                            </td>
                            <td>
                                <span className="badge badgeSuccess">active</span>
                            </td>
                            <td>
                                <button className="btn" type="button" disabled>
                                    Edit (coming soon)
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>Student</td>
                            <td>
                                <span className="badge badgePrimary">student</span>
                            </td>
                            <td>
                                <span className="badge badgeSuccess">active</span>
                            </td>
                            <td>
                                <button className="btn" type="button" disabled>
                                    Edit (coming soon)
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="divider" />

                <div className="notice noticeInfo">
                    When backend endpoints exist:
                    <ul>
                        <li>List users, edit roles, disable accounts.</li>
                        <li>Review courses, remove inappropriate content, and view enrollments.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
