import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

const MySQLBooking = () => {
    const { showToast } = useAuth();

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [event, setEvent] = useState('EDM Music Festival');
    const [tickets, setTickets] = useState('1');
    const [submitting, setSubmitting] = useState(false);

    // MySQL records state
    const [records, setRecords] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [dbStatus, setDbStatus] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const fetchRecords = async () => {
        setLoadingData(true);
        try {
            const res = await apiFetch('/api/bookings/mysql-list');
            const data = await res.json();
            if (res.ok && data.success) {
                setRecords(data.data || []);
            } else {
                setRecords([]);
            }
        } catch (e) {
            console.error('Error fetching MySQL records:', e);
            setRecords([]);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchStatus = async () => {
        try {
            const res = await apiFetch('/api/bookings/mysql-status');
            const data = await res.json();
            setDbStatus(data);
        } catch (e) {
            setDbStatus({ connected: false, error: 'Cannot connect to server' });
        }
    };

    useEffect(() => {
        fetchStatus();
        fetchRecords();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await apiFetch('/api/bookings/mysql-submit', {
                method: 'POST',
                body: JSON.stringify({ name, email, event, tickets: Number(tickets) })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                showToast(data.message || 'Booking saved to MySQL! ✅', 'success');
                setName('');
                setEmail('');
                setTickets('1');
                fetchRecords();
            } else {
                showToast(data.message || 'MySQL insert failed', 'error');
            }
        } catch (err) {
            showToast('Unable to reach backend server', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            const res = await apiFetch(`/api/bookings/mysql-delete/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok && data.success) {
                showToast(data.message, 'success');
                setRecords(prev => prev.filter(r => r.id !== id));
            } else {
                showToast(data.message || 'Delete failed', 'error');
            }
        } catch (err) {
            showToast('Delete request failed', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <h1>
                    <i className="bx bxs-data" style={{ color: 'var(--secondary)', marginRight: '10px' }}></i>
                    MySQL Database Bookings
                </h1>
                <p>Live SQL Database integration using <code>mysql2</code> — INSERT, SELECT & DELETE queries on AWS EC2</p>
            </div>

            {/* DB Status Bar */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px',
                borderRadius: '12px', marginBottom: '24px',
                background: dbStatus?.connected
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${dbStatus?.connected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                fontSize: '0.88rem'
            }}>
                <span style={{
                    width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                    background: dbStatus?.connected ? '#10b981' : '#ef4444',
                    boxShadow: dbStatus?.connected
                        ? '0 0 8px rgba(16, 185, 129, 0.6)'
                        : '0 0 8px rgba(239, 68, 68, 0.6)',
                    animation: dbStatus?.connected ? 'pulse 2s infinite' : 'none'
                }}></span>
                {dbStatus?.connected ? (
                    <span style={{ color: '#10b981' }}>
                        🐬 MySQL Connected — Database: <strong>{dbStatus.database}</strong> | Table: <strong>{dbStatus.table}</strong> | Host: <code>{dbStatus.host}:{dbStatus.port}</code>
                    </span>
                ) : (
                    <span style={{ color: '#ef4444' }}>
                        ⚠️ MySQL Not Connected — {dbStatus?.error || 'Start MySQL service on EC2: '}&nbsp;
                        <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>
                            sudo systemctl start mysql
                        </code>
                    </span>
                )}
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1.6fr', gap: '24px' }}>
                {/* Booking Form */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="bx bx-plus-circle" style={{ color: 'var(--secondary)' }}></i>
                        <span>New SQL Booking</span>
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

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Event</label>
                            <select className="glass-input" value={event} onChange={(e) => setEvent(e.target.value)} required>
                                <option value="EDM Music Festival">EDM Music Festival</option>
                                <option value="Street Food Carnival">Street Food Carnival</option>
                                <option value="AI & Tech Conference">AI &amp; Tech Conference</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Tickets</label>
                            <select className="glass-input" value={tickets} onChange={(e) => setTickets(e.target.value)} required>
                                <option value="1">1 Ticket</option>
                                <option value="2">2 Tickets</option>
                                <option value="3">3 Tickets</option>
                            </select>
                        </div>

                        {/* SQL Preview */}
                        <div style={{
                            background: '#04060b', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '10px', padding: '12px 14px', fontFamily: 'monospace', fontSize: '0.78rem'
                        }}>
                            <div style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '6px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                SQL Query Preview
                            </div>
                            <span style={{ color: '#c084fc' }}>INSERT INTO</span>
                            <span style={{ color: '#93c5fd' }}> bookings </span>
                            <span style={{ color: '#fde68a' }}>(name, email, event, tickets)</span>
                            <br />
                            <span style={{ color: '#c084fc' }}>VALUES</span>
                            <span style={{ color: '#6ee7b7' }}>
                                {' '}('{name || '...'}', '{email || '...'}', '{event}', {tickets});
                            </span>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={submitting || !dbStatus?.connected}
                            style={{ marginTop: '4px' }}
                        >
                            {submitting ? (
                                <><i className="bx bx-loader-alt bx-spin"></i><span>Inserting...</span></>
                            ) : (
                                <><i className="bx bx-data"></i><span>INSERT INTO MySQL</span></>
                            )}
                        </button>
                        {!dbStatus?.connected && (
                            <p style={{ color: '#f87171', fontSize: '0.78rem', textAlign: 'center', margin: 0 }}>
                                ⚠️ MySQL must be running to insert records
                            </p>
                        )}
                    </form>
                </div>

                {/* MySQL Records Table */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <i className="bx bx-table" style={{ color: 'var(--primary)' }}></i>
                            <span>bookings <span style={{ color: 'var(--txt-muted)', fontSize: '0.85rem' }}>Table</span></span>
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                                background: 'rgba(99,102,241,0.15)', color: 'var(--primary)',
                                padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600
                            }}>
                                {records.length} row{records.length !== 1 ? 's' : ''}
                            </span>
                            <button className="btn-secondary" onClick={fetchRecords}
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                <i className="bx bx-refresh"></i>
                                <span>Refresh</span>
                            </button>
                        </div>
                    </div>

                    {loadingData ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-muted)', gap: '10px' }}>
                            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: '1.3rem' }}></i>
                            <span>Querying MySQL database...</span>
                        </div>
                    ) : records.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-muted)', gap: '8px' }}>
                            <i className="bx bx-table" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                            <p style={{ margin: 0 }}>No records in MySQL table yet.</p>
                            <p style={{ margin: 0, fontSize: '0.78rem' }}>Submit the form to INSERT your first row.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto', flex: 1 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                        {['ID', 'Name', 'Email', 'Event', 'Tickets', 'Date', 'Action'].map(col => (
                                            <th key={col} style={{
                                                padding: '10px 12px', textAlign: 'left',
                                                color: 'var(--txt-muted)', fontWeight: 600,
                                                fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                                                whiteSpace: 'nowrap'
                                            }}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((row, i) => (
                                        <tr key={row.id} style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                                            background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                                            transition: 'background 0.2s'
                                        }}>
                                            <td style={{ padding: '10px 12px', color: 'var(--primary)', fontWeight: 700 }}>#{row.id}</td>
                                            <td style={{ padding: '10px 12px', fontWeight: 500 }}>{row.name}</td>
                                            <td style={{ padding: '10px 12px', color: 'var(--txt-muted)', fontSize: '0.78rem' }}>{row.email}</td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <span style={{
                                                    background: 'rgba(99,102,241,0.12)', color: 'var(--primary)',
                                                    padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', whiteSpace: 'nowrap'
                                                }}>{row.event}</span>
                                            </td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                <span style={{
                                                    background: 'rgba(16,185,129,0.12)', color: '#10b981',
                                                    padding: '2px 10px', borderRadius: '12px', fontWeight: 700
                                                }}>{row.tickets}</span>
                                            </td>
                                            <td style={{ padding: '10px 12px', color: 'var(--txt-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                                {formatDate(row.booking_date)}
                                            </td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <button
                                                    onClick={() => handleDelete(row.id)}
                                                    disabled={deletingId === row.id}
                                                    style={{
                                                        background: 'rgba(239,68,68,0.12)', color: '#f87171',
                                                        border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px',
                                                        padding: '4px 10px', cursor: 'pointer', fontSize: '0.78rem',
                                                        display: 'flex', alignItems: 'center', gap: '4px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {deletingId === row.id
                                                        ? <i className="bx bx-loader-alt bx-spin"></i>
                                                        : <i className="bx bx-trash"></i>}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* SQL Query Info footer */}
                    <div style={{
                        marginTop: '16px', padding: '10px 14px',
                        background: 'rgba(0,0,0,0.25)', borderRadius: '8px',
                        fontFamily: 'monospace', fontSize: '0.72rem',
                        color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <span style={{ color: '#c084fc' }}>SELECT</span>
                        <span style={{ color: '#93c5fd' }}> * </span>
                        <span style={{ color: '#c084fc' }}>FROM</span>
                        <span style={{ color: '#fde68a' }}> bookings </span>
                        <span style={{ color: '#c084fc' }}>ORDER BY</span>
                        <span style={{ color: '#6ee7b7' }}> id DESC</span>
                        <span style={{ color: '#c084fc' }}>;</span>
                        <span style={{ float: 'right', color: 'rgba(255,255,255,0.2)' }}>
                            {records.length} row{records.length !== 1 ? 's' : ''} returned
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MySQLBooking;
