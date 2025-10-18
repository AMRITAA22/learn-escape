const PomodoroSession = require('../models/PomodoroSession');

// @desc    Log a completed pomodoro session
// @route   POST /api/pomodoro/log
exports.logSession = async (req, res) => {
    const { duration } = req.body;
    try {
        await PomodoroSession.create({
            userId: req.user.id,
            duration,
        });
        res.status(201).json({ message: 'Session logged successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};