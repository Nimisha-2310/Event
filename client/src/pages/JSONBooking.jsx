import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

const JSONBooking = () => {
    const { showToast } = useAuth();
    
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [event, setEvent] = useState('EDM Music Festival');
    const [tickets, setTickets] = useState('1');
    const [submitting, setSubmitting] = useState(false);

    // Saved data.json state
    const [savedData, setSavedData] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

    const fetchJsonData = async () => {
        try {
            const res = await apiFetch('/api/bookings/task9-data');
            if (res.ok) {
                const data = await res.json();
                setSavedData(data);
            } else {
                setSavedData(null);
            }
        } catch (e) {
            console.error('Error fetching JSON booking data:', e);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        fetchJsonData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await apiFetch('/api/bookings/task9-submit', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    email,
                    event,
                    tickets: Number(tickets)
                })
            });

            const data = await res.json();

            if (res.ok) {
                showToast(data.message || 'Saved to data.json root file! ✅', 'success');
                setSavedData(data.user);
                // Reset form
                setName('');
                setEmail('');
            } else {
                showToast(data.message || 'Failed saving to data.json', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Unable to connect to server backend API', 'error');
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div>
            <div className="page-header">
                <h1>JSON Booking Submission</h1>
                <p>Task 9: Writing local database records into a root server-side <code>data.json</code> file</p>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
                {/* Form Card */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="bx bx-file-blank" style={{ color: 'var(--secondary)' }}></i>
                        <span>JSON Submission Form</span>
                    </h3>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="Aarav Sharma"
                                className="glass-input"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="aarav@gmail.com"
                                className="glass-input"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-grid" style={{ gap: '15px', marginBottom: 0 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Target Event</label>
                                <select
                                    className="glass-input"
                                    value={event}
                                    onChange={(e) => setEvent(e.target.value)}
                                    required
                                >
                                    <option value="EDM Music Festival">EDM Music Festival</option>
                                    <option value="Street Food Carnival">Street Food Carnival</option>
                                    <option value="AI & Tech Conference">AI & Tech Conference</option>
                                </select>
                            </div>

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
                                    <span>Writing File...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bx bx-save"></i>
                                    <span>Write to data.json</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* File Preview Card */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="bx bx-code-block" style={{ color: 'var(--primary)' }}></i>
                        <span>Root <code>data.json</code> Contents</span>
                    </h3>

                    <div 
                        style={{
                            background: '#04060b',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            padding: '20px',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            flex: 1,
                            overflowY: 'auto',
                            color: '#a5b4fc',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: savedData ? 'flex-start' : 'center',
                            alignItems: savedData ? 'stretch' : 'center',
                            textShadow: '0 0 10px rgba(165, 180, 252, 0.1)'
                        }}
                    >
                        {loadingData ? (
                            <span style={{ color: 'var(--txt-muted)' }}>Querying root file system...</span>
                        ) : savedData ? (
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                {JSON.stringify(savedData, null, 2)}
                            </pre>
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--txt-muted)' }}>
                                <i className="bx bx-file-find" style={{ fontSize: '2.5rem', marginBottom: '10px', opacity: 0.5 }}></i>
                                <p>File <code>data.json</code> does not exist or is empty.</p>
                                <p style={{ fontSize: '0.75rem', marginTop: '5px' }}>Submit the form to write files.</p>
                            </div>
                        )}
                    </div>
                    
                    {savedData && (
                        <button 
                            className="btn-secondary" 
                            onClick={fetchJsonData}
                            style={{ marginTop: '15px' }}
                        >
                            <i className="bx bx-refresh"></i>
                            <span>Reload data.json</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JSONBooking;
