const express = require('express');
const router = express.Router();
const { logSession, getStats } = require('../controllers/pomodoroController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/log').post(logSession);
router.route('/stats').get(getStats);  // ADD THIS LINE

module.exports = router;