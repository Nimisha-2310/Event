const mongoose = require('mongoose');
const { getModel } = require('../config/db');

const EventSchema = new mongoose.Schema({
    event_name: {
        type: String,
        required: true
    },
    event_date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        default: 0
    },
    imageUrl: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const RealEventModel = mongoose.model('Event', EventSchema);

module.exports = getModel('Event', RealEventModel);
