import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/study-groups`;

const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token;
};

const getConfig = () => ({
    headers: { Authorization: `Bearer ${getAuthToken()}` }
});

// Get all groups user is a member of
const getUserGroups = async () => {
    try {
        const response = await axios.get(API_URL, getConfig());
        return response.data;
    } catch (error) {
        console.error("Failed to fetch groups", error);
        throw error;
    }
};

// Get single group by ID
const getGroupById = async (groupId: string) => {
    try {
        const response = await axios.get(`${API_URL}/${groupId}`, getConfig());
        return response.data;
    } catch (error) {
        console.error("Failed to fetch group", error);
        throw error;
    }
};

// Create a new group
const createGroup = async (groupData: {
    name: string;
    description?: string;
    isPrivate?: boolean;
}) => {
    try {
        const response = await axios.post(API_URL, groupData, getConfig());
        return response.data;
    } catch (error) {
        console.error("Failed to create group", error);
        throw error;
    }
};

// Join group using code
const joinGroup = async (groupCode: string) => {
    try {
        const response = await axios.post(`${API_URL}/join`, { groupCode }, getConfig());
        return response.data;
    } catch (error) {
        console.error("Failed to join group", error);
        throw error;
    }
};

// Leave a group
const leaveGroup = async (groupId: string) => {
    try {
        const response = await axios.delete(`${API_URL}/${groupId}/leave`, getConfig());
        return response.data;
    } catch (error) {
        console.error("Failed to leave group", error);
        throw error;
    }
};

// Delete a group
const deleteGroup = async (groupId: string) => {
    try {
        const response = await axios.delete(`${API_URL}/${groupId}`, getConfig());
        return response.data;
    } catch (error) {
        console.error("Failed to delete group", error);
        throw error;
    }
};

// Add a goal to group
const addGoal = async (groupId: string, goalData: {
    title: string;
    description?: string;
    targetValue: number;
    type: 'hours' | 'sessions' | 'tasks';
    deadline?: Date;
}) => {
    try {
        const response = await axios.post(`${API_URL}/${groupId}/goals`, goalData, getConfig());
        return response.data;
    } catch (error) {
        console.error("Failed to add goal", error);
        throw error;
    }
};

// Update goal progress
const updateGoalProgress = async (groupId: string, goalId: string, progress: number) => {
    try {
        const response = await axios.put(`${API_URL}/${groupId}/goals/${goalId}`, { progress }, getConfig());
        return response.data;
    } catch (error) {
        console.error("Failed to update goal", error);
        throw error;
    }
};

// Share a resource
const shareResource = async (groupId: string, resourceData: {
    resourceType: 'note' | 'flashcard' | 'link';
    resourceId: string;
    title: string;
}) => {
    try {
        const response = await axios.post(`${API_URL}/${groupId}/resources`, resourceData, getConfig());
        return response.data;
    } catch (error) {
        console.error("Failed to share resource", error);
        throw error;
    }
};

// Get shared resources
const getSharedResources = async (groupId: string) => {
    try {
        const response = await axios.get(`${API_URL}/${groupId}/resources`, getConfig());
        return response.data;
    } catch (error) {
        console.error("Failed to fetch resources", error);
        throw error;
    }
};

// Send a chat message
const sendMessage = async (groupId: string, message: string) => {
    try {
        const response = await axios.post(`${API_URL}/${groupId}/chat`, { message }, getConfig());
        return response.data;
    } catch (error) {
        console.error("Failed to send message", error);
        throw error;
    }
};

// Remove a member (admin only)
const removeMember = async (groupId: string, memberId: string) => {
    try {
        const response = await axios.delete(`${API_URL}/${groupId}/members/${memberId}`, getConfig());
        return response.data;
    } catch (error) {
        console.error("Failed to remove member", error);
        throw error;
    }
};

const deleteGoal = async (groupId: string, goalId: string) => {
    try {
        const response = await axios.delete(`${API_URL}/${groupId}/goals/${goalId}`, getConfig());
        return response.data;
    } catch (error) {
        console.error("Failed to delete goal", error);
        throw error;
    }
};

const studyGroupsService = {
    getUserGroups,
    getGroupById,
    createGroup,
    joinGroup,
    leaveGroup,
    deleteGroup,
    addGoal,
    deleteGoal,
    updateGoalProgress,
    shareResource,
    getSharedResources,
    sendMessage,
    removeMember,
};

export default studyGroupsService;