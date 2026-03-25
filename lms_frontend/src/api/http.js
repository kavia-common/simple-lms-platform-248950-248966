/**
 * @fileoverview Minimal fetch wrapper for the LMS API.
 */

/**
 * PUBLIC_INTERFACE
 * Get API base URL from environment variables.
 * - For CRA, use REACT_APP_* variables.
 *
 * @return {string} Base URL, no trailing slash.
 */
export function getApiBaseUrl() {
    const raw =
        process.env.REACT_APP_API_BASE_URL ||
        process.env.REACT_APP_BACKEND_URL ||
        'http://localhost:3001';
    return String(raw).replace(/\/+$/, '');
}

/**
 * PUBLIC_INTERFACE
 * Perform a JSON API request with basic error normalization.
 *
 * @param {string} path URL path, starting with '/'.
 * @param {RequestInit=} options fetch options.
 * @return {Promise<any>} Parsed JSON response.
 */
export async function apiJson(path, options = {}) {
    const url = `${getApiBaseUrl()}${path}`;
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    const text = await response.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch (e) {
        data = text || null;
    }

    if (!response.ok) {
        const message =
            (data && data.detail && String(data.detail)) ||
            (data && data.message && String(data.message)) ||
            `Request failed (${response.status})`;
        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}
