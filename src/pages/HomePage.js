import React from 'react';
import Hero from '../components/Hero';
import StatsBar from '../components/StatsBar';
import TripsSection from '../components/TripsSection';
import ActivitiesSection from '../components/ActivitiesSection';
import CTASection from '../components/CTASection';

const HomePage = ({ userRole }) => {
    const handleSearch = () => {
        const section = document.getElementById('trips');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen">
            <Hero onSearch={handleSearch} />
            <StatsBar />
            <TripsSection />
            <ActivitiesSection />
            <CTASection userRole={userRole} />
        </div>
    );
};

export default HomePage;
