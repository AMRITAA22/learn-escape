import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/notes`;

const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token;
};

const getNotes = async () => {
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    const response = await axios.get(API_URL, config);
    return response.data;
};

const createNote = async () => {
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    const response = await axios.post(API_URL, {}, config);
    return response.data;
};

const updateNote = async (noteId: string, updateData: { title?: string; content?: string }) => {
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    const response = await axios.put(`${API_URL}/${noteId}`, updateData, config);
    return response.data;
};

const deleteNote = async (noteId: string) => {
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    const response = await axios.delete(`${API_URL}/${noteId}`, config);
    return response.data;
};

const notesService = {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
};

export default notesService;