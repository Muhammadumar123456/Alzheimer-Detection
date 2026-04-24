/**
 * =============================================================================
 * CENTRALIZED API CLIENT
 * =============================================================================
 * Single point for all backend API communication.
 * Handles base URL, auth headers, and error normalization.
 * =============================================================================
 */

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:5000/api';

/**
 * Make an API request with automatic auth header injection.
 */
export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    // Safe response parsing
    let data = {};
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        try {
            data = await response.json();
        } catch (err) {
            console.error('[API] JSON parse failed:', err);
        }
    }

    if (!response.ok) {
        const message =
            data?.error?.message ||
            data?.message ||
            `Request failed with status ${response.status}`;
        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

export const apiGet = (endpoint) => apiRequest(endpoint, { method: 'GET' });

export const apiPost = (endpoint, body) =>
    apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
    });

export const apiPut = (endpoint, body) =>
    apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
    });

export const apiDelete = (endpoint) =>
    apiRequest(endpoint, { method: 'DELETE' });

export const apiUpload = (endpoint, formData) =>
    apiRequest(endpoint, {
        method: 'POST',
        body: formData,
    });
