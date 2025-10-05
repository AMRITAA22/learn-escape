import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deckId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck', required: true },
  question: String,
  answer: String,
  interval: { type: Number, default: 1 },
  repetition: { type: Number, default: 0 },
  efactor: { type: Number, default: 2.5 },
  nextReview: { type: Date, default: Date.now },
});

export default mongoose.model('Flashcard', flashcardSchema);
