import React, { useState, useEffect } from 'react';
import { ChevronRight, Cctv, Clock } from 'lucide-react';

export default function Topbar({ pageTitle = "Dashboard" }) {
  const [timeIST, setTimeIST] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istString = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setTimeIST(`${istString} IST`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 bg-[#0d1120] border-b border-[#1e2d45] px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Breadcrumbs Left */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[#64748b] font-medium tracking-wide">City Traffic Command</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#1e2d45]" />
        <span className="text-[#f1f5f9] font-semibold text-sm tracking-wide">{pageTitle}</span>
      </div>

      {/* Live System Status Right */}
      <div className="flex items-center gap-4 text-xs">
        {/* Live Feed Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#22c55e] font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider">Live Feed</span>
        </div>

        <div className="h-4 w-[1px] bg-[#1e2d45]" />

        {/* Cameras Status */}
        <div className="flex items-center gap-1.5 text-[#64748b]">
          <Cctv className="w-3.5 h-3.5 text-[#06b6d4]" />
          <span className="text-slate-300 font-medium">Cameras:</span>
          <span className="text-[#06b6d4] font-semibold font-mono">7/8 Online</span>
        </div>

        <div className="h-4 w-[1px] bg-[#1e2d45]" />

        {/* IST Clock */}
        <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-[#3b82f6]" />
          <span>{timeIST || '14:52:00 IST'}</span>
        </div>
      </div>
    </header>
  );
}
