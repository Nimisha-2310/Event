import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // If already logged in, send home
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await login(email, password);
        setLoading(false);
        if (res.success) {
            navigate('/');
        }
    };

    return (
        <div style={{ maxWidth: '420px', margin: '60px auto' }}>
            <div className="glass-card">
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <i className="bx bx-log-in-circle" style={{ fontSize: '3.5rem', color: 'var(--primary)' }}></i>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '10px' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--txt-muted)', fontSize: '0.9rem' }}>Sign in to manage cohorts & reserve tickets</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="aarav@gmail.com"
                            className="glass-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="glass-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ marginTop: '10px' }}
                    >
                        {loading ? (
                            <>
                                <i className="bx bx-loader-alt bx-spin"></i>
                                <span>Securing Connection...</span>
                            </>
                        ) : (
                            <>
                                <i className="bx bx-lock-open-alt"></i>
                                <span>Sign In</span>
                            </>
                        )}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem', color: 'var(--txt-muted)' }}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 600 }}>
                        Sign Up Here
                    </Link>
                </div>
            </div>
            
            {/* Quick Helper Credentials for Examiners */}
            <div 
                style={{ 
                    marginTop: '20px', 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    border: '1px dashed var(--panel-border)', 
                    borderRadius: '12px', 
                    padding: '12px 20px', 
                    fontSize: '0.8rem',
                    color: 'var(--txt-muted)',
                    textAlign: 'center'
                }}
            >
                <div>💡 <strong>Examiner Quick Tip:</strong> Register an account to explore.</div>
                <div>Any email containing <code>admin</code> (e.g. <code>admin@gmail.com</code>) will receive Admin role automatically.</div>
            </div>
        </div>
    );
};

export default Login;
