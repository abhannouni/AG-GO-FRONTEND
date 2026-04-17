import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { moroccanCities, activityCategories } from '../constants/uiConstants';

const LocationIcon = () => (
    <svg className="w-5 h-5 text-forest-800 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const FlagIcon = () => (
    <svg className="w-5 h-5 text-forest-800 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V5a2 2 0 012-2h10l-3 5 3 5H5v8" />
    </svg>
);

const SocialLinks = [
    { icon: 'f', label: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: '𝕏', label: 'X / Twitter', color: 'hover:bg-black' },
    { icon: 'in', label: 'LinkedIn', color: 'hover:bg-blue-700' },
    { icon: '◎', label: 'Instagram', color: 'hover:bg-pink-600' },
];

const Hero = ({ onSearch }) => {
    const navigate = useNavigate();
    const [location, setLocation] = useState('');
    const [activityType, setActivityType] = useState('');

    const handleSearch = () => {
        if (onSearch) onSearch({ location, activityType });
        const params = new URLSearchParams();
        if (location) params.set('city', location);
        if (activityType) params.set('category', activityType);
        navigate(`/activities${params.toString() ? `?${params.toString()}` : ''}`);
    };

    return (
        <section className="relative min-h-screen overflow-hidden flex flex-col">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=85)`,
                }}
            />

            {/* Layered Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-forest-950/95 via-forest-900/75 to-forest-950/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/60 via-transparent to-transparent" />

            {/* Social Sidebar */}
            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex-col gap-3 z-20 hidden md:flex">
                <div className="w-px h-16 bg-white/30 mx-auto mb-1" />
                {SocialLinks.map((s) => (
                    <a
                        key={s.label}
                        href="/#"
                        aria-label={s.label}
                        className={`w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white text-xs font-bold transition-all duration-200 ${s.color} hover:border-transparent hover:scale-110`}
                    >
                        {s.icon}
                    </a>
                ))}
                <div className="w-px h-16 bg-white/30 mx-auto mt-1" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex items-center">
                <div className="container mx-auto px-6 md:px-16 lg:px-24 pt-28 pb-24">
                    <div className="max-w-2xl">
                        {/* Sub-headline */}
                        <p className="text-gold-400 font-semibold text-lg mb-4 italic tracking-wide">
                            Experience Unmatched Adventures
                        </p>

                        {/* Main Headline */}
                        <h1 className="text-white font-extrabold leading-[1.1] mb-6 text-5xl md:text-6xl lg:text-7xl">
                            Where Extraordinary
                            <br />
                            <span className="text-gold-400">Memories</span> Begin
                        </h1>

                        {/* Description */}
                        <p className="text-white/75 text-lg max-w-xl mb-10 leading-relaxed">
                            Discover the ancient medinas, golden deserts, and rugged mountains of Morocco.
                            Your extraordinary journey starts right here.
                        </p>

                        {/* Search Bar */}
                        <div className="bg-white rounded-2xl md:rounded-full shadow-2xl shadow-forest-950/30 p-2 flex flex-col md:flex-row items-stretch md:items-center gap-2 max-w-2xl">
                            {/* Location Dropdown */}
                            <div className="flex items-center gap-3 flex-1 px-4 py-3">
                                <LocationIcon />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-400 font-medium mb-0.5">Location</p>
                                    <select
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="text-forest-900 font-semibold text-sm w-full focus:outline-none bg-transparent cursor-pointer"
                                    >
                                        <option value="">All Morocco</option>
                                        {moroccanCities.slice(1).map((city) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="w-px h-10 bg-gray-200 hidden md:block flex-shrink-0" />

                            {/* Activity Type Dropdown */}
                            <div className="flex items-center gap-3 flex-1 px-4 py-3">
                                <FlagIcon />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-400 font-medium mb-0.5">Activity Type</p>
                                    <select
                                        value={activityType}
                                        onChange={(e) => setActivityType(e.target.value)}
                                        className="text-forest-900 font-semibold text-sm w-full focus:outline-none bg-transparent cursor-pointer"
                                    >
                                        <option value="">All Activities</option>
                                        {activityCategories.slice(1).map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Search Button */}
                            <button
                                onClick={handleSearch}
                                className="bg-forest-900 text-white px-8 py-4 rounded-xl md:rounded-full font-semibold hover:bg-forest-800 active:scale-95 transition-all duration-200 whitespace-nowrap shadow-lg shadow-forest-950/30 flex-shrink-0"
                            >
                                Search Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slide Arrows */}
            <div className="absolute right-7 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
                <button className="w-11 h-11 rounded-full bg-white/15 border border-white/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button className="w-11 h-11 rounded-full bg-white/15 border border-white/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>


        </section>
    );
};

export default Hero;
