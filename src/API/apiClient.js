import axios from 'axios';

const BASE_URL = process.env.API_BASE_URL || 'http://af-go-backend-production.up.railway.app/api/v1';

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

// Normalise error shape — attach status so callers can classify the error
apiClient.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error.response?.status;
        const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            (error.code === 'ECONNABORTED'
                ? 'Request timed out. Please try again.'
                : !error.response
                    ? 'Unable to connect. Please check your connection.'
                    : error.message || 'An unexpected error occurred');
        const err = new Error(message);
        err.status = status;        // carry HTTP status for toast classification
        return Promise.reject(err);
    }
);

export default apiClient;
