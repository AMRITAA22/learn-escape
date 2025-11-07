// server/controllers/quizController.js
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const StudyGroup = require('../models/StudyGroup'); // <-- THIS IS THE FIX

// Helper function to check if user is in a group
const isGroupMember = (group, userId) => {
    // Use .equals() for robust ObjectId comparison
    return group.members.some(m => m.userId.equals(userId));
};

// @desc    Get all quizzes for a study group
// @route   GET /api/study-groups/:id/quizzes
exports.getQuizzesForGroup = async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        // Use ._id here for ObjectId
        if (!isGroupMember(group, req.user._id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const quizzes = await Quiz.find({ studyGroupId: req.params.id })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
            
        res.status(200).json(quizzes);
    } catch (error) {
        console.error("Error in getQuizzesForGroup:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single quiz (questions only)
// @route   GET /api/quizzes/:id
exports.getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).select('-questions.correctAnswer');
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        if (quiz.studyGroupId) {
            const group = await StudyGroup.findById(quiz.studyGroupId);
            // Use ._id for robust comparison
            if (!group || !isGroupMember(group, req.user._id)) {
                return res.status(403).json({ message: 'You are not a member of the group this quiz belongs to.' });
            }
        }
        // Use .equals() for robust comparison
        else if (!quiz.createdBy.equals(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to view this quiz.' });
        }
        
        res.status(200).json(quiz);
    } catch (error) {
        console.error("Error in getQuiz:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Submit answers for a quiz
// @route   POST /api/quizzes/:id/submit
exports.submitQuiz = async (req, res) => {
    const { answers } = req.body;
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        let correctCount = 0;
        const resultAnswers = [];

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

        const newResult = await QuizResult.create({
            quizId: quiz._id, // Use the ObjectId
            userId: req.user._id, // Use the ObjectId
            studyGroupId: quiz.studyGroupId,
            score: score,
            answers: resultAnswers
        });

        res.status(201).json(newResult);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already submitted this quiz.' });
        }
        console.error("Error in submitQuiz:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get leaderboard for a quiz
// @route   GET /api/quizzes/:id/leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // --- THIS IS THE CORRECTED SECURITY LOGIC ---
        if (quiz.studyGroupId) {
            const group = await StudyGroup.findById(quiz.studyGroupId);
            // Check if group exists AND user is a member
            if (!group || !group.members.some(m => m.userId.equals(req.user._id))) {
                return res.status(403).json({ message: 'You are not a member of this quiz\'s group.' });
            }
        } 
        else if (!quiz.createdBy.equals(req.user._id)) { 
            return res.status(403).json({ message: 'Not authorized to view this personal quiz.' });
        }
        // --- END OF FIX ---

        const results = await QuizResult.find({ quizId: req.params.id })
            .populate('userId', 'name')
            .sort({ score: -1, createdAt: 1 });

        res.status(200).json(results);
    } catch (error) {
        console.error("Error in getLeaderboard:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single quiz result by its ID
// @route   GET /api/quizzes/results/:id
exports.getQuizResult = async (req, res) => {
    try {
        const result = await QuizResult.findById(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Quiz result not found' });
        }

        // --- THIS IS THE CORRECTED SECURITY LOGIC ---
        // Use .equals() to compare the result's ObjectId with the user's ObjectId
        if (!result.userId.equals(req.user._id)) {
            console.error("Authorization Failed in getQuizResult:");
            console.error("Result Owner ID:", result.userId);
            console.error("Logged In User ID:", req.user._id);
            return res.status(403).json({ message: 'Not authorized to view this result' });
        }

        await result.populate('userId', 'name');
        await result.populate('quizId', 'title');
        
        res.status(200).json(result);

    } catch (error) {
        console.error("Error in getQuizResult:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};