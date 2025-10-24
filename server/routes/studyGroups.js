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
    .get(getUserGroups)      // GET /api/study-groups - Get user's groups
    .post(createGroup);      // POST /api/study-groups - Create new group

// Join group with code
router.post('/join', joinGroup);  // POST /api/study-groups/join

// Single group operations
router.route('/:id')
    .get(getGroupById)       // GET /api/study-groups/:id - Get group details
    .delete(deleteGroup);    // DELETE /api/study-groups/:id - Delete group

// Leave group
router.delete('/:id/leave', leaveGroup);  // DELETE /api/study-groups/:id/leave

// Group goals
router.route('/:id/goals')
    .post(addGoal);  // POST /api/study-groups/:id/goals - Add goal

router.put('/:id/goals/:goalId', updateGoalProgress);  // PUT /api/study-groups/:id/goals/:goalId - Update goal

// Group resources
router.route('/:id/resources')
    .get(getSharedResources)   // GET /api/study-groups/:id/resources - Get resources
    .post(shareResource);      // POST /api/study-groups/:id/resources - Share resource

// Group chat
router.post('/:id/chat', sendMessage);  // POST /api/study-groups/:id/chat - Send message

// Member management (admin only)
router.delete('/:id/members/:memberId', removeMember);  // DELETE /api/study-groups/:id/members/:memberId

module.exports = router;