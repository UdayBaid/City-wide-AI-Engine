import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BOOT_LOGS = [
  { prefix: '[OK]', text: 'Initializing Traffic Command Center...', color: 'green' },
  { prefix: '[OK]', text: 'Connecting to ANPR Camera Network (8 nodes)...', color: 'green' },
  { prefix: '[OK]', text: 'Loading YOLOv8 Detection Engine...', color: 'green' },
  { prefix: '[OK]', text: 'Establishing Secure Database Connection...', color: 'green' },
  { prefix: '[READY]', text: 'System Online — 8 Cameras Active', color: 'blue' },
];

export default function CountdownPage() {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Reveal lines one by one every 800ms
    const lineIntervals = [];

    BOOT_LOGS.forEach((log, index) => {
      const timeout = setTimeout(() => {
        setDisplayedLines((prev) => [...prev, log]);

        // When the last line [READY] is shown, wait 800ms and navigate to /login
        if (index === BOOT_LOGS.length - 1) {
          setTimeout(() => {
            navigate('/login');
          }, 800);
        }
      }, (index + 1) * 800);

      lineIntervals.push(timeout);
    });

    // Animate progress bar from 0 to 100% over 5 seconds (5000ms)
    const startTime = Date.now();
    const duration = 4800;
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(progressTimer);
      }
    }, 50);

    return () => {
      lineIntervals.forEach(clearTimeout);
      clearInterval(progressTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen w-full bg-[#0a0d1a] flex flex-col items-center justify-center p-4 select-none font-mono">
      {/* Terminal Card */}
      <div className="w-full max-w-xl bg-[#111827] border border-[#1e2d45] rounded-xl shadow-2xl shadow-cyan-950/20 overflow-hidden">
        {/* macOS style Title Bar */}
        <div className="bg-[#0d1120] border-b border-[#1e2d45] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ef4444] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#f59e0b] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#22c55e] inline-block"></span>
          </div>
          <span className="text-xs text-[#64748b] tracking-wider font-semibold font-mono">
            boot-sequence.sh
          </span>
          <div className="w-12 text-right">
            <span className="text-[10px] text-cyan-400/80 uppercase font-mono">ARM64</span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-6 space-y-3 min-h-[220px] bg-[#0a0d1a]/80">
          {displayedLines.map((line, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs tracking-wide leading-relaxed">
              <span
                className={`font-bold shrink-0 ${
                  line.color === 'green' ? 'text-[#22c55e]' : 'text-[#3b82f6]'
                }`}
              >
                {line.prefix}
              </span>
              <span className="text-[#f1f5f9]">{line.text}</span>
            </div>
          ))}

          {displayedLines.length < BOOT_LOGS.length && (
            <div className="flex items-center gap-2 text-xs text-[#64748b]">
              <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse"></span>
            </div>
          )}
        </div>

        {/* Progress Bar Section */}
        <div className="p-6 bg-[#0d1120] border-t border-[#1e2d45] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#64748b] font-medium">System Boot Status</span>
            <span className="text-[#3b82f6] font-bold font-mono">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-[#161f35] rounded-full overflow-hidden border border-[#1e2d45]">
            <div
              className="h-full bg-[#3b82f6] transition-all duration-75 ease-out shadow-[0_0_12px_rgba(59,130,246,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Version Text */}
      <div className="mt-8 text-center">
        <p className="text-xs text-[#64748b] font-sans tracking-wide">
          Urban Traffic Analytics System · Version 2.4.0
        </p>
        <p className="text-[11px] text-slate-500 font-mono mt-1">
          SIH 2026
        </p>
      </div>
    </div>
  );
}
