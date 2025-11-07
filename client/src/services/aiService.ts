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

// NEW: Generate flashcards without saving
const generateFlashcards = async (data: {
    topic?: string;
    numberOfCards?: number;
    useUploadedNotes?: boolean;
}) => {
    const config = { headers: { 'Authorization': `Bearer ${getAuthToken()}` } };
    const response = await axios.post(`${API_URL}/generate-flashcards`, data, config);
    return response.data;
};

// NEW: Generate and save flashcards as a deck
const generateAndSaveDeck = async (data: {
    topic?: string;
    numberOfCards?: number;
    useUploadedNotes?: boolean;
    deckTitle?: string;
    deckDescription?: string;
}) => {
    const config = { headers: { 'Authorization': `Bearer ${getAuthToken()}` } };
    const response = await axios.post(`${API_URL}/generate-deck`, data, config);
    return response.data;
};
const generateQuizByTopic = async (data: {
    topic: string;
    numberOfQuestions?: number;
    title?: string;
    studyGroupId?: string;
}) => {
    const config = { headers: { 'Authorization': `Bearer ${getAuthToken()}` } };
    const response = await axios.post(`${API_URL}/generate-quiz-topic`, data, config);
    return response.data;
};

const aiService = {
    uploadNotes,
    chat,
    getConversations,
    getConversationById,
    generateFlashcards,
    generateAndSaveDeck,
    generateQuizByTopic
};

export default aiService;
