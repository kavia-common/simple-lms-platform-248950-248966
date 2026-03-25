/**
 * @fileoverview Instructor panel landing: manage courses.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { listCourses } from '../data/mockData';

/**
 * PUBLIC_INTERFACE
 * Instructor courses page.
 *
 * @return {JSX.Element} Page.
 */
export function InstructorCoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function load() {
            setLoading(true);
            const data = await listCourses();
            if (isMounted) {
                setCourses(data);
                setLoading(false);
            }
        }
        void load();
        return () => {
            isMounted = false;
        };
    }, []);

    const links = [
        { to: '/instructor', label: 'Courses' },
        { to: '/instructor/courses/new', label: 'Create course' },
    ];

    return (
        <div className="mainGrid">
            <Sidebar title="Instructor Panel" links={links} />
            <div className="card cardPad">
                <div className="row spaceBetween">
                    <div>
                        <h1 className="h1">Instructor Courses</h1>
                        <p className="p">Create and edit courses and lessons. (Data is demo-only in this frontend.)</p>
                    </div>
                    <Link className="btn btnPrimary" to="/instructor/courses/new">
                        New course
                    </Link>
                </div>

                <div className="divider" />

                {loading ? <div className="notice noticeInfo">Loading…</div> : null}

                <table className="table" aria-label="Instructor course list">
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>Lessons</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((c) => (
                            <tr key={c.id}>
                                <td>
                                    <strong>{c.title}</strong>
                                    <div className="help">{c.description}</div>
                                </td>
                                <td>{c.lessons.length}</td>
                                <td className="row">
                                    <Link className="btn" to={`/courses/${c.id}`}>
                                        View
                                    </Link>
                                    <Link className="btn btnPrimary" to={`/instructor/courses/${c.id}/edit`}>
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="divider" />

                <div className="notice">
                    Backend OpenAPI currently exposes only a health check endpoint. Once instructor APIs exist, this page will be
                    wired to real persistence.
                </div>
            </div>
        </div>
    );
}
