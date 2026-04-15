import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import activitiesReducer from './activities/activitiesSlice';
import bookingsReducer from './bookings/bookingsSlice';
import uiReducer from './ui/uiSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        activities: activitiesReducer,
        bookings: bookingsReducer,
        ui: uiReducer,
    },
});

export default store;
