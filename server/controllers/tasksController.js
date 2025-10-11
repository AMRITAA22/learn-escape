const Task = require('../models/task');
roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyRoom' }


// Get all tasks for the logged-in user
exports.getTasks = async (req, res) => {
    try {
        // THE FIX: This now finds only the tasks where 'createdBy'
        // matches the ID of the user making the request.
        const tasks = await Task.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
// Get tasks for a study room
exports.getRoomTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ roomId: req.params.roomId }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};


// Create a new task
exports.createTask = async (req, res) => {
    const { title } = req.body;
    try {
        const task = await Task.create({
            title,
            createdBy: req.user.id,
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update a task (e.g., mark as complete)
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || task.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Task not found or user not authorized' });
        }
        task.completed = req.body.completed;
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
