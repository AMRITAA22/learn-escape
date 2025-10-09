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

const createTask = async (taskData: { title: string }) => {
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    const response = await axios.post(API_URL, taskData, config);
    return response.data;
};

const updateTask = async (taskId: string, updateData: { completed: boolean }) => {
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