import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api/v1';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// Attach JWT on every request if present
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('afgo_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Normalise error shape so thunks always get { message }
apiClient.interceptors.response.use(
    (res) => res,
    (error) => {
        const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'An unexpected error occurred';
        return Promise.reject(new Error(message));
    }
);

export default apiClient;
