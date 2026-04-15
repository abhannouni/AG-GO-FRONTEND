import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const categoryColors = {
    Adventure: '#f97316',
    Cultural: '#d97706',
    'Food & Culture': '#ef4444',
    Wellness: '#22c55e',
    Beach: '#0ea5e9',
};

const createCustomIcon = (category) => {
    const color = categoryColors[category] || '#1e3a8a';
    return L.divIcon({
        className: '',
        html: `
      <div style="
        width: 36px; height: 36px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        display: flex; align-items: center; justify-content: center;
      ">
        <div style="
          width: 10px; height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38],
    });
};

// Morocco center coordinates
const MOROCCO_CENTER = [31.7917, -7.0926];
const DEFAULT_ZOOM = 5;

const MapView = ({ activities }) => {
    return (
        <div className="w-full rounded-2xl overflow-hidden shadow-xl border border-gray-200" style={{ height: '520px' }}>
            <MapContainer
                center={MOROCCO_CENTER}
                zoom={DEFAULT_ZOOM}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {activities.map((activity) => (
                    <Marker
                        key={activity.id}
                        position={activity.coordinates}
                        icon={createCustomIcon(activity.category)}
                    >
                        <Popup className="activity-popup" maxWidth={240}>
                            <div className="p-1">
                                <img
                                    src={activity.image}
                                    alt={activity.title}
                                    className="w-full h-28 object-cover rounded-lg mb-2"
                                />
                                <h4 className="font-bold text-gray-900 text-sm mb-1">{activity.title}</h4>
                                <p className="text-gray-500 text-xs mb-2 line-clamp-2">{activity.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-blue-900 font-bold text-sm">${activity.price}</span>
                                    <span className="text-xs text-gray-400">{activity.duration}</span>
                                </div>
                                <button className="mt-2 w-full py-1.5 bg-blue-950 text-white text-xs font-semibold rounded-lg hover:bg-blue-900 transition-colors">
                                    View Details
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;
