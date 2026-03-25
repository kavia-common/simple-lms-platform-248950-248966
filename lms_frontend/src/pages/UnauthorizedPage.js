/**
 * @fileoverview Unauthorized page.
 */

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Unauthorized page.
 *
 * @return {JSX.Element} Page.
 */
export function UnauthorizedPage() {
    return (
        <div className="card cardPad">
            <h1 className="h1">Unauthorized</h1>
            <p className="p">You do not have access to that page for your current role.</p>
            <div className="divider" />
            <Link className="btn btnPrimary" to="/">
                Back to catalog
            </Link>
        </div>
    );
}
