import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser, selectUserRole, logout } from '../redux/auth/authSlice';

const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Trips', to: '/trips' },
    { label: 'Activities', to: '/activities' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
];

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

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [hoverReveal, setHoverReveal] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const userRole = useSelector(selectUserRole);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (to) =>
        to !== '#' && (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

    const isMapPage = location.pathname.startsWith('/activities/map');
    const shouldHide = isMapPage && !hoverReveal && !mobileOpen;

    return (
        <>
            {/* Hover zone (map page only): move cursor to top to reveal */}
            {isMapPage && !mobileOpen && (
                <div
                    className="fixed top-0 left-0 right-0 h-5 z-[60]"
                    onMouseEnter={() => setHoverReveal(true)}
                />
            )}

            {/* Wrapper keeps the pill nav and the mobile dropdown aligned together */}
            <div
                className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-[70] transition-all duration-300 ${shouldHide
                    ? '-translate-y-24 opacity-0 pointer-events-none'
                    : 'translate-y-0 opacity-100 pointer-events-auto'
                    }`}
                onMouseEnter={() => { if (isMapPage) setHoverReveal(true); }}
                onMouseLeave={() => { if (isMapPage && !mobileOpen) setHoverReveal(false); }}
            >
                <nav
                    className={`w-full transition-all duration-300 ${scrolled
                        ? 'bg-white shadow-xl rounded-full'
                        : 'bg-white/95 backdrop-blur-md rounded-full shadow-lg'
                        }`}
                >
                    <div className="flex items-center justify-between px-6 py-3">
                        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
                            <div className="w-9 h-9 bg-forest-900 rounded-full flex items-center justify-center shadow-md">
                                <img src="/logo.png" alt="Logo" className="rounded-full" />
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
                            <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-forest-900 transition-all">
                                <SearchIcon />
                            </button>

                            {isAuthenticated ? (
                                <div className="hidden md:flex items-center gap-2">
                                    {userRole === 'prestataire' || userRole === 'admin' ? (
                                        <Link
                                            to="/dashboard"
                                            className="bg-gold-500 text-forest-950 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gold-400 transition-colors shadow-md shadow-gold-500/20"
                                        >
                                            Dashboard
                                        </Link>
                                    ) : null}
                                    {userRole === 'client' && (
                                        <Link
                                            to="/my-bookings"
                                            className={`text-sm font-semibold transition-colors px-3 py-2 rounded-full ${isActive('/my-bookings')
                                                ? 'bg-forest-50 text-forest-900 font-bold'
                                                : 'text-gray-600 hover:text-forest-800 hover:bg-gray-50'
                                                }`}
                                        >
                                            My Bookings
                                        </Link>
                                    )}
                                    <span className="text-sm text-gray-600 font-medium max-w-[120px] truncate">
                                        {user?.name || user?.email}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-2">
                                    <Link
                                        to="/login"
                                        className="text-forest-900 text-sm font-semibold hover:text-forest-700 transition-colors px-3 py-2"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-forest-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-forest-800 transition-colors shadow-md shadow-forest-900/20"
                                    >
                                        Register &rarr;
                                    </Link>
                                </div>
                            )}

                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="lg:hidden w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500"
                            >
                                <MenuIcon />
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Mobile dropdown — sibling to the pill nav, not inside it */}
                {mobileOpen && (
                    <div className="lg:hidden bg-white rounded-3xl mt-2 p-4 shadow-xl border border-gray-100">
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
                            {isAuthenticated ? (
                                <>
                                    {(userRole === 'prestataire' || userRole === 'admin') && (
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex-1 py-2 rounded-full text-sm font-semibold text-center bg-gold-500 text-forest-950"
                                        >
                                            Dashboard
                                        </Link>
                                    )}
                                    {userRole === 'client' && (
                                        <Link
                                            to="/my-bookings"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex-1 py-2 rounded-full text-sm font-semibold text-center bg-forest-50 text-forest-900 border border-forest-200"
                                        >
                                            My Bookings
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => { handleLogout(); setMobileOpen(false); }}
                                        className="flex-1 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex-1 py-2 rounded-full text-sm font-semibold text-center bg-forest-900 text-white"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex-1 py-2 rounded-full text-sm font-semibold text-center bg-gold-500 text-forest-950"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Navbar;
