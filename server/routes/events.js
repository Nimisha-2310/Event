const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect } = require('../middleware/authMiddleware');

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving events list' });
    }
});

// Add an event
router.post('/', protect, async (req, res) => {
    try {
        const { event_name, event_date, location, description, price, imageUrl } = req.body;
        if (!event_name || !event_date || !location) {
            return res.status(400).json({ message: 'Event name, date, and location are required' });
        }

        const parsedDate = new Date(event_date);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ message: 'Invalid event date format' });
        }

        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice < 0) {
            return res.status(400).json({ message: 'Event price must be a non-negative number' });
        }

        const newEvent = await Event.create({
            event_name: event_name.trim(),
            event_date: parsedDate,
            location: location.trim(),
            description: description ? description.trim() : '',
            price: numPrice,
            imageUrl: imageUrl?.trim() || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80'
        });
        res.status(201).json(newEvent);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating event' });
    }
});

// Update an event
router.put('/:id', protect, async (req, res) => {
    try {
        const { event_name, event_date, location, description, price, imageUrl } = req.body;
        const updateData = {};

        if (event_name) updateData.event_name = event_name.trim();
        if (event_date) {
            const parsedDate = new Date(event_date);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({ message: 'Invalid event date format' });
            }
            updateData.event_date = parsedDate;
        }
        if (location) updateData.location = location.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (price !== undefined) {
            const numPrice = Number(price);
            if (isNaN(numPrice) || numPrice < 0) {
                return res.status(400).json({ message: 'Event price must be a non-negative number' });
            }
            updateData.price = numPrice;
        }
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();

        const updated = await Event.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Event not found' });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating event details' });
    }
});

// Delete an event
router.delete('/:id', protect, async (req, res) => {
    try {
        const deleted = await Event.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting event' });
    }
});

module.exports = router;
