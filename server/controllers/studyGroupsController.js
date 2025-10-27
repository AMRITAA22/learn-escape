const StudyGroup = require('../models/StudyGroup');

// @desc    Create a new study group
// @route   POST /api/study-groups
exports.createGroup = async (req, res) => {
    const { name, description, isPrivate } = req.body;

    try {
        // Generate unique group code
        let groupCode;
        let isUnique = false;
        
        while (!isUnique) {
            groupCode = generateGroupCode();
            const existing = await StudyGroup.findOne({ groupCode });
            if (!existing) {
                isUnique = true;
            }
        }

        const group = await StudyGroup.create({
            name,
            description,
            groupCode,
            isPrivate: isPrivate !== false,
            createdBy: req.user.id,
            members: [{
                userId: req.user.id,
                role: 'admin',
                joinedAt: new Date(),
            }],
        });

        await group.populate('members.userId', 'name email');
        await group.populate('createdBy', 'name');
        res.status(201).json(group);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all groups user is a member of
// @route   GET /api/study-groups
exports.getUserGroups = async (req, res) => {
    try {
        const groups = await StudyGroup.find({
            'members.userId': req.user.id,
        })
        .populate('members.userId', 'name email')
        .populate('createdBy', 'name')
        .sort({ updatedAt: -1 });

        res.status(200).json(groups);
    } catch (error) {
        console.error('Error getting groups:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single group by ID
// @route   GET /api/study-groups/:id
exports.getGroupById = async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id)
            .populate('members.userId', 'name email')
            .populate('createdBy', 'name')
            .populate('goals.createdBy', 'name')
            .populate('sharedResources.sharedBy', 'name')
            .populate('chat.userId', 'name');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is a member
        const isMember = group.members.some(m => m.userId._id.toString() === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized to view this group' });
        }

        res.status(200).json(group);
    } catch (error) {
        console.error('Error getting group:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Join a group using group code
// @route   POST /api/study-groups/join
exports.joinGroup = async (req, res) => {
    const { groupCode } = req.body;

    try {
        const group = await StudyGroup.findOne({ groupCode: groupCode.toUpperCase() });

        if (!group) {
            return res.status(404).json({ message: 'Group not found. Check the code and try again.' });
        }

        // Check if already a member
        const isMember = group.members.some(m => m.userId.toString() === req.user.id);
        if (isMember) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }

        // Check if group is full
        if (group.members.length >= group.maxMembers) {
            return res.status(400).json({ message: 'This group is full' });
        }

        // Add user to group
        group.members.push({
            userId: req.user.id,
            role: 'member',
            joinedAt: new Date(),
        });

        await group.save();
        await group.populate('members.userId', 'name email');

        res.status(200).json(group);
    } catch (error) {
        console.error('Error joining group:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Leave a group
// @route   DELETE /api/study-groups/:id/leave
exports.leaveGroup = async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is the creator
        if (group.createdBy.toString() === req.user.id) {
            return res.status(400).json({ message: 'Group creator cannot leave. Delete the group instead.' });
        }

        // Remove user from members
        group.members = group.members.filter(m => m.userId.toString() !== req.user.id);
        await group.save();

        res.status(200).json({ message: 'Left group successfully' });
    } catch (error) {
        console.error('Error leaving group:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a group
// @route   DELETE /api/study-groups/:id
exports.deleteGroup = async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Only creator can delete
        if (group.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only group creator can delete the group' });
        }

        await group.deleteOne();
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a goal to group
// @route   POST /api/study-groups/:id/goals
exports.addGoal = async (req, res) => {
    const { title, description, targetValue, type, deadline } = req.body;

    try {
        const group = await StudyGroup.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is a member
        const isMember = group.members.some(m => m.userId.toString() === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        group.goals.push({
            title,
            description,
            targetValue,
            type,
            deadline,
            createdBy: req.user.id,
            currentValue: 0,
            completed: false,
        });

        await group.save();
        res.status(201).json(group);
    } catch (error) {
        console.error('Error adding goal:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update goal progress
// @route   PUT /api/study-groups/:id/goals/:goalId
exports.updateGoalProgress = async (req, res) => {
    const { progress } = req.body;

    try {
        const group = await StudyGroup.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const goal = group.goals.id(req.params.goalId);
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        goal.currentValue += progress;
        if (goal.currentValue >= goal.targetValue) {
            goal.completed = true;
            goal.currentValue = goal.targetValue;
        }

        await group.save();
        res.status(200).json(group);
    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a goal
// @route   DELETE /api/study-groups/:id/goals/:goalId
exports.deleteGoal = async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is a member
        const isMember = group.members.some(m => m.userId.toString() === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Remove the goal
        group.goals = group.goals.filter(g => g._id.toString() !== req.params.goalId);
        
        await group.save();
        res.status(200).json({ message: 'Goal deleted successfully', group });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Share a resource with group
// @route   POST /api/study-groups/:id/resources
exports.shareResource = async (req, res) => {
    const { resourceType, resourceId, title } = req.body;

    try {
        const group = await StudyGroup.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is a member
        const isMember = group.members.some(m => m.userId.toString() === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        group.sharedResources.push({
            resourceType,
            resourceId,
            title,
            sharedBy: req.user.id,
            sharedAt: new Date(),
        });

        await group.save();
        await group.populate('sharedResources.sharedBy', 'name');

        res.status(201).json(group);
    } catch (error) {
        console.error('Error sharing resource:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get shared resources
// @route   GET /api/study-groups/:id/resources
exports.getSharedResources = async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id)
            .populate('sharedResources.sharedBy', 'name');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is a member
        const isMember = group.members.some(m => m.userId.toString() === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.status(200).json(group.sharedResources);
    } catch (error) {
        console.error('Error getting resources:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send a chat message
// @route   POST /api/study-groups/:id/chat
exports.sendMessage = async (req, res) => {
    const { message } = req.body;

    try {
        const group = await StudyGroup.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is a member
        const isMember = group.members.some(m => m.userId.toString() === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        group.chat.push({
            userId: req.user.id,
            message,
            createdAt: new Date(),
        });

        await group.save();
        await group.populate('chat.userId', 'name');

        res.status(201).json(group.chat[group.chat.length - 1]);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Delete a shared resource
// @route   DELETE /api/study-groups/:id/resources/:resourceId
exports.deleteSharedResource = async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is a member
        const isMember = group.members.some(m => m.userId.toString() === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Find the resource
        const resource = group.sharedResources.id(req.params.resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check if user is the one who shared it or is admin
        const isResourceOwner = resource.sharedBy.toString() === req.user.id;
        const isAdmin = group.createdBy.toString() === req.user.id;

        if (!isResourceOwner && !isAdmin) {
            return res.status(403).json({ message: 'Only the resource owner or group admin can delete this resource' });
        }

        // Remove the resource
        group.sharedResources.pull({ _id: req.params.resourceId });
        await group.save();

        res.status(200).json({ message: 'Resource deleted successfully', group });
    } catch (error) {
        console.error('Error deleting resource:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Remove member (admin only)
// @route   DELETE /api/study-groups/:id/members/:memberId
exports.removeMember = async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is admin
        const userMember = group.members.find(m => m.userId.toString() === req.user.id);
        if (!userMember || userMember.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can remove members' });
        }

        // Cannot remove creator
        if (req.params.memberId === group.createdBy.toString()) {
            return res.status(400).json({ message: 'Cannot remove group creator' });
        }

        group.members = group.members.filter(m => m.userId.toString() !== req.params.memberId);
        await group.save();

        res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Helper function to generate group code
function generateGroupCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}