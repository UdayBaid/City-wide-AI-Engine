import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';
import { 
  BarChart3, 
  Layers, 
  Flame
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { 
  VELOCITY_DISTRIBUTION, 
  WEEKLY_CONGESTION_MATRIX, 
  TOP_OD_CORRIDORS
} from '../data/mockData';
import api from '../api/client';

const getMatrixCellColor = (level) => {
  switch (level) {
    case 'critical':
      return 'bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.6)]';
    case 'high':
      return 'bg-[#f59e0b]';
    case 'normal':
      return 'bg-[#0284c7]';
    case 'low':
    default:
      return 'bg-[#1e293b]/70';
  }
};

export default function Analytics() {
  const [trafficFlow, setTrafficFlow] = useState([]);
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    api.getTraffic().then(data => setTrafficFlow(data.flow24h || []));
    api.getCameras().then(data => setCameras(data.cameras || []));
  }, []);

  return (
    <div className="flex bg-[#0a0d1a] min-h-screen text-[#f1f5f9]">
      <Sidebar />

      <div className="flex-1 ml-[220px] min-h-screen flex flex-col">
        <Topbar pageTitle="Analytics" />

        <main className="p-6 space-y-6 flex-1">
          {/* Header Title Banner */}
          <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#3b82f6]" />
              <h2 className="text-lg font-bold text-[#f1f5f9]">
                City Traffic Analytics
              </h2>
            </div>
            <p className="text-xs text-[#64748b] mt-1">
              Historical trends, corridor velocity distribution & node health diagnostics
            </p>
          </div>

          {/* ROW 1: 2 Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Hourly Vehicle Volume */}
            <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#f1f5f9]">
                    Hourly Vehicle Volume (24 Hours)
                  </h3>
                  <p className="text-[11px] text-[#64748b]">Metropolitan throughput aggregated across 8 nodes</p>
                </div>
                <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-[#3b82f6] text-[10px] font-mono font-bold rounded">
                  24H METRIC
                </span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficFlow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="analyticsFlowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
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
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#analyticsFlowGrad)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Corridor Velocity Distribution */}
            <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#f1f5f9]">
                    Corridor Velocity Distribution
                  </h3>
                  <p className="text-[11px] text-[#64748b]">Real-time speed brackets captured by optical radar</p>
                </div>
                <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-[#06b6d4] text-[10px] font-mono font-bold rounded">
                  RADAR SCAN
                </span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={VELOCITY_DISTRIBUTION} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <XAxis dataKey="bracket" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip 
                      formatter={(val, name, item) => [`${val.toLocaleString()} vehicles`, item.payload.label]}
                      contentStyle={{ 
                        backgroundColor: '#0d1120', 
                        borderColor: '#1e2d45', 
                        borderRadius: '8px', 
                        fontSize: '11px',
                        color: '#f1f5f9'
                      }} 
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {VELOCITY_DISTRIBUTION.map((entry, index) => (
                        <Cell 
                          key={`cell-vel-${index}`} 
                          fill={index === 4 ? '#ef4444' : index === 3 ? '#f59e0b' : '#06b6d4'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ROW 2: Matrix & OD Corridors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Weekly Congestion Matrix (7 Days x 24h) */}
            <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#f59e0b]" />
                    <h3 className="text-sm font-semibold text-[#f1f5f9]">
                      Weekly Congestion Matrix (7 Days × 24h)
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm bg-[#1e293b]"></span> Low
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm bg-[#0284c7]"></span> Normal
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm bg-[#f59e0b]"></span> High
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm bg-[#ef4444]"></span> Critical
                    </span>
                  </div>
                </div>

                {/* 7x24 Matrix visualization */}
                <div className="space-y-1.5 overflow-x-auto pb-2">
                  <div className="flex items-center gap-1 pl-10 text-[9px] font-mono text-[#64748b]">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} className="w-[17px] text-center shrink-0">
                        {i % 4 === 0 ? i : ''}
                      </div>
                    ))}
                  </div>

                  {WEEKLY_CONGESTION_MATRIX.map((row) => (
                    <div key={row.day} className="flex items-center gap-1.5">
                      <span className="w-8 text-[11px] font-mono text-[#64748b] font-medium shrink-0">
                        {row.day}
                      </span>
                      <div className="flex items-center gap-1">
                        {row.hours.map((hObj) => (
                          <div
                            key={`${row.day}-${hObj.hour}`}
                            title={`${row.day} @ ${hObj.hour}:00 - Status: ${hObj.level.toUpperCase()}`}
                            className={`w-[17px] h-5 rounded-[2px] cursor-pointer transition-transform hover:scale-125 shrink-0 ${getMatrixCellColor(
                              hObj.level
                            )}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1e2d45] text-[11px] text-[#64748b] flex justify-between">
                <span>Peak Congestion Windows: 09:00 - 11:00 & 18:00 - 20:30 IST</span>
                <span className="text-[#06b6d4] font-mono">168 Temporal Cells</span>
              </div>
            </div>

            {/* RIGHT: Top 10 Origin-Destination Corridors */}
            <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#3b82f6]" />
                  <h3 className="text-sm font-semibold text-[#f1f5f9]">
                    Top 10 Origin-Destination Corridors
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">VEHICLES / DAY</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={TOP_OD_CORRIDORS.slice(0, 7)}
                    margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                  >
                    <XAxis type="number" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis 
                      dataKey="corridor" 
                      type="category" 
                      stroke="#cbd5e1" 
                      fontSize={10} 
                      tickLine={false}
                      width={170} 
                    />
                    <Tooltip 
                      formatter={(val) => [`${val.toLocaleString()} vehicles/day`, 'Traffic Volume']}
                      contentStyle={{ 
                        backgroundColor: '#0d1120', 
                        borderColor: '#1e2d45', 
                        borderRadius: '8px', 
                        fontSize: '11px',
                        color: '#f1f5f9'
                      }} 
                    />
                    <Bar dataKey="volume" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ROW 3: Optical Sensor & Camera Node Performance Table */}
          <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#f1f5f9]">
                  Optical Sensor & Camera Node Performance
                </h3>
                <p className="text-[11px] text-[#64748b]">Hardware telemetry and optical accuracy matrix</p>
              </div>
              <span className="text-[11px] font-mono text-[#06b6d4]">LIVE TELEMETRY</span>
            </div>

            <div className="overflow-x-auto border border-[#1e2d45] rounded-lg">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#0d1120] text-[#64748b] font-mono text-[10px] uppercase border-b border-[#1e2d45]">
                  <tr>
                    <th className="p-3">Camera ID</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Resolution</th>
                    <th className="p-3">Total Reads Today</th>
                    <th className="p-3">OCR Accuracy</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2d45] bg-[#0d1120]/50 font-mono text-[11px]">
                  {cameras.map((cam) => {
                    const isOffline = cam.status === 'offline';
                    return (
                      <tr key={cam.id} className="hover:bg-[#111827] transition-colors">
                        <td className="p-3 font-bold text-[#06b6d4]">{cam.id}</td>
                        <td className="p-3 font-sans font-medium text-slate-200">{cam.name}</td>
                        <td className="p-3 text-slate-400">{cam.resolution}</td>
                        <td className="p-3 text-white font-bold">{cam.todayReads.toLocaleString()}</td>
                        <td className="p-3 text-emerald-400 font-bold">{cam.accuracy}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              isOffline
                                ? 'bg-amber-500/20 text-[#f59e0b] border border-[#f59e0b]/30'
                                : 'bg-emerald-500/20 text-[#22c55e] border border-[#22c55e]/30'
                            }`}
                          >
                            {cam.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{cam.lastSeen}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
