import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/achievements`;

const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token;
};

const getConfig = () => ({
    headers: { Authorization: `Bearer ${getAuthToken()}` }
});

const getAchievements = async () => {
    try {
        const response = await axios.get(API_URL, getConfig());
        return response.data;
    } catch (error) {
        console.error("Failed to fetch achievements", error);
        throw error;
    }
};

const checkAchievements = async () => {
    try {
        const response = await axios.post(`${API_URL}/check`, {}, getConfig());
        return response.data;
    } catch (error) {
        console.error("Failed to check achievements", error);
        throw error;
    }
};

const getAchievementStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats`, getConfig());
        return response.data;
    } catch (error) {
        console.error("Failed to fetch stats", error);
        throw error;
    }
};

const achievementsService = {
    getAchievements,
    checkAchievements,
    getAchievementStats,
};

export default achievementsService;