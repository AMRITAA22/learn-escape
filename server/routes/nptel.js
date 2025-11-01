const express = require('express');
const router = express.Router();
const {
    getNptelData,
    addSubject,
    removeSubject,
    getCourseSuggestions,
    trackCourse,
    updateProgress
} = require('../controllers/nptelController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getNptelData);

router.route('/subjects')
    .post(addSubject)
    .delete(removeSubject);
    
router.route('/suggest')
    .get(getCourseSuggestions);

router.route('/track')
    .post(trackCourse);

router.route('/track/:courseId')
    .put(updateProgress);

module.exports = router;