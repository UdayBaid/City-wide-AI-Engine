import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CityMap from '../components/CityMap';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';
import { 
  Car, 
  Route, 
  Gauge, 
  AlertTriangle, 
  ChevronRight, 
  CheckCircle2, 
  TrendingUp
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api/client';

// (Google Maps CityMap component handles all map rendering)


export default function Dashboard() {
  const navigate = useNavigate();

  // Dynamic live stats with small 3-second variation
  const [stats, setStats] = useState({
    totalVehicles: 1281,
    activeTrajectories: 325,
    avgSpeed: 33,
    activeAlerts: 3
  });
  const [cameras, setCameras] = useState([]);
  const [trafficFlow, setTrafficFlow] = useState([]);
  const [congestedSegments, setCongestedSegments] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.getCameras().then(data => setCameras(data.cameras || []));
    api.getTraffic().then(data => {
      setTrafficFlow(data.flow24h || []);
      setCongestedSegments(data.congestedSegments || []);
    });
    api.getAlerts().then(data => {
      if (data && data.active) {
        setAlerts(data.active);
        setStats(prev => ({ ...prev, activeAlerts: data.active.length }));
      }
    });
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        totalVehicles: Math.max(1200, prev.totalVehicles + Math.floor(Math.random() * 7) - 3),
        activeTrajectories: Math.max(300, prev.activeTrajectories + Math.floor(Math.random() * 5) - 2),
        avgSpeed: Math.max(28, Math.min(42, prev.avgSpeed + Math.floor(Math.random() * 3) - 1)),
        activeAlerts: 3
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex bg-[#0a0d1a] min-h-screen text-[#f1f5f9]">
      {/* 220px Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-[220px] min-h-screen flex flex-col">
        <Topbar pageTitle="Dashboard" />

        <main className="p-6 space-y-6 flex-1">
          {/* ROW 1: 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Vehicles */}
            <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Total Vehicles
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#3b82f6]">
                  <Car className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl lg:text-3xl font-bold font-mono text-white tracking-tight">
                  {stats.totalVehicles.toLocaleString()}
                </h3>
                <p className="text-xs text-[#22c55e] font-medium flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +3.8% vs last hr
                </p>
              </div>
            </div>

            {/* Card 2: Active Trajectories */}
            <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Active Trajectories
                </span>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[#06b6d4]">
                  <Route className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl lg:text-3xl font-bold font-mono text-[#3b82f6] tracking-tight">
                  {stats.activeTrajectories}
                </h3>
                <p className="text-xs text-[#64748b] font-medium mt-1">
                  Correlated across 8 nodes
                </p>
              </div>
            </div>

            {/* Card 3: Avg Corridor Speed */}
            <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Avg Corridor Speed
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#f59e0b]">
                  <Gauge className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl lg:text-3xl font-bold font-mono text-white tracking-tight">
                  {stats.avgSpeed} <span className="text-sm font-normal text-[#64748b]">km/h</span>
                </h3>
                <p className="text-xs text-[#f59e0b] font-medium mt-1">
                  Peak congestion active
                </p>
              </div>
            </div>

            {/* Card 4: Active Alerts */}
            <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Active Alerts
                </span>
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[#ef4444]">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl lg:text-3xl font-bold font-mono text-[#ef4444] tracking-tight">
                  {stats.activeAlerts}
                </h3>
                <p className="text-xs text-[#ef4444] font-medium mt-1">
                  1 critical blacklist hit
                </p>
              </div>
            </div>
          </div>

          {/* ROW 2: Map (65%) + Alerts panel (35%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* MAP CARD: 65% (8 cols) */}
            <div className="lg:col-span-8 bg-[#111827] border border-[#1e2d45] rounded-xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-[#f1f5f9]">
                    🗺 Delhi Grid Surveillance Map
                  </span>
                  <span className="text-xs font-mono text-[#64748b] bg-[#0d1120] px-2 py-0.5 rounded border border-[#1e2d45]">
                    8 Surveillance Intersections
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#64748b]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
                    Active Node (7)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                    Offline Node (1)
                  </span>
                </div>
              </div>


              {/* Google Maps */}
              <CityMap cameras={cameras} height={360} />

            </div>

            {/* ALERTS PANEL: 35% (4 cols) */}
            <div className="lg:col-span-4 bg-[#111827] border border-[#1e2d45] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-[#f1f5f9]">
                      🔔 Recent Alerts
                    </h4>
                    <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 text-[#ef4444] text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-ping" />
                      LIVE
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#64748b]">AUTO-SYNC</span>
                </div>

                {/* Alert Items */}
                <div className="space-y-2.5">
                  {alerts.slice(0, 4).map((alert) => {
                    const isCrit = alert.severity === 'critical';
                    const isWarn = alert.severity === 'warning';
                    const borderClass = isCrit
                      ? 'border-l-4 border-l-[#ef4444]'
                      : isWarn
                      ? 'border-l-4 border-l-[#f59e0b]'
                      : 'border-l-4 border-l-[#3b82f6]';
                    const titleColor = isCrit
                      ? 'text-red-400'
                      : isWarn
                      ? 'text-amber-400'
                      : 'text-blue-400';

                    return (
                      <div
                        key={alert.id}
                        className={`p-3 bg-[#0d1120] ${borderClass} border border-[#1e2d45] rounded-r-lg`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-xs font-bold ${titleColor}`}>
                            {alert.title}
                          </span>
                          <span className="text-[10px] text-[#64748b] font-mono shrink-0 ml-2">
                            {alert.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748b] mt-1 line-clamp-2">
                          {alert.description}
                        </p>
                      </div>
                    );
                  })}

                  {alerts.length === 0 && (
                    <div className="p-4 text-center text-xs text-[#64748b]">
                      No active critical alerts recorded.
                    </div>
                  )}
                </div>
              </div>

              {/* View all alerts button */}
              <button
                onClick={() => navigate('/alerts')}
                className="mt-4 w-full py-2.5 px-3 bg-[#0d1120] hover:bg-[#161f35] border border-[#1e2d45] hover:border-[#3b82f6] text-xs font-semibold text-[#3b82f6] rounded-lg transition-all flex items-center justify-center gap-1 group"
              >
                <span>View All Alerts</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* ROW 3: 3 Analytics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: Traffic Flow (24 Hours) */}
            <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-semibold text-[#f1f5f9]">
                    Traffic Flow (24 Hours)
                  </h4>
                  <p className="text-[11px] text-[#64748b]">Hourly vehicle volume throughput</p>
                </div>
                <span className="text-[10px] font-mono text-[#06b6d4] bg-[#0d1120] px-2 py-0.5 rounded border border-[#1e2d45]">
                  LIVE AGG
                </span>
              </div>

              <div className="h-44 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficFlow} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0d1120', 
                        borderColor: '#1e2d45', 
                        borderRadius: '8px', 
                        fontSize: '11px',
                        color: '#f1f5f9'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="vehicles" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorVehicles)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 2: Top Congested Segments */}
            <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-semibold text-[#f1f5f9]">
                    Top Congested Segments
                  </h4>
                  <p className="text-[11px] text-[#64748b]">Real-time congestion severity index</p>
                </div>
                <span className="text-[10px] font-mono text-[#f59e0b] bg-[#0d1120] px-2 py-0.5 rounded border border-[#1e2d45]">
                  DELAY IDX
                </span>
              </div>

              <div className="h-44 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    layout="vertical" 
                    data={congestedSegments} 
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis 
                      dataKey="route" 
                      type="category" 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      width={110}
                    />
                    <Tooltip 
                      formatter={(val, name, item) => [`${val}% Congestion (${item.payload.speed})`, 'Index']}
                      contentStyle={{ 
                        backgroundColor: '#0d1120', 
                        borderColor: '#1e2d45', 
                        borderRadius: '8px', 
                        fontSize: '11px',
                        color: '#f1f5f9' 
                      }} 
                    />
                    <Bar dataKey="congestion" radius={[0, 4, 4, 0]}>
                      {congestedSegments.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.congestion > 80 ? '#ef4444' : entry.congestion > 70 ? '#f59e0b' : '#3b82f6'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 3: ANPR Engine Accuracy */}
            <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-semibold text-[#f1f5f9]">
                      ANPR Engine Accuracy
                    </h4>
                    <p className="text-[11px] text-[#64748b]">YOLOv8x + CRNN OCR Pipeline</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#22c55e]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="my-3">
                  <div className="text-4xl font-extrabold font-mono text-[#22c55e] tracking-tight">
                    94.2%
                  </div>
                  <p className="text-xs text-[#64748b] mt-1">
                    142,830 plates scanned today
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1e2d45] flex items-center justify-between text-xs font-mono">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#64748b] uppercase tracking-wider block">CONFIDENCE</span>
                  <span className="font-bold text-slate-200">0.96 Avg</span>
                </div>
                <div className="h-6 w-[1px] bg-[#1e2d45]" />
                <div className="space-y-0.5 text-right">
                  <span className="text-[10px] text-[#64748b] uppercase tracking-wider block">LATENCY</span>
                  <span className="font-bold text-[#06b6d4]">18ms</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
