import React from 'react';

const StarIcon = () => (
    <svg className="w-3.5 h-3.5 text-gold-400 fill-gold-400" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const PinIcon = () => (
    <svg className="w-3.5 h-3.5 text-forest-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M12 6v6l4 2" />
    </svg>
);

const categoryColors = {
    'Adventure': { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
    'Cultural': { bg: 'bg-gold-100', text: 'text-gold-700', dot: 'bg-gold-500' },
    'Food & Culture': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    'Wellness': { bg: 'bg-forest-100', text: 'text-forest-700', dot: 'bg-forest-500' },
    'Beach': { bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-500' },
};

const ActivityCard = ({ activity }) => {
    const { title, category, location, duration, price, rating, reviews, image, description } = activity;
    const colors = categoryColors[category] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };

    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
            <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${colors.bg} ${colors.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                    {category}
                </span>
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-forest-900 px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
                    ${price} / person
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
                <h3 className="text-gray-900 font-bold text-base mb-1.5 line-clamp-1 group-hover:text-forest-800 transition-colors">
                    {title}
                </h3>
                <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed">{description}</p>

                <div className="flex items-center gap-3 mt-auto">
                    <div className="flex items-center gap-1 text-gray-500 text-xs flex-1 min-w-0">
                        <PinIcon />
                        <span className="truncate">{location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs flex-shrink-0">
                        <ClockIcon />
                        <span>{duration}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                        <StarIcon />
                        <span className="text-sm font-bold text-gray-800">{rating}</span>
                        <span className="text-xs text-gray-400">({reviews} reviews)</span>
                    </div>
                    <button className="text-xs font-semibold text-forest-800 hover:text-forest-600 flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                        View Details
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActivityCard;
