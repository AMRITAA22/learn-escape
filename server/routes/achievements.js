const express = require('express');
const router = express.Router();
const { getAchievements, checkAchievements, getAchievementStats } = require('../controllers/achievementsController');


const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAchievements);
router.post('/check', checkAchievements);
router.get('/stats', protect, getAchievementStats);


module.exports = router;