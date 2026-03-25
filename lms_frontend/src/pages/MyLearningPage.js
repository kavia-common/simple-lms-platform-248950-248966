/**
 * @fileoverview My Learning page: enrolled courses and quick resume.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGetCourseBySlug, apiListCourses, apiListLessons, apiMyCourseProgress, apiMyEnrollments } from '../api/lmsApi';
import { useAuth } from '../context/AuthContext';
import { getCourse as getCourseMock, getCourseProgress as getCourseProgressMock, isEnrolled as isEnrolledMock, listCourses as listCoursesMock } from '../data/mockData';

/**
 * PUBLIC_INTERFACE
 * My learning page.
 *
 * @return {JSX.Element} Page.
 */
export function MyLearningPage() {
    const { user, token } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState('api');
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;
        async function load() {
            setLoading(true);
            setError('');

            // If no backend token, show mock enrollments (demo UX).
            if (!token) {
                try {
                    const all = await listCoursesMock();
                    const enrolled = [];
                    for (const c of all) {
                        const ok = await isEnrolledMock(user.id, c.id);
                        if (ok) {
                            const full = await getCourseMock(c.id);
                            if (full) {
                                enrolled.push(full);
                            }
                        }
                    }
                    if (isMounted) {
                        setCourses(enrolled);
                        setMode('mock');
                    }
                } catch (e) {
                    if (isMounted) {
                        setError(e.message || 'Failed to load demo enrollments');
                        setMode('mock');
                    }
                } finally {
                    if (isMounted) setLoading(false);
                }
                return;
            }

            try {
                // API mode:
                // - enrollments list gives us course IDs
                // - courses list gives us slug for routing
                const [enrollments, catalog] = await Promise.all([apiMyEnrollments(token), apiListCourses(token)]);
                const byId = new Map(catalog.map((c) => [Number(c.id), c]));
                const enrolledCourses = [];

                for (const enr of enrollments) {
                    const c = byId.get(Number(enr.course_id));
                    if (c) {
                        enrolledCourses.push({
                            id: String(c.slug),
                            backendId: Number(c.id),
                            title: c.title,
                            description: c.description || '',
                            instructorName: 'Instructor',
                        });
                    }
                }

                if (isMounted) {
                    setCourses(enrolledCourses);
                    setMode('api');
                }
            } catch (e) {
                // Fallback to mock
                try {
                    const all = await listCoursesMock();
                    const enrolled = [];
                    for (const c of all) {
                        const ok = await isEnrolledMock(user.id, c.id);
                        if (ok) {
                            const full = await getCourseMock(c.id);
                            if (full) {
                                enrolled.push(full);
                            }
                        }
                    }
                    if (isMounted) {
                        setCourses(enrolled);
                        setMode('mock');
                        setError('Backend unavailable; showing demo data.');
                    }
                } catch (e2) {
                    if (isMounted) {
                        setError(e2.message || e.message || 'Failed to load enrollments');
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }
        void load();
        return () => {
            isMounted = false;
        };
    }, [user, token]);

    const summaries = useMemo(() => {
        return courses.map((c) => ({
            course: c,
        }));
    }, [courses]);

    return (
        <div className="card cardPad">
            <h1 className="h1">My Learning</h1>
            <p className="p">Courses you are enrolled in and your progress so far.</p>

            {loading ? <div className="notice noticeInfo">Loading…</div> : null}
            {error ? <div className="notice noticeInfo">{error}</div> : null}

            {!loading && summaries.length === 0 ? (
                <div className="notice">
                    You are not enrolled in any courses yet. Go to the <Link to="/">catalog</Link> to enroll.
                </div>
            ) : null}

            <div className="divider" />

            <div className="gridCards" aria-label="Enrolled courses">
                {summaries.map(({ course }) => (
                    <MyLearningCard key={course.id} course={course} mode={mode} token={token} userId={user.id} />
                ))}
            </div>
        </div>
    );
}

/**
 * @param {{ course: any, userId: string, token: string|null, mode: string }} props Props.
 * @return {JSX.Element} Card.
 */
function MyLearningCard({ course, userId, token, mode }) {
    const [progress, setProgress] = useState({ completed: 0, total: 0 });

    useEffect(() => {
        let isMounted = true;
        async function load() {
            if (mode === 'mock' || !token || !course.backendId) {
                const p = await getCourseProgressMock(userId, course);
                if (isMounted) {
                    setProgress(p);
                }
                return;
            }

            // API mode: total lessons = course lesson count; completed = progress rows.
            try {
                const lessons = await apiListLessons(course.id, token);
                const rows = await apiMyCourseProgress(course.backendId, token);
                const completed = rows.filter((r) => r.status === 'completed' || r.progress_percent >= 100).length;

                if (isMounted) {
                    setProgress({ completed, total: lessons.length });
                }
            } catch {
                // Keep minimal progress info if API fails mid-flight.
                if (isMounted) {
                    setProgress({ completed: 0, total: 0 });
                }
            }
        }
        void load();
        return () => {
            isMounted = false;
        };
    }, [userId, course, token, mode]);

    const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;

    return (
        <div className="card cardPad">
            <h2 className="courseCardTitle">{course.title}</h2>
            <p className="courseCardMeta">{course.description}</p>
            <div className="row spaceBetween">
                <span className="badge badgeSuccess">{percent}% complete</span>
                <Link className="btn btnPrimary" to={`/courses/${course.id}`}>
                    Resume
                </Link>
            </div>
        </div>
    );
}
