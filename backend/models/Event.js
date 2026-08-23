const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    organiserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, minlength: 3, maxlength: 100 },
    description: { type: String, default: '' },
    venue: { type: String, required: true },
    startsAt: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1, max: 10000 },
    bookedSeats: { type: Number, default: 0, min: 0 },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['draft', 'published', 'cancelled'], default: 'published' },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema); 