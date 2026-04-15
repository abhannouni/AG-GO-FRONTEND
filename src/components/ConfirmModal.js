import React, { useEffect } from 'react';

const SpinIcon = () => (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

/**
 * Accessible confirmation dialog.
 *
 * Props
 * ──────────────────────────────────────────
 * isOpen        boolean
 * title         string
 * message       string
 * confirmLabel  string   (default "Confirm")
 * cancelLabel   string   (default "Cancel")
 * danger        boolean  (default true) — red confirm button + warning icon
 * loading       boolean  — disables both buttons, shows spinner on confirm
 * onConfirm     () => void
 * onCancel      () => void
 */
const ConfirmModal = ({
    isOpen,
    title = 'Are you sure?',
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = true,
    loading = false,
    onConfirm,
    onCancel,
}) => {
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape' && !loading) onCancel(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, loading, onCancel]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/50 backdrop-blur-[2px]">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 animate-fadeInUp"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
            >
                {danger && (
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                )}

                <h3
                    id="confirm-modal-title"
                    className="text-lg font-bold text-gray-900 text-center mb-2"
                >
                    {title}
                </h3>

                {message && (
                    <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">{message}</p>
                )}

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${danger
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-forest-900 hover:bg-forest-800'
                            }`}
                    >
                        {loading ? <SpinIcon /> : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
