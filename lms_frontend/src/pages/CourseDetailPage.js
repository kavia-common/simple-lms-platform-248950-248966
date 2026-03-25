/**
 * @fileoverview Course detail view: enrollment + lessons list.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enroll, getCourse, getCourseProgress, getQuizAttempt, isEnrolled } from '../data/mockData';

/**
 * PUBLIC_INTERFACE
 * Course detail page.
 *
 * @return {JSX.Element} Page.
 */
export function CourseDetailPage() {
    const { courseId } = useParams();
    const { user, isAuthenticated } = useAuth();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enrolled, setEnrolled] = useState(false);
    const [progress, setProgress] = useState({ completed: 0, total: 0 });
    const [quizAttempt, setQuizAttempt] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function load() {
            try {
                setLoading(true);
                const data = await getCourse(String(courseId));
                if (!data) {
                    throw new Error('Course not found');
                }
                if (isMounted) {
                    setCourse(data);
                }
            } catch (e) {
                if (isMounted) {
                    setError(e.message || 'Failed to load course');
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
    }, [courseId]);

    useEffect(() => {
        let isMounted = true;
        async function loadState() {
            if (!user || !course) {
                return;
            }
            const isUserEnrolled = await isEnrolled(user.id, course.id);
            const prog = await getCourseProgress(user.id, course);
            const attempt = course.quiz ? await getQuizAttempt(user.id, course.quiz.id) : null;
            if (isMounted) {
                setEnrolled(isUserEnrolled);
                setProgress(prog);
                setQuizAttempt(attempt);
            }
        }
        void loadState();
        return () => {
            isMounted = false;
        };
    }, [user, course]);

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
        await enroll(user.id, course.id);
        setEnrolled(true);
    }

    if (loading) {
        return <div className="notice noticeInfo">Loading course…</div>;
    }

    if (error) {
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
                    {course.lessons.map((lesson) => (
                        <tr key={lesson.id}>
                            <td>{lesson.title}</td>
                            <td>{lesson.videoUrl ? 'Video + text' : 'Text'}</td>
                            <td>
                                {user && enrolled ? (
                                    <Link className="btn btnPrimary" to={`/courses/${course.id}/lessons/${lesson.id}`}>
                                        Start
                                    </Link>
                                ) : (
                                    <span className="badge">Enroll to start</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {course.quiz ? (
                <>
                    <div className="divider" />
                    <h2 className="h2">Quiz (optional)</h2>
                    <div className="row spaceBetween">
                        <div className="p" style={{ margin: 0 }}>
                            {course.quiz.title}{' '}
                            {quizAttempt ? (
                                <span className="badge badgeSuccess">
                                    Last attempt: {quizAttempt.score}/{quizAttempt.total}
                                </span>
                            ) : (
                                <span className="badge">Not attempted</span>
                            )}
                        </div>
                        {user && enrolled ? (
                            <Link className="btn btnPrimary" to={`/courses/${course.id}/lessons/${course.lessons[0].id}?quiz=1`}>
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
