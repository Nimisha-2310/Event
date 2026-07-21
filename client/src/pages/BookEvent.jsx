import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BookEvent = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, showToast } = useAuth();

    const [eventName, setEventName] = useState('Not Selected');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [tickets, setTickets] = useState('1');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const eventParam = searchParams.get('event');
        if (eventParam) {
            setEventName(eventParam);
        }
        
        // Auto-fill user credentials if logged in
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [searchParams, user]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (eventName === 'Not Selected') {
            showToast('Please select a valid event first', 'warning');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    event: eventName,
                    tickets: Number(tickets)
                })
            });

            const data = await res.json();

            if (res.ok) {
                showToast('Booking Successful! 🎉', 'success');
                // Store in localStorage for ticket confirmation render (simulate local retrieval like original)
                localStorage.setItem('ticket', JSON.stringify(data));
                navigate('/ticket-receipt');
            } else {
                showToast(data.message || 'Error occurred while saving booking', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Unable to reach server', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '40px auto' }}>
            <div className="glass-card">
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <i className="bx bxs-coupon" style={{ fontSize: '3rem', color: 'var(--secondary)' }}></i>
                    <h2 style={{ marginTop: '10px', fontSize: '1.8rem', fontWeight: 800 }}>Confirm Reservation</h2>
                </div>

                <div 
                    style={{ 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        padding: '14px 20px', 
                        borderRadius: '10px', 
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <i className="bx bx-calendar-star" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i>
                    <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--txt-muted)', fontWeight: 700 }}>Event Name</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{eventName}</div>
                    </div>
                </div>

                <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Your Name</label>
                        <input
                            type="text"
                            placeholder="Aarav Sharma"
                            required
                            className="glass-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="aarav@gmail.com"
                            required
                            className="glass-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '0px', marginBottom: 0 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>No. of Tickets</label>
                            <select
                                className="glass-input"
                                value={tickets}
                                onChange={(e) => setTickets(e.target.value)}
                                required
                            >
                                <option value="1">1 Ticket</option>
                                <option value="2">2 Tickets</option>
                                <option value="3">3 Tickets</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={submitting}
                        style={{ marginTop: '10px' }}
                    >
                        {submitting ? (
                            <>
                                <i className="bx bx-loader-alt bx-spin"></i>
                                <span>Verifying Booking...</span>
                            </>
                        ) : (
                            <>
                                <i className="bx bx-check-double"></i>
                                <span>Confirm Booking</span>
                            </>
                        )}
                    </button>
                    
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookEvent;
