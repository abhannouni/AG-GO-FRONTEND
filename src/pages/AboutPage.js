import React from 'react';
import { Link } from 'react-router-dom';

const SparkIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l1.6 5.1L19 9l-5.4 1.9L12 16l-1.6-5.1L5 9l5.4-1.9L12 2z" />
    </svg>
);

const ShieldIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v6c0 5-3 8-7 9-4-1-7-4-7-9V7l7-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-5" />
    </svg>
);

const HeartIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
        />
    </svg>
);

const AboutPage = () => {
    const values = [
        {
            title: 'Authentic local experiences',
            desc: 'We partner with local guides and providers to keep every moment real, respectful, and unforgettable.',
            icon: <SparkIcon />,
            tone: 'bg-gold-500/15 text-gold-400',
        },
        {
            title: 'Safety, clarity, trust',
            desc: 'Clear details, transparent pricing, and thoughtful guidance—so you can travel with confidence.',
            icon: <ShieldIcon />,
            tone: 'bg-forest-600/15 text-forest-200',
        },
        {
            title: 'Built with love for Morocco',
            desc: 'From medinas to mountains, we design journeys that celebrate Morocco’s culture, food, and people.',
            icon: <HeartIcon />,
            tone: 'bg-white/10 text-white',
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <div className="relative bg-forest-900 pt-32 pb-16 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-15"
                    style={{
                        backgroundImage:
                            'url(https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1600&q=80)',
                    }}
                />
                <div className="absolute -top-10 -left-10 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-16 -right-16 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

                <div className="container mx-auto px-6 relative">
                    <p className="text-gold-400 font-semibold text-sm uppercase tracking-widest mb-3">
                        ✦ Our Story
                    </p>
                    <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
                        About Afrika<span className="text-gold-400">Go</span>
                    </h1>
                    <p className="text-white/70 text-lg max-w-2xl">
                        We help travelers discover Morocco through curated trips, trusted local providers, and experiences that feel
                        personal—never generic.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-8">
                        <Link
                            to="/activities"
                            className="px-6 py-3 rounded-full bg-gold-500 text-forest-950 text-sm font-bold hover:bg-gold-400 transition-colors shadow-lg"
                        >
                            Explore Activities
                        </Link>
                        <Link
                            to="/contact"
                            className="px-6 py-3 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/15 transition-colors border border-white/15"
                        >
                            Contact Us
                        </Link>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                        {[
                            { value: '4.7★', label: 'Average rating' },
                            { value: '20+', label: 'Local partners' },
                            { value: '5', label: 'Activity categories' },
                            { value: '2026', label: 'Growing fast' },
                        ].map((s) => (
                            <div key={s.label} className="bg-white/10 border border-white/10 rounded-2xl px-4 py-4 backdrop-blur-sm">
                                <p className="text-white font-extrabold text-2xl">{s.value}</p>
                                <p className="text-white/60 text-xs mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    <div className="lg:col-span-5">
                        <p className="text-forest-800 font-semibold text-sm uppercase tracking-widest mb-3">✦ Mission</p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                            Make Morocco easy to explore—beautifully.
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            AfrikaGo brings together the best Moroccan activities and travel ideas in one place. Whether you’re planning
                            a weekend in Marrakech, a Sahara desert trip, or a wellness escape, our goal is simple: help you book the
                            right experience with clarity and confidence.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            {['Curated listings', 'Trusted providers', 'Modern booking flow', 'Local-first'].map((chip) => (
                                <span
                                    key={chip}
                                    className="px-3.5 py-2 rounded-full bg-forest-50 text-forest-800 text-xs font-semibold border border-forest-100"
                                >
                                    {chip}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {values.map((v) => (
                                <div
                                    key={v.title}
                                    className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${v.tone}`}>
                                        {v.icon}
                                    </div>
                                    <h3 className="mt-4 font-bold text-gray-900">{v.title}</h3>
                                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{v.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 rounded-3xl bg-gradient-to-br from-forest-900 to-forest-950 text-white p-8 overflow-hidden relative">
                            <div className="absolute -top-10 -right-10 w-56 h-56 bg-gold-500/15 rounded-full blur-3xl" />
                            <p className="text-white/75 text-sm font-semibold uppercase tracking-widest mb-2">✦ Why us</p>
                            <h3 className="text-2xl md:text-3xl font-extrabold leading-tight">
                                Modern UI, real Moroccan experiences.
                            </h3>
                            <p className="text-white/70 text-sm mt-3 max-w-2xl">
                                We’re building a clean, fast, and reliable way to discover and book. No clutter, no confusion—just the
                                essentials, styled with care.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    to="/trips"
                                    className="px-6 py-3 rounded-full bg-gold-500 text-forest-950 text-sm font-bold hover:bg-gold-400 transition-colors shadow-lg"
                                >
                                    Browse Trips
                                </Link>
                                <Link
                                    to="/activities"
                                    className="px-6 py-3 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/15 transition-colors border border-white/15"
                                >
                                    Browse Activities
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;

