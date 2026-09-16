import React, { useState, useEffect } from 'react';
import { Video, WifiOff, Camera, RefreshCw, Maximize2, Shield, Activity, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api/client';

export default function LiveCameras() {
  const [cameras, setCameras] = useState([]);
  const [streamErrors, setStreamErrors] = useState({});
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

  
  const loadCameras = () => {
    setIsRefreshing(true);
    api.getCameras()
      .then((data) => {
        if (data && data.cameras) {
          setCameras(data.cameras);
          setBackendOnline(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load cameras:", err);
        setBackendOnline(false);
      })
      .finally(() => setIsRefreshing(false));
  };

  useEffect(() => {
    loadCameras();
  }, []);

  const handleStreamError = (camId) => {
    setStreamErrors((prev) => ({ ...prev, [camId]: true }));
  };

  const retryStream = (camId, e) => {
    if (e) e.stopPropagation();
    setStreamErrors((prev) => {
      const next = { ...prev };
      delete next[camId];
      return next;
    });
  };

  const onlineCount = cameras.filter((c) => c.status === 'online').length;
  const offlineCount = cameras.filter((c) => c.status === 'offline').length;

  return (
    <div className="flex bg-[#0a0d1a] min-h-screen text-[#f1f5f9]">
      <Sidebar />

      <div className="flex-1 ml-[220px] min-h-screen flex flex-col">
        <Topbar pageTitle="Live Cameras" />

        <main className="p-6 space-y-6 flex-1">
          {}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] border border-[#1e2d45] rounded-xl p-5">
            <div>
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#3b82f6]" />
                <h2 className="text-lg font-bold text-[#f1f5f9]">
                  City-Wide Surveillance Feeds
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-[#0d1120] border border-[#1e2d45] flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-[#22c55e] animate-pulse' : 'bg-[#ef4444]'}`}></span>
                <span className="text-xs font-mono font-medium text-slate-200">
                  Backend Stream: <span className="text-[#06b6d4] font-bold">{onlineCount} Online</span> / <span className="text-[#f59e0b] font-bold">{offlineCount} Disconnected</span>
                </span>
              </div>

              <button
                onClick={loadCameras}
                disabled={isRefreshing}
                className="px-3 py-1.5 bg-[#0d1120] hover:bg-[#161f35] border border-[#1e2d45] text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1.5"
                title="Refresh Camera Grid"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#3b82f6]' : ''}`} />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {cameras.map((cam, idx) => {
              const isOffline = cam.status === 'offline';
              const hasFailed = streamErrors[cam.id];
              const streamUrl = api.getStreamUrl(cam.id);

              return (
                <div
                  key={cam.id}
                  onClick={() => !isOffline && setSelectedCamera(cam)}
                  className={`bg-[#111827] border border-[#1e2d45] rounded-xl overflow-hidden shadow-lg flex flex-col justify-between transition-all duration-200 ${
                    !isOffline ? 'hover:border-[#3b82f6]/70 hover:shadow-cyan-900/20 cursor-pointer' : ''
                  }`}
                >
                  {}
                  <div className="p-3 bg-[#0d1120] border-b border-[#1e2d45]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        <span className="text-xs font-bold text-[#06b6d4] font-mono shrink-0">
                          {`C${idx + 1}`}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 truncate" title={cam.name}>
                          {cam.shortName}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          isOffline
                            ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30'
                            : 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                        }`}
                      >
                        {isOffline ? 'OFFLINE' : 'LIVE'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#64748b] mt-1 font-mono">
                      <span>REC · {cam.resolution}</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        {cam.id}
                      </span>
                    </div>
                  </div>

                  {}
                  <div className="relative w-full h-[185px] bg-[#070a14] overflow-hidden flex items-center justify-center border-y border-[#1e2d45]/40 group">
                    {isOffline ? (
                      <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                        <WifiOff className="w-8 h-8 text-[#f59e0b] animate-bounce" />
                        <span className="text-[11px] font-mono font-bold text-[#f59e0b] tracking-wider">
                          SIGNAL LOST — HEARTBEAT TIMEOUT
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Field maintenance ticket #TK-4402
                        </span>
                      </div>
                    ) : !hasFailed ? (
                      <div className="w-full h-full relative">
                        {}
                        <img
                          src={streamUrl}
                          alt={cam.name}
                          onError={() => handleStreamError(cam.id)}
                          className="w-full h-full object-cover select-none pointer-events-none"
                          loading="eager"
                        />

                        {}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 p-1.5 rounded-md border border-white/20 text-white">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full relative flex flex-col items-center justify-center bg-[#070a14] p-3 text-center">
                        <Camera className="w-7 h-7 text-[#06b6d4]/70 mb-2 animate-pulse" />
                        <span className="text-[11px] font-mono font-bold text-slate-300">
                          CONNECTING TO BACKEND FRAME...
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400/80 mt-1">
                          RADAR SCAN: {cam.direction}
                        </span>
                        <button
                          onClick={(e) => retryStream(cam.id, e)}
                          className="mt-3 px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 rounded text-[10px] text-blue-300"
                        >
                          Retry Feed
                        </button>
                      </div>
                    )}
                  </div>

                  {}
                  <div className="p-3 bg-[#0d1120] text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[11px] text-[#64748b]">Last Plate Read:</span>
                      <span className={`text-xs font-bold ${isOffline ? 'text-[#64748b]' : 'text-[#06b6d4]'}`}>
                        {cam.lastPlate || 'PB10XX1234'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#64748b] mt-1 font-mono">
                      <span>Speed: {isOffline ? 'N/A' : `${cam.lastSpeed} km/h`}</span>
                      <span className="text-emerald-400 font-semibold">{isOffline ? 'OFFLINE' : 'LIVE 30 FPS'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {}
          {selectedCamera && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#111827] border border-[#1e2d45] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col">
                {}
                <div className="p-4 bg-[#0d1120] border-b border-[#1e2d45] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{selectedCamera.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          {selectedCamera.id}
                        </span>
                      </h3>
                      <p className="text-xs text-[#64748b] font-mono">
                        Direction: {selectedCamera.direction} · Lat: {selectedCamera.lat} · Lng: {selectedCamera.lng}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCamera(null)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {}
                <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                  <img
                    src={api.getStreamUrl(selectedCamera.id)}
                    alt={selectedCamera.name}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 text-xs font-mono text-cyan-400 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>NEURAL OPTICAL STREAM: 1080P HD</span>
                  </div>
                </div>

                {}
                <div className="p-4 bg-[#0d1120] border-t border-[#1e2d45] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[#64748b] block text-[10px]">READ ACCURACY</span>
                    <span className="text-emerald-400 font-bold text-sm">{selectedCamera.accuracy}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[10px]">SCANNED TODAY</span>
                    <span className="text-white font-bold text-sm">{selectedCamera.todayReads?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[10px]">TARGET PLATE</span>
                    <span className="text-[#06b6d4] font-bold text-sm">{selectedCamera.lastPlate}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[10px]">CORRIDOR VELOCITY</span>
                    <span className="text-amber-400 font-bold text-sm">{selectedCamera.lastSpeed} km/h</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
