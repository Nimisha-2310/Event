const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect } = require('../middleware/authMiddleware');

// Get all students
router.get('/', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving students list' });
    }
});

// Add a student
router.post('/', protect, async (req, res) => {
    try {
        const { name, email, age, course } = req.body;
        if (!name || !email || !age || !course) {
            return res.status(400).json({ message: 'Please input all student details' });
        }

        const newStudent = await Student.create({ name, email, age, course });
        res.status(201).json(newStudent);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error registering student profile' });
    }
});

// Update a student
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, email, age, course } = req.body;
        const updated = await Student.findByIdAndUpdate(req.params.id, { name, email, age, course }, { new: true });
        if (!updated) return res.status(404).json({ message: 'Student record not found' });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error editing student record' });
    }
});

// Delete a student
router.delete('/:id', protect, async (req, res) => {
    try {
        const deleted = await Student.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Student record not found' });
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting student record' });
    }
});

module.exports = router;
