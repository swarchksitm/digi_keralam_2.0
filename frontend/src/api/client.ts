import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if error is 401 (Unauthorized) and redirect to login if needed
        // In a real app, we might try to refresh token here
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Redirect logic or event emission could go here
        }
        return Promise.reject(error);
    }
);

export default api;
