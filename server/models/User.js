// server/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // No two users can share an email
    },
    password: {
        type: String,
        required: true,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// This function runs before a user document is saved to the database
UserSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);