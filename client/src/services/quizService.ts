import axios from 'axios';

// Get base URL from environment variables
const API_URL = process.env.REACT_APP_API_URL;

// Helper to get the auth token
const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token;
};

const getConfig = () => ({
    headers: { Authorization: `Bearer ${getAuthToken()}` }
});

// GET /api/study-groups/:id/quizzes
const getQuizzesForGroup = async (groupId: string) => {
    const response = await axios.get(`${API_URL}/study-groups/${groupId}/quizzes`, getConfig());
    return response.data;
};

// GET /api/quizzes/:id
const getQuiz = async (quizId: string) => {
    const response = await axios.get(`${API_URL}/quizzes/${quizId}`, getConfig());
    return response.data;
};

// POST /api/quizzes/:id/submit
const submitQuiz = async (quizId: string, answers: { questionId: string, userAnswer: string }[]) => {
    const response = await axios.post(`${API_URL}/quizzes/${quizId}/submit`, { answers }, getConfig());
    return response.data;
};

// GET /api/quizzes/:id/leaderboard
const getLeaderboard = async (quizId: string) => {
    const response = await axios.get(`${API_URL}/quizzes/${quizId}/leaderboard`, getConfig());
    return response.data;
};

// --- THIS IS THE NEW FUNCTION ---
// GET /api/quizzes/results/:resultId
const getQuizResult = async (resultId: string) => {
    const response = await axios.get(`${API_URL}/quizzes/results/${resultId}`, getConfig());
    return response.data;
};
// --- END OF NEW FUNCTION ---

const quizService = {
    getQuizzesForGroup,
    getQuiz,
    submitQuiz,
    getLeaderboard,
    getQuizResult // <-- ADDED IT TO THE EXPORT
};

export default quizService;