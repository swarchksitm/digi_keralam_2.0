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
        // Don't attach token for login/token endpoints to avoid 401s from expired tokens
        if (token && !config.url?.includes('/login/') && !config.url?.includes('/token/')) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Flag to prevent infinite loops
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {

            // If the error comes from the login or refresh endpoint itself, don't retry
            if (originalRequest.url.includes('/login/') || originalRequest.url.includes('/token/refresh/')) {
                localStorage.removeItem('token');
                localStorage.removeItem('refresh');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh');

            if (!refreshToken) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Call refresh endpoint
                // Note: We use axios directly to avoid interceptors on this call
                const response = await axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, {
                    refresh: refreshToken
                });

                if (response.status === 200) {
                    const { access } = response.data;

                    localStorage.setItem('token', access);

                    // Update default headers
                    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${access}`;

                    processQueue(null, access);
                    isRefreshing = false;

                    return api(originalRequest);
                }
            } catch (err) {
                processQueue(err, null);
                isRefreshing = false;

                // If refresh fails, logout
                localStorage.removeItem('token');
                localStorage.removeItem('refresh');
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);


export const getUserProfile = () => api.get('/auth/profile/');
export const updateUser = (data: any) => api.patch('/auth/profile/', data);

export default api;
