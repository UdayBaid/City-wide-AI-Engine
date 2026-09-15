import React, { useCallback, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Pin,
} from '@vis.gl/react-google-maps';

/**
 * CityMap — Google Maps component for the Dashboard
 * Uses @vis.gl/react-google-maps (Google's official React library)
 *
 * Props:
 *   cameras  - Array of camera node objects from mockData / API
 *   apiKey   - Google Maps API key (from REACT_APP_GOOGLE_MAPS_KEY env var)
 */

const MAP_ID = 'city-wide-ai-map'; // Created in Google Cloud Console for dark styling

// Dark map style (works without a Cloud Map ID too)
const DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0a0d1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0d1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e2d45' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0d1120' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e3a5f' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#0d1a2e' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#3b82f6' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1a2e' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3b82f6' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#0d1a2e' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1e2d45' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
];

function CameraMarker({ cam, onClick }) {
  const isOffline = cam.status === 'offline';
  return (
    <AdvancedMarker
      key={cam.id}
      position={{ lat: cam.lat, lng: cam.lng }}
      onClick={() => onClick(cam)}
      title={cam.name}
    >
      {/* Custom circular marker */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: '#0a0d1a',
        border: `2.5px solid ${isOffline ? '#f59e0b' : '#3b82f6'}`,
        boxShadow: `0 0 14px ${isOffline ? 'rgba(245,158,11,0.7)' : 'rgba(59,130,246,0.7)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isOffline ? '#f59e0b' : '#3b82f6',
        fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'transform 0.15s',
      }}>
        {cam.id.replace('CAM-0', 'C')}
      </div>
    </AdvancedMarker>
  );
}

export default function CityMap({ cameras = [], height = 360 }) {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY || '';
  const [selected, setSelected] = useState(null);

  const handleMarkerClick = useCallback((cam) => {
    setSelected(cam);
  }, []);

  if (!apiKey) {
    return (
      <div style={{
        width: '100%', height,
        background: '#0a0d1a',
        border: '1px solid #1e2d45',
        borderRadius: 8,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 8,
      }}>
        <div style={{ fontSize: 32 }}>🗺️</div>
        <div style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace' }}>
          Google Maps API key not set
        </div>
        <div style={{ color: '#475569', fontSize: 11 }}>
          Add REACT_APP_GOOGLE_MAPS_KEY to frontend/.env
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height, borderRadius: 8, overflow: 'hidden', border: '1px solid #1e2d45' }}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: 28.6139, lng: 77.2090 }}
          defaultZoom={12}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          mapId="DEMO_MAP_ID"
          mapTypeId="roadmap"
          styles={DARK_STYLE}
          style={{ width: '100%', height: '100%' }}
          onClick={() => setSelected(null)}
        >
          {cameras.map((cam) => (
            <CameraMarker key={cam.id} cam={cam} onClick={handleMarkerClick} />
          ))}

          {selected && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <div style={{
                background: '#111827', color: '#f1f5f9',
                padding: '8px 12px', borderRadius: 8,
                fontFamily: 'Inter, sans-serif', minWidth: 200,
                fontSize: 12,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#06b6d4', fontWeight: 700, fontFamily: 'monospace' }}>
                    {selected.id}
                  </span>
                  <span style={{
                    padding: '1px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                    background: selected.status === 'online' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                    color: selected.status === 'online' ? '#22c55e' : '#f59e0b',
                    textTransform: 'uppercase',
                  }}>
                    {selected.status}
                  </span>
                </div>
                <p style={{ fontWeight: 600, marginBottom: 6, color: '#e2e8f0' }}>{selected.name}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, color: '#94a3b8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Vehicles Today:</span>
                    <span style={{ color: '#e2e8f0' }}>{selected.todayReads?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Last Speed:</span>
                    <span style={{ color: '#e2e8f0' }}>{selected.lastSpeed} km/h</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>OCR Accuracy:</span>
                    <span style={{ color: '#22c55e' }}>{selected.accuracy}</span>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
