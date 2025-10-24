const StudyGroup = require('../models/StudyGroup');
const Note = require('../models/Note');

// @desc    Create a new study group
// @route   POST /api/study-groups
const createGroup = async (req, res) => {
    const { name, description, isPrivate } = req.body;

    try {
        // Generate random group code (6 uppercase letters/numbers)
        const groupCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const group = await StudyGroup.create({
            name,
            description,
            isPrivate: isPrivate !== false,
            groupCode,
            createdBy: req.user.id,
            members: [{
                userId: req.user.id,
                role: 'admin',
                joinedAt: new Date(),
            }],
        });

        await group.populate('members.userId', 'name email');
        res.status(201).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc    Get all groups user is a member of
// @route   GET /api/study-groups
const getUserGroups = async (req, res) => {
    try {
        const groups = await StudyGroup.find({
            'members.userId': req.user.id,
        })
        .populate('members.userId', 'name email')
        .populate('createdBy', 'name')
        .sort({ updatedAt: -1 });

        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single group by ID
// @route   GET /api/study-groups/:id
const getGroupById = async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id)
            .populate('members.userId', 'name email')
            .populate('createdBy', 'name')
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
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Join a group using group code
// @route   POST /api/study-groups/join
const joinGroup = async (req, res) => {
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
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Leave a group
// @route   DELETE /api/study-groups/:id/leave
const leaveGroup = async (req, res) => {
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
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a group
// @route   DELETE /api/study-groups/:id
const deleteGroup = async (req, res) => {
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
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a goal to group
// @route   POST /api/study-groups/:id/goals
const addGoal = async (req, res) => {
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
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update goal progress
// @route   PUT /api/study-groups/:id/goals/:goalId
const updateGoalProgress = async (req, res) => {
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
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Share a resource with group
// @route   POST /api/study-groups/:id/resources
const shareResource = async (req, res) => {
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
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get shared resources
// @route   GET /api/study-groups/:id/resources
const getSharedResources = async (req, res) => {
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
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send a chat message
// @route   POST /api/study-groups/:id/chat
const sendMessage = async (req, res) => {
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
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Remove member (admin only)
// @route   DELETE /api/study-groups/:id/members/:memberId
const removeMember = async (req, res) => {
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
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
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
};