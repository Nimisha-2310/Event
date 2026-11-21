const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'eventconnect_secret_token_12345';

const protect = (req, res, next) => {
    let token = null;

    // 1. Check Authorization header first (most direct & reliable for API clients/SPAs)
    if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // 2. Check cookie fallback
    else if (req.cookies && req.cookies.authCookie) {
        token = req.cookies.authCookie;
    }
    
    if (!token) {
        return res.status(401).json({ message: 'Access denied. Please log in first.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired session token. Please log in again.' });
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
