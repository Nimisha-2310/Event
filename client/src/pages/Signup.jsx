import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const { register, user } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // If already logged in, redirect home
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await register(name, email, password);
        setLoading(false);
        if (res.success) {
            navigate('/');
        }
    };

    return (
        <div style={{ maxWidth: '420px', margin: '50px auto' }}>
            <div className="glass-card">
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <i className="bx bx-user-plus" style={{ fontSize: '3.5rem', color: 'var(--secondary)' }}></i>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '10px' }}>Create Account</h2>
                    <p style={{ color: 'var(--txt-muted)', fontSize: '0.9rem' }}>Join EventConnect to book tickets and manage databases</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Your Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="Aarav Sharma"
                            className="glass-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

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
                        <label>Choose Password</label>
                        <input
                            type="password"
                            required
                            placeholder="Min 6 characters"
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
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            <>
                                <i className="bx bx-rocket"></i>
                                <span>Get Started</span>
                            </>
                        )}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem', color: 'var(--txt-muted)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                        Sign In Here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
