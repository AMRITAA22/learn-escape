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

/**
 * @desc    Delete a study room
 * @route   DELETE /api/rooms/:id
 */
exports.deleteRoom = async (req, res) => {
    try {
        const room = await StudyRoom.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // --- SECURITY CHECK: Ensure the user deleting the room is the one who created it ---
        if (room.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to delete this room' });
        }

        await room.deleteOne();

        res.status(200).json({ message: 'Room removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};