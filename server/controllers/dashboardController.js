const Task = require('../models/task');
const User = require('../models/User');
const PomodoroSession = require('../models/PomodoroSession');

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // --- All calculations are now correctly defined before being used ---

        // 1. Calculate Total Personal Tasks
        const totalPersonalTasks = await Task.countDocuments({
            createdBy: userId,
            taskType: 'personal',
        });

        // 2. Calculate Completed Personal Tasks
        const completedPersonalTasks = await Task.countDocuments({
            createdBy: userId,
            taskType: 'personal',
            completedBy: { $in: [userId] },
        });

        // 3. Calculate Study Hours Today
        const todaySessions = await PomodoroSession.find({ userId: userId, createdAt: { $gte: todayStart } });
        const totalMinutesToday = todaySessions.reduce((sum, session) => sum + session.duration, 0);
        const studyHoursToday = (totalMinutesToday / 60).toFixed(1);

        // 4. Calculate Study Streak
        const allSessions = await PomodoroSession.find({ userId: userId }).sort({ createdAt: 'desc' });
        let studyStreak = 0;
        if (allSessions.length > 0) {
            const uniqueDays = [...new Set(allSessions.map(s => new Date(s.createdAt).toDateString()))];
            let currentDate = new Date();
            if (uniqueDays.includes(currentDate.toDateString())) {
                studyStreak = 1;
                currentDate.setDate(currentDate.getDate() - 1);
                while (uniqueDays.includes(currentDate.toDateString())) {
                    studyStreak++;
                    currentDate.setDate(currentDate.getDate() - 1);
                }
            }
        }

        // 5. Calculate User Rank
        const allUsers = await User.find({}).lean();
        const userTaskCounts = await Promise.all(allUsers.map(async (user) => {
            const count = await Task.countDocuments({ createdBy: user._id, completedBy: { $in: [user._id] } });
            return { userId: user._id, taskCount: count };
        }));
        userTaskCounts.sort((a, b) => b.taskCount - a.taskCount);
        const rank = userTaskCounts.findIndex(u => u.userId.equals(userId)) + 1;

        // --- Send the final response ---
        res.status(200).json({
            completedPersonalTasks,
            totalPersonalTasks,
            studyStreak,
            studyHoursToday,
            rank: rank > 0 ? rank : 'N/A',
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};