const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'eventconnect_secret_token_12345';

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Verify if user already exists
        const userExists = await User.findOne({ email: cleanEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine role (admin or user)
        const role = cleanEmail.includes('admin') ? 'admin' : 'user';

        // Create user
        const newUser = await User.create({
            name: name.trim(),
            email: cleanEmail,
            password: hashedPassword,
            role
        });

        // Generate JWT
        const token = jwt.sign(
            { id: newUser._id || newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Set Cookie
        res.cookie('authCookie', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'lax',
            path: '/'
        });

        res.status(201).json({
            message: 'User registered successfully 🎉',
            token,
            user: {
                id: newUser._id || newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and set cookie
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Check if user exists
        const user = await User.findOne({ email: cleanEmail });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials ❌' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Emulation support: check direct password comparison if bcrypt fails (e.g. for existing direct password rows in fallback)
            if (password !== user.password) {
                return res.status(400).json({ message: 'Invalid credentials ❌' });
            }
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id || user.id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Set Cookie
        res.cookie('authCookie', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'lax',
            path: '/'
        });

        res.json({
            message: 'Login successful! 🎉',
            token,
            user: {
                id: user._id || user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user & clear cookie
router.post('/logout', (req, res) => {
    res.clearCookie('authCookie', { path: '/' });
    res.json({ message: 'Logged out successfully' });
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user info
router.get('/me', async (req, res) => {
    let token = null;
    if (req.cookies && req.cookies.authCookie) {
        token = req.cookies.authCookie;
    } else if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({
            user: {
                id: decoded.id,
                name: decoded.name,
                email: decoded.email,
                role: decoded.role
            }
        });
    } catch (err) {
        res.clearCookie('authCookie', { path: '/' });
        res.status(401).json({ message: 'Session expired, login again' });
    }
});

module.exports = router;

