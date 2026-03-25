/**
 * @fileoverview Course catalog page.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiListCourses } from '../api/lmsApi';
import { useAuth } from '../context/AuthContext';
import { listCourses as listCoursesMock } from '../data/mockData';

/**
 * Map backend CourseOut -> UI course shape used by pages.
 *
 * @param {any} c Backend course.
 * @return {{ id: string, title: string, description: string, instructorName: string, backendId?: number }} UI course.
 */
function toUiCourse(c) {
    return {
        id: String(c.slug),
        backendId: Number(c.id),
        title: c.title,
        description: c.description || '',
        instructorName: 'Instructor', // backend currently doesn't expose instructor name
    };
}

/**
 * PUBLIC_INTERFACE
 * Catalog page: browse courses.
 *
 * @return {JSX.Element} Page.
 */
export function CatalogPage() {
    const { token } = useAuth();
    const [courses, setCourses] = useState([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [dataSource, setDataSource] = useState('api'); // api|mock

    useEffect(() => {
        let isMounted = true;
        async function load() {
            setError('');
            setIsLoading(true);
            try {
                const apiCourses = await apiListCourses(token || null);
                if (isMounted) {
                    setCourses(apiCourses.map(toUiCourse));
                    setDataSource('api');
                }
            } catch (e) {
                // Fallback to mock data so the UI is still usable without backend running.
                try {
                    const mock = await listCoursesMock();
                    if (isMounted) {
                        setCourses(mock);
                        setDataSource('mock');
                        setError('Backend unavailable; showing demo data.');
                    }
                } catch (e2) {
                    if (isMounted) {
                        setError(e2.message || e.message || 'Failed to load catalog');
                    }
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }
        void load();
        return () => {
            isMounted = false;
        };
    }, [token]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
            return courses;
        }
        return courses.filter(
            (c) =>
                c.title.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q) ||
                c.instructorName.toLowerCase().includes(q)
        );
    }, [courses, query]);

    return (
        <div className="card cardPad">
            <div className="row spaceBetween">
                <div>
                    <h1 className="h1">Course Catalog</h1>
                    <p className="p">
                        Browse courses, enroll, track progress, and continue lessons.
                        {dataSource === 'mock' ? ' (Demo data mode)' : ''}
                    </p>
                </div>

                <div className="field" style={{ minWidth: '260px' }}>
                    <label className="label" htmlFor="catalogSearch">
                        Search
                    </label>
                    <input
                        id="catalogSearch"
                        className="input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="React, design, instructor..."
                    />
                </div>
            </div>

            {error ? <div className="notice noticeInfo">{error}</div> : null}
            {isLoading ? <div className="notice noticeInfo">Loading courses…</div> : null}

            <div className="divider" />

            <div className="gridCards" aria-label="Course list">
                {filtered.map((course) => (
                    <div key={course.id} className="card cardPad">
                        <h2 className="courseCardTitle">{course.title}</h2>
                        <p className="courseCardMeta">{course.description}</p>
                        <div className="row spaceBetween">
                            <span className="badge">Instructor: {course.instructorName}</span>
                            <Link className="btn btnPrimary" to={`/courses/${course.id}`}>
                                View course
                            </Link>
                        </div>
                    </div>
                ))}
                {!isLoading && filtered.length === 0 ? <div className="notice">No courses match your search.</div> : null}
            </div>
        </div>
    );
}
