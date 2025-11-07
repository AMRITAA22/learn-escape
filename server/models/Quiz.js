// server/models/Quiz.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  studyGroupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StudyGroup', 
    required: false // Optional
  },
  basedOnResourceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: false // Optional
  },
  resourceType: { 
    type: String, 
    enum: ['note', 'flashcard', 'topic'], // Added 'topic'
    required: true 
  },
  questions: [questionSchema],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);