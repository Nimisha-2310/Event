const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'eventconnect_secret_token_12345';

const protect = (req, res, next) => {
    const token = req.cookies.authCookie;
    
    if (!token) {
        return res.status(401).json({ message: 'Access denied. Please log in first.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid session token. Please log in again.' });
    }
};

const adminOnly = (req, res, next) => {
    protect(req, res, () => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Access forbidden. Admins only.' });
        }
    });
};

module.exports = {
    protect,
    adminOnly
};
