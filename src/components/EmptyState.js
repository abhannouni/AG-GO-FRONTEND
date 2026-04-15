import React from 'react';

const EmptyState = ({ icon, title, message, action }) => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-forest-50 rounded-full flex items-center justify-center mb-4">
            {icon || (
                <svg className="w-8 h-8 text-forest-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )}
        </div>
        <p className="text-gray-700 font-semibold text-lg mb-2">{title || 'Nothing here yet'}</p>
        {message && <p className="text-gray-400 text-sm mb-4">{message}</p>}
        {action && (
            <button
                onClick={action.onClick}
                className="mt-2 px-6 py-2.5 rounded-full bg-forest-900 text-white text-sm font-semibold hover:bg-forest-800 transition-colors"
            >
                {action.label}
            </button>
        )}
    </div>
);

export default EmptyState;
