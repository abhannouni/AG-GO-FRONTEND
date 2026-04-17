import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectAuth, clearAuthError } from '../redux/auth/authSlice';
import Spinner from '../components/Spinner';

const GlobeIcon = () => (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

const LoginPage = () => {
    // 'identifier' accepts both email address and username
    const [form, setForm] = useState({ identifier: '', password: '' });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { loading, user } = useSelector(selectAuth);

    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        dispatch(clearAuthError());
    }, [dispatch]);

    useEffect(() => {
        if (user) navigate(from, { replace: true });
    }, [user, navigate, from]);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(login(form));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 flex items-center justify-center px-4">
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
                    <h1 className="text-2xl font-extrabold text-forest-950 mb-1">Welcome back</h1>
                    <p className="text-gray-500 text-sm mb-6">Sign in to your AfrikaGo account</p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email or Username</label>
                            <input
                                type="text"
                                name="identifier"
                                value={form.identifier}
                                onChange={handleChange}
                                required
                                placeholder="you@example.com or john_doe"
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
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-900/20 focus:border-forest-700 transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-forest-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-forest-800 transition-colors shadow-md shadow-forest-900/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Spinner size="sm" /> : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-forest-700 font-semibold hover:text-forest-900 transition-colors">
                            Create one
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

export default LoginPage;
