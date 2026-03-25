/**
 * @fileoverview 404 page.
 */

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Not Found page.
 *
 * @return {JSX.Element} Page.
 */
export function NotFoundPage() {
    return (
        <div className="card cardPad">
            <h1 className="h1">Page not found</h1>
            <p className="p">The page you requested does not exist.</p>
            <div className="divider" />
            <Link className="btn btnPrimary" to="/">
                Go to catalog
            </Link>
        </div>
    );
}
