import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}`;
const TASKS_API_URL = `${process.env.REACT_APP_API_URL}/tasks`;

const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token;
};

const getDashboardData = async () => {
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    try {
        const response = await axios.get(`${API_URL}/dashboard`, config);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        return {};
    }
};

const getTaskStats = async () => {
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    try {
        const response = await axios.get(TASKS_API_URL, config);
        const tasks = response.data;
        
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((task: any) => task.completed).length;
        
        return {
            completed: completedTasks,
            total: totalTasks
        };
    } catch (error) {
        console.error("Failed to fetch tasks", error);
        return { completed: 0, total: 0 };
    }
};

const dashboardService = {
    getDashboardData,
    getTaskStats,
};

export default dashboardService;