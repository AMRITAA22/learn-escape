const express = require('express');
const router = express.Router();
const { 
    uploadNotes, 
    chat, 
    uploadMiddleware, 
    getConversations, 
    getConversationById 
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/upload', uploadMiddleware, uploadNotes);
router.post('/chat', chat);

// --- These routes were missing, causing the 404 error ---
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationById);

module.exports = router;