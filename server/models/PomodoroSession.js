const mongoose = require('mongoose');

const PomodoroSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    duration: {
        type: Number, // Duration in minutes
        required: true,
    },
}, { timestamps: true }); // 'createdAt' will be our session date

module.exports = mongoose.model('PomodoroSession', PomodoroSessionSchema);