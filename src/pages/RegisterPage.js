import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, selectAuth, clearAuthError } from '../redux/auth/authSlice';
import Spinner from '../components/Spinner';

const GlobeIcon = () => (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

const RegisterPage = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, registerSuccess } = useSelector(selectAuth);

    useEffect(() => {
        dispatch(clearAuthError());
    }, [dispatch]);

    useEffect(() => {
        if (registerSuccess) navigate('/login');
    }, [registerSuccess, navigate]);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(register(form));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 flex items-center justify-center px-4 py-12">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-forest-700/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-forest-700 rounded-full flex items-center justify-center shadow-lg">
                            <GlobeIcon />
                        </div>
                        <span className="font-extrabold text-white text-2xl tracking-tight">
                            Afrika<span className="text-gold-400">Go</span>
                        </span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h1 className="text-2xl font-extrabold text-forest-950 mb-1">Create your account</h1>
                    <p className="text-gray-500 text-sm mb-6">Join AfrikaGo and start exploring</p>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                placeholder="Your full name"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-900/20 focus:border-forest-700 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-900/20 focus:border-forest-700 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                placeholder="At least 6 characters"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-900/20 focus:border-forest-700 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">I am a...</label>
                            <div className="flex gap-3">
                                {[
                                    { value: 'client', label: 'Traveler / Client' },
                                    { value: 'prestataire', label: 'Activity Provider' },
                                ].map(({ value, label }) => (
                                    <label
                                        key={value}
                                        className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${form.role === value
                                                ? 'border-forest-700 bg-forest-50 text-forest-900'
                                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={value}
                                            checked={form.role === value}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-forest-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-forest-800 transition-colors shadow-md shadow-forest-900/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Spinner size="sm" /> : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-forest-700 font-semibold hover:text-forest-900 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>

                <p className="text-center text-white/40 text-xs mt-6">
                    &copy; {new Date().getFullYear()} AfrikaGo. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
