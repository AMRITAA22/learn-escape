import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL + '/rooms';

// Function to get the auth token from localStorage
const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token;
};

// Get all public rooms
const getPublicRooms = async () => {
    const token = getAuthToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

// --- THIS IS THE FUNCTION YOU ARE MISSING ---
// Create a new room
const createRoom = async (roomData: { name: string; isPublic: boolean }) => {
    const token = getAuthToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL, roomData, config);
    return response.data;
};

// Now, the object below can find both functions
const roomService = {
    getPublicRooms,
    createRoom,
};

export default roomService;