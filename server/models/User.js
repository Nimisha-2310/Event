const mongoose = require('mongoose');
const { getModel } = require('../config/db');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user' // user or admin
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const RealUserModel = mongoose.model('User', UserSchema);

module.exports = getModel('User', RealUserModel);
