import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/pomodoro`;

const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token;
};

const logSession = async (duration: number) => {
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    const response = await axios.post(`${API_URL}/log`, { duration }, config);
    return response.data;
};

const pomodoroService = {
    logSession,
};

export default pomodoroService;