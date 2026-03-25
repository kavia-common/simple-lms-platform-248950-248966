/**
 * @fileoverview In-memory mock store for LMS UI development.
 */

/**
 * @typedef {{ id: string, title: string, content: string, videoUrl?: string }} Lesson
 */

/**
 * @typedef {{ id: string, question: string, options: string[], correctIndex: number }} QuizQuestion
 */

/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   description: string,
 *   instructorName: string,
 *   lessons: Lesson[],
 *   quiz?: { id: string, title: string, questions: QuizQuestion[] }
 * }} Course
 */

/** @type {Course[]} */
const COURSES = [
    {
        id: 'course-react-101',
        title: 'React 101',
        description: 'Learn components, props/state, hooks, and how to build modern UIs.',
        instructorName: 'Instructor',
        lessons: [
            {
                id: 'lesson-react-1',
                title: 'Welcome & Setup',
                content: 'Install Node.js, run the dev server, and understand the project structure.',
                videoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
            },
            {
                id: 'lesson-react-2',
                title: 'Components & Props',
                content: 'Break UI into reusable components and pass data via props.',
            },
            {
                id: 'lesson-react-3',
                title: 'State & Effects',
                content: 'Use useState/useEffect for local state and side effects.',
            },
        ],
        quiz: {
            id: 'quiz-react-101',
            title: 'React 101 Quiz',
            questions: [
                {
                    id: 'q1',
                    question: 'What hook is used to manage local state in a function component?',
                    options: ['useMemo', 'useState', 'useEffect', 'useRef'],
                    correctIndex: 1,
                },
            ],
        },
    },
    {
        id: 'course-lms-basics',
        title: 'Learning Design Basics',
        description: 'Create modules, lessons, and assessments that support learner outcomes.',
        instructorName: 'Instructor',
        lessons: [
            {
                id: 'lesson-lms-1',
                title: 'Learning Outcomes',
                content: 'Define what learners can do after completing the course.',
            },
            {
                id: 'lesson-lms-2',
                title: 'Lesson Structure',
                content: 'Short lessons, clear objectives, and meaningful practice.',
            },
        ],
    },
];

/**
 * Enrollment and progress are keyed by userId for demo purposes.
 * @type {Record<string, { enrolledCourseIds: Set<string>, completedLessonIds: Set<string>, quizAttempts: Record<string, { score: number, total: number }> }>}
 */
const USER_STATE = {};

/**
 * @param {string} userId User ID.
 * @return {void}
 */
function ensureUser(userId) {
    if (!USER_STATE[userId]) {
        USER_STATE[userId] = {
            enrolledCourseIds: new Set(),
            completedLessonIds: new Set(),
            quizAttempts: {},
        };
    }
}

/**
 * PUBLIC_INTERFACE
 * List all courses.
 *
 * @return {Promise<Course[]>} Courses.
 */
export async function listCourses() {
    return COURSES.map((c) => ({ ...c }));
}

/**
 * PUBLIC_INTERFACE
 * Get course by id.
 *
 * @param {string} courseId Course id.
 * @return {Promise<Course|null>} Course or null.
 */
export async function getCourse(courseId) {
    const found = COURSES.find((c) => c.id === courseId);
    return found ? { ...found } : null;
}

/**
 * PUBLIC_INTERFACE
 * Enroll a user in a course.
 *
 * @param {string} userId User id.
 * @param {string} courseId Course id.
 * @return {Promise<void>} Promise.
 */
export async function enroll(userId, courseId) {
    ensureUser(userId);
    USER_STATE[userId].enrolledCourseIds.add(courseId);
}

/**
 * PUBLIC_INTERFACE
 * Check if user is enrolled.
 *
 * @param {string} userId User id.
 * @param {string} courseId Course id.
 * @return {Promise<boolean>} Enrolled.
 */
export async function isEnrolled(userId, courseId) {
    ensureUser(userId);
    return USER_STATE[userId].enrolledCourseIds.has(courseId);
}

/**
 * PUBLIC_INTERFACE
 * Get progress summary for a course.
 *
 * @param {string} userId User id.
 * @param {Course} course Course.
 * @return {Promise<{ completed: number, total: number }>} Progress.
 */
export async function getCourseProgress(userId, course) {
    ensureUser(userId);
    const total = course.lessons.length;
    const completed = course.lessons.filter((l) => USER_STATE[userId].completedLessonIds.has(l.id)).length;
    return { completed, total };
}

/**
 * PUBLIC_INTERFACE
 * Mark a lesson completed.
 *
 * @param {string} userId User id.
 * @param {string} lessonId Lesson id.
 * @return {Promise<void>} Promise.
 */
export async function completeLesson(userId, lessonId) {
    ensureUser(userId);
    USER_STATE[userId].completedLessonIds.add(lessonId);
}

/**
 * PUBLIC_INTERFACE
 * Get completed status for lesson.
 *
 * @param {string} userId User id.
 * @param {string} lessonId Lesson id.
 * @return {Promise<boolean>} Completed.
 */
export async function isLessonCompleted(userId, lessonId) {
    ensureUser(userId);
    return USER_STATE[userId].completedLessonIds.has(lessonId);
}

/**
 * PUBLIC_INTERFACE
 * Record a quiz attempt.
 *
 * @param {string} userId User id.
 * @param {string} quizId Quiz id.
 * @param {number} score Score.
 * @param {number} total Total.
 * @return {Promise<void>} Promise.
 */
export async function recordQuizAttempt(userId, quizId, score, total) {
    ensureUser(userId);
    USER_STATE[userId].quizAttempts[quizId] = { score, total };
}

/**
 * PUBLIC_INTERFACE
 * Get quiz attempt, if any.
 *
 * @param {string} userId User id.
 * @param {string} quizId Quiz id.
 * @return {Promise<{ score: number, total: number }|null>} Attempt.
 */
export async function getQuizAttempt(userId, quizId) {
    ensureUser(userId);
    return USER_STATE[userId].quizAttempts[quizId] || null;
}
