import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Search, 
  Calendar, 
  Download, 
  Route, 
  FileCheck
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { TRAJECTORY_TARGET } from '../data/mockData';
import api from '../api/client';

// Helper component to invalidate Leaflet container size on mount to prevent grey/white rendering
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);
  return null;
}

// Helper to fit map bounds to current vehicle trajectory
function MapBoundsFitter({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 0) {
      try {
        const bounds = L.latLngBounds(positions);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
      } catch (err) {
        console.warn("fitBounds error:", err);
      }
    }
  }, [map, positions]);
  return null;
}

// Map markers
const createNodeIcon = (camId, isPathNode, nodeIndex) => {
  if (isPathNode) {
    return L.divIcon({
      className: 'trajectory-active-marker',
      html: `
        <div style="
          width: 34px; 
          height: 34px; 
          border-radius: 50%; 
          background: #0d1120; 
          border: 2px solid #06b6d4; 
          box-shadow: 0 0 16px rgba(6,182,212,0.8); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: #06b6d4; 
          font-family: monospace; 
          font-size: 11px; 
          font-weight: bold;
        ">
          #${nodeIndex + 1}
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18]
    });
  }

  return L.divIcon({
    className: 'trajectory-neutral-marker',
    html: `
      <div style="
        width: 22px; 
        height: 22px; 
        border-radius: 50%; 
        background: #111827; 
        border: 1px solid #1e2d45; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        color: #64748b; 
        font-family: monospace; 
        font-size: 8px;
      ">
        ${camId.replace('CAM-0', 'C')}
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

export default function Trajectories() {
  const [cameras, setCameras] = useState([]);
  const [searchPlate, setSearchPlate] = useState('PB10XX1234');
  const [searchDate, setSearchDate] = useState('2026-09-14');
  const [target, setTarget] = useState(TRAJECTORY_TARGET);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [mapStyle, setMapStyle] = useState('tactical'); // 'tactical' | 'osm_dark'

  useEffect(() => {
    api.getCameras().then(data => setCameras(data.cameras || []));
    api.getTrajectories(searchPlate)
      .then(data => {
        if (data && data.nodes) setTarget(data);
      })
      .catch(err => console.error("Failed to load trajectory:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Path coordinates for polyline: CAM-06 -> CAM-04 -> CAM-01 -> CAM-02
  const pathPositions = (target.nodes || []).map((n) => [n.lat, n.lng]);

  const handleTrack = (e) => {
    e.preventDefault();
    api.getTrajectories(searchPlate)
      .then(data => {
        if (data && data.nodes) setTarget(data);
      })
      .catch(err => {
        console.error("Failed to track plate:", err);
        setTarget(TRAJECTORY_TARGET);
      });
  };

  const handleExportPDF = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="flex bg-[#0a0d1a] min-h-screen text-[#f1f5f9]">
      <Sidebar />

      <div className="flex-1 ml-[220px] min-h-screen flex flex-col">
        <Topbar pageTitle="Trajectories" />

        <main className="p-6 space-y-6 flex-1">
          {/* Header & Filter Search bar */}
          <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Route className="w-5 h-5 text-[#3b82f6]" />
                  <h2 className="text-lg font-bold text-[#f1f5f9]">
                    Vehicle Trajectory Tracking
                  </h2>
                </div>
              </div>

              {/* Input & Track Form */}
              <form onSubmit={handleTrack} className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={searchPlate}
                    onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                    placeholder="Search Plate..."
                    className="pl-9 pr-3 py-2 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#3b82f6] w-40"
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold text-xs rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                >
                  Track Vehicle
                </button>
              </form>
            </div>
          </div>

          {/* Main 2-Panel Layout: LEFT 60% Map | RIGHT 40% Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT 60% (7 cols on 12-grid or 60% ratio) */}
            <div className="lg:col-span-7 bg-[#111827] border border-[#1e2d45] rounded-xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#06b6d4]" />
                  <span className="text-sm font-semibold text-[#f1f5f9]">
                    Delhi Corridor Trajectory Trace
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <span className="w-2.5 h-0.5 bg-[#3b82f6] border-dashed border border-[#3b82f6]"></span>
                  <span>4 Nodes Correlated</span>
                </div>
              </div>

              {/* Map */}
              <div className="w-full h-[520px] rounded-lg overflow-hidden border border-[#1e2d45] relative bg-[#070a14]">
                <MapContainer
                  center={[28.6180, 77.2100]}
                  zoom={12}
                  scrollWheelZoom={true}
                  style={{ width: '100%', height: '100%', backgroundColor: '#070a14' }}
                >
                  <MapResizer />
                  <MapBoundsFitter positions={pathPositions} />

                  {/* 100% Free Watermark-Free Dark Surveillance Basemaps — No API Key Required */}
                  {mapStyle === 'tactical' ? (
                    <TileLayer
                      key="osm-tactical-dark"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      className="dark-tactical-tiles"
                      maxZoom={19}
                    />
                  ) : (
                    <TileLayer
                      key="esri-satellite"
                      attribution='&copy; Esri &copy; Earthstar Geographics'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      className="night-satellite-tiles"
                      maxZoom={18}
                    />
                  )}

                  {/* Connecting dashed polyline */}
                  <Polyline
                    positions={pathPositions}
                    pathOptions={{
                      color: '#06b6d4',
                      weight: 4,
                      opacity: 0.9,
                      dashArray: '8, 8',
                      lineCap: 'round'
                    }}
                  />

                  {/* Render All 8 Cameras with special style for target path */}
                  {cameras.map((cam) => {
                    const nodeIndex = (target.nodes || []).findIndex((n) => n.camera === cam.id);
                    const isPathNode = nodeIndex !== -1;
                    const pathDetails = isPathNode ? target.nodes[nodeIndex] : null;

                    return (
                      <Marker
                        key={cam.id}
                        position={[cam.lat, cam.lng]}
                        icon={createNodeIcon(cam.id, isPathNode, nodeIndex)}
                      >
                        <Popup>
                          <div className="p-1 min-w-[210px] text-xs font-sans">
                            <div className="flex items-center justify-between border-b border-[#1e2d45] pb-1 mb-1.5">
                              <span className="font-mono font-bold text-[#06b6d4]">{cam.id}</span>
                              <span className="text-[10px] text-slate-400">{cam.shortName}</span>
                            </div>
                            {isPathNode ? (
                              <div className="space-y-1 font-mono text-[11px]">
                                <div className="text-emerald-400 font-bold flex items-center justify-between">
                                  <span>Checkpoint #{nodeIndex + 1}</span>
                                  <span className="text-[10px] text-cyan-300">INTERCEPT</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Timestamp:</span>
                                  <span className="text-white font-bold">{pathDetails.time}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Speed:</span>
                                  <span className="text-white font-bold">{pathDetails.speed}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Direction:</span>
                                  <span className="text-cyan-300">{pathDetails.direction}</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[11px] text-[#64748b]">Surveillance Node · Active Optical Scanner</p>
                            )}

                            {/* Embedded Live Camera Feed Stream Preview */}
                            {cam.status === 'online' && (
                              <div className="mt-2 rounded overflow-hidden border border-[#1e2d45] bg-black">
                                <img
                                  src={api.getStreamUrl(cam.id)}
                                  alt={cam.name}
                                  className="w-full h-20 object-cover"
                                />
                                <div className="p-1 bg-[#0d1120] text-[9px] font-mono text-cyan-400 flex items-center justify-between">
                                  <span>LIVE CAM FEED</span>
                                  <span className="text-emerald-400">{cam.fps || 30} FPS</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>

                {/* Dark Theme & Layer Controls (Zero API Key, Zero Watermark) */}
                <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 bg-[#0d1120]/90 backdrop-blur-md border border-[#1e2d45] p-1 rounded-lg text-[10px] font-mono">
                  <button
                    onClick={() => setMapStyle('tactical')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      mapStyle === 'tactical' ? 'bg-[#06b6d4] text-black font-bold' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Tactical Dark
                  </button>
                  <button
                    onClick={() => setMapStyle('satellite')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      mapStyle === 'satellite' ? 'bg-[#06b6d4] text-black font-bold' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Night Satellite
                  </button>
                </div>

                {/* Trajectory legend pill on top of map */}
                <div className="absolute top-3 right-3 z-[1000] bg-[#0d1120]/90 backdrop-blur-md border border-[#1e2d45] p-2.5 rounded-lg text-[10px] font-mono space-y-1">
                  <div className="text-cyan-400 font-bold">ROUTE CHRONOLOGY:</div>
                  <div className="text-slate-300">1. Dhaula Kuan (14:10)</div>
                  <div className="text-slate-300">2. Karol Bagh (14:22)</div>
                  <div className="text-slate-300">3. Connaught Place (14:35)</div>
                  <div className="text-slate-300">4. India Gate (14:48)</div>
                </div>
              </div>
            </div>

            {/* RIGHT 40% (5 cols on 12-grid) */}
            <div className="lg:col-span-5 bg-[#111827] border border-[#1e2d45] rounded-xl p-5 flex flex-col justify-between">
              <div className="space-y-5">
                {/* Target Profile Card */}
                <div className="p-4 bg-[#0d1120] border border-[#1e2d45] rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748b]">
                      TRACKED TARGET
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-[#06b6d4] border border-cyan-500/30">
                      LIVE CORRELATION
                    </span>
                  </div>

                  <div className="mt-2">
                    <h3 className="text-2xl font-extrabold font-mono text-[#06b6d4] tracking-wider">
                      {target.plate}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {target.model}
                    </p>
                    <p className="text-[11px] text-[#64748b] font-mono mt-1">
                      Registered: {target.owner} · {target.category}
                    </p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-center">
                    <span className="text-[10px] text-[#64748b] font-mono block">DISTANCE</span>
                    <span className="text-sm font-bold font-mono text-white mt-1 block">
                      {target.totalDistance}
                    </span>
                  </div>

                  <div className="p-3 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-center">
                    <span className="text-[10px] text-[#64748b] font-mono block">DURATION</span>
                    <span className="text-sm font-bold font-mono text-white mt-1 block">
                      {target.duration}
                    </span>
                  </div>

                  <div className="p-3 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-center">
                    <span className="text-[10px] text-[#64748b] font-mono block">AVG SPEED</span>
                    <span className="text-sm font-bold font-mono text-[#22c55e] mt-1 block">
                      {target.avgSpeed}
                    </span>
                  </div>
                </div>

                {/* Camera Detection Timeline (4 Nodes) */}
                <div>
                  <h4 className="text-xs font-semibold text-[#f1f5f9] mb-2.5 flex items-center justify-between">
                    <span>Camera Detection Timeline (4 Nodes)</span>
                    <span className="text-[10px] font-mono text-[#06b6d4]">UTC+5:30</span>
                  </h4>

                  <div className="overflow-hidden border border-[#1e2d45] rounded-lg bg-[#0d1120]">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#161f35] text-[#64748b] font-mono text-[10px] uppercase border-b border-[#1e2d45]">
                        <tr>
                          <th className="p-2.5">Camera</th>
                          <th className="p-2.5">Location</th>
                          <th className="p-2.5">Time</th>
                          <th className="p-2.5">Speed</th>
                          <th className="p-2.5">Direction</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2d45] font-mono">
                        {target.nodes.map((node, idx) => (
                          <tr key={idx} className="hover:bg-[#111827]/80 transition-colors">
                            <td className="p-2.5 text-[#06b6d4] font-bold">
                              {node.camera}
                            </td>
                            <td className="p-2.5 text-slate-200 font-sans">
                              {node.location}
                            </td>
                            <td className="p-2.5 text-white font-bold">
                              {node.time}
                            </td>
                            <td className="p-2.5 text-[#22c55e]">
                              {node.speed}
                            </td>
                            <td className="p-2.5 text-slate-400">
                              {node.direction}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Export Forensic Report Button */}
              <div className="mt-6 pt-4 border-t border-[#1e2d45]">
                <button
                  onClick={handleExportPDF}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-lg transition-all shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2"
                >
                  {downloadSuccess ? (
                    <>
                      <FileCheck className="w-4 h-4 text-emerald-300" />
                      <span>Forensic Dossier Generated (PB10XX1234.pdf)</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Export Forensic Report (PDF)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
