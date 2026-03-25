/**
 * @fileoverview LMS API client: typed-ish helpers around apiJson + auth tokens.
 */

import { apiJson } from './http';

/**
 * @typedef {{ access_token: string, token_type?: string }} TokenResponse
 */

/**
 * @typedef {{ id: number, email: string, username: string, full_name?: string|null, is_active: boolean, roles: string[] }} UserPublic
 */

/**
 * @typedef {{
 *   id: number,
 *   slug: string,
 *   title: string,
 *   description?: string|null,
 *   level?: string|null,
 *   is_published: boolean,
 *   created_by_user_id?: number|null,
 *   created_at: string,
 *   updated_at: string
 * }} CourseOut
 */

/**
 * @typedef {{
 *   id: number,
 *   course_id: number,
 *   slug: string,
 *   title: string,
 *   content_type: string,
 *   content_text?: string|null,
 *   video_url?: string|null,
 *   resource_url?: string|null,
 *   sort_order: number,
 *   estimated_minutes?: number|null,
 *   is_published: boolean,
 *   created_at: string,
 *   updated_at: string
 * }} LessonOut
 */

/**
 * @typedef {{
 *   id: number,
 *   user_id: number,
 *   course_id: number,
 *   status: string,
 *   enrolled_at: string,
 *   completed_at?: string|null
 * }} EnrollmentOut
 */

/**
 * @typedef {{
 *   id: number,
 *   user_id: number,
 *   course_id: number,
 *   lesson_id: number,
 *   status: string,
 *   progress_percent: number,
 *   started_at?: string|null,
 *   completed_at?: string|null,
 *   updated_at: string
 * }} ProgressOut
 */

/**
 * @typedef {{
 *   id: number,
 *   course_id: number,
 *   lesson_id?: number|null,
 *   title: string,
 *   description?: string|null,
 *   passing_score: number,
 *   is_published: boolean
 * }} QuizOut
 */

/**
 * @typedef {{ id: number, option_text: string, sort_order: number }} QuizQuestionOption
 */

/**
 * @typedef {{
 *   id: number,
 *   quiz_id: number,
 *   prompt: string,
 *   question_type: string,
 *   sort_order: number,
 *   options: QuizQuestionOption[]
 * }} QuizQuestionOut
 */

/**
 * @typedef {{
 *   id: number,
 *   quiz_id: number,
 *   user_id: number,
 *   attempt: number,
 *   score_percent?: number|null,
 *   passed?: boolean|null,
 *   submitted_at: string
 * }} QuizSubmissionOut
 */

/**
 * @param {string|null} token JWT access token.
 * @return {HeadersInit} Headers.
 */
function authHeaders(token) {
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * PUBLIC_INTERFACE
 * Auth: login to get a JWT access token.
 *
 * Backend: POST /api/auth/login
 *
 * @param {string} email Email.
 * @param {string} password Password.
 * @return {Promise<TokenResponse>} Token response.
 */
export async function apiLogin(email, password) {
    return apiJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

/**
 * PUBLIC_INTERFACE
 * Auth: register a user.
 *
 * Backend: POST /api/auth/register
 *
 * @param {{email: string, username: string, password: string, full_name?: string|null, role?: string}} payload Register payload.
 * @return {Promise<UserPublic>} Created user.
 */
export async function apiRegister(payload) {
    return apiJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

/**
 * PUBLIC_INTERFACE
 * Auth: get current user.
 *
 * Backend: GET /api/auth/me
 *
 * @param {string} token JWT.
 * @return {Promise<UserPublic>} Current user.
 */
export async function apiMe(token) {
    return apiJson('/api/auth/me', {
        method: 'GET',
        headers: authHeaders(token),
    });
}

/**
 * PUBLIC_INTERFACE
 * Courses: list.
 *
 * Backend: GET /api/courses
 *
 * @param {string|null} token Optional JWT (instructor/admin sees unpublished).
 * @return {Promise<CourseOut[]>} Courses.
 */
export async function apiListCourses(token = null) {
    return apiJson('/api/courses', {
        method: 'GET',
        headers: authHeaders(token),
    });
}

/**
 * PUBLIC_INTERFACE
 * Courses: get by slug.
 *
 * Backend: GET /api/courses/{course_slug}
 *
 * @param {string} courseSlug Slug.
 * @return {Promise<CourseOut>} Course.
 */
export async function apiGetCourseBySlug(courseSlug) {
    return apiJson(`/api/courses/${encodeURIComponent(courseSlug)}`, { method: 'GET' });
}

/**
 * PUBLIC_INTERFACE
 * Lessons: list for course slug.
 *
 * Backend: GET /api/courses/{course_slug}/lessons
 *
 * @param {string} courseSlug Slug.
 * @param {string|null} token Optional JWT (instructor/admin sees unpublished).
 * @return {Promise<LessonOut[]>} Lessons.
 */
export async function apiListLessons(courseSlug, token = null) {
    return apiJson(`/api/courses/${encodeURIComponent(courseSlug)}/lessons`, {
        method: 'GET',
        headers: authHeaders(token),
    });
}

/**
 * PUBLIC_INTERFACE
 * Enrollment: enroll current user.
 *
 * Backend: POST /api/courses/{course_id}/enroll
 *
 * @param {number} courseId Course id.
 * @param {string} token JWT.
 * @return {Promise<EnrollmentOut>} Enrollment.
 */
export async function apiEnroll(courseId, token) {
    return apiJson(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: authHeaders(token),
    });
}

/**
 * PUBLIC_INTERFACE
 * Enrollment: list my enrollments.
 *
 * Backend: GET /api/me/enrollments
 *
 * @param {string} token JWT.
 * @return {Promise<EnrollmentOut[]>} Enrollments.
 */
export async function apiMyEnrollments(token) {
    return apiJson('/api/me/enrollments', { method: 'GET', headers: authHeaders(token) });
}

/**
 * PUBLIC_INTERFACE
 * Progress: get my course progress (requires enrollment).
 *
 * Backend: GET /api/courses/{course_id}/progress
 *
 * @param {number} courseId Course id.
 * @param {string} token JWT.
 * @return {Promise<ProgressOut[]>} Progress rows.
 */
export async function apiMyCourseProgress(courseId, token) {
    return apiJson(`/api/courses/${courseId}/progress`, { method: 'GET', headers: authHeaders(token) });
}

/**
 * PUBLIC_INTERFACE
 * Progress: update my lesson progress (requires enrollment).
 *
 * Backend: PUT /api/lessons/{lesson_id}/progress
 *
 * @param {number} lessonId Lesson id.
 * @param {{status: string, progress_percent: number}} payload Update.
 * @param {string} token JWT.
 * @return {Promise<ProgressOut>} Updated progress.
 */
export async function apiUpdateLessonProgress(lessonId, payload, token) {
    return apiJson(`/api/lessons/${lessonId}/progress`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(payload),
    });
}

/**
 * PUBLIC_INTERFACE
 * Quizzes: list for course.
 *
 * Backend: GET /api/courses/{course_id}/quizzes
 *
 * @param {number} courseId Course id.
 * @return {Promise<QuizOut[]>} Quizzes.
 */
export async function apiListQuizzes(courseId) {
    return apiJson(`/api/courses/${courseId}/quizzes`, { method: 'GET' });
}

/**
 * PUBLIC_INTERFACE
 * Quizzes: get quiz questions (with options).
 *
 * Backend: GET /api/quizzes/{quiz_id}/questions
 *
 * @param {number} quizId Quiz id.
 * @return {Promise<QuizQuestionOut[]>} Questions.
 */
export async function apiGetQuizQuestions(quizId) {
    return apiJson(`/api/quizzes/${quizId}/questions`, { method: 'GET' });
}

/**
 * PUBLIC_INTERFACE
 * Quizzes: submit answers (requires enrollment).
 *
 * Backend: POST /api/quizzes/{quiz_id}/submit
 *
 * @param {number} quizId Quiz id.
 * @param {{answers: Record<number, (number|string)>}} payload Submission payload.
 * @param {string} token JWT.
 * @return {Promise<QuizSubmissionOut>} Submission result.
 */
export async function apiSubmitQuiz(quizId, payload, token) {
    return apiJson(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(payload),
    });
}
