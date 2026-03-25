/**
 * @fileoverview Lesson viewer page with completion + optional quiz.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
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
    const { courseId, lessonId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const showQuiz = useQuizFlag();

    const [course, setCourse] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [progress, setProgress] = useState({ completed: 0, total: 0 });

    const [quizState, setQuizState] = useState({
        open: false,
        current: 0,
        selected: -1,
        score: 0,
        finished: false,
        attempt: null,
    });

    useEffect(() => {
        let isMounted = true;
        async function load() {
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
                setLoading(false);
            }
        }
        void load();
        return () => {
            isMounted = false;
        };
    }, [courseId, lessonId, user]);

    useEffect(() => {
        let isMounted = true;
        async function maybeOpenQuiz() {
            if (!showQuiz || !course || !course.quiz) {
                return;
            }
            const attempt = await getQuizAttempt(user.id, course.quiz.id);
            if (isMounted) {
                setQuizState((s) => ({ ...s, open: true, attempt }));
            }
        }
        void maybeOpenQuiz();
        return () => {
            isMounted = false;
        };
    }, [showQuiz, course, user]);

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
        await completeLesson(user.id, lesson.id);
        setCompleted(true);
        const prog = await getCourseProgress(user.id, course);
        setProgress(prog);
    }

    const idx = course.lessons.findIndex((l) => l.id === lesson.id);
    const prev = idx > 0 ? course.lessons[idx - 1] : null;
    const next = idx >= 0 && idx < course.lessons.length - 1 ? course.lessons[idx + 1] : null;

    const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;

    return (
        <div className="card cardPad">
            <div className="row spaceBetween">
                <div>
                    <h1 className="h1">
                        {course.title} / {lesson.title}
                    </h1>
                    <div className="row">
                        <span className="badge badgeSuccess">{percent}% course progress</span>
                        {completed ? <span className="badge badgeSuccess">Lesson completed</span> : <span className="badge">In progress</span>}
                    </div>
                </div>
                <div className="row">
                    <Link className="btn" to={`/courses/${course.id}`}>
                        Course overview
                    </Link>
                    {!completed ? (
                        <button className="btn btnPrimary" type="button" onClick={handleComplete}>
                            Mark completed
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="divider" />

            {lesson.videoUrl ? (
                <div className="notice noticeInfo">
                    Video link:{' '}
                    <a href={lesson.videoUrl} target="_blank" rel="noreferrer">
                        {lesson.videoUrl}
                    </a>
                </div>
            ) : null}

            <p className="p" style={{ marginTop: '12px' }}>
                {lesson.content}
            </p>

            <div className="divider" />

            <div className="row spaceBetween">
                <div className="row">
                    {prev ? (
                        <Link className="btn" to={`/courses/${course.id}/lessons/${prev.id}`}>
                            ← Previous
                        </Link>
                    ) : (
                        <span className="badge">Start</span>
                    )}
                    {next ? (
                        <Link className="btn btnPrimary" to={`/courses/${course.id}/lessons/${next.id}`}>
                            Next →
                        </Link>
                    ) : (
                        <span className="badge badgeSuccess">Last lesson</span>
                    )}
                </div>

                {course.quiz ? (
                    <button className="btn" type="button" onClick={() => setQuizState((s) => ({ ...s, open: true }))}>
                        Take quiz
                    </button>
                ) : null}
            </div>

            {course.quiz && quizState.open ? (
                <QuizDialog
                    quiz={course.quiz}
                    userId={user.id}
                    state={quizState}
                    setState={setQuizState}
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
 * @param {{ quiz: any, userId: string, state: any, setState: Function, onClose: Function }} props Props.
 * @return {JSX.Element} Quiz dialog.
 */
function QuizDialog({ quiz, userId, state, setState, onClose }) {
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
    }, [state.finished, state.score, quiz, userId, setState]);

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
