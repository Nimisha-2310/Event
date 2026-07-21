import React from 'react';

const Loader = ({ message = 'Loading details...' }) => {
    return (
        <div className="loader-wrapper">
            <div className="spinner"></div>
            <p style={{ marginTop: '20px', color: '#94a3b8', fontSize: '0.95rem' }}>{message}</p>
        </div>
    );
};

export default Loader;
