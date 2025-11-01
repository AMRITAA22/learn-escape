import axios from "axios";

const API_URL = "http://localhost:5000/api/tasks";

interface TaskData {
  title: string;
  dueDate?: string | null;
  completed?: boolean;
  createdBy?: string;
  priority?: string;
  estimatedMinutes?: number;
}

// ✅ Get all tasks
const getTasks = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// ✅ Create new task
const createTask = async (taskData: TaskData) => {
  const res = await axios.post(API_URL, taskData);
  return res.data;
};

// ✅ Update a task
const updateTask = async (id: string, updates: Partial<TaskData>) => {
  const res = await axios.patch(`${API_URL}/${id}`, updates);
  return res.data;
};

// ✅ Delete a task
const deleteTask = async (id: string) => {
  await axios.delete(`${API_URL}/${id}`);
};

export default {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
