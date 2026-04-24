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
    /** List raw availability records (provider-side management) */
    list: (params) => apiClient.get('/availability', { params }),
    /** Get annotated slots with remainingSpots for a specific activity + date */
    getSlots: (params) => apiClient.get('/availability/slots', { params }),
    /** Get per-day status for a full month (client calendar view) */
    getCalendar: (params) => apiClient.get('/availability/calendar', { params }),
    /** Provider: create / upsert availability for a date */
    create: (data) => apiClient.post('/availability', data),
    /** Provider: bulk create/block availability for a date range */
    createBulk: (data) => apiClient.post('/availability/bulk', data),
    /** Provider: replace time slots for an existing availability record */
    update: (id, data) => apiClient.patch(`/availability/${id}`, data),
    /** Provider: delete an availability record */
    remove: (id) => apiClient.delete(`/availability/${id}`),
};

export const bookingsAPI = {
    create: (data) => apiClient.post('/bookings', data),
    mine: () => apiClient.get('/bookings/me'),
    provider: () => apiClient.get('/bookings/provider'),
    update: (id, data) => apiClient.patch(`/bookings/${id}`, data),
};

export const tripsAPI = {
    list: (params) => apiClient.get('/trips', { params }),
    getById: (id) => apiClient.get(`/trips/${id}`),
    create: (data) => apiClient.post('/trips', data),
    update: (id, data) => apiClient.patch(`/trips/${id}`, data),
    remove: (id) => apiClient.delete(`/trips/${id}`),
};

export const healthAPI = {
    check: () => apiClient.get('/health'),
};
