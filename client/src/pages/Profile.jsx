import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const Profile = () => {
    const { user, loading: authLoading, logout, showToast } = useAuth();
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Redirect guest users
    useEffect(() => {
        if (!authLoading && !user) {
            showToast('Please login to view user profile dashboard', 'warning');
            navigate('/login');
        }
    }, [user, authLoading]);

    const fetchMyBookings = async () => {
        try {
            const res = await fetch('/api/bookings');
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            } else {
                showToast('Failed to retrieve booking histories', 'error');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMyBookings();
        }
    }, [user]);

    const handleViewSavedTicket = (bookingItem) => {
        localStorage.setItem('ticket', JSON.stringify(bookingItem));
        navigate('/ticket-receipt');
    };

    if (authLoading || (!user && !authLoading)) {
        return <Loader message="Accessing secure profile..." />;
    }

    // Generate avatar abbreviation
    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'US';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Profile Overview Card */}
            <div className="glass-card">
                <div className="profile-card">
                    <div className="profile-avatar-row">
                        <div className="avatar-circle">
                            {initials}
                        </div>
                        <div className="profile-details-info">
                            <h2 style={{ letterSpacing: '-0.02em', fontWeight: 800 }}>{user.name}</h2>
                            <p style={{ color: 'var(--txt-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <i className="bx bx-envelope" style={{ fontSize: '1.1rem' }}></i>
                                <span>{user.email}</span>
                            </p>
                            <span className="profile-badge">
                                Role: {user.role}
                            </span>
                        </div>
                        
                        <div style={{ marginLeft: 'auto' }}>
                            <button className="btn-secondary" onClick={logout} style={{ borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                                <i className="bx bx-log-out-circle"></i>
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--txt-muted)', fontWeight: 700 }}>Total Bookings</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '5px' }}>{bookings.length}</div>
                        </div>

                        <div style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--txt-muted)', fontWeight: 700 }}>Security Status</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-success)', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <i className="bx bxs-shield-alt-2"></i>
                                <span>Protected Session</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reserved Bookings List */}
            <div>
                <h3 className="events-section-title" style={{ marginBottom: '20px' }}>
                    <i className="bx bx-purchase-tag-alt" style={{ color: 'var(--primary)' }}></i>
                    <span>Your Booked Tickets</span>
                </h3>

                {loading ? (
                    <Loader message="Querying active reservation entries..." />
                ) : bookings.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {bookings.map(item => (
                            <div key={item._id || item.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                            {item.ticketId}
                                        </div>
                                        <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px', color: 'var(--txt-primary)' }}>{item.event}</h4>
                                    </div>
                                    <span className="profile-badge" style={{ margin: 0, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-success)' }}>
                                        Active
                                    </span>
                                </div>
                                
                                <div style={{ fontSize: '0.9rem', color: 'var(--txt-muted)' }}>
                                    <div><strong style={{ color: 'var(--txt-primary)' }}>Booked For:</strong> {item.name}</div>
                                    <div><strong style={{ color: 'var(--txt-primary)' }}>Quantity:</strong> {item.tickets} Admissions</div>
                                </div>

                                <button 
                                    className="btn-primary" 
                                    style={{ marginTop: 'auto', padding: '8px 15px', fontSize: '0.85rem' }}
                                    onClick={() => handleViewSavedTicket(item)}
                                >
                                    <i className="bx bx-barcode-reader"></i>
                                    <span>View & Print Ticket</span>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--txt-muted)' }}>
                        <i className="bx bx-coupon" style={{ fontSize: '3rem', marginBottom: '10px', opacity: 0.5 }}></i>
                        <h4>No Bookings Found</h4>
                        <p>You haven't reserved any tickets yet. Explore home page to register events!</p>
                        <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginTop: '15px', fontSize: '0.85rem' }}>
                            Browse Catalog
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
