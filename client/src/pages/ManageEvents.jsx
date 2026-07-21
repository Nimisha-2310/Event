import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

const ManageEvents = () => {
    const { user, loading: authLoading, showToast } = useAuth();
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // Form inputs state
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [saving, setSaving] = useState(false);

    // Redirect guest users
    useEffect(() => {
        if (!authLoading && !user) {
            showToast('Please login to manage events directory', 'warning');
            navigate('/login');
        }
    }, [user, authLoading]);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events');
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            } else {
                showToast('Failed to load events data', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Connection to server failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchEvents();
        }
    }, [user]);

    const resetForm = () => {
        setCurrentId(null);
        setEventName('');
        setEventDate('');
        setLocation('');
        setDescription('');
        setPrice('');
        setImageUrl('');
    };

    const handleOpenCreateModal = () => {
        resetForm();
        setModalOpen(true);
    };

    const handleOpenEditModal = (evt) => {
        setCurrentId(evt._id || evt.id);
        setEventName(evt.event_name);
        
        // Format ISO Date to YYYY-MM-DD for date picker input
        const dateObj = new Date(evt.event_date);
        const formattedDate = dateObj.toISOString().split('T')[0];
        
        setEventDate(formattedDate);
        setLocation(evt.location);
        setDescription(evt.description || '');
        setPrice(String(evt.price || 0));
        setImageUrl(evt.imageUrl || '');
        setModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            event_name: eventName,
            event_date: eventDate,
            location,
            description,
            price: Number(price) || 0,
            imageUrl
        };

        const method = currentId ? 'PUT' : 'POST';
        const url = currentId ? `/api/events/${currentId}` : '/api/events';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showToast(
                    currentId ? 'Event details updated successfully' : 'Event inserted successfully! 📆',
                    'success'
                );
                setModalOpen(false);
                resetForm();
                fetchEvents();
            } else {
                const data = await res.json();
                showToast(data.message || 'Error occurred while saving event registry', 'error');
            }
        } catch (err) {
            showToast('Unable to contact API server', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this event? All ticket sales data relating to this event will become unlinked.')) return;

        try {
            const res = await fetch(`/api/events/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                showToast('Event directory item deleted.', 'success');
                fetchEvents();
            } else {
                showToast('Could not delete event item', 'error');
            }
        } catch (e) {
            showToast('Communications failure', 'error');
        }
    };

    if (authLoading || (!user && !authLoading)) {
        return <Loader message="Verifying authentication permissions..." />;
    }

    return (
        <div>
            <div className="page-header">
                <h1>Organize & Manage Events</h1>
                <p>Add new concert nodes, schedule dates, edit parameters, and maintain catalog entries</p>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                    <button className="btn-primary" onClick={handleOpenCreateModal}>
                        <i className="bx bx-calendar-plus"></i>
                        <span>Create Event Listing</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <Loader message="Loading directory registry data..." />
            ) : (
                <div className="glass-card" style={{ padding: '20px' }}>
                    {events.length > 0 ? (
                        <div className="table-responsive">
                            <table className="crud-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Scheduled Date</th>
                                        <th>Venue / Location</th>
                                        <th>Price (INR)</th>
                                        <th>Short Description</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map(evt => {
                                        const dateStr = new Date(evt.event_date).toLocaleDateString('en-US', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        });
                                        
                                        return (
                                            <tr key={evt._id || evt.id}>
                                                <td style={{ fontWeight: 700, color: 'var(--txt-primary)' }}>{evt.event_name}</td>
                                                <td>
                                                    <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>{dateStr}</span>
                                                </td>
                                                <td>
                                                    <i className="bx bx-map-pin" style={{ marginRight: '5px', opacity: 0.6 }}></i>
                                                    {evt.location}
                                                </td>
                                                <td>
                                                    <span style={{ fontWeight: 700 }}>₹{evt.price}</span>
                                                </td>
                                                <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--txt-muted)' }}>
                                                    {evt.description || 'No description provided.'}
                                                </td>
                                                <td style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <div className="actions-cell">
                                                        <button
                                                            className="btn-icon edit-btn"
                                                            onClick={() => handleOpenEditModal(evt)}
                                                            title="Edit event"
                                                        >
                                                            <i className="bx bx-edit"></i>
                                                        </button>
                                                        <button
                                                            className="btn-icon delete-btn"
                                                            onClick={() => handleDelete(evt._id || evt.id)}
                                                            title="Delete event"
                                                        >
                                                            <i className="bx bx-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--txt-muted)' }}>
                            <i className="bx bx-calendar-x" style={{ fontSize: '3rem', marginBottom: '15px' }}></i>
                            <h3>Events Catalog is Empty</h3>
                            <p>No events are registered in your database. Click 'Create Event Listing' to seed options.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Event Form Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={currentId ? '✏️ Modify Event parameters' : '📅 Design Event Listing'}
            >
                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Event Name</label>
                        <input
                            type="text"
                            placeholder="EDM Music Festival"
                            className="glass-input"
                            required
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                        />
                    </div>

                    <div className="form-grid" style={{ gap: '15px', marginBottom: 0 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Date</label>
                            <input
                                type="date"
                                className="glass-input"
                                required
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Venue / Location</label>
                            <input
                                type="text"
                                placeholder="Jaipur"
                                className="glass-input"
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-grid" style={{ gap: '15px', marginBottom: 0 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Price (₹)</label>
                            <input
                                type="number"
                                placeholder="799"
                                className="glass-input"
                                required
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Image URL (Optional)</label>
                            <input
                                type="url"
                                placeholder="https://images.unsplash.com/..."
                                className="glass-input"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Event Description</label>
                        <textarea
                            placeholder="Detail parameters, guidelines, timings, artists lineups..."
                            className="glass-input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="modal-footer" style={{ border: 'none', padding: '10px 0 0 0' }}>
                        <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? (
                                <>
                                    <i className="bx bx-loader-alt bx-spin"></i>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bx bx-save"></i>
                                    <span>{currentId ? 'Apply Updates' : 'Publish Listing'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ManageEvents;
