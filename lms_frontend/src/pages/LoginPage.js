/**
 * @fileoverview Login page.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PUBLIC_INTERFACE
 * Login page.
 *
 * @return {JSX.Element} Page.
 */
export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function validate() {
        if (!email.trim().includes('@')) {
            return 'Enter a valid email address.';
        }
        if (password.length < 4) {
            return 'Password must be at least 4 characters (demo).';
        }
        return '';
    }

    async function onSubmit(e) {
        e.preventDefault();
        const msg = validate();
        if (msg) {
            setError(msg);
            return;
        }
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/my-learning');
        } catch (err) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card cardPad">
            <h1 className="h1">Sign in</h1>
            <p className="p">Demo sign-in: any email + password will sign you in as a student.</p>

            {error ? <div className="notice noticeDanger">{error}</div> : null}

            <form onSubmit={onSubmit} aria-label="Login form">
                <div className="formGrid">
                    <div className="field">
                        <label className="label" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            className="input"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="student@example.com"
                        />
                    </div>
                    <div className="field">
                        <label className="label" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            className="input"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••"
                        />
                    </div>
                </div>

                <div className="divider" />

                <button className="btn btnPrimary" type="submit" disabled={loading}>
                    {loading ? 'Signing in…' : 'Sign in'}
                </button>
            </form>

            <div className="divider" />

            <div className="notice noticeInfo">
                If you want to connect to a backend API later, set <strong>REACT_APP_API_BASE_URL</strong> in the frontend .env.
            </div>
        </div>
    );
}
