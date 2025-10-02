const StudyRoom = require('../models/StudyRoom');

// @desc    Create a new study room
// @route   POST /api/rooms
exports.createRoom = async (req, res) => {
    const { name, isPublic } = req.body;
    try {
        const room = await StudyRoom.create({
            name,
            isPublic,
            createdBy: req.user._id, // req.user comes from the 'protect' middleware
            members: [req.user._id],
        });
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all public study rooms
// @route   GET /api/rooms
exports.getPublicRooms = async (req, res) => {
    try {
        const rooms = await StudyRoom.find({ isPublic: true }).populate('createdBy', 'name');
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};