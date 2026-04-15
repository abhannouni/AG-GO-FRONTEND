import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Morocco centre — Mapbox uses [lng, lat]
const MOROCCO_CENTER = [-7.0926, 31.7917];
const DEFAULT_ZOOM = 5;

const SOURCE_ID = 'activities-source';

export const CATEGORY_COLORS = {
    Adventure: '#e5aa30',
    Cultural: '#c9911a',
    'Food & Culture': '#C1272D',
    Wellness: '#278d55',
    Beach: '#0ea5e9',
};

const CATEGORY_LABELS = {
    Adventure: 'A',
    Cultural: 'C',
    'Food & Culture': 'F',
    Wellness: 'W',
    Beach: 'B',
};

/** Convert activities array → GeoJSON FeatureCollection */
const buildGeoJSON = (activities) => ({
    type: 'FeatureCollection',
    features: activities.map((a) => {
        const [lat, lng] = a.coordinates; // mockData stores [lat, lng]
        return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [lng, lat] },
            properties: {
                id: a.id,
                title: a.title,
                category: a.category,
                location: a.location,
                price: a.price,
                rating: a.rating,
                reviews: a.reviews,
                duration: a.duration,
                image: a.image,
                description: a.description,
                color: CATEGORY_COLORS[a.category] || '#0a2e1c',
                label: CATEGORY_LABELS[a.category] || '?',
            },
        };
    }),
});

const buildMiniPopupHTML = (props) => `
  <div style="font-family:system-ui,sans-serif;padding:10px;min-width:180px;">
    <strong style="font-size:13px;color:#111;display:block;margin-bottom:4px;">${props.title}</strong>
    <p style="color:#6b7280;font-size:11px;margin:0 0 6px 0;">📍 ${props.location} &nbsp;·&nbsp; ⏱ ${props.duration}</p>
    <div style="display:flex;justify-content:space-between;font-size:12px;">
      <span style="font-weight:800;color:#0a2e1c;">$${props.price}</span>
      <span style="color:#c9911a;font-weight:600;">⭐ ${props.rating}</span>
    </div>
  </div>
`;

/**
 * MapboxMap
 *
 * Props:
 *  activities       – array of activity objects
 *  selectedId       – id of the currently-selected activity (for highlight)
 *  onSelect         – callback(activity | null) when a marker is clicked
 *                     If omitted, a mini Mapbox popup is shown instead
 *  height           – CSS height string (default '520px')
 *  rounded          – whether to apply rounded-2xl to the container (default true)
 */
