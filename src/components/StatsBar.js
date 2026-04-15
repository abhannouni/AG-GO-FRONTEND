import React from 'react';
import { stats } from '../data/mockData';

const StatsBar = () => {
    return (
        <section className="bg-forest-900 py-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-white/20">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center md:px-8">
                            <p className="text-gold-400 font-extrabold text-3xl md:text-4xl mb-1 tracking-tight">
                                {stat.value}
                            </p>
                            <p className="text-white/70 text-sm font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsBar;
