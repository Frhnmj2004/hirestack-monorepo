import axios from 'axios';

// The base URL should be configured via environment variable, fallback to local dev gateway
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to inject auth token if stored in local storage
apiClient.interceptors.request.use((config) => {
    // Only access window/localStorage on the client side
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('hirelens_auth_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor for global error handling (e.g., redirect on 401)
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // In a real app, you might trigger a Zustand action here to show a toast
        // or log out the user on 401 Unauthorized
        if (error.response?.status === 401) {
            // handle logout
        }
        return Promise.reject(error);
    }
);

export default apiClient;
