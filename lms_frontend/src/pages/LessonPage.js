/**
 * @fileoverview Lesson viewer page with completion + optional quiz.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiGetQuizQuestions, apiListLessons, apiListQuizzes, apiMyCourseProgress, apiSubmitQuiz, apiUpdateLessonProgress } from '../api/lmsApi';
import { useAuth } from '../context/AuthContext';
import {
    completeLesson,
    getCourse,
    getCourseProgress,
    getQuizAttempt,
    isLessonCompleted,
    recordQuizAttempt,
} from '../data/mockData';

/**
 * @return {boolean} Whether quiz should be shown.
 */
function useQuizFlag() {
    const location = useLocation();
    return useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('quiz') === '1';
    }, [location.search]);
}

/**
 * PUBLIC_INTERFACE
 * Lesson page.
 *
 * @return {JSX.Element} Page.
 */
export function LessonPage() {
    const { courseId, lessonId } = useParams(); // courseId = slug; lessonId = numeric in API mode (string in mock)
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const showQuiz = useQuizFlag();

    const [course, setCourse] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [progress, setProgress] = useState({ completed: 0, total: 0 });
    const [mode, setMode] = useState('api');
    const [error, setError] = useState('');

    const [quizState, setQuizState] = useState({
        open: false,
        loading: false,
        quizId: null,
        questions: [],
        answers: {}, // questionId -> optionId
        finished: false,
        result: null,
    });

    useEffect(() => {
        let isMounted = true;

        async function loadApi() {
            if (!token) {
                throw new Error('no-token');
            }

            // Need lessons list for lesson lookup + course progress totals.
            const lessons = await apiListLessons(String(courseId), token);
            const l = lessons.find((x) => String(x.id) === String(lessonId)) || null;
            if (!l) {
                throw new Error('Lesson not found');
            }

            // Compute completion from progress rows (if any).
            // Note: API progress endpoint requires course_id (numeric). We don't have it from lesson list.
            // For now, we treat "completed" as: have a progress record for this lesson with completed/100.
            // (We update via PUT /lessons/{lesson_id}/progress on completion.)
            let isDone = false;
            try {
                // If backend adds a course-id lookup by slug, this could be improved.
                // Here we keep best-effort by trusting local completed state + update endpoint result.
                // No-op.
            } catch {
                // ignore
            }

            if (isMounted) {
                setCourse({
                    id: String(courseId),
                    title: String(courseId),
                    lessons,
                });
                setLesson(l);
                setCompleted(isDone);
                setProgress({ completed: 0, total: lessons.length });
                setMode('api');
            }

            // Try to load quiz meta (optional) so the "Take quiz" button appears.
            try {
                // We do not have numeric course_id in this page; quiz association is optional.
                // So we only show quiz if query param requests it AND we can resolve quiz by listing from course progress page.
                // (CourseDetailPage passes quiz=1, but doesn't provide quizId.)
                // For now we keep quiz open only in mock mode unless backend adds a direct slug->id lookup in a dedicated endpoint.
                void showQuiz;
            } catch {
                // ignore
            }
        }

        async function loadMock() {
            setLoading(true);
            const c = await getCourse(String(courseId));
            if (!c) {
                setLoading(false);
                return;
            }
            const l = c.lessons.find((x) => x.id === String(lessonId)) || null;
            const isDone = await isLessonCompleted(user.id, String(lessonId));
            const prog = await getCourseProgress(user.id, c);
            if (isMounted) {
                setCourse(c);
                setLesson(l);
                setCompleted(isDone);
                setProgress(prog);
                setMode('mock');
                setLoading(false);
            }
        }

        async function load() {
            setError('');
            setLoading(true);
            try {
                await loadApi();
                if (isMounted) setLoading(false);
            } catch (e) {
                // API mode failed -> fallback to mock
                try {
                    await loadMock();
                    if (isMounted) setError('Backend unavailable for lesson/progress; using demo data.');
                } catch (e2) {
                    if (isMounted) setError(e2.message || e.message || 'Failed to load lesson');
                    if (isMounted) setLoading(false);
                }
            }
        }

        void load();
        return () => {
            isMounted = false;
        };
    }, [courseId, lessonId, user, token, showQuiz]);

    if (loading) {
        return <div className="notice noticeInfo">Loading lesson…</div>;
    }

    if (!course || !lesson) {
        return (
            <div className="notice noticeDanger">
                Lesson not found. <Link to={`/courses/${courseId}`}>Back to course</Link>
            </div>
        );
    }

    async function handleComplete() {
        if (mode === 'mock') {
            await completeLesson(user.id, lesson.id);
            setCompleted(true);
            const prog = await getCourseProgress(user.id, course);
            setProgress(prog);
            return;
        }

        if (!token) {
            setError('Please sign in to track progress.');
            return;
        }

        try {
            const row = await apiUpdateLessonProgress(Number(lesson.id), { status: 'completed', progress_percent: 100 }, token);
            setCompleted(row.status === 'completed' || row.progress_percent >= 100);
            // total remains from lessons list; completed count not tracked here (kept simple).
        } catch (e) {
            setError(e.message || 'Failed to update progress');
        }
    }

    const lessonsList = mode === 'mock' ? course.lessons : course.lessons;
    const idx = lessonsList.findIndex((l) => String(l.id) === String(lesson.id));
    const prev = idx > 0 ? lessonsList[idx - 1] : null;
    const next = idx >= 0 && idx < lessonsList.length - 1 ? lessonsList[idx + 1] : null;

    const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;

    return (
        <div className="card cardPad">
            <div className="row spaceBetween">
                <div>
                    <h1 className="h1">
                        {mode === 'mock' ? course.title : course.id} / {lesson.title}
                    </h1>
                    <div className="row">
                        <span className="badge badgeSuccess">{percent}% course progress</span>
                        {completed ? <span className="badge badgeSuccess">Lesson completed</span> : <span className="badge">In progress</span>}
                        {mode === 'mock' ? <span className="badge">Demo</span> : null}
                    </div>
                </div>
                <div className="row">
                    <Link className="btn" to={`/courses/${mode === 'mock' ? course.id : courseId}`}>
                        Course overview
                    </Link>
                    {!completed ? (
                        <button className="btn btnPrimary" type="button" onClick={handleComplete}>
                            Mark completed
                        </button>
                    ) : null}
                </div>
            </div>

            {error ? (
                <>
                    <div className="divider" />
                    <div className="notice noticeInfo">{error}</div>
                </>
            ) : null}

            <div className="divider" />

            {lesson.videoUrl || lesson.video_url ? (
                <div className="notice noticeInfo">
                    Video link:{' '}
                    <a href={lesson.videoUrl || lesson.video_url} target="_blank" rel="noreferrer">
                        {lesson.videoUrl || lesson.video_url}
                    </a>
                </div>
            ) : null}

            {lesson.resource_url ? (
                <div className="notice noticeInfo">
                    Resource link:{' '}
                    <a href={lesson.resource_url} target="_blank" rel="noreferrer">
                        {lesson.resource_url}
                    </a>
                </div>
            ) : null}

            <p className="p" style={{ marginTop: '12px' }}>
                {lesson.content || lesson.content_text}
            </p>

            <div className="divider" />

            <div className="row spaceBetween">
                <div className="row">
                    {prev ? (
                        <Link className="btn" to={`/courses/${courseId}/lessons/${prev.id}`}>
                            ← Previous
                        </Link>
                    ) : (
                        <span className="badge">Start</span>
                    )}
                    {next ? (
                        <Link className="btn btnPrimary" to={`/courses/${courseId}/lessons/${next.id}`}>
                            Next →
                        </Link>
                    ) : (
                        <span className="badge badgeSuccess">Last lesson</span>
                    )}
                </div>

                {mode === 'mock' && course.quiz ? (
                    <button className="btn" type="button" onClick={() => setQuizState((s) => ({ ...s, open: true }))}>
                        Take quiz
                    </button>
                ) : null}
            </div>

            {mode === 'mock' && course.quiz && quizState.open ? (
                <MockQuizDialog
                    quiz={course.quiz}
                    userId={user.id}
                    onClose={() => {
                        setQuizState((s) => ({ ...s, open: false }));
                        navigate(`/courses/${course.id}/lessons/${lesson.id}`, { replace: true });
                    }}
                />
            ) : null}
        </div>
    );
}