const MapboxMap = ({
    activities = [],
    selectedId = null,
    onSelect = null,
    height = '520px',
    rounded = true,
}) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Keep latest props in refs so event-handler closures never go stale
    const onSelectRef = useRef(onSelect);
    const activitiesRef = useRef(activities);
    useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
    useEffect(() => { activitiesRef.current = activities; }, [activities]);

    const token = process.env.REACT_APP_MAPBOX_TOKEN;
    const tokenMissing = !token || token === 'pk.your_mapbox_public_token_here';

    // ── Effect 0: suppress unhandled AbortError rejections ───────────────────
    // When map.remove() cancels in-flight tile/style fetches, mapbox-gl's
    // internal fetch() calls reject with AbortError.  Those rejections are NOT
    // caught by map.on('error', …) — they surface as unhandled promise
    // rejections that React's error overlay intercepts (including in Strict Mode
    // double-invoke).  We silence them here by marking the event handled.
    useEffect(() => {
        // Component-level second-line handler (global one in index.js is primary).
        // Catches any stragglers that slip through before the global handler fires.
        const handler = (e) => {
            const r = e.reason;
            if (r instanceof Error) {
                const isAbort =
                    r.name === 'AbortError' ||
                    r.message?.includes('aborted') ||
                    r.message?.includes('signal');
                const isFetchFail =
                    r.message === 'Failed to fetch' ||
                    r.message === 'Load failed' ||
                    r.message === 'NetworkError when attempting to fetch resource';
                if (isAbort || isFetchFail) e.preventDefault();
            }
        };
        window.addEventListener('unhandledrejection', handler);
        return () => window.removeEventListener('unhandledrejection', handler);
    }, []);

    // ── Effect 1: initialise the map (runs once per mount) ───────────────────
    useEffect(() => {
        if (map.current || !mapContainer.current || tokenMissing) return;

        mapboxgl.accessToken = token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/outdoors-v12',
            center: MOROCCO_CENTER,
            zoom: DEFAULT_ZOOM,
            attributionControl: false,
        });

        // Suppress AbortErrors that fire when the map is removed mid-load
        map.current.on('error', (e) => {
            if (e.error?.name === 'AbortError') return;
            console.warn('[MapboxMap]', e.error?.message ?? e.error);
        });

        map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
        map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
        map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

        map.current.on('load', () => {
            setMapLoaded(true);
            setIsLoading(false);
        });

        return () => {
            try {
                map.current?.remove();
            } catch {
                // Swallow any synchronous error mapbox-gl may throw on removal
            }
            map.current = null;
            setMapLoaded(false);
            setIsLoading(true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Effect 2: wire up GeoJSON source + layers once map style is ready ────
    useEffect(() => {
        if (!mapLoaded || !map.current) return;
        if (map.current.getSource(SOURCE_ID)) return; // already initialised

        const m = map.current;

        // ── Source (with client-side clustering) ─────────────────────────────
        m.addSource(SOURCE_ID, {
            type: 'geojson',
            data: buildGeoJSON(activitiesRef.current),
            cluster: true,
            clusterMaxZoom: 13,   // Expand cluster below zoom 13
            clusterRadius: 60,    // Cluster radius in pixels
        });

        // ── Layer: cluster bubble ─────────────────────────────────────────────
        m.addLayer({
            id: 'clusters',
            type: 'circle',
            source: SOURCE_ID,
            filter: ['has', 'point_count'],
            paint: {
                // Colour steps: small → medium → large cluster
                'circle-color': [
                    'step', ['get', 'point_count'],
                    '#0a2e1c', 4,
                    '#155a37', 10,
                    '#c9911a',
                ],
                'circle-radius': [
                    'step', ['get', 'point_count'],
                    26, 4,
                    34, 10,
                    44,
                ],
                'circle-opacity': 0.92,
                'circle-stroke-width': 3,
                'circle-stroke-color': 'rgba(255,255,255,0.95)',
            },
        });

        // ── Layer: cluster count label ────────────────────────────────────────
        m.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: SOURCE_ID,
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
                'text-size': 14,
                'text-allow-overlap': true,
            },
            paint: { 'text-color': '#ffffff' },
        });

        // ── Layer: individual marker — outer glow ring ────────────────────────
        m.addLayer({
            id: 'unclustered-glow',
            type: 'circle',
            source: SOURCE_ID,
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': ['get', 'color'],
                'circle-radius': 20,
                'circle-opacity': 0.18,
                'circle-stroke-width': 0,
            },
        });

        // ── Layer: individual marker — main dot ───────────────────────────────
        m.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: SOURCE_ID,
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': ['get', 'color'],
                'circle-radius': 13,
                'circle-stroke-width': 3,
                'circle-stroke-color': '#ffffff',
                'circle-opacity': 0.95,
            },
        });

        // ── Layer: individual marker — category letter ────────────────────────
        m.addLayer({
            id: 'unclustered-label',
            type: 'symbol',
            source: SOURCE_ID,
            filter: ['!', ['has', 'point_count']],
            layout: {
                'text-field': ['get', 'label'],
                'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
                'text-size': 10,
                'text-allow-overlap': true,
            },
            paint: { 'text-color': '#ffffff' },
        });

        // ── Pointer cursor on hover ───────────────────────────────────────────
        const addPointer = (layerId) => {
            m.on('mouseenter', layerId, () => { m.getCanvas().style.cursor = 'pointer'; });
            m.on('mouseleave', layerId, () => { m.getCanvas().style.cursor = ''; });
        };
        addPointer('clusters');
        addPointer('unclustered-point');
        addPointer('unclustered-glow');

        // ── Cluster click → zoom in ───────────────────────────────────────────
        m.on('click', 'clusters', (e) => {
            const features = m.queryRenderedFeatures(e.point, { layers: ['clusters'] });
            if (!features.length) return;
            const clusterId = features[0].properties.cluster_id;
            m.getSource(SOURCE_ID).getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return;
                m.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom + 0.5,
                    duration: 600,
                });
            });
        });

        // ── Individual marker click ───────────────────────────────────────────
        m.on('click', 'unclustered-point', (e) => {
            const props = e.features[0].properties;
            const activity = activitiesRef.current.find((a) => a.id === props.id);

            if (onSelectRef.current) {
                // Side-panel mode
                onSelectRef.current(activity ?? null);
                m.easeTo({
                    center: e.features[0].geometry.coordinates,
                    zoom: Math.max(m.getZoom(), 9),
                    duration: 600,
                    offset: [-160, 0],
                });
            } else {
                // Standalone mode — show a mini Mapbox popup
                new mapboxgl.Popup({ offset: 22, maxWidth: '220px', closeButton: true })
                    .setLngLat(e.features[0].geometry.coordinates)
                    .setHTML(buildMiniPopupHTML(props))
                    .addTo(m);
            }
        });

        // Clicking the glow ring also triggers selection
        m.on('click', 'unclustered-glow', (e) => {
            const features = m.queryRenderedFeatures(e.point, {
                layers: ['unclustered-point', 'unclustered-glow'],
            });
            if (!features.length) return;
            const props = features[0].properties;
            const activity = activitiesRef.current.find((a) => a.id === props.id);
            if (onSelectRef.current) onSelectRef.current(activity ?? null);
        });

        // Clicking empty space → deselect
        m.on('click', (e) => {
            const hit = m.queryRenderedFeatures(e.point, {
                layers: ['unclustered-point', 'unclustered-glow', 'clusters'],
            });
            if (hit.length === 0 && onSelectRef.current) onSelectRef.current(null);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapLoaded]);

    // ── Effect 3: update GeoJSON data when activities filter changes ──────────
    useEffect(() => {
        if (!mapLoaded || !map.current) return;
        const source = map.current.getSource(SOURCE_ID);
        if (source) source.setData(buildGeoJSON(activities));
    }, [activities, mapLoaded]);

    // ── Effect 4: highlight/unhighlight the selected marker ──────────────────
    useEffect(() => {
        if (!mapLoaded || !map.current) return;
        if (!map.current.getLayer('unclustered-point')) return;

        const sid = selectedId ?? -1;

        map.current.setPaintProperty('unclustered-point', 'circle-radius', [
            'case', ['==', ['get', 'id'], sid], 17, 13,
        ]);
        map.current.setPaintProperty('unclustered-point', 'circle-stroke-width', [
            'case', ['==', ['get', 'id'], sid], 4, 3,
        ]);
        map.current.setPaintProperty('unclustered-glow', 'circle-radius', [
            'case', ['==', ['get', 'id'], sid], 28, 20,
        ]);
        map.current.setPaintProperty('unclustered-glow', 'circle-opacity', [
            'case', ['==', ['get', 'id'], sid], 0.32, 0.18,
        ]);
    }, [selectedId, mapLoaded]);

    // ── Effect 5: smooth fly to selected activity ─────────────────────────────
    useEffect(() => {
        if (!mapLoaded || !map.current || !selectedId) return;
        const activity = activities.find((a) => a.id === selectedId);
        if (!activity) return;
        const [lat, lng] = activity.coordinates;
        map.current.easeTo({
            center: [lng, lat],
            zoom: Math.max(map.current.getZoom(), 9),
            duration: 700,
            offset: [onSelect ? -160 : 0, 0],
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId, mapLoaded]);

    // ── Token missing placeholder ─────────────────────────────────────────────
    if (tokenMissing) {
        return (
            <div
                className={`w-full bg-forest-50 flex flex-col items-center justify-center gap-4 px-8 text-center ${rounded ? 'rounded-2xl' : ''}`}
                style={{ height }}
            >
                <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-forest-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                </div>
                <div>
                    <p className="font-bold text-forest-900 text-lg">Mapbox token required</p>
                    <p className="text-gray-500 text-sm mt-1 max-w-xs">
                        Add your public token to{' '}
                        <code className="bg-gray-100 px-1 rounded text-xs">.env</code> as{' '}
                        <code className="bg-gray-100 px-1 rounded text-xs">REACT_APP_MAPBOX_TOKEN</code>, then restart the dev server.
                    </p>
                    <a
                        href="https://account.mapbox.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-3 px-5 py-2 rounded-full bg-forest-900 text-white text-sm font-semibold hover:bg-forest-800 transition-colors"
                    >
                        Get a free token →
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative w-full overflow-hidden ${rounded ? 'rounded-2xl shadow-xl border border-gray-200' : ''}`}
            style={{ height }}
        >
            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-forest-50 flex flex-col items-center justify-center z-10 gap-3">
                    <div className="w-10 h-10 border-4 border-forest-200 border-t-forest-900 rounded-full animate-spin" />
                    <p className="text-forest-700 text-sm font-medium">Loading map…</p>
                </div>
            )}

            {/* Map canvas */}
            <div ref={mapContainer} className="w-full h-full" />
        </div>
    );
};

export default MapboxMap;
