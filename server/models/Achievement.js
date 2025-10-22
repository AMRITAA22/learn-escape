const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    achievementId: {
        type: String,
        required: true,
        enum: [
            'first_session',
            'week_streak',
            'hour_master',
            'task_warrior',
            'note_taker',
            'century_club',
            'early_bird',
            'night_owl',
        ],
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    unlockedAt: {
        type: Date,
        default: () => new Date(),
    },
}, { timestamps: true });

// Ensure a user can only unlock each achievement once
AchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', AchievementSchema);