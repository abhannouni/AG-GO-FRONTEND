import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { availabilityAPI } from '../../API/endpoints';

export const fetchAvailability = createAsyncThunk(
    'availability/fetch',
    async (params, { rejectWithValue }) => {
        try {
            const res = await availabilityAPI.list(params);
            return res.data.data ?? res.data;
        } catch (err) { return rejectWithValue(err.message); }
    }
);

export const fetchAvailableSlots = createAsyncThunk(
    'availability/fetchSlots',
    async ({ activityId, date }, { rejectWithValue }) => {
        try {
            const res = await availabilityAPI.getSlots({ activityId, date });
            return res.data.data ?? res.data;
        } catch (err) { return rejectWithValue(err.message); }
    }
);

export const saveAvailability = createAsyncThunk(
    'availability/save',
    async (data, { rejectWithValue }) => {
        try {
            const res = await availabilityAPI.create(data);
            return res.data.data ?? res.data;
        } catch (err) { return rejectWithValue(err.response?.data?.message ?? err.message); }
    }
);

export const deleteAvailability = createAsyncThunk(
    'availability/delete',
    async (id, { rejectWithValue }) => {
        try { await availabilityAPI.remove(id); return id; }
        catch (err) { return rejectWithValue(err.response?.data?.message ?? err.message); }
    }
);

export const fetchCalendar = createAsyncThunk(
    'availability/fetchCalendar',
    async ({ activityId, year, month }, { rejectWithValue }) => {
        try {
            const res = await availabilityAPI.getCalendar({ activityId, year, month });
            return { key: `${activityId}-${year}-${month}`, days: res.data.data ?? res.data };
        } catch (err) { return rejectWithValue(err.message); }
    }
);

export const saveBulkAvailability = createAsyncThunk(
    'availability/saveBulk',
    async (data, { rejectWithValue }) => {
        try {
            const res = await availabilityAPI.createBulk(data);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data?.message ?? err.message); }
    }
);

const availabilitySlice = createSlice({
    name: 'availability',
    initialState: {
        records: [],
        slots: null,
        slotsDate: null,
        loading: false,
        slotsLoading: false,
        saveLoading: false,
        bulkSaveLoading: false,
        error: null,
        slotsError: null,
        calendar: {},
        calendarLoading: false,
        calendarError: null,
    },
    reducers: {
        clearSlots(state) { state.slots = null; state.slotsDate = null; state.slotsError = null; },
        clearAvailabilityError(state) { state.error = null; },
        clearCalendar(state) { state.calendar = {}; state.calendarError = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAvailability.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAvailability.fulfilled, (state, action) => { state.loading = false; state.records = action.payload; })
            .addCase(fetchAvailability.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
        builder
            .addCase(fetchAvailableSlots.pending, (state) => { state.slotsLoading = true; state.slotsError = null; state.slots = null; })
            .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
                state.slotsLoading = false;
                state.slots = action.payload;
                state.slotsDate = action.meta.arg?.date ?? null;
            })
            .addCase(fetchAvailableSlots.rejected, (state, action) => { state.slotsLoading = false; state.slotsError = action.payload; });
        builder
            .addCase(saveAvailability.pending, (state) => { state.saveLoading = true; state.error = null; })
            .addCase(saveAvailability.fulfilled, (state, action) => {
                state.saveLoading = false;
                const updated = action.payload;
                const idx = state.records.findIndex((r) => r._id === updated._id);
                if (idx >= 0) state.records[idx] = updated; else state.records.push(updated);
            })
            .addCase(saveAvailability.rejected, (state, action) => { state.saveLoading = false; state.error = action.payload; });
        builder
            .addCase(deleteAvailability.pending, (state) => { state.loading = true; })
            .addCase(deleteAvailability.fulfilled, (state, action) => { state.loading = false; state.records = state.records.filter((r) => r._id !== action.payload); })
            .addCase(deleteAvailability.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
        builder
            .addCase(fetchCalendar.pending, (state) => { state.calendarLoading = true; state.calendarError = null; })
            .addCase(fetchCalendar.fulfilled, (state, action) => {
                state.calendarLoading = false;
                state.calendar[action.payload.key] = action.payload.days;
            })
            .addCase(fetchCalendar.rejected, (state, action) => { state.calendarLoading = false; state.calendarError = action.payload; });
        builder
            .addCase(saveBulkAvailability.pending, (state) => { state.bulkSaveLoading = true; state.error = null; })
            .addCase(saveBulkAvailability.fulfilled, (state) => { state.bulkSaveLoading = false; })
            .addCase(saveBulkAvailability.rejected, (state, action) => { state.bulkSaveLoading = false; state.error = action.payload; });
    },
});

export const { clearSlots, clearAvailabilityError, clearCalendar } = availabilitySlice.actions;

export const selectAvailabilityRecords = (s) => s.availability.records;
export const selectAvailabilityLoading = (s) => s.availability.loading;
export const selectSaveLoading = (s) => s.availability.saveLoading;
export const selectBulkSaveLoading = (s) => s.availability.bulkSaveLoading;
export const selectAvailabilityError = (s) => s.availability.error;
export const selectAvailableSlots = (s) => s.availability.slots;
export const selectSlotsLoading = (s) => s.availability.slotsLoading;
export const selectSlotsError = (s) => s.availability.slotsError;
export const selectCalendarMap = (s) => s.availability.calendar;
export const selectCalendarLoading = (s) => s.availability.calendarLoading;
export const selectCalendarError = (s) => s.availability.calendarError;

export default availabilitySlice.reducer;