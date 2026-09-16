import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  CheckCircle2, 
  Camera
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api/client';

export default function Alerts() {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [incidentLogs, setIncidentLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    api.getAlerts().then(data => {
      if (data) {
        setActiveAlerts(data.active || []);
        setIncidentLogs(data.historical || []);
      }
    }).catch(err => console.error("Failed to load alerts:", err));
  }, []);

  const handleResolveAlert = (alertId) => {
    const resolvedItem = activeAlerts.find((a) => a.id === alertId);
    if (!resolvedItem) return;

    // Call backend endpoint to resolve
    api.resolveAlert(alertId).catch((err) => console.warn("Backend resolve alert warning:", err));

    // Remove from active
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));

    // Append to historical incident logs
    setIncidentLogs((prev) => [
      {
        id: `INC-${Math.floor(Math.random() * 900) + 100}`,
        severity: resolvedItem.severity,
        type: resolvedItem.type,
        description: resolvedItem.title,
        camera: resolvedItem.camera,
        timestamp: 'Just now',
        status: 'Resolved'
      },
      ...prev
    ]);
  };

  // Filter incident logs based on tab
  const filteredIncidents = incidentLogs.filter((inc) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'Critical') return inc.severity === 'critical';
    if (activeTab === 'Warning') return inc.severity === 'warning';
    if (activeTab === 'Info') return inc.severity === 'info';
    if (activeTab === 'Resolved') return inc.status === 'Resolved';
    return true;
  });

  return (
    <div className="flex bg-[#0a0d1a] min-h-screen text-[#f1f5f9]">
      <Sidebar />

      <div className="flex-1 ml-[220px] min-h-screen flex flex-col">
        <Topbar pageTitle="Alerts" />

        <main className="p-6 space-y-6 flex-1">
          {/* Header Title */}
          <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#ef4444]" />
                <h2 className="text-lg font-bold text-[#f1f5f9]">
                  Active Real-Time Alerts
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-[#ef4444] text-xs font-bold rounded-lg font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse"></span>
                {activeAlerts.length} PENDING ACTION
              </span>
            </div>
          </div>

          {/* TOP SECTION: Active Alert Cards in a Row / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeAlerts.map((alert) => {
              const isCrit = alert.severity === 'critical';
              const isWarn = alert.severity === 'warning';
              const borderColor = isCrit 
                ? 'border-l-4 border-l-[#ef4444]' 
                : isWarn 
                ? 'border-l-4 border-l-[#f59e0b]' 
                : 'border-l-4 border-l-[#3b82f6]';

              const badgeColor = isCrit
                ? 'bg-red-500/20 text-[#ef4444] border-red-500/30'
                : isWarn
                ? 'bg-amber-500/20 text-[#f59e0b] border-amber-500/30'
                : 'bg-blue-500/20 text-[#3b82f6] border-blue-500/30';

              return (
                <div
                  key={alert.id}
                  className={`bg-[#111827] border border-[#1e2d45] ${borderColor} rounded-r-xl p-5 flex flex-col justify-between shadow-lg hover:border-r-[#3b82f6]/40 transition-all`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                        {alert.severity.toUpperCase()} · {alert.type}
                      </span>
                      <span className="text-[11px] font-mono text-[#64748b]">
                        {alert.timestamp}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                      {alert.title}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {alert.description}
                    </p>

                    <div className="p-2.5 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-[11px] font-mono flex items-center justify-between text-slate-300 mb-4">
                      <div className="flex items-center gap-1.5 truncate">
                        <Camera className="w-3.5 h-3.5 text-[#06b6d4]" />
                        <span className="truncate">{alert.camera}</span>
                      </div>
                      {alert.plate !== 'N/A' && (
                        <span className="font-bold text-[#06b6d4] shrink-0">{alert.plate}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleResolveAlert(alert.id)}
                    className="w-full py-2 px-3 bg-[#0d1120] hover:bg-[#161f35] border border-[#1e2d45] hover:border-[#22c55e] text-xs font-semibold text-[#22c55e] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Resolve Alert</span>
                  </button>
                </div>
              );
            })}

            {activeAlerts.length === 0 && (
              <div className="col-span-full p-8 bg-[#111827] border border-[#1e2d45] rounded-xl text-center">
                <CheckCircle2 className="w-10 h-10 text-[#22c55e] mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white">All Clear — Zero Active Violations</h3>
                <p className="text-xs text-[#64748b] mt-1">Grid parameters operating within nominal thresholds.</p>
              </div>
            )}
          </div>

          {/* BOTTOM SECTION: Historical Incident Logs Table */}
          <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#f1f5f9]">
                  Historical Incident Logs
                </h3>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1.5 bg-[#0d1120] p-1 rounded-lg border border-[#1e2d45]">
                {['ALL', 'Critical', 'Warning', 'Info', 'Resolved'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-[#3b82f6] text-white shadow font-semibold'
                        : 'text-[#64748b] hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-[#1e2d45] rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0d1120] text-[#64748b] font-mono text-[10px] uppercase border-b border-[#1e2d45]">
                  <tr>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Camera Node</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2d45] bg-[#0d1120]/40 font-mono text-[11px]">
                  {filteredIncidents.map((log) => {
                    const isCrit = log.severity === 'critical';
                    const isWarn = log.severity === 'warning';

                    return (
                      <tr key={log.id} className="hover:bg-[#111827] transition-colors font-sans">
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              isCrit
                                ? 'bg-red-500/20 text-[#ef4444]'
                                : isWarn
                                ? 'bg-amber-500/20 text-[#f59e0b]'
                                : 'bg-blue-500/20 text-[#3b82f6]'
                            }`}
                          >
                            {log.severity}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-200">{log.type}</td>
                        <td className="p-3 text-slate-300">{log.description}</td>
                        <td className="p-3 text-[#06b6d4] font-mono">{log.camera}</td>
                        <td className="p-3 text-slate-400 font-mono text-[10px]">{log.timestamp}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono ${
                              log.status === 'Active'
                                ? 'bg-red-500/20 text-[#ef4444]'
                                : log.status === 'Investigating'
                                ? 'bg-amber-500/20 text-[#f59e0b]'
                                : 'bg-emerald-500/20 text-[#22c55e]'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
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
