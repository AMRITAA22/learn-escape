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

// @desc    Get session statistics for the logged-in user
// @route   GET /api/pomodoro/stats
exports.getStats = async (req, res) => {
    try {
        const sessions = await PomodoroSession.find({ userId: req.user.id });
        
        const sessionsCompleted = sessions.length;
        const totalMinutesStudied = sessions.reduce((sum, session) => sum + session.duration, 0);
        
        res.status(200).json({
            sessionsCompleted,
            totalMinutesStudied,
            sessions,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};