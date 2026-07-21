const mongoose = require('mongoose');
const { getModel } = require('../config/db');

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const RealStudentModel = mongoose.model('Student', StudentSchema);

module.exports = getModel('Student', RealStudentModel);
