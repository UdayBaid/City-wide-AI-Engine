import React, { useState, useEffect } from 'react';
import { Video, WifiOff, Camera } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { CAMERA_NODES } from '../data/mockData';

const INDIAN_SAMPLE_PLATES = [
  "DL01AB1044", "HR26BC4419", "DL03CC8899", "UP16AK5522", 
  "DL08CX9901", "PB10XX1234", "CH01TB9002", "DL12CP0045",
  "HR51AU7766", "UP14BT3399", "DL04CA1212", "RJ14CW9021",
  "DL09SV4590", "UK07TA6611", "DL02CQ3499", "PB02BK8801"
];

export default function LiveCameras() {
  const [cameras, setCameras] = useState(CAMERA_NODES);
  const [videoErrors, setVideoErrors] = useState({});

  // Cycle plates every 2 seconds for active cameras
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      setCameras((prev) =>
        prev.map((cam) => {
          if (cam.status === 'offline') return cam;
          const randomPlate = INDIAN_SAMPLE_PLATES[Math.floor(Math.random() * INDIAN_SAMPLE_PLATES.length)];
          const randomSpeed = Math.floor(Math.random() * 45) + 20;
          return {
            ...cam,
            lastPlate: randomPlate,
            lastSpeed: randomSpeed,
            lastSeen: timeStr
          };
        })
      );
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const handleVideoError = (camId) => {
    setVideoErrors((prev) => ({ ...prev, [camId]: true }));
  };

  return (
    <div className="flex bg-[#0a0d1a] min-h-screen text-[#f1f5f9]">
      <Sidebar />

      <div className="flex-1 ml-[220px] min-h-screen flex flex-col">
        <Topbar pageTitle="Live Cameras" />

        <main className="p-6 space-y-6 flex-1">
          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] border border-[#1e2d45] rounded-xl p-5">
            <div>
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#3b82f6]" />
                <h2 className="text-lg font-bold text-[#f1f5f9]">
                  City-Wide Surveillance Feeds (2×4 Matrix)
                </h2>
              </div>
              <p className="text-xs text-[#64748b] mt-1">
                Real-time optical feed monitoring with ANPR telemetry and neural bounding overlays
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-[#0d1120] border border-[#1e2d45] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
                <span className="text-xs font-mono font-medium text-slate-200">
                  Grid Status: <span className="text-[#06b6d4] font-bold">7 Online</span> / <span className="text-[#f59e0b] font-bold">1 Disconnected</span>
                </span>
              </div>
            </div>
          </div>

          {/* 2x4 Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {cameras.map((cam, idx) => {
              const isOffline = cam.status === 'offline';
              const hasVideoFailed = videoErrors[cam.id];

              return (
                <div
                  key={cam.id}
                  className="bg-[#111827] border border-[#1e2d45] rounded-xl overflow-hidden shadow-lg flex flex-col justify-between transition-all duration-200 hover:border-[#3b82f6]/50"
                >
                  {/* Top Bar */}
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
                      <span>{cam.id}</span>
                    </div>
                  </div>

                  {/* Video Area / Fallback Animation */}
                  <div className="relative w-full h-[180px] bg-[#0a0d1a] overflow-hidden flex items-center justify-center border-y border-[#1e2d45]/40">
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
                    ) : !hasVideoFailed ? (
                      <div className="w-full h-full relative">
                        <video
                          src={cam.videoSrc}
                          autoPlay
                          loop
                          muted
                          playsInline
                          onError={() => handleVideoError(cam.id)}
                          className="w-full h-full object-cover"
                        />
                        {/* Camera HUD Overlays */}
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 text-[9px] font-mono text-cyan-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                          <span>YOLO-V8·AI</span>
                        </div>
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 text-[9px] font-mono text-slate-300">
                          {cam.fps} FPS
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full relative flex flex-col items-center justify-center bg-[#070a14] p-3 select-none">
                        {/* Scanning beam animation */}
                        <div className="scanner-line" />
                        
                        <div className="relative z-10 flex flex-col items-center text-center space-y-1">
                          <Camera className="w-7 h-7 text-[#06b6d4]/70 mb-1 animate-pulse" />
                          <span className="text-[11px] font-mono font-bold text-slate-300">
                            OPTICAL STREAM ACTIVE
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400/90">
                            RADAR SCANNING: {cam.direction}
                          </span>
                        </div>

                        {/* Artificial bounding box overlay */}
                        <div className="absolute inset-4 border border-cyan-500/20 rounded pointer-events-none flex flex-col justify-between p-1 text-[9px] font-mono text-cyan-500/50">
                          <div className="flex justify-between">
                            <span>[+] LOCK</span>
                            <span>{cam.resolution}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>LAT: {cam.lat.toFixed(4)}</span>
                            <span>LNG: {cam.lng.toFixed(4)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Bar: Telemetry */}
                  <div className="p-3 bg-[#0d1120] text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[11px] text-[#64748b]">Last Read:</span>
                      <span className={`text-xs font-bold ${isOffline ? 'text-[#64748b]' : 'text-[#06b6d4]'}`}>
                        {cam.lastPlate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#64748b] mt-1 font-mono">
                      <span>Speed: {isOffline ? 'N/A' : `${cam.lastSpeed} km/h`}</span>
                      <span>{cam.lastSeen}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
