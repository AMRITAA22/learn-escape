const Achievement = require('../models/Achievement');
const PomodoroSession = require('../models/PomodoroSession');
const Task = require('../models/task');
const Note = require('../models/Note');

// Define all achievements with their requirements
const ACHIEVEMENTS = {
    FIRST_SESSION: {
        id: 'first_session',
        title: 'First Step',
        description: 'Complete your first Pomodoro session',
        requirement: { type: 'sessions', value: 1 },
    },
    WEEK_STREAK: {
        id: 'week_streak',
        title: 'On Fire',
        description: 'Maintain a 7-day study streak',
        requirement: { type: 'streak', value: 7 },
    },
    HOUR_MASTER: {
        id: 'hour_master',
        title: 'Hour Master',
        description: 'Study for 10 hours in a week',
        requirement: { type: 'weekly_hours', value: 10 },
    },
    TASK_WARRIOR: {
        id: 'task_warrior',
        title: 'Task Warrior',
        description: 'Complete 50 tasks',
        requirement: { type: 'tasks', value: 50 },
    },
    NOTE_TAKER: {
        id: 'note_taker',
        title: 'Note Taker',
        description: 'Create 10 notes',
        requirement: { type: 'notes', value: 10 },
    },
    CENTURY_CLUB: {
        id: 'century_club',
        title: 'Century Club',
        description: 'Study for 100 hours total',
        requirement: { type: 'total_hours', value: 100 },
    },
    EARLY_BIRD: {
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Complete 3 sessions before 9 AM',
        requirement: { type: 'early_sessions', value: 3 },
    },
    NIGHT_OWL: {
        id: 'night_owl',
        title: 'Night Owl',
        description: 'Complete 3 sessions after 10 PM',
        requirement: { type: 'late_sessions', value: 3 },
    },
};

// @desc    Get all achievements for user with progress
// @route   GET /api/achievements
exports.getAchievements = async (req, res) => {
    try {
        const userAchievements = await Achievement.find({ userId: req.user.id });
        const unlockedIds = new Set(userAchievements.map(a => a.achievementId));

        const achievementsWithProgress = await Promise.all(
            Object.values(ACHIEVEMENTS).map(async (achievement) => {
                const progress = await calculateProgress(req.user.id, achievement);
                const isUnlocked = unlockedIds.has(achievement.id);
                const unlockedAt = userAchievements.find(a => a.achievementId === achievement.id)?.unlockedAt;

                return {
                    ...achievement,
                    isUnlocked,
                    progress: progress.current,
                    target: progress.target,
                    unlockedAt,
                };
            })
        );

        res.status(200).json(achievementsWithProgress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Check and auto-unlock achievements
// @route   POST /api/achievements/check
exports.checkAchievements = async (req, res) => {
    try {
        const unlockedAchievements = [];

        for (const achievement of Object.values(ACHIEVEMENTS)) {
            const isAlreadyUnlocked = await Achievement.findOne({
                userId: req.user.id,
                achievementId: achievement.id,
            });

            if (!isAlreadyUnlocked) {
                const shouldUnlock = await checkAchievementRequirement(req.user.id, achievement);

                if (shouldUnlock) {
                    const newAchievement = await Achievement.create({
                        userId: req.user.id,
                        achievementId: achievement.id,
                        title: achievement.title,
                        description: achievement.description,
                        unlockedAt: new Date(),
                    });

                    unlockedAchievements.push(newAchievement);
                }
            }
        }

        res.status(200).json({
            newAchievements: unlockedAchievements,
            count: unlockedAchievements.length,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get achievement statistics
// @route   GET /api/achievements/stats
exports.getAchievementStats = async (req, res) => {
    try {
        const achievements = await Achievement.find({ userId: req.user.id });
        const totalAchievements = Object.keys(ACHIEVEMENTS).length;
        const unlockedCount = achievements.length;
        const completionPercentage = Math.round((unlockedCount / totalAchievements) * 100);

        res.status(200).json({
            totalAchievements,
            unlockedCount,
            lockedCount: totalAchievements - unlockedCount,
            completionPercentage,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Helper: Calculate progress for an achievement
async function calculateProgress(userId, achievement) {
    const requirement = achievement.requirement;

    switch (requirement.type) {
        case 'sessions':
            const sessions = await PomodoroSession.countDocuments({ userId });
            return { current: sessions, target: requirement.value };

        case 'weekly_hours':
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const weeklySessions = await PomodoroSession.find({
                userId,
                createdAt: { $gte: weekAgo },
            });
            const weeklyHours = Math.floor(weeklySessions.reduce((sum, s) => sum + s.duration, 0) / 60);
            return { current: weeklyHours, target: requirement.value };

        case 'tasks':
            const completedTasks = await Task.countDocuments({
                createdBy: userId,
                completed: true,
            });
            return { current: completedTasks, target: requirement.value };

        case 'notes':
            const notes = await Note.countDocuments({ userId });
            return { current: notes, target: requirement.value };

        case 'total_hours':
            const allSessions = await PomodoroSession.find({ userId });
            const totalHours = Math.floor(allSessions.reduce((sum, s) => sum + s.duration, 0) / 60);
            return { current: totalHours, target: requirement.value };

        case 'early_sessions':
            const earlySessions = await PomodoroSession.find({ userId });
            const earlyCount = earlySessions.filter(s => {
                const hour = new Date(s.createdAt).getHours();
                return hour >= 5 && hour < 9;
            }).length;
            return { current: earlyCount, target: requirement.value };

        case 'late_sessions':
            const lateSessions = await PomodoroSession.find({ userId });
            const lateCount = lateSessions.filter(s => {
                const hour = new Date(s.createdAt).getHours();
                return hour >= 22 || hour < 5;
            }).length;
            return { current: lateCount, target: requirement.value };

        case 'streak':
            // Simplified streak calculation
            const recentSessions = await PomodoroSession.find({ userId }).sort({ createdAt: -1 }).limit(7);
            return { current: recentSessions.length, target: requirement.value };

        default:
            return { current: 0, target: requirement.value };
    }
}

// Helper: Check if achievement requirement is met
async function checkAchievementRequirement(userId, achievement) {
    const progress = await calculateProgress(userId, achievement);
    return progress.current >= progress.target;
}

// module.exports = {
//     getAchievements,
//     checkAchievements,
//     getAchievementStats,
// };