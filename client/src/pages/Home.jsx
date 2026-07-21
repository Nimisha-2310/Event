import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { showToast } = useAuth();

    // Fetch Events list
    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events');
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            } else {
                showToast('Failed to load events', 'error');
            }
        } catch (e) {
            console.error('Fetch events error:', e);
            showToast('Unable to connect to Server', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Filter events based on query
    const filteredEvents = events.filter(evt =>
        evt.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBookNow = (eventName) => {
        navigate(`/book-event?event=${encodeURIComponent(eventName)}`);
    };

    return (
        <div className="home-container">
            {/* Hero search area */}
            <div className="hero-section">
                <h1>Discover Live Tech & Food Events</h1>
                <p>Concerts • Festivals • Tech Workshops • Food Carnivals</p>
                <div className="search-container">
                    <i className="bx bx-search"></i>
                    <input
                        type="text"
                        placeholder="Search events by name or location..."
                        className="glass-input search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Trending events */}
            <div className="events-title-row">
                <h2 className="events-section-title">
                    <i className="bx bxs-hot"></i>
                    <span>Available Events</span>
                </h2>
            </div>

            {loading ? (
                <Loader message="Loading upcoming events..." />
            ) : (
                <div className="events-grid">
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map(evt => {
                            const formattedDate = new Date(evt.event_date).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            });
                            
                            return (
                                <div key={evt._id || evt.id} className="event-item-card">
                                    <div className="event-image-container">
                                        <img src={evt.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80'} alt={evt.event_name} />
                                        <span className="event-location-badge">
                                            <i className="bx bx-map"></i>
                                            {evt.location}
                                        </span>
                                        <span className="event-price-badge">₹{evt.price}</span>
                                    </div>
                                    <div className="event-details-content">
                                        <div className="event-date-text">
                                            <i className="bx bx-calendar"></i>
                                            {formattedDate}
                                        </div>
                                        <h3 className="event-title-h3">{evt.event_name}</h3>
                                        <p className="event-desc-p">{evt.description}</p>
                                        <div className="event-card-actions">
                                            <button
                                                className="btn-primary"
                                                onClick={() => handleBookNow(evt.event_name)}
                                            >
                                                <i className="bx bx-receipt"></i>
                                                <span>Book Ticket</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="no-events-box">
                            <i className="bx bx-sad"></i>
                            <h3>No Events Found</h3>
                            <p>Try searching for a different keyword or check back later!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
