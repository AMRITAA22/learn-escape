const express = require('express');
const router = express.Router();
const { logSession } = require('../controllers/pomodoroController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/log').post(logSession);

module.exports = router;