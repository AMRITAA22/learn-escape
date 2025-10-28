const express = require('express');
const router = express.Router();
const { processVoiceCommand, checkVoiceService } = require('../controllers/voiceController');
const { protect } = require('../middleware/authMiddleware');

// Routes
router.post('/process', protect, processVoiceCommand);
router.get('/health', checkVoiceService);

module.exports = router;
