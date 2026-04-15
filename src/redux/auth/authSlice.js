import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../API/endpoints';

// ── Async thunks ──────────────────────────────────────────────────────────────

export const register = createAsyncThunk(
    'auth/register',
    async (data, { rejectWithValue }) => {
        try {
            const res = await authAPI.register(data);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async (data, { rejectWithValue }) => {
        try {
            const res = await authAPI.login(data);
            const { token, user } = res.data;
            localStorage.setItem('afgo_token', token);
            return { token, user };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// ── Helpers: restore session from localStorage ────────────────────────────────
const storedToken = localStorage.getItem('afgo_token');
let storedUser = null;
try {
    const raw = localStorage.getItem('afgo_user');
    if (raw) storedUser = JSON.parse(raw);
} catch { /* ignore */ }

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: storedUser,
        token: storedToken,
        loading: false,
        error: null,
        registerSuccess: false,
    },
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            state.error = null;
            localStorage.removeItem('afgo_token');
            localStorage.removeItem('afgo_user');
        },
        clearAuthError(state) {
            state.error = null;
        },
        clearRegisterSuccess(state) {
            state.registerSuccess = false;
        },
    },
    extraReducers: (builder) => {
        // register
        builder
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.registerSuccess = false;
            })
            .addCase(register.fulfilled, (state) => {
                state.loading = false;
                state.registerSuccess = true;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // login
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
                localStorage.setItem('afgo_user', JSON.stringify(action.payload.user));
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearAuthError, clearRegisterSuccess } = authSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAuth = (s) => s.auth;
export const selectUser = (s) => s.auth.user;
export const selectIsAuthenticated = (s) => !!s.auth.token;
export const selectUserRole = (s) => s.auth.user?.role ?? 'guest';

export default authSlice.reducer;
