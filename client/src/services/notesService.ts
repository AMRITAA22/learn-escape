import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/notes`;

const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token;
};

const getConfig = () => ({
    headers: { Authorization: `Bearer ${getAuthToken()}` }
});

const getNotes = async () => {
    const response = await axios.get(API_URL, getConfig());
    return response.data;
};

const getNote = async (noteId: string) => {
    const response = await axios.get(`${API_URL}/${noteId}`, getConfig());
    return response.data;
};

const createNote = async () => {
    const response = await axios.post(API_URL, {}, getConfig());
    return response.data;
};

const updateNote = async (noteId: string, updateData: { title?: string; content?: string }) => {
    const response = await axios.put(`${API_URL}/${noteId}`, updateData, getConfig());
    return response.data;
};

const deleteNote = async (noteId: string) => {
    const response = await axios.delete(`${API_URL}/${noteId}`, getConfig());
    return response.data;
};

const notesService = {
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
};

export default notesService;