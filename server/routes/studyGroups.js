const express = require('express');
const router = express.Router();
const {
    createGroup,
    getUserGroups,
    getGroupById,
    joinGroup,
    leaveGroup,
    deleteGroup,
    addGoal,
    updateGoalProgress,
    deleteGoal,  // ADD THIS LINE
    shareResource,
    getSharedResources,
    sendMessage,
    removeMember,
} = require('../controllers/studyGroupsController');
const { protect } = require('../middleware/authMiddleware');

// Apply authentication to all routes
router.use(protect);

// Main group routes
router.route('/')
    .get(getUserGroups)
    .post(createGroup);

// Join group with code
router.post('/join', joinGroup);

// Single group operations
router.route('/:id')
    .get(getGroupById)
    .delete(deleteGroup);

// Leave group
router.delete('/:id/leave', leaveGroup);

// Group goals
router.route('/:id/goals')
    .post(addGoal);

router.put('/:id/goals/:goalId', updateGoalProgress);
router.delete('/:id/goals/:goalId', deleteGoal);  // MOVE THIS BEFORE module.exports

// Group resources
router.route('/:id/resources')
    .get(getSharedResources)
    .post(shareResource);

// Group chat
router.post('/:id/chat', sendMessage);

// Member management (admin only)
router.delete('/:id/members/:memberId', removeMember);

module.exports = router;