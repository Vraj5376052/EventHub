const Booking = require('../models/Booking');
const Event = require('../models/Event');

const generateReference = () =>
    'EH-' + Math.random().toString(36).slice(2, 7).toUpperCase();

const createBooking = async (req, res) => {
    const { eventId, quantity } = req.body;
    try {
        const qty = Number(quantity);
        if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
            return res.status(400).json({ field: 'quantity', message: 'Choose between 1 and 10 tickets' });
        }
        if (!eventId) {
            return res.status(400).json({ field: 'eventId', message: 'Event is required' });
        }

        // Atomic: check availability and reserve the seats in ONE database operation.
        // Two people booking the last seat cannot both succeed.
        const event = await Event.findOneAndUpdate(
            {
                _id: eventId,
                status: 'published',
                $expr: { $lte: [{ $add: ['$bookedSeats', qty] }, '$capacity'] },
            },
            { $inc: { bookedSeats: qty } },
            { new: true }
        );

        if (!event) {
            const existing = await Event.findById(eventId);
            if (!existing || existing.status !== 'published') {
                return res.status(400).json({ message: 'This event is not open for booking' });
            }
            const remaining = existing.capacity - existing.bookedSeats;
            return res.status(400).json({
                field: 'quantity',
                message: remaining > 0
                    ? `Only ${remaining} seat${remaining === 1 ? '' : 's'} remaining`
                    : 'This event is sold out',
            });
        }

        try {
            const booking = await Booking.create({
                eventId: event._id,
                customerId: req.user.id,
                quantity: qty,
                reference: generateReference(),
            });
            return res.status(201).json({ booking, event });
        } catch (bookingError) {
            // The seats were reserved but the booking record failed — give them back.
            await Event.updateOne({ _id: event._id }, { $inc: { bookedSeats: -qty } });
            throw bookingError;
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createBooking };