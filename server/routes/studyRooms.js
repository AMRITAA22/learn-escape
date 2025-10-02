// server/routes/studyRooms.js

const express = require('express');
const router = express.Router();
const { createRoom, getPublicRooms } = require('../controllers/studyRoomController.js');
const { protect } = require('../middleware/authMiddleware');

// Apply the 'protect' middleware to both routes
router.route('/').post(protect, createRoom).get(protect, getPublicRooms);

module.exports = router;