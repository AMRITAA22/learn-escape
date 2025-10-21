const express = require('express');
const router = express.Router();
const { 
    uploadNotes, 
    chat, 
    uploadMiddleware, 
    getConversations, 
    getConversationById,
    generateFlashcards,
    generateAndSaveDeck
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/upload', uploadMiddleware, uploadNotes);
router.post('/chat', chat);

router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationById);

// NEW: AI Flashcard generation routes
router.post('/generate-flashcards', generateFlashcards);
router.post('/generate-deck', generateAndSaveDeck);

module.exports = router;