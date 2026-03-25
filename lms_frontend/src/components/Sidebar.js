/**
 * @fileoverview Sidebar navigation for panel layouts.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * @param {boolean} isActive Active.
 * @return {string} Class name.
 */
function sidebarClass(isActive) {
    return isActive ? 'navLink navLinkActive' : 'navLink';
}

/**
 * PUBLIC_INTERFACE
 * Sidebar with optional links.
 *
 * @param {{ title: string, links: Array<{ to: string, label: string }> }} props Props.
 * @return {JSX.Element} Sidebar.
 */
export function Sidebar({ title, links }) {
    return (
        <aside className="sidebar" aria-label={title}>
            <h2 className="sidebarTitle">{title}</h2>
            <div className="sidebarLinks">
                {links.map((l) => (
                    <NavLink key={l.to} to={l.to} className={({ isActive }) => sidebarClass(isActive)}>
                        {l.label}
                    </NavLink>
                ))}
            </div>
        </aside>
    );
}
