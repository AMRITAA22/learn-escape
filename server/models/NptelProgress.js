const mongoose = require('mongoose');

const TrackedCourseSchema = new mongoose.Schema({
    courseId: {
        type: String,
        required: true,
    },
    courseName: {
        type: String,
        required: true,
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    }
});

const NptelProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    subjects: {
        type: [String],
        default: [],
    },
    trackedCourses: [TrackedCourseSchema]
}, { timestamps: true });

module.exports = mongoose.model('NptelProgress', NptelProgressSchema);