// ── User-friendly messages by action + HTTP status ───────────────────────────

const MESSAGES = {
    register: {
        409: 'An account with this email or username already exists.',
        422: 'Check your input — some fields are invalid.',
        500: 'Server error. Please try again in a moment.',
        network: 'Unable to connect. Check your internet connection.',
        default: 'Registration failed. Please try again.',
    },
    login: {
        401: 'Incorrect email/username or password.',
        403: 'Your account is not authorised to access this resource.',
        422: 'Please enter a valid email/username and password.',
        500: 'Server error. Please try again in a moment.',
        network: 'Unable to connect. Check your internet connection.',
        default: 'Login failed. Please try again.',
    },
};

// Map HTTP status to toast type
const TOAST_TYPE = {
    400: 'warning',
    401: 'error',
    403: 'error',
    409: 'error',
    422: 'warning',
    500: 'error',
};

/**
 * Given an HTTP status (may be undefined for network errors), a raw error
 * message, and the auth action context ('login' | 'register'), returns a
 * { message, toastType } pair safe to show to the user.
 */
export function classifyAuthError(status, _rawMessage, context = 'login') {
    const map = MESSAGES[context] ?? MESSAGES.login;

    if (!status) {
        return { message: map.network, toastType: 'error' };
    }

    return {
        message: map[status] ?? map.default,
        toastType: TOAST_TYPE[status] ?? 'error',
    };
}
