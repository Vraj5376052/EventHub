const express = require('express');
const { createEvent, getMyEvents } = require('../controllers/eventController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, requireRole('organiser'), createEvent);
router.get('/mine', protect, requireRole('organiser'), getMyEvents);

module.exports = router;