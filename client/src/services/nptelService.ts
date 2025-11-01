import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/nptel`;

const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token;
};

const getConfig = () => ({
    headers: { Authorization: `Bearer ${getAuthToken()}` }
});

const getNptelData = async () => {
    const response = await axios.get(API_URL, getConfig());
    return response.data;
};

const addSubject = async (subject: string) => {
    const response = await axios.post(`${API_URL}/subjects`, { subject }, getConfig());
    return response.data;
};

const removeSubject = async (subject: string) => {
    // Note: Using 'data' for DELETE body as per your controller
    const response = await axios.delete(`${API_URL}/subjects`, {
        ...getConfig(),
        data: { subject }
    });
    return response.data;
};

const getSuggestions = async (subject: string) => {
    const response = await axios.get(`${API_URL}/suggest?subject=${encodeURIComponent(subject)}`, getConfig());
    return response.data;
};

const trackCourse = async (course: { courseId: string, courseName: string }) => {
    const response = await axios.post(`${API_URL}/track`, course, getConfig());
    return response.data;
};

const updateProgress = async (courseId: string, progress: number) => {
    const response = await axios.put(`${API_URL}/track/${courseId}`, { progress }, getConfig());
    return response.data;
};

const nptelService = {
    getNptelData,
    addSubject,
    removeSubject,
    getSuggestions,
    trackCourse,
    updateProgress,
};

export default nptelService;