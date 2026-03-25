/**
 * @fileoverview My Learning page: enrolled courses and quick resume.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourse, getCourseProgress, isEnrolled, listCourses } from '../data/mockData';

/**
 * PUBLIC_INTERFACE
 * My learning page.
 *
 * @return {JSX.Element} Page.
 */
export function MyLearningPage() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function load() {
            setLoading(true);
            const all = await listCourses();
            const enrolled = [];
            for (const c of all) {
                const ok = await isEnrolled(user.id, c.id);
                if (ok) {
                    const full = await getCourse(c.id);
                    if (full) {
                        enrolled.push(full);
                    }
                }
            }
            if (isMounted) {
                setCourses(enrolled);
                setLoading(false);
            }
        }
        void load();
        return () => {
            isMounted = false;
        };
    }, [user]);

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

            {!loading && summaries.length === 0 ? (
                <div className="notice">
                    You are not enrolled in any courses yet. Go to the <Link to="/">catalog</Link> to enroll.
                </div>
            ) : null}

            <div className="divider" />

            <div className="gridCards" aria-label="Enrolled courses">
                {summaries.map(({ course }) => (
                    <MyLearningCard key={course.id} course={course} userId={user.id} />
                ))}
            </div>
        </div>
    );
}

/**
 * @param {{ course: any, userId: string }} props Props.
 * @return {JSX.Element} Card.
 */
function MyLearningCard({ course, userId }) {
    const [progress, setProgress] = useState({ completed: 0, total: 0 });

    useEffect(() => {
        let isMounted = true;
        async function load() {
            const p = await getCourseProgress(userId, course);
            if (isMounted) {
                setProgress(p);
            }
        }
        void load();
        return () => {
            isMounted = false;
        };
    }, [userId, course]);

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
