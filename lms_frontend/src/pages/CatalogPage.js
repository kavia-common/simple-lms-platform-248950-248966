/**
 * @fileoverview Course catalog page.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCourses } from '../data/mockData';

/**
 * PUBLIC_INTERFACE
 * Catalog page: browse courses.
 *
 * @return {JSX.Element} Page.
 */
export function CatalogPage() {
    const [courses, setCourses] = useState([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;
        async function load() {
            try {
                setIsLoading(true);
                const data = await listCourses();
                if (isMounted) {
                    setCourses(data);
                }
            } catch (e) {
                if (isMounted) {
                    setError(e.message || 'Failed to load catalog');
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
    }, []);

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
                        Browse courses, enroll, track progress, and continue lessons. Use the demo role switcher in the header to
                        preview instructor/admin views.
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

            {error ? <div className="notice noticeDanger">{error}</div> : null}
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
