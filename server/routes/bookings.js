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

// ==========================================
// 🐬 MySQL Database Booking CRUD API Endpoints
// ==========================================
const { getMySQLPool, isMySQLReady, getMySQLStatus, initMySQL } = require('../config/mysql');

// 1. Get MySQL Status & Config Info
router.get('/mysql-status', async (req, res) => {
    if (!isMySQLReady()) {
        await initMySQL();
    }
    res.json(getMySQLStatus());
});

// 2. Fetch all bookings from MySQL Table
router.get('/mysql-list', async (req, res) => {
    try {
        let pool = getMySQLPool();
        if (!pool || !isMySQLReady()) {
            pool = await initMySQL();
        }

        if (!pool) {
            return res.status(503).json({ 
                message: 'MySQL database is not connected. Please ensure MySQL server is running.',
                status: getMySQLStatus()
            });
        }

        const [rows] = await pool.query('SELECT * FROM bookings ORDER BY id DESC');
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (err) {
        console.error('MySQL query error:', err);
        res.status(500).json({ message: 'Error fetching MySQL bookings: ' + err.message });
    }
});

// 3. Create a new booking in MySQL Table (INSERT INTO)
router.post('/mysql-submit', async (req, res) => {
    try {
        const { name, email, event, tickets } = req.body;
        if (!name || !email || !event || !tickets) {
            return res.status(400).json({ message: 'All booking fields (name, email, event, tickets) are required' });
        }

        let pool = getMySQLPool();
        if (!pool || !isMySQLReady()) {
            pool = await initMySQL();
        }

        if (!pool) {
            return res.status(503).json({ 
                message: 'MySQL server is not running or unreachable. Please start MySQL service.',
                status: getMySQLStatus()
            });
        }

        const insertSQL = 'INSERT INTO bookings (name, email, event, tickets) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(insertSQL, [
            name.trim(),
            email.trim().toLowerCase(),
            event.trim(),
            Number(tickets)
        ]);

        const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [result.insertId]);
        const createdRecord = rows[0];

        res.status(201).json({
            success: true,
            message: `Booking successfully saved to MySQL database (ID: #${result.insertId})! ✅`,
            data: createdRecord
        });
    } catch (err) {
        console.error('MySQL insert error:', err);
        res.status(500).json({ message: 'Failed inserting record into MySQL: ' + err.message });
    }
});

// 4. Delete a booking from MySQL Table (DELETE FROM)
router.delete('/mysql-delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let pool = getMySQLPool();
        if (!pool || !isMySQLReady()) {
            pool = await initMySQL();
        }

        if (!pool) {
            return res.status(503).json({ message: 'MySQL service unavailable' });
        }

        const [result] = await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Booking ID not found in MySQL' });
        }

        res.json({
            success: true,
            message: `Booking #${id} deleted from MySQL database successfully.`
        });
    } catch (err) {
        console.error('MySQL delete error:', err);
        res.status(500).json({ message: 'Error deleting MySQL record: ' + err.message });
    }
});

module.exports = router;


