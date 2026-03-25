/**
 * @fileoverview Course detail view: enrollment + lessons list.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    apiEnroll,
    apiGetCourseBySlug,
    apiListLessons,
    apiListQuizzes,
    apiMyCourseProgress,
    apiMyEnrollments,
} from '../api/lmsApi';
import { useAuth } from '../context/AuthContext';
import { enroll as enrollMock, getCourse as getCourseMock, getCourseProgress as getCourseProgressMock, isEnrolled as isEnrolledMock } from '../data/mockData';

/**
 * PUBLIC_INTERFACE
 * Course detail page.
 *
 * @return {JSX.Element} Page.
 */
export function CourseDetailPage() {
    const { courseId } = useParams(); // course slug in API mode; mock id in demo mode
    const { user, isAuthenticated, token } = useAuth();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enrolled, setEnrolled] = useState(false);
    const [progress, setProgress] = useState({ completed: 0, total: 0 });
    const [quizMeta, setQuizMeta] = useState(null);
    const [mode, setMode] = useState('api'); // api|mock

    useEffect(() => {
        let isMounted = true;
        async function load() {
            setLoading(true);
            setError('');
            try {
                // API mode (preferred)
                const c = await apiGetCourseBySlug(String(courseId));
                const ls = await apiListLessons(String(courseId), token || null);
                const quizzes = await apiListQuizzes(Number(c.id));

                if (isMounted) {
                    setCourse({
                        id: String(c.slug),
                        backendId: Number(c.id),
                        title: c.title,
                        description: c.description || '',
                        instructorName: 'Instructor',
                    });
                    setLessons(ls);
                    setQuizMeta(quizzes && quizzes.length ? quizzes[0] : null);
                    setMode('api');
                }
            } catch (e) {
                // Fallback to mock mode
                try {
                    const c = await getCourseMock(String(courseId));
                    if (!c) {
                        throw new Error('Course not found');
                    }
                    if (isMounted) {
                        setCourse(c);
                        setLessons(c.lessons || []);
                        setQuizMeta(c.quiz || null);
                        setMode('mock');
                        setError('Backend unavailable; showing demo data.');
                    }
                } catch (e2) {
                    if (isMounted) {
                        setError(e2.message || e.message || 'Failed to load course');
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
    }, [courseId, token]);

    useEffect(() => {
        let isMounted = true;
        async function loadState() {
            if (!user || !course) {
                return;
            }

            // Demo-mode: keep old mock behavior.
            if (mode === 'mock') {
                const isUserEnrolled = await isEnrolledMock(user.id, course.id);
                const prog = await getCourseProgressMock(user.id, course);
                if (isMounted) {
                    setEnrolled(isUserEnrolled);
                    setProgress(prog);
                }
                return;
            }

            // API mode requires auth token for enrollment/progress.
            if (!token) {
                if (isMounted) {
                    setEnrolled(false);
                    setProgress({ completed: 0, total: lessons.length || 0 });
                }
                return;
            }

            try {
                const enrollments = await apiMyEnrollments(token);
                const isUserEnrolled = enrollments.some((e) => e.course_id === course.backendId);

                let completed = 0;
                if (isUserEnrolled) {
                    const rows = await apiMyCourseProgress(course.backendId, token);
                    completed = rows.filter((r) => r.status === 'completed' || r.progress_percent >= 100).length;
                }

                if (isMounted) {
                    setEnrolled(isUserEnrolled);
                    setProgress({ completed, total: lessons.length || 0 });
                }
            } catch (e) {
                if (isMounted) {
                    setError(e.message || 'Failed to load enrollment/progress');
                }
            }
        }
        void loadState();
        return () => {
            isMounted = false;
        };
    }, [user, token, course, lessons, mode]);

    const progressPct = useMemo(() => {
        if (!progress.total) {
            return 0;
        }
        return Math.round((progress.completed / progress.total) * 100);
    }, [progress]);

    async function handleEnroll() {
        if (!user || !course) {
            return;
        }

        if (mode === 'mock') {
            await enrollMock(user.id, course.id);
            setEnrolled(true);
            return;
        }

        if (!token) {
            setError('Please sign in to enroll.');
            return;
        }

        try {
            await apiEnroll(course.backendId, token);
            setEnrolled(true);
        } catch (e) {
            setError(e.message || 'Failed to enroll');
        }
    }

    if (loading) {
        return <div className="notice noticeInfo">Loading course…</div>;
    }

    if (error && !course) {
        return <div className="notice noticeDanger">{error}</div>;
    }

    if (!course) {
        return <div className="notice">Course not found.</div>;
    }

    return (
        <div className="card cardPad">
            <div className="row spaceBetween">
                <div>
                    <h1 className="h1">{course.title}</h1>
                    <p className="p">{course.description}</p>
                    <div className="row">
                        <span className="badge">Instructor: {course.instructorName}</span>
                        {isAuthenticated && user ? <span className="badge badgeSuccess">Progress: {progressPct}%</span> : null}
                        {mode === 'mock' ? <span className="badge">Demo data</span> : null}
                    </div>
                </div>

                <div className="row">
                    {!isAuthenticated ? (
                        <div className="notice noticeInfo">Sign in to enroll and track progress.</div>
                    ) : enrolled ? (
                        <span className="badge badgeSuccess">Enrolled</span>
                    ) : (
                        <button className="btn btnPrimary" type="button" onClick={handleEnroll}>
                            Enroll
                        </button>
                    )}
                </div>
            </div>

            {error ? (
                <>
                    <div className="divider" />
                    <div className="notice noticeInfo">{error}</div>
                </>
            ) : null}

            <div className="divider" />

            <h2 className="h2">Lessons</h2>
            <div className="notice">
                Tip: You can access lessons once you are enrolled. Use <strong>My Learning</strong> to resume.
            </div>

            <div className="divider" />

            <table className="table" aria-label="Lesson list">
                <thead>
                    <tr>
                        <th>Lesson</th>
                        <th>Type</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {(mode === 'mock' ? lessons : lessons.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))).map(
                        (lesson) => (
                            <tr key={mode === 'mock' ? lesson.id : String(lesson.id)}>
                                <td>{lesson.title}</td>
                                <td>{lesson.video_url ? 'Video + text' : lesson.resource_url ? 'Link' : 'Text'}</td>
                                <td>
                                    {user && enrolled ? (
                                        <Link
                                            className="btn btnPrimary"
                                            to={`/courses/${course.id}/lessons/${mode === 'mock' ? lesson.id : String(lesson.id)}`}
                                        >
                                            Start
                                        </Link>
                                    ) : (
                                        <span className="badge">Enroll to start</span>
                                    )}
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>

            {quizMeta ? (
                <>
                    <div className="divider" />
                    <h2 className="h2">Quiz (optional)</h2>
                    <div className="row spaceBetween">
                        <div className="p" style={{ margin: 0 }}>
                            {quizMeta.title ? quizMeta.title : quizMeta.title}{' '}
                            <span className="badge">Take from a lesson page</span>
                        </div>
                        {user && enrolled ? (
                            <Link
                                className="btn btnPrimary"
                                to={`/courses/${course.id}/lessons/${mode === 'mock' ? lessons[0].id : String(lessons[0]?.id)}?quiz=1`}
                            >
                                Take quiz
                            </Link>
                        ) : (
                            <span className="badge">Enroll to take quiz</span>
                        )}
                    </div>
                </>
            ) : null}
        </div>
    );
}
