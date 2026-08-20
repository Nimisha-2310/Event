import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="glass-nav">
            <div className="logo" onClick={() => navigate('/')}>
                <i className="bx bxs-calendar-event"></i>
                <span>EventConnect</span>
            </div>

            <div className="nav-links">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <i className="bx bx-home-alt"></i>
                    <span>Home</span>
                </NavLink>
                
                <NavLink to="/json-booking" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <i className="bx bxs-data"></i>
                    <span>MySQL Bookings</span>
                </NavLink>

                {user && (
                    <>
                        <NavLink to="/students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <i className="bx bx-user-pin"></i>
                            <span>Students</span>
                        </NavLink>

                        <NavLink to="/manage-events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <i className="bx bx-edit-alt"></i>
                            <span>Manage Events</span>
                        </NavLink>
                    </>
                )}

                {user ? (
                    <div className="nav-profile-menu">
                        <span className="profile-trigger" onClick={() => navigate('/profile')}>
                            <i className="bx bx-user-circle"></i>
                            <span>{user.name.split(' ')[0]}</span>
                        </span>
                        <button className="logout-btn" onClick={logout}>
                            <i className="bx bx-log-out"></i>
                        </button>
                    </div>
                ) : (
                    <>
                        <NavLink to="/login" className="nav-link">Login</NavLink>
                        <NavLink to="/signup" className="nav-auth-btn">
                            <i className="bx bx-user-plus"></i>
                            <span>Sign Up</span>
                        </NavLink>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
