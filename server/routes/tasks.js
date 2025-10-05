import express from 'express';
import Task from '../models/Task.js';
import { verifyToken } from '../middleware/auth.js';   // your JWT middleware

const router = express.Router();

// ✅ Get all tasks for the logged-in user
router.get('/', verifyToken, async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id });
  res.json(tasks);
});

// ➕ Add a new task
router.post('/', verifyToken, async (req, res) => {
  const task = new Task({ userId: req.user.id, text: req.body.text });
  await task.save();
  res.json(task);
});

// 🔁 Toggle completion
router.patch('/:id', verifyToken, async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.completed = !task.completed;
  await task.save();
  res.json(task);
});

// ❌ Delete a task
router.delete('/:id', verifyToken, async (req, res) => {
  await Task.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ success: true });
});

export default router;
