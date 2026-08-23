const express = require('express');
const { createBooking } = require('../controllers/bookingController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, requireRole('customer'), createBooking);

module.exports = router;