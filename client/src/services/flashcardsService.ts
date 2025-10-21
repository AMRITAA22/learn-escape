import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/flashcards`;

const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token;
};

const getDecks = async () => {
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    const response = await axios.get(API_URL, config);
    return response.data;
};

const createDeck = async (deckData: { 
    title: string; 
    description?: string;
    cards?: { front: string; back: string }[];
}) => {
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    const response = await axios.post(API_URL, deckData, config);
    return response.data;
};

const getDeckById = async (deckId: string) => {
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    const response = await axios.get(`${API_URL}/${deckId}`, config);
    return response.data;
};

const addCardToDeck = async (deckId: string, cardData: { front: string; back: string }) => {
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    const response = await axios.post(`${API_URL}/${deckId}/cards`, cardData, config);
    return response.data;
};

const updateCard = async (deckId: string, cardId: string, cardData: { front?: string; back?: string }) => {
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    const response = await axios.put(`${API_URL}/${deckId}/cards/${cardId}`, cardData, config);
    return response.data;
};

const updateDeck = async (deckId: string, deckData: { title?: string; description?: string }) => {
    const config = { headers: { Authorization: `Bearer ${getAuthToken()}` } };
    const response = await axios.put(`${API_URL}/${deckId}`, deckData, config);
    return response.data;
};

const deleteDeck = async (deckId: string) => {
    const token = getAuthToken();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.delete(`${API_URL}/${deckId}`, config);
    return response.data;
};

const deleteCard = async (deckId: string, cardId: string) => {
    const token = getAuthToken();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.delete(`${API_URL}/${deckId}/cards/${cardId}`, config);
    return response.data;
};

const flashcardsService = {
    getDecks,
    createDeck,
    getDeckById,
    addCardToDeck,
    updateCard,
    updateDeck,
    deleteDeck,
    deleteCard
};

export default flashcardsService;