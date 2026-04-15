import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from '../redux/auth/authSlice';

const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const MapIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5 text-gold-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const benefits = [
    'List your trips and activities for free',
    'Reach thousands of travelers every month',
    'Manage bookings with a simple dashboard',
    'Get paid securely and on time',
];

const CTASection = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const role = useSelector(selectUserRole);
    return (
        <section className="py-20 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-forest-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Content */}
                    <div>
                        <span className="inline-block text-gold-400 text-sm font-bold uppercase tracking-widest mb-4">
                            ✦ For Service Providers
                        </span>
                        <h2 className="text-white font-extrabold text-4xl md:text-5xl leading-tight mb-6">
                            Are You a Travel
                            <br />
                            <span className="text-gold-400">Service Provider?</span>
                        </h2>
                        <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
                            Join our growing network of prestataires across Morocco.
                            List your unique trips, guided tours, and local experiences to connect
                            with travelers from around the world.
                        </p>

                        {/* Benefits */}
                        <ul className="space-y-3 mb-10">
                            {benefits.map((benefit) => (
                                <li key={benefit} className="flex items-center gap-3 text-white/80">
                                    <CheckIcon />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            {isAuthenticated && (role === 'prestataire' || role === 'admin') ? (
                                <Link
                                    to="/dashboard"
                                    className="flex items-center justify-center gap-2 bg-gold-500 text-white px-7 py-4 rounded-full font-bold hover:bg-gold-400 transition-all duration-200 shadow-xl shadow-gold-500/30 hover:scale-105"
                                >
                                    <PlusIcon />
                                    Go to Dashboard
                                </Link>
                            ) : isAuthenticated ? (
                                <Link
                                    to="/activities"
                                    className="flex items-center justify-center gap-2 bg-gold-500 text-white px-7 py-4 rounded-full font-bold hover:bg-gold-400 transition-all duration-200 shadow-xl shadow-gold-500/30 hover:scale-105"
                                >
                                    <MapIcon />
                                    Browse Activities
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/register"
                                        className="flex items-center justify-center gap-2 bg-gold-500 text-white px-7 py-4 rounded-full font-bold hover:bg-gold-400 transition-all duration-200 shadow-xl shadow-gold-500/30 hover:scale-105"
                                    >
                                        <PlusIcon />
                                        Get Started Free
                                    </Link>
                                    <Link
                                        to="/activities/map"
                                        className="flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white px-7 py-4 rounded-full font-bold hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                                    >
                                        <MapIcon />
                                        Explore Map
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: Stat Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { value: '300+', label: 'Active Prestataires', icon: '👨‍💼' },
                            { value: '98%', label: 'Satisfaction Rate', icon: '⭐' },
                            { value: '$2.4M', label: 'Paid to Providers', icon: '💰' },
                            { value: '24/7', label: 'Support Available', icon: '🛎️' },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200"
                            >
                                <div className="text-3xl mb-3">{item.icon}</div>
                                <p className="text-gold-400 font-extrabold text-3xl leading-none mb-1">{item.value}</p>
                                <p className="text-white/60 text-sm">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Banner */}
                <div className="mt-16 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="text-white font-semibold text-lg">Ready to grow your travel business?</p>
                        <p className="text-white/55 text-sm mt-1">Join thousands of local guides and tour operators already on AfGo</p>
                    </div>
                    <Link to="/register" className="flex-shrink-0 bg-white text-forest-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all">
                        Get Started Free →
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
