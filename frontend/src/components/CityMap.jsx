import React, { useCallback, useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/client';

/**
 * CityMap — Surveillance Map component for Dashboard.
 * Supports dual-mode:
 * 1. Google Maps (when REACT_APP_GOOGLE_MAPS_KEY is provided)
 * 2. 100% Free Leaflet Dark Tactical Map (zero API key required, no setup needed)
 */

// Dark map style for Google Maps
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

function GoogleCameraMarker({ cam, onClick }) {
  const isOffline = cam.status === 'offline';
  return (
    <AdvancedMarker
      key={cam.id}
      position={{ lat: cam.lat, lng: cam.lng }}
      onClick={() => onClick(cam)}
      title={cam.name}
    >
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: '#0a0d1a',
        border: `2.5px solid ${isOffline ? '#f59e0b' : '#3b82f6'}`,
        boxShadow: `0 0 14px ${isOffline ? 'rgba(245,158,11,0.7)' : 'rgba(59,130,246,0.7)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isOffline ? '#f59e0b' : '#3b82f6',
        fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold',
        cursor: 'pointer',
      }}>
        {cam.id.replace('CAM-0', 'C')}
      </div>
    </AdvancedMarker>
  );
}

// Leaflet map size invalidator helper
function LeafletMapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

// Leaflet custom marker generator
const createLeafletCameraIcon = (camId, isOffline) => L.divIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div style="
      width: 32px; height: 32px; border-radius: 50%;
      background: #0a0d1a;
      border: 2px solid ${isOffline ? '#f59e0b' : '#06b6d4'};
      box-shadow: 0 0 12px ${isOffline ? 'rgba(245,158,11,0.7)' : 'rgba(6,182,212,0.8)'};
      display: flex; align-items: center; justify-content: center;
      color: ${isOffline ? '#f59e0b' : '#06b6d4'};
      font-family: monospace; font-size: 10px; font-weight: bold;
      cursor: pointer;
    ">
      ${camId.replace('CAM-0', 'C')}
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

export default function CityMap({ cameras = [], height = 360 }) {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY || '';
  const [selected, setSelected] = useState(null);

  const handleMarkerClick = useCallback((cam) => {
    setSelected(cam);
  }, []);

  // If no Google Maps API key provided, seamlessly render 100% Free Leaflet Dark Tactical Map
  if (!apiKey) {
    return (
      <div style={{ width: '100%', height, borderRadius: 8, overflow: 'hidden', border: '1px solid #1e2d45', position: 'relative', background: '#070a14' }}>
        <MapContainer
          center={[28.6180, 77.2100]}
          zoom={12}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%', backgroundColor: '#070a14' }}
        >
          <LeafletMapResizer />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="dark-tactical-tiles"
            maxZoom={19}
          />
          {cameras.map((cam) => {
            const isOffline = cam.status === 'offline';
            return (
              <Marker
                key={cam.id}
                position={[cam.lat, cam.lng]}
                icon={createLeafletCameraIcon(cam.id, isOffline)}
              >
                <Popup>
                  <div style={{ minWidth: 200, padding: 2, fontFamily: 'Inter, sans-serif' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#06b6d4', fontWeight: 700, fontFamily: 'monospace' }}>{cam.id}</span>
                      <span style={{
                        padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                        background: !isOffline ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                        color: !isOffline ? '#22c55e' : '#f59e0b'
                      }}>
                        {cam.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>{cam.name}</p>

                    {!isOffline && (
                      <div style={{ width: '100%', height: 95, borderRadius: 4, overflow: 'hidden', marginBottom: 6, background: '#000', border: '1px solid #1e2d45' }}>
                        <img
                          src={api.getStreamUrl(cam.id)}
                          alt={cam.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}

                    <div style={{ fontSize: 10, color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Vehicles Today:</span>
                        <span style={{ color: '#fff' }}>{cam.todayReads?.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Last Speed:</span>
                        <span style={{ color: '#fff' }}>{cam.lastSpeed} km/h</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Tactical Dark Mode Badge */}
        <div style={{
          position: 'absolute', bottom: 8, left: 8, zIndex: 1000,
          background: 'rgba(13,17,32,0.85)', backdropFilter: 'blur(4px)',
          border: '1px solid #1e2d45', borderRadius: 4,
          padding: '2px 8px', fontSize: 10, fontFamily: 'monospace', color: '#06b6d4'
        }}>
          TACTICAL SURVEILLANCE GRID · NO API KEY REQ
        </div>
      </div>
    );
  }

  // Google Maps mode if API key is provided
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
            <GoogleCameraMarker key={cam.id} cam={cam} onClick={handleMarkerClick} />
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

                {selected.status === 'online' && (
                  <div style={{
                    width: '100%',
                    height: 110,
                    borderRadius: 6,
                    overflow: 'hidden',
                    marginBottom: 8,
                    border: '1px solid rgba(6,182,212,0.3)',
                    background: '#070a14',
                    position: 'relative',
                  }}>
                    <img
                      src={api.getStreamUrl(selected.id)}
                      alt={selected.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute', top: 4, left: 4,
                      background: 'rgba(0,0,0,0.7)', padding: '2px 5px',
                      borderRadius: 4, fontSize: 9, fontFamily: 'monospace',
                      color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                      LIVE FEED
                    </div>
                  </div>
                )}

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
