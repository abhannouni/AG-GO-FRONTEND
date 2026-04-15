import React from 'react';

const StarIcon = () => (
    <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
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
    'City Tour': 'bg-purple-100 text-purple-700',
    'Adventure': 'bg-orange-100 text-orange-700',
    'Cultural': 'bg-amber-100 text-amber-700',
    'Beach': 'bg-sky-100 text-sky-700',
    'Wellness': 'bg-green-100 text-green-700',
    'Food & Culture': 'bg-red-100 text-red-700',
};

const TripCard = ({ trip }) => {
    const { title, location, duration, price, rating, reviews, image, category } = trip;

    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
            {/* Image */}
            <div className="relative overflow-hidden aspect-[4/3]">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                {/* Category Badge */}
                <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[category] || 'bg-gray-100 text-gray-700'}`}>
                    {category}
                </span>
                {/* Price Badge */}
                <div className="absolute bottom-3 right-3 bg-forest-900 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    from ${price}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="text-gray-900 font-bold text-base mb-2 line-clamp-1 group-hover:text-forest-800 transition-colors">
                    {title}
                </h3>

                <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
                    <PinIcon />
                    <span className="truncate">{location}, Morocco</span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                        <StarIcon />
                        <span className="text-sm font-bold text-gray-800">{rating}</span>
                        <span className="text-xs text-gray-400">({reviews})</span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <ClockIcon />
                        <span>{duration}</span>
                    </div>
                </div>

                {/* Book Button */}
                <button className="mt-4 w-full py-2.5 rounded-xl bg-forest-50 text-forest-900 text-sm font-semibold hover:bg-forest-900 hover:text-white transition-all duration-200 border border-forest-100 hover:border-forest-900">
                    Book Now
                </button>
            </div>
        </div>
    );
};

export default TripCard;
