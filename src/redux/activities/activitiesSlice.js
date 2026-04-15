import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { activitiesAPI } from '../../API/endpoints';

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchActivities = createAsyncThunk(
    'activities/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const res = await activitiesAPI.list(params);
            return res.data.data ?? res.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchActivityById = createAsyncThunk(
    'activities/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const res = await activitiesAPI.getById(id);
            return res.data.data ?? res.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const createActivity = createAsyncThunk(
    'activities/create',
    async (data, { rejectWithValue }) => {
        try {
            const res = await activitiesAPI.create(data);
            return res.data.data ?? res.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const updateActivity = createAsyncThunk(
    'activities/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await activitiesAPI.update(id, data);
            return res.data.data ?? res.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const deleteActivity = createAsyncThunk(
    'activities/delete',
    async (id, { rejectWithValue }) => {
        try {
            await activitiesAPI.remove(id);
            return id;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const activitiesSlice = createSlice({
    name: 'activities',
    initialState: {
        items: [],
        selected: null,
        loading: false,
        error: null,
        // filters mirrored in Redux so components stay in sync
        filters: { city: '', category: '' },
    },
    reducers: {
        setFilters(state, action) {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearSelectedActivity(state) {
            state.selected = null;
        },
        clearActivitiesError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // fetchAll
        builder
            .addCase(fetchActivities.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActivities.fulfilled, (state, action) => {
                state.loading = false;
                state.items = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchActivities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // fetchById
        builder
            .addCase(fetchActivityById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActivityById.fulfilled, (state, action) => {
                state.loading = false;
                state.selected = action.payload;
            })
            .addCase(fetchActivityById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // create
        builder
            .addCase(createActivity.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(createActivity.rejected, (state, action) => {
                state.error = action.payload;
            });

        // update
        builder
            .addCase(updateActivity.fulfilled, (state, action) => {
                const idx = state.items.findIndex((a) => a._id === action.payload._id);
                if (idx !== -1) state.items[idx] = action.payload;
                if (state.selected?._id === action.payload._id) state.selected = action.payload;
            })
            .addCase(updateActivity.rejected, (state, action) => {
                state.error = action.payload;
            });

        // delete
        builder
            .addCase(deleteActivity.fulfilled, (state, action) => {
                state.items = state.items.filter((a) => a._id !== action.payload);
            })
            .addCase(deleteActivity.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { setFilters, clearSelectedActivity, clearActivitiesError } = activitiesSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectActivities = (s) => s.activities.items;
export const selectSelectedActivity = (s) => s.activities.selected;
export const selectActivitiesLoading = (s) => s.activities.loading;
export const selectActivitiesError = (s) => s.activities.error;
export const selectActivityFilters = (s) => s.activities.filters;

export default activitiesSlice.reducer;
