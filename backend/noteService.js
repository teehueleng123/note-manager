import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api', // Your backend URL
    headers: {
        'Content-Type': 'application/json'
    }
});

// --- Chat Service ---
export const sendChatMessageAPI = async (message) => {
    try {
        const response = await apiClient.post('/chat', { message });
        return response.data;
    } catch (error) {
        console.error('Error sending chat message:', error);
        throw error;
    }
};

// --- Note Services ---
export const getNotes = async () => {
    const response = await apiClient.get('/notes');
    return response.data;
};

export const createNote = async (note) => {
    const response = await apiClient.post('/notes', note);
    return response.data;
};

export const updateNote = async (id, note) => {
    const response = await apiClient.put(`/notes/${id}`, note);
    return response.data;
};

export const deleteNote = async (id) => {
    await apiClient.delete(`/notes/${id}`);
};

// --- Quote and Settings Services ---
export const getQuotes = async () => {
    // Mock implementation, replace with actual API call if needed
    return []; 
};
export const createQuote = async (quote) => { return {}; };
export const getSettings = async () => { 
    // Mock implementation, replace with actual API call if needed
    return { username: 'Tee Hue Leng' }; 
};
export const updateUsername = async (username) => { return { username }; };