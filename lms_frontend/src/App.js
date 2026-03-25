/**
 * @fileoverview Application entry component with routing.
 */

import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { HeaderNav } from './components/HeaderNav';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CatalogPage } from './pages/CatalogPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { InstructorCoursesPage } from './pages/InstructorCoursesPage';
import { InstructorEditorPage } from './pages/InstructorEditorPage';
import { LessonPage } from './pages/LessonPage';
import { LoginPage } from './pages/LoginPage';
import { MyLearningPage } from './pages/MyLearningPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

/**
 * PUBLIC_INTERFACE
 * Main app component (router + providers).
 *
 * @return {JSX.Element} App.
 */
export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="appShell">
                    <HeaderNav />
                    <div className="container">
                        <Routes>
                            <Route path="/" element={<CatalogPage />} />
                            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                            <Route element={<ProtectedRoute />}>
                                <Route path="/my-learning" element={<MyLearningPage />} />
                                <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
                                <Route path="/profile" element={<ProfilePage />} />
                            </Route>

                            <Route element={<ProtectedRoute allowedRoles={['instructor', 'admin']} />}>
                                <Route path="/instructor" element={<InstructorCoursesPage />} />
                                <Route path="/instructor/courses/:courseId/edit" element={<InstructorEditorPage />} />
                                <Route path="/instructor/courses/new" element={<InstructorEditorPage />} />
                            </Route>

                            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                                <Route path="/admin" element={<AdminDashboardPage />} />
                            </Route>

                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/unauthorized" element={<UnauthorizedPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}
