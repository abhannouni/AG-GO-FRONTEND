import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectToast, clearToast } from '../redux/ui/uiSlice';

const ICONS = {
    success: (
        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    warning: (
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
    ),
    info: (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
        </svg>
    ),
};

const BG = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-blue-50 border-blue-200',
};

const ToastNotification = () => {
    const dispatch = useDispatch();
    const toast = useSelector(selectToast);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => dispatch(clearToast()), 4000);
        return () => clearTimeout(timer);
    }, [toast, dispatch]);

    if (!toast) return null;

    const type = toast.type || 'info';

    return (
        <div className="fixed bottom-6 right-6 z-[9999] animate-fade-in">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${BG[type]}`}>
                {ICONS[type]}
                <p className="text-sm font-medium text-gray-800">{toast.message}</p>
                <button
                    onClick={() => dispatch(clearToast())}
                    className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ToastNotification;
