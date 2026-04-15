import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Trips', to: '/trips' },
    { label: 'Activities', to: '/activities' },
    { label: 'About', to: '#' },
    { label: 'Contact', to: '#' },
];

const GlobeIcon = () => (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
);

const MenuIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const Navbar = ({ userRole, setUserRole }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (to) =>
        to !== '#' && (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

    return (
        <nav
            className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-300 ${scrolled
                    ? 'bg-white shadow-xl rounded-full'
                    : 'bg-white/95 backdrop-blur-md rounded-full shadow-lg'
                }`}
        >
            <div className="flex items-center justify-between px-6 py-3">
                <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="w-9 h-9 bg-forest-900 rounded-full flex items-center justify-center shadow-md">
                        <GlobeIcon />
                    </div>
                    <span className="font-extrabold text-forest-900 text-xl tracking-tight">
                        Afrika<span className="text-gold-500">Go</span>
                    </span>
                </Link>

                <ul className="hidden lg:flex items-center gap-7">
                    {navLinks.map(({ label, to }) => (
                        <li key={label}>
                            {to === '#' ? (
                                <a href="/" className="text-gray-500 hover:text-forest-800 font-medium text-sm transition-colors">
                                    {label}
                                </a>
                            ) : (
                                <Link
                                    to={to}
                                    className={`font-medium text-sm transition-colors ${isActive(to)
                                            ? 'text-forest-900 font-bold border-b-2 border-gold-500 pb-0.5'
                                            : 'text-gray-600 hover:text-forest-800'
                                        }`}
                                >
                                    {label}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-0.5 bg-gray-100 rounded-full p-1">
                        <button
                            onClick={() => setUserRole('user')}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${userRole === 'user' ? 'bg-forest-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            User
                        </button>
                        <button
                            onClick={() => setUserRole('prestataire')}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${userRole === 'prestataire' ? 'bg-gold-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            Prestataire
                        </button>
                    </div>

                    <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-forest-900 transition-all">
                        <SearchIcon />
                    </button>

                    {userRole === 'prestataire' ? (
                        <button className="hidden md:block bg-gold-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gold-400 transition-colors shadow-md shadow-gold-500/20">
                            Dashboard &rarr;
                        </button>
                    ) : (
                        <button className="hidden md:block bg-forest-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-forest-800 transition-colors shadow-md shadow-forest-900/20">
                            Sign In &rarr;
                        </button>
                    )}

                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500"
                    >
                        <MenuIcon />
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="lg:hidden bg-white rounded-3xl mx-2 mb-2 p-4 shadow-xl border border-gray-100">
                    <ul className="flex flex-col gap-1 mb-4">
                        {navLinks.map(({ label, to }) => (
                            <li key={label}>
                                {to === '#' ? (
                                    <span className="block text-gray-500 font-medium py-2 px-2 text-sm">{label}</span>
                                ) : (
                                    <Link
                                        to={to}
                                        onClick={() => setMobileOpen(false)}
                                        className={`block font-medium py-2 px-2 rounded-xl text-sm transition-colors ${isActive(to)
                                                ? 'text-forest-900 bg-forest-50 font-bold'
                                                : 'text-gray-700 hover:text-forest-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        {label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button
                            onClick={() => { setUserRole('user'); setMobileOpen(false); }}
                            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${userRole === 'user' ? 'bg-forest-900 text-white' : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            User
                        </button>
                        <button
                            onClick={() => { setUserRole('prestataire'); setMobileOpen(false); }}
                            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${userRole === 'prestataire' ? 'bg-gold-500 text-white' : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            Prestataire
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
