import apiClient from './apiClient';

export const authAPI = {
    register: (data) => apiClient.post('/auth/register', data),
    login: (data) => apiClient.post('/auth/login', data),
};

export const activitiesAPI = {
    list: (params) => apiClient.get('/activities', { params }),
    getById: (id) => apiClient.get(`/activities/${id}`),
    create: (data) => apiClient.post('/activities', data),
    update: (id, data) => apiClient.patch(`/activities/${id}`, data),
    remove: (id) => apiClient.delete(`/activities/${id}`),
};

export const availabilityAPI = {
    list: (params) => apiClient.get('/availability', { params }),
    create: (data) => apiClient.post('/availability', data),
};

export const bookingsAPI = {
    create: (data) => apiClient.post('/bookings', data),
    mine: () => apiClient.get('/bookings/me'),
    provider: () => apiClient.get('/bookings/provider'),
    update: (id, data) => apiClient.patch(`/bookings/${id}`, data),
};

export const healthAPI = {
    check: () => apiClient.get('/health'),
};
