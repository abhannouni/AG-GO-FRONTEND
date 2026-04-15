import { createSlice } from '@reduxjs/toolkit';

/**
 * uiSlice — app-wide UI state:
 *  - toast notifications
 *  - global loading overlay (optional)
 */
const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        toast: null, // { message, type: 'success'|'error'|'info' }
    },
    reducers: {
        showToast(state, action) {
            // action.payload: { message, type }
            state.toast = action.payload;
        },
        clearToast(state) {
            state.toast = null;
        },
    },
});

export const { showToast, clearToast } = uiSlice.actions;

export const selectToast = (s) => s.ui.toast;

export default uiSlice.reducer;
