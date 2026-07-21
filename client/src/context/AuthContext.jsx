import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState([]);

    // Custom Toast Manager
    const showToast = (message, type = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        
        // Auto-remove toast after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Check user authentication status on load
    const checkAuthStatus = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error('Session verify failed:', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Login handler
    const login = async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                setUser(data.user);
                showToast(data.message || 'Logged in successfully! 👋', 'success');
                return { success: true };
            } else {
                showToast(data.message || 'Credentials invalid', 'error');
                return { success: false, error: data.message };
            }
        } catch (e) {
            showToast('Axios/Network error during login request', 'error');
            return { success: false, error: 'Connection error' };
        }
    };

    // Register handler
    const register = async (name, email, password) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                setUser(data.user);
                showToast(data.message || 'Account registered successfully! 🎉', 'success');
                return { success: true };
            } else {
                showToast(data.message || 'Signup failed', 'error');
                return { success: false, error: data.message };
            }
        } catch (e) {
            showToast('Network error during registration request', 'error');
            return { success: false, error: 'Connection error' };
        }
    };

    // Logout handler
    const logout = async () => {
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                setUser(null);
                showToast('Logged out successfully. Good bye!', 'success');
            }
        } catch (err) {
            showToast('Error signing out', 'error');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuthStatus, toasts, showToast, removeToast }}>
            {children}
            
            {/* Render Active Toasts */}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast ${t.type}`}>
                        {t.type === 'success' && <i className="bx bxs-check-circle"></i>}
                        {t.type === 'error' && <i className="bx bxs-error-circle"></i>}
                        {t.type === 'warning' && <i className="bx bxs-info-circle"></i>}
                        <span>{t.message}</span>
                        <i className="bx bx-x toast-close" onClick={() => removeToast(t.id)}></i>
                    </div>
                ))}
            </div>
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be wrapped in AuthProvider');
    }
    return context;
};
