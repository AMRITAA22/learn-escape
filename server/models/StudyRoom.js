const mongoose = require('mongoose');

const StudyRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, // A reference to a User's ID
        required: true,
        ref: 'User', // The model to link to
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

module.exports = mongoose.model('StudyRoom', StudyRoomSchema);