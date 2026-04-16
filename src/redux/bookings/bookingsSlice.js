import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingsAPI } from '../../API/endpoints';

// ── Async thunks ──────────────────────────────────────────────────────────────

export const createBooking = createAsyncThunk(
    'bookings/create',
    async (data, { rejectWithValue }) => {
        try {
            const res = await bookingsAPI.create(data);
            return res.data.data ?? res.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchMyBookings = createAsyncThunk(
    'bookings/fetchMine',
    async (_, { rejectWithValue }) => {
        try {
            const res = await bookingsAPI.mine();
            return res.data.data ?? res.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchProviderBookings = createAsyncThunk(
    'bookings/fetchProvider',
    async (_, { rejectWithValue }) => {
        try {
            const res = await bookingsAPI.provider();
            return res.data.data ?? res.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const updateBookingStatus = createAsyncThunk(
    'bookings/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await bookingsAPI.update(id, data);
            return res.data.data ?? res.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const cancelBooking = createAsyncThunk(
    'bookings/cancel',
    async (id, { rejectWithValue }) => {
        try {
            const res = await bookingsAPI.update(id, { status: 'cancelled' });
            return res.data.data ?? res.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const bookingsSlice = createSlice({
    name: 'bookings',
    initialState: {
        myBookings: [],
        providerBookings: [],
        loading: false,
        createLoading: false,
        cancelLoading: null, // stores the booking id being cancelled
        error: null,
        lastCreated: null,
    },
    reducers: {
        clearBookingsError(state) {
            state.error = null;
        },
        clearLastCreated(state) {
            state.lastCreated = null;
        },
    },
    extraReducers: (builder) => {
        // createBooking
        builder
            .addCase(createBooking.pending, (state) => {
                state.createLoading = true;
                state.error = null;
                state.lastCreated = null;
            })
            .addCase(createBooking.fulfilled, (state, action) => {
                state.createLoading = false;
                state.lastCreated = action.payload;
                state.myBookings.unshift(action.payload);
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.createLoading = false;
                state.error = action.payload;
            });

        // fetchMyBookings
        builder
            .addCase(fetchMyBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.myBookings = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchMyBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // fetchProviderBookings
        builder
            .addCase(fetchProviderBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProviderBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.providerBookings = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchProviderBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // updateBookingStatus
        builder
            .addCase(updateBookingStatus.fulfilled, (state, action) => {
                const updated = action.payload;
                const idx = state.myBookings.findIndex((b) => b._id === updated._id);
                if (idx !== -1) state.myBookings[idx] = updated;
                const pidx = state.providerBookings.findIndex((b) => b._id === updated._id);
                if (pidx !== -1) state.providerBookings[pidx] = updated;
            })
            .addCase(updateBookingStatus.rejected, (state, action) => {
                state.error = action.payload;
            });

        // cancelBooking
        builder
            .addCase(cancelBooking.pending, (state, action) => {
                state.cancelLoading = action.meta.arg; // the booking id
            })
            .addCase(cancelBooking.fulfilled, (state, action) => {
                state.cancelLoading = null;
                const updated = action.payload;
                const idx = state.myBookings.findIndex((b) => b._id === updated._id);
                if (idx !== -1) state.myBookings[idx] = updated;
            })
            .addCase(cancelBooking.rejected, (state, action) => {
                state.cancelLoading = null;
                state.error = action.payload;
            });
    },
});

export const { clearBookingsError, clearLastCreated } = bookingsSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectMyBookings = (s) => s.bookings.myBookings;
export const selectProviderBookings = (s) => s.bookings.providerBookings;
export const selectBookingsLoading = (s) => s.bookings.loading;
export const selectCreateBookingLoading = (s) => s.bookings.createLoading;
export const selectCancelBookingLoading = (s) => s.bookings.cancelLoading;
export const selectBookingsError = (s) => s.bookings.error;
export const selectLastCreatedBooking = (s) => s.bookings.lastCreated;

export default bookingsSlice.reducer;
