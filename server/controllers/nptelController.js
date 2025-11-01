const NptelProgress = require('../models/NptelProgress');
const { getCourses } = require('../nptelData');
const axios = require('axios');

const NPTEL_API_URL = 'https://api.nptelprep.in/courses';

// Helper to get or create the user's progress document
async function getOrCreateProgress(userId) {
    let progress = await NptelProgress.findOne({ userId });
    if (!progress) {
        progress = await NptelProgress.create({ userId });
    }
    return progress;
}

// @desc    Get user's subjects and tracked courses
// @route   GET /api/nptel
exports.getNptelData = async (req, res) => {
    try {
        const progress = await getOrCreateProgress(req.user.id);
        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a subject
// @route   POST /api/nptel/subjects
exports.addSubject = async (req, res) => {
    const { subject } = req.body;
    if (!subject) {
        return res.status(400).json({ message: 'Subject is required' });
    }
    try {
        const progress = await getOrCreateProgress(req.user.id);
        if (!progress.subjects.includes(subject)) {
            progress.subjects.push(subject);
            await progress.save();
        }
        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Remove a subject
// @route   DELETE /api/nptel/subjects
exports.removeSubject = async (req, res) => {
    const { subject } = req.body;
    try {
        const progress = await getOrCreateProgress(req.user.id);
        progress.subjects = progress.subjects.filter(s => s !== subject);
        await progress.save();
        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get NPTEL course suggestions based on a subject
// @route   GET /api/nptel/suggest
exports.getCourseSuggestions = async (req, res) => {
    const { subject } = req.query;
    if (!subject) {
        return res.status(400).json({ message: 'Subject query is required' });
    }

    try {
        const allCourses = getCourses();
        if (allCourses.length === 0) {
            console.warn('[NPTEL Search] Search attempted but 0 courses are loaded.');
            return res.status(503).json({ message: 'Course data is still loading, please try again in a moment.' });
        }

        const subjectLower = subject.toLowerCase();
        
        // SAFER FILTERING:
        // We check if the property exists before calling .toLowerCase()
        const suggestions = allCourses.filter(course => {
            const nameMatch = course.course_name ? course.course_name.toLowerCase().includes(subjectLower) : false;
            const disciplineMatch = course.discipline ? course.discipline.toLowerCase().includes(subjectLower) : false;
            return nameMatch || disciplineMatch;
        }).slice(0, 20);

        console.log(`[NPTEL Search] Found ${suggestions.length} suggestions for "${subject}"`);
        res.status(200).json(suggestions);

    } catch (error) {
        console.error("[NPTEL Search] Suggestion Error:", error.message);
        res.status(500).json({ message: 'Failed to fetch course suggestions' });
    }
};

// @desc    Track a new course
// @route   POST /api/nptel/track
exports.trackCourse = async (req, res) => {
    const { courseId, courseName } = req.body;
    try {
        const progress = await getOrCreateProgress(req.user.id);
        
        // Check if already tracking
        const isTracking = progress.trackedCourses.some(c => c.courseId === courseId);
        if (!isTracking) {
            progress.trackedCourses.push({ courseId, courseName, progress: 0 });
            await progress.save();
        }
        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update progress on a tracked course
// @route   PUT /api/nptel/track/:courseId
exports.updateProgress = async (req, res) => {
    const { courseId } = req.params;
    const { progress } = req.body;
    try {
        const doc = await getOrCreateProgress(req.user.id);
        const course = doc.trackedCourses.find(c => c.courseId === courseId);

        if (course) {
            course.progress = Number(progress);
            await doc.save();
            res.status(200).json(doc);
        } else {
            res.status(404).json({ message: 'Tracked course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};