import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import activitiesReducer from './activities/activitiesSlice';
import bookingsReducer from './bookings/bookingsSlice';
import uiReducer from './ui/uiSlice';
import tripsReducer from './trips/tripsSlice';
import availabilityReducer from './availability/availabilitySlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        activities: activitiesReducer,
        bookings: bookingsReducer,
        ui: uiReducer,
        trips: tripsReducer,
        availability: availabilityReducer,
    },
});

export default store;
