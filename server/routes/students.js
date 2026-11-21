const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect } = require('../middleware/authMiddleware');

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

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
        if (!name || !email || age === undefined || !course) {
            return res.status(400).json({ message: 'Please input all student details' });
        }

        const cleanEmail = email.trim().toLowerCase();
        if (!isValidEmail(cleanEmail)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        const numAge = parseInt(age, 10);
        if (isNaN(numAge) || numAge < 5 || numAge > 120) {
            return res.status(400).json({ message: 'Please provide a valid age between 5 and 120' });
        }

        // Check for duplicate student email
        const existing = await Student.findOne({ email: cleanEmail });
        if (existing) {
            return res.status(400).json({ message: 'A student record with this email already exists' });
        }

        const newStudent = await Student.create({
            name: name.trim(),
            email: cleanEmail,
            age: numAge,
            course: course.trim()
        });
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
        
        let updateData = {};
        if (name) updateData.name = name.trim();
        if (course) updateData.course = course.trim();
        
        if (age !== undefined) {
            const numAge = parseInt(age, 10);
            if (isNaN(numAge) || numAge < 5 || numAge > 120) {
                return res.status(400).json({ message: 'Please provide a valid age between 5 and 120' });
            }
            updateData.age = numAge;
        }

        if (email) {
            const cleanEmail = email.trim().toLowerCase();
            if (!isValidEmail(cleanEmail)) {
                return res.status(400).json({ message: 'Please provide a valid email address' });
            }

            const existing = await Student.findOne({ email: cleanEmail });
            if (existing && String(existing._id || existing.id) !== String(req.params.id)) {
                return res.status(400).json({ message: 'This email is already registered to another student' });
            }
            updateData.email = cleanEmail;
        }

        const updated = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
