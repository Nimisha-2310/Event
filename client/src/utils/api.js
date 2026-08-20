/**
 * Centralized API Fetch Utility for EventConnect
 * Automatically handles JSON serialization, Bearer token headers, and credential inclusion.
 */

export const getAuthToken = () => {
    return localStorage.getItem('auth_token');
};

export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('auth_token', token);
    } else {
        localStorage.removeItem('auth_token');
    }
};

export const apiFetch = async (url, options = {}) => {
    const token = getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        credentials: 'include',
        ...options,
        headers
    };

    const response = await fetch(url, config);
    return response;
};
