// server/models/QuizResult.js
const mongoose = require('mongoose');

const QuizResultSchema = new mongoose.Schema({
  quizId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Quiz', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  studyGroupId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StudyGroup', 
    required: false 
  },
  score: { 
    type: Number, 
    required: true 
  },
  answers: [{
    questionText: String,
    userAnswer: String,
    correctAnswer: String
  }],
}, { timestamps: true });

QuizResultSchema.index({ quizId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('QuizResult', QuizResultSchema);