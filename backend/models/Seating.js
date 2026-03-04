const mongoose = require('mongoose');

const SeatingSchema = new mongoose.Schema({
    examDate: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true,
        index: true // Indexed for fast search
    },
    block: {
        type: String,
        required: true
    },
    floor: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Seating', SeatingSchema);
