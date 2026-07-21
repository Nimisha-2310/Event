const mongoose = require('mongoose');
const { getModel } = require('../config/db');

const BookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    event: {
        type: String,
        required: true
    },
    tickets: {
        type: Number,
        required: true,
        min: 1
    },
    ticketId: {
        type: String,
        required: true
    },
    bookingDate: {
        type: Date,
        default: Date.now
    }
});

const RealBookingModel = mongoose.model('Booking', BookingSchema);

module.exports = getModel('Booking', RealBookingModel);
