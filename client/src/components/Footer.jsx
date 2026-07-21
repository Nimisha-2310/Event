import React from 'react';

const Footer = () => {
    return (
        <footer className="glass-footer">
            <p>© {new Date().getFullYear()} EventConnect. All rights reserved.</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>B.Tech Information Technology Industrial Training Project</p>
        </footer>
    );
};

export default Footer;
