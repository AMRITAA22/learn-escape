// server/controllers/quizController.js
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const StudyGroup = require('../models/StudyGroup'); // [cite: 2395-2411]

// Helper function to check if user is in a group
const isGroupMember = (group, userId) => {
    return group.members.some(m => m.userId.toString() === userId.toString()); // [cite: 2265-2266]
};

// @desc    Get all quizzes for a study group
// @route   GET /api/study-groups/:id/quizzes
exports.getQuizzesForGroup = async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (!isGroupMember(group, req.user.id)) {
            return res.status(403).json({ message: 'Not authorized' }); // [cite: 2266]
        }

        const quizzes = await Quiz.find({ studyGroupId: req.params.id })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
            
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single quiz (questions only)
// @route   GET /api/quizzes/:id
exports.getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).select('-questions.correctAnswer'); // Hide answers
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // If it's a group quiz, check for membership
        if (quiz.studyGroupId) {
            const group = await StudyGroup.findById(quiz.studyGroupId);
            if (!group || !isGroupMember(group, req.user.id)) {
                return res.status(403).json({ message: 'You are not a member of the group this quiz belongs to.' });
            }
        }
        // If it's a personal quiz, only the creator can see it
        else if (quiz.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this quiz.' });
        }
        
        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Submit answers for a quiz
// @route   POST /api/quizzes/:id/submit
exports.submitQuiz = async (req, res) => {
    const { answers } = req.body; // Expects: [{ questionId: "...", userAnswer: "C" }]
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        let correctCount = 0;
        const resultAnswers = [];

        // Grade the quiz
        for (const userAnswer of answers) {
            const question = quiz.questions.id(userAnswer.questionId);
            if (!question) continue;

            const isCorrect = question.correctAnswer === userAnswer.userAnswer;
            if (isCorrect) {
                correctCount++;
            }
            resultAnswers.push({
                questionText: question.questionText,
                userAnswer: userAnswer.userAnswer,
                correctAnswer: question.correctAnswer
            });
        }

        const score = Math.round((correctCount / quiz.questions.length) * 100);

        // Save the result
        const newResult = await QuizResult.create({
            quizId: quiz._id,
            userId: req.user.id,
            studyGroupId: quiz.studyGroupId, // Copy group ID for the leaderboard
            score: score,
            answers: resultAnswers
        });

        res.status(201).json(newResult);
    } catch (error) {
        if (error.code === 11000) { // Handle duplicate key error (user already took quiz)
            return res.status(400).json({ message: 'You have already submitted this quiz.' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get leaderboard for a quiz
// @route   GET /api/quizzes/:id/leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const results = await QuizResult.find({ quizId: req.params.id })
            .populate('userId', 'name')
            .sort({ score: -1, createdAt: 1 }); // Highest score, then fastest time

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single quiz result by its ID
// @route   GET /api/quizzes/results/:id
exports.getQuizResult = async (req, res) => {
    try {
        const result = await QuizResult.findById(req.params.id)
            .populate('userId', 'name')
            .populate('quizId', 'title'); // Also get the quiz title

        if (!result) {
            return res.status(404).json({ message: 'Quiz result not found' });
        }

        // Security: Only the user who took the quiz can see their own result.
        if (result.userId._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this result' });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};