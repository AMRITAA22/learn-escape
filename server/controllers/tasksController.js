const Task = require('../models/task');

// Get all tasks for the logged-in user
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ createdBy: req.user.id }).sort({ dueDate: 1, createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create a new task
exports.createTask = async (req, res) => {
    const { title, dueDate, estimatedMinutes } = req.body; // <-- Add estimatedMinutes
    try {
        const task = await Task.create({
            title,
            dueDate: dueDate || null,
            estimatedMinutes: estimatedMinutes || 60, // <-- Add this
            createdBy: req.user.id,
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update a task
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || task.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Task not found or user not authorized' });
        }
        
        // Update fields that are provided
        if (req.body.completed !== undefined) task.completed = req.body.completed;
        if (req.body.title !== undefined) task.title = req.body.title;
        if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate;
        if (req.body.estimatedMinutes !== undefined) task.estimatedMinutes = req.body.estimatedMinutes; // <-- Add this

        await task.save();
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || task.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Task not found or user not authorized' });
        }
        await task.deleteOne();
        res.status(200).json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};