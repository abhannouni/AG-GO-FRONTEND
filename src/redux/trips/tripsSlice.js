import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tripsAPI } from '../../API/endpoints';

export const fetchTrips = createAsyncThunk(
    'trips/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const res = await tripsAPI.list(params);
            return res.data.data ?? res.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchTripById = createAsyncThunk(
    'trips/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const res = await tripsAPI.getById(id);
            return res.data.data ?? res.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const tripsSlice = createSlice({
    name: 'trips',
    initialState: {
        items: [],
        selected: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearSelectedTrip(state) { state.selected = null; },
        clearTripsError(state) { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTrips.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchTrips.fulfilled, (state, action) => {
                state.loading = false;
                state.items = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchTrips.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        builder
            .addCase(fetchTripById.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchTripById.fulfilled, (state, action) => {
                state.loading = false;
                state.selected = action.payload;
            })
            .addCase(fetchTripById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearSelectedTrip, clearTripsError } = tripsSlice.actions;

export const selectTrips = (s) => s.trips.items;
export const selectSelectedTrip = (s) => s.trips.selected;
export const selectTripsLoading = (s) => s.trips.loading;
export const selectTripsError = (s) => s.trips.error;

export default tripsSlice.reducer;
