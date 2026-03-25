/**
 * @fileoverview Instructor course editor (demo UI).
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { getCourse } from '../data/mockData';

/**
 * @typedef {{ title: string, description: string, instructorName: string }} CourseDraft
 */

/**
 * PUBLIC_INTERFACE
 * Instructor editor page for creating/editing courses.
 *
 * @return {JSX.Element} Page.
 */
export function InstructorEditorPage() {
    const { courseId } = useParams();
    const isNew = !courseId;

    const [draft, setDraft] = useState(
        /** @type {CourseDraft} */ ({
            title: '',
            description: '',
            instructorName: 'Instructor',
        })
    );
    const [lessons, setLessons] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;
        async function load() {
            if (isNew) {
                return;
            }
            const c = await getCourse(String(courseId));
            if (c && isMounted) {
                setDraft({ title: c.title, description: c.description, instructorName: c.instructorName });
                setLessons(c.lessons.map((l) => ({ ...l })));
            }
        }
        void load();
        return () => {
            isMounted = false;
        };
    }, [courseId, isNew]);

    const links = useMemo(() => {
        return [
            { to: '/instructor', label: 'Courses' },
            { to: '/instructor/courses/new', label: 'Create course' },
        ];
    }, []);

    function updateField(field, value) {
        setDraft((d) => ({ ...d, [field]: value }));
    }

    function addLesson() {
        setLessons((ls) => [
            ...ls,
            { id: `lesson-${Date.now()}`, title: 'New lesson', content: 'Lesson content…', videoUrl: '' },
        ]);
    }

    function updateLesson(idx, field, value) {
        setLessons((ls) => ls.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
    }

    function removeLesson(idx) {
        setLessons((ls) => ls.filter((_, i) => i !== idx));
    }

    function validate() {
        if (!draft.title.trim()) {
            return 'Title is required.';
        }
        if (!draft.description.trim()) {
            return 'Description is required.';
        }
        if (!draft.instructorName.trim()) {
            return 'Instructor name is required.';
        }
        if (lessons.length === 0) {
            return 'Add at least one lesson.';
        }
        return '';
    }

    function save() {
        const msg = validate();
        if (msg) {
            setError(msg);
            return;
        }
        setError('');
        // Demo-only: no persistence.
        // In real wiring: POST/PUT to backend, then navigate back to instructor list.
        // eslint-disable-next-line no-alert
        alert('Saved (demo UI only). Hook up backend course APIs to persist changes.');
    }

    return (
        <div className="mainGrid">
            <Sidebar title="Instructor Panel" links={links} />
            <div className="card cardPad">
                <div className="row spaceBetween">
                    <div>
                        <h1 className="h1">{isNew ? 'Create course' : 'Edit course'}</h1>
                        <p className="p">Edit metadata and lessons. This is a frontend-only demo editor with validation.</p>
                    </div>
                    <div className="row">
                        <Link className="btn" to="/instructor">
                            Back
                        </Link>
                        <button className="btn btnPrimary" type="button" onClick={save}>
                            Save
                        </button>
                    </div>
                </div>

                {error ? <div className="notice noticeDanger">{error}</div> : null}

                <div className="divider" />

                <div className="formGrid" aria-label="Course fields">
                    <div className="field">
                        <label className="label" htmlFor="courseTitle">
                            Title
                        </label>
                        <input
                            id="courseTitle"
                            className="input"
                            value={draft.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            placeholder="e.g. React 101"
                        />
                    </div>
                    <div className="field">
                        <label className="label" htmlFor="instructorName">
                            Instructor
                        </label>
                        <input
                            id="instructorName"
                            className="input"
                            value={draft.instructorName}
                            onChange={(e) => updateField('instructorName', e.target.value)}
                            placeholder="Instructor name"
                        />
                    </div>
                    <div className="field" style={{ gridColumn: '1 / -1' }}>
                        <label className="label" htmlFor="courseDesc">
                            Description
                        </label>
                        <textarea
                            id="courseDesc"
                            className="textarea"
                            value={draft.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="What will learners achieve?"
                        />
                    </div>
                </div>

                <div className="divider" />

                <div className="row spaceBetween">
                    <h2 className="h2">Lessons</h2>
                    <button className="btn" type="button" onClick={addLesson}>
                        + Add lesson
                    </button>
                </div>

                <div className="divider" />

                <div className="sidebarLinks" aria-label="Lesson editors">
                    {lessons.map((l, idx) => (
                        <div key={l.id} className="card cardPad">
                            <div className="row spaceBetween">
                                <div className="badge">Lesson {idx + 1}</div>
                                <button className="btn btnDanger" type="button" onClick={() => removeLesson(idx)}>
                                    Remove
                                </button>
                            </div>

                            <div className="divider" />

                            <div className="field">
                                <label className="label" htmlFor={`lesson-title-${l.id}`}>
                                    Title
                                </label>
                                <input
                                    id={`lesson-title-${l.id}`}
                                    className="input"
                                    value={l.title}
                                    onChange={(e) => updateLesson(idx, 'title', e.target.value)}
                                />
                            </div>

                            <div className="field">
                                <label className="label" htmlFor={`lesson-video-${l.id}`}>
                                    Video URL (optional)
                                </label>
                                <input
                                    id={`lesson-video-${l.id}`}
                                    className="input"
                                    value={l.videoUrl || ''}
                                    onChange={(e) => updateLesson(idx, 'videoUrl', e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="field">
                                <label className="label" htmlFor={`lesson-content-${l.id}`}>
                                    Content
                                </label>
                                <textarea
                                    id={`lesson-content-${l.id}`}
                                    className="textarea"
                                    value={l.content}
                                    onChange={(e) => updateLesson(idx, 'content', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="divider" />

                <div className="notice noticeInfo">
                    Next step: replace this editor’s alert-based save with API calls to backend endpoints once available.
                </div>
            </div>
        </div>
    );
}