/**
 * Retain previous mock quiz experience so the UI stays feature-complete without backend.
 *
 * @param {{ quiz: any, userId: string, onClose: Function }} props Props.
 * @return {JSX.Element} Quiz dialog.
 */
function MockQuizDialog({ quiz, userId, onClose }) {
    const [state, setState] = useState({
        current: 0,
        selected: -1,
        score: 0,
        finished: false,
        attempt: null,
    });

    const question = quiz.questions[state.current];

    async function submitAnswer() {
        const isCorrect = state.selected === question.correctIndex;
        setState((s) => ({
            ...s,
            score: isCorrect ? s.score + 1 : s.score,
            current: s.current + 1,
            selected: -1,
            finished: s.current + 1 >= quiz.questions.length,
        }));
    }

    useEffect(() => {
        let isMounted = true;
        async function finalize() {
            if (!state.finished) {
                return;
            }
            await recordQuizAttempt(userId, quiz.id, state.score, quiz.questions.length);
            const attempt = await getQuizAttempt(userId, quiz.id);
            if (isMounted) {
                setState((s) => ({ ...s, attempt }));
            }
        }
        void finalize();
        return () => {
            isMounted = false;
        };
    }, [state.finished, state.score, quiz, userId]);

    return (
        <div className="card cardPad" role="dialog" aria-modal="true" aria-label="Quiz">
            <div className="row spaceBetween">
                <h2 className="h2">{quiz.title}</h2>
                <button className="btn" type="button" onClick={() => onClose()}>
                    Close
                </button>
            </div>

            {state.attempt ? (
                <div className="notice noticeInfo">
                    Last recorded attempt: <strong>{state.attempt.score}</strong> / {state.attempt.total}
                </div>
            ) : null}

            <div className="divider" />

            {state.finished ? (
                <div className="notice">
                    Completed! Score: <strong>{state.score}</strong> / {quiz.questions.length}
                </div>
            ) : (
                <>
                    <div className="badge">
                        Question {state.current + 1} of {quiz.questions.length}
                    </div>
                    <h3 className="h2" style={{ marginTop: '10px' }}>
                        {question.question}
                    </h3>

                    <div className="sidebarLinks" role="radiogroup" aria-label="Quiz options">
                        {question.options.map((opt, idx) => (
                            <label key={opt} className="navLink" style={{ cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="quizOption"
                                    value={String(idx)}
                                    checked={state.selected === idx}
                                    onChange={() => setState((s) => ({ ...s, selected: idx }))}
                                    style={{ marginRight: '8px' }}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>

                    <div className="divider" />

                    <div className="row spaceBetween">
                        <div className="help">Select an option and submit to continue.</div>
                        <button className="btn btnPrimary" type="button" onClick={submitAnswer} disabled={state.selected < 0}>
                            Submit
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
