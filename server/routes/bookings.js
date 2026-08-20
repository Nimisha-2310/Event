const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');

const getDataJsonPath = () => {
    if (process.env.VERCEL) {
        return path.join('/tmp', 'data.json');
    }
    return path.join(__dirname, '..', '..', 'data.json');
};

// Get all bookings (optionally filter by email)
router.get('/', protect, async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { email: req.user.email.trim().toLowerCase() };
        const bookings = await Booking.find(query);
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving bookings' });
    }
});

// Book a ticket
router.post('/', async (req, res) => {
    try {
        const { name, email, event, tickets } = req.body;
        if (!name || !email || !event || !tickets) {
            return res.status(400).json({ message: 'All booking fields are required' });
        }

        const ticketId = 'TKT-' + Math.floor(100000 + Math.random() * 900000);

        const newBooking = await Booking.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            event: event.trim(),
            tickets: Number(tickets),
            ticketId,
            bookingDate: new Date()
        });

        res.status(201).json(newBooking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error booking ticket' });
    }
});

// Task 9 Support: Save form data to data.json dynamically
router.post('/task9-submit', (req, res) => {
    const { name, email, event, tickets } = req.body;
    
    if (!name || !email || !event || !tickets) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const userData = { 
        name: name.trim(), 
        email: email.trim().toLowerCase(), 
        event, 
        tickets: Number(tickets), 
        submittedAt: new Date().toISOString()
    };
    
    const filePath = getDataJsonPath();
    
    fs.writeFile(filePath, JSON.stringify(userData, null, 2), (err) => {
        if (err) {
            console.error('Task 9 write error:', err);
            return res.status(500).json({ message: 'Error saving data to data.json' });
        }
        res.json({ 
            message: 'Successfully saved local data.json config!',
            user: userData 
        });
    });
});

// Task 9 Support: Get data.json contents
router.get('/task9-data', (req, res) => {
    const filePath = getDataJsonPath();
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'JSON booking data not created yet' });
    }
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading JSON booking data' });
        }
        try {
            res.json(JSON.parse(data));
        } catch (e) {
            res.status(500).json({ message: 'Error parsing json file' });
        }
    });
});

module.exports = router;

