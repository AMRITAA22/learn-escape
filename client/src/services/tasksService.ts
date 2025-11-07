// import axios from "axios";

// const API_URL = "http://localhost:5000/api/tasks";

// interface TaskData {
//   title: string;
//   dueDate?: string | null;
//   completed?: boolean;
//   createdBy?: string;
//   priority?: string;
//   estimatedMinutes?: number;
// }

// // ✅ Get all tasks
// const getTasks = async () => {
//   const res = await axios.get(API_URL);
//   return res.data;
// };

// // ✅ Create new task
// const createTask = async (taskData: TaskData) => {
//   const res = await axios.post(API_URL, taskData);
//   return res.data;
// };

// // ✅ Update a task
// const updateTask = async (id: string, updates: Partial<TaskData>) => {
//   const res = await axios.patch(`${API_URL}/${id}`, updates);
//   return res.data;
// };

// // ✅ Delete a task
// const deleteTask = async (id: string) => {
//   await axios.delete(`${API_URL}/${id}`);
// };

// export default {
//   getTasks,
//   createTask,
//   updateTask,
//   deleteTask,
// };

import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/tasks`;

const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token;
};

const getTasks = async () => {
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    const response = await axios.get(API_URL, config);
    return response.data;
};

const createTask = async (taskData: { title: string; dueDate?: string | null }) => {  // UPDATE THIS
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    const response = await axios.post(API_URL, taskData, config);
    return response.data;
};

const updateTask = async (taskId: string, updateData: { completed?: boolean; title?: string; dueDate?: string | null }) => {  // UPDATE THIS
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    const response = await axios.put(`${API_URL}/${taskId}`, updateData, config);
    return response.data;
};

const deleteTask = async (taskId: string) => {
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    const response = await axios.delete(`${API_URL}/${taskId}`, config);
    return response.data;
};

const tasksService = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
};

export default tasksService;