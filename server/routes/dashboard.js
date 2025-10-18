const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// All dashboard routes are protected
router.use(protect);

router.route('/').get(getDashboardData);

module.exports = router;