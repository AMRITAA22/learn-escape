// server/routes/quiz.js
const express = require('express');
const router = express.Router();
const { getQuiz, submitQuiz, getLeaderboard } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware'); // [cite: 2373-2379]

router.use(protect); // All quiz routes are protected

router.route('/:id').get(getQuiz);
router.route('/:id/submit').post(submitQuiz);
router.route('/:id/leaderboard').get(getLeaderboard);

module.exports = router;