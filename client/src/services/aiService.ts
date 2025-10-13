import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/ai`;

const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token;
};

const uploadNotes = async (noteFile: File) => {
    const formData = new FormData();
    formData.append('noteFile', noteFile);
    const config = {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'multipart/form-data',
        },
    };
    const response = await axios.post(`${API_URL}/upload`, formData, config);
    return response.data;
};

// Chat function now accepts an optional conversationId
const chat = async (prompt: string, conversationId: string | null) => {
    const config = { headers: { 'Authorization': `Bearer ${getAuthToken()}` } };
    const response = await axios.post(`${API_URL}/chat`, { prompt, conversationId }, config);
    return response.data;
};

const getConversations = async () => {
    const config = { headers: { 'Authorization': `Bearer ${getAuthToken()}` } };
    const response = await axios.get(`${API_URL}/conversations`, config);
    return response.data;
};

const getConversationById = async (id: string) => {
    const config = { headers: { 'Authorization': `Bearer ${getAuthToken()}` } };
    const response = await axios.get(`${API_URL}/conversations/${id}`, config);
    return response.data;
};


const aiService = {
    uploadNotes,
    chat,
    getConversations,
    getConversationById,
};

export default aiService;