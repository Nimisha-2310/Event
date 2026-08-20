import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TicketReceipt = () => {
    const [booking, setBooking] = useState(null);
    const navigate = useNavigate();
    const { showToast } = useAuth();

    useEffect(() => {
        const stored = localStorage.getItem('ticket');
        if (stored) {
            try {
                setBooking(JSON.parse(stored));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (!booking) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <i className="bx bx-error-circle" style={{ fontSize: '3rem', color: 'var(--accent-danger)' }}></i>
                <h3 style={{ marginTop: '10px' }}>No Active Ticket Found</h3>
                <p style={{ color: 'var(--txt-muted)' }}>You haven't booked any event ticket in this session.</p>
                <button className="btn-primary" onClick={() => navigate('/')} style={{ margin: '20px auto 0 auto' }}>
                    Go to Events Catalog
                </button>
            </div>
        );
    }

    // Generate random barcode lines
    const barcodeSpans = Array.from({ length: 42 }).map((_, idx) => {
        // Random width 1px to 4px
        const widths = [1, 2, 3, 4];
        const randomWidth = widths[Math.floor(Math.random() * widths.length)];
        return (
            <span 
                key={idx} 
                style={{ 
                    width: `${randomWidth}px`, 
                    marginLeft: idx % 3 === 0 ? '2px' : '0px',
                    backgroundColor: '#1e293b' 
                }} 
            />
        );
    });

    return (
        <div className="ticket-wrapper">
            <div className="page-header" style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '2rem' }}>🎉 Booking Confirmed</h1>
                <p>Your ticket is successfully registered in the system</p>
            </div>

            <div className="event-ticket">
                {/* Header/Main ticket block */}
                <div className="ticket-main">
                    <div className="ticket-title">
                        Event Ticket
                    </div>

                    <div className="ticket-info-grid">
                        <div className="ticket-field">
                            <span className="ticket-label">Guest name</span>
                            <span className="ticket-value">{booking.name}</span>
                        </div>
                        
                        <div className="ticket-field">
                            <span className="ticket-label">Email</span>
                            <span className="ticket-value" style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>{booking.email}</span>
                        </div>

                        <div className="ticket-field" style={{ gridColumn: 'span 2' }}>
                            <span className="ticket-label">Event name</span>
                            <span className="ticket-value" style={{ color: 'var(--primary)', fontWeight: 700 }}>{booking.event}</span>
                        </div>

                        <div className="ticket-field">
                            <span className="ticket-label">Admissions</span>
                            <span className="ticket-value">{booking.tickets} {booking.tickets > 1 ? 'Tickets' : 'Ticket'}</span>
                        </div>

                        <div className="ticket-field">
                            <span className="ticket-label">Booking date</span>
                            <span className="ticket-value">
                                {(() => {
                                    const d = new Date(booking.bookingDate || booking.createdAt || Date.now());
                                    return !isNaN(d.getTime()) ? d.toLocaleDateString('en-US', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    }) : 'Confirmed';
                                })()}
                            </span>
                        </div>
                    </div>

                    {/* Left and right visual ticket tear notches */}
                    <div className="ticket-divider">
                        <span className="ticket-notch-l"></span>
                        <span className="ticket-notch-r"></span>
                    </div>
                </div>

                {/* Ticket stub check bar */}
                <div className="ticket-stub">
                    <div className="ticket-barcode-container">
                        <div className="barcode-lines">
                            {barcodeSpans}
                        </div>
                        <span className="barcode-num">{booking.ticketId || 'TKT-9938292'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '12px', color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>
                        <i className="bx bxs-check-circle"></i>
                        <span>VALID TICKET ENTRY</span>
                    </div>
                </div>
            </div>

            <div className="ticket-actions">
                <button className="btn-secondary" onClick={() => navigate('/')}>
                    <i className="bx bx-home-alt"></i>
                    <span>Events Catalog</span>
                </button>

                <button className="btn-primary" onClick={handlePrint}>
                    <i className="bx bx-printer"></i>
                    <span>Print Ticket</span>
                </button>
            </div>
        </div>
    );
};

export default TicketReceipt;
