const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    front: { type: String, required: true, trim: true },
    back: { type: String, required: true, trim: true },
});

const flashcardDeckSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    cards: [cardSchema],
}, { timestamps: true });

module.exports = mongoose.model('FlashcardDeck', flashcardDeckSchema);