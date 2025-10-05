const express = require('express');
const router = express.Router();

// THE FIX: Add 'deleteRoom' to this import list
const { 
    createRoom, 
    getPublicRooms, 
    deleteRoom 
} = require('../controllers/studyRoomController');

const { protect } = require('../middleware/authMiddleware');

// This handles GET (to fetch rooms) and POST (to create a room)
router.route('/').get(protect, getPublicRooms).post(protect, createRoom);

// This handles DELETE requests to a specific room ID (e.g., /api/rooms/12345)
router.route('/:id').delete(protect, deleteRoom);

module.exports = router;