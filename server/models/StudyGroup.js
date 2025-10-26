const mongoose = require('mongoose');

const StudyGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    groupCode: {
        type: String,
        required: true,
        unique: true,
        // uppercase: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member',
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
    }],
    goals: [{
        title: {
            type: String,
            required: true,
        },
        description: String,
        targetValue: Number,
        currentValue: {
            type: Number,
            default: 0,
        },
        type: {
            type: String,
            enum: ['hours', 'sessions', 'tasks'],
            required: true,
        },
        deadline: Date,
        completed: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],
    sharedResources: [{
        resourceType: {
            type: String,
            enum: ['note', 'flashcard', 'link'],
            required: true,
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        title: String,
        sharedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        sharedAt: {
            type: Date,
            default: Date.now,
        },
    }],
    chat: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],
    isPrivate: {
        type: Boolean,
        default: true,
    },
    maxMembers: {
        type: Number,
        default: 50,
    },
}, { timestamps: true });

// Generate unique 6-character group code
// Change the pre-save hook
StudyGroupSchema.pre('save', async function(next) {
    if (!this.groupCode) {
        let code;
        let isUnique = false;
        
        // Keep generating until we get a unique code
        while (!isUnique) {
            code = generateGroupCode();
            const existingGroup = await mongoose.model('StudyGroup').findOne({ groupCode: code });
            if (!existingGroup) {
                isUnique = true;
            }
        }
        this.groupCode = code;
    }
    next();
});

// Helper function to generate group code
function generateGroupCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Index for faster queries
StudyGroupSchema.index({ groupCode: 1 });
StudyGroupSchema.index({ 'members.userId': 1 });
StudyGroupSchema.index({ createdBy: 1 });

module.exports = mongoose.model('StudyGroup', StudyGroupSchema);