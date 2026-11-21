import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

const BookEvent = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, showToast } = useAuth();

    const [events, setEvents] = useState([]);
    const [eventName, setEventName] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [tickets, setTickets] = useState('1');
    const [submitting, setSubmitting] = useState(false);

    // Fetch all events for selection
    useEffect(() => {
        const loadEvents = async () => {
            try {
                const res = await apiFetch('/api/events');
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data);
                    
                    const eventParam = searchParams.get('event');
                    if (eventParam && data.some(e => e.event_name === eventParam)) {
                        setEventName(eventParam);
                    } else if (data.length > 0) {
                        setEventName(data[0].event_name);
                    }
                }
            } catch (e) {
                console.error('Failed loading events for booking:', e);
            }
        };
        loadEvents();
    }, [searchParams]);

    useEffect(() => {
        // Auto-fill user credentials if logged in
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const selectedEvent = events.find(e => e.event_name === eventName);
    const totalPrice = selectedEvent ? (selectedEvent.price || 0) * Number(tickets) : 0;

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!eventName || eventName === 'Not Selected' || eventName === 'Loading events...') {
            showToast('Please select a valid event first', 'warning');
            return;
        }

        const cleanEmail = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            showToast('Please provide a valid email address', 'error');
            return;
        }

        setSubmitting(true);

        try {
            const res = await apiFetch('/api/bookings', {
                method: 'POST',
                body: JSON.stringify({
                    name: name.trim(),
                    email: cleanEmail,
                    event: eventName,
                    tickets: Number(tickets)
                })
            });

            const data = await res.json();

            if (res.ok) {
                showToast('Booking Successful! 🎉', 'success');
                // Store in localStorage for ticket confirmation render
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
                    <p style={{ color: 'var(--txt-muted)', fontSize: '0.9rem' }}>Secure your admissions badge with instant receipt</p>
                </div>

                <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Select Target Event</label>
                        {events.length > 0 ? (
                            <select
                                className="glass-input"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                required
                            >
                                {events.map((evt) => (
                                    <option key={evt._id || evt.id} value={evt.event_name}>
                                        {evt.event_name} (₹{evt.price}) - {evt.location}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                className="glass-input"
                                value={eventName || 'Loading events...'}
                                onChange={(e) => setEventName(e.target.value)}
                                required
                            />
                        )}
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Your Full Name</label>
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
                                <option value="4">4 Tickets</option>
                                <option value="5">5 Tickets</option>
                            </select>
                        </div>
                    </div>

                    {/* Pricing Summary */}
                    {selectedEvent && (
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--panel-border)',
                            borderRadius: '10px',
                            padding: '12px 16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.9rem'
                        }}>
                            <div>
                                <span style={{ color: 'var(--txt-muted)' }}>Total Amount ({tickets}x ₹{selectedEvent.price}):</span>
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
                                ₹{totalPrice}
                            </div>
                        </div>
                    )}

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
