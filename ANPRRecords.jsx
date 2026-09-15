import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { ANPR_RECORDS_MOCK, CAMERA_NODES } from '../data/mockData';

export default function ANPRRecords() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCamera, setSelectedCamera] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortField, setSortField] = useState('timestamp');
  const [sortAsc, setSortAsc] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Filtering
  const filteredRecords = ANPR_RECORDS_MOCK.filter((rec) => {
    const matchesSearch = 
      rec.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCamera = selectedCamera === 'ALL' || rec.camera === selectedCamera;
    const matchesStatus = selectedStatus === 'ALL' || rec.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesCamera && matchesStatus;
  });

  // Sorting
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (sortField === 'speed') {
      aVal = parseInt(a.speed, 10);
      bVal = parseInt(b.speed, 10);
    }
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportCSV = () => {
    const headers = "Plate,VehicleModel,Camera,Location,Timestamp,Speed,Status,Confidence\n";
    const rows = sortedRecords.map(r => `"${r.plate}","${r.vehicleModel}","${r.camera}","${r.location}","${r.timestamp}","${r.speed}","${r.status}","${r.confidence}"`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anpr_records_${Date.now()}.csv`;
    a.click();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="flex bg-[#0a0d1a] min-h-screen text-[#f1f5f9]">
      <Sidebar />

      <div className="flex-1 ml-[220px] min-h-screen flex flex-col">
        <Topbar pageTitle="ANPR Records" />

        <main className="p-6 space-y-6 flex-1">
          {/* Header Banner */}
          <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[#3b82f6]" />
                <h2 className="text-lg font-bold text-[#f1f5f9]">
                  ANPR Telemetry & Detection Records
                </h2>
              </div>
              <p className="text-xs text-[#64748b] mt-1">
                Real-time optical character recognition indexed from 8 Delhi surveillance nodes
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <span className="px-3 py-1.5 bg-[#0d1120] border border-[#1e2d45] rounded-lg">
                Total Matches: <span className="text-[#06b6d4] font-bold">{sortedRecords.length}</span>
              </span>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Plate Search input */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Plate, Location, Model..."
                  className="w-full pl-9 pr-3 py-2 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              {/* Camera dropdown filter */}
              <div className="relative">
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="pl-3 pr-8 py-2 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#3b82f6] cursor-pointer"
                >
                  <option value="ALL">All Camera Nodes</option>
                  {CAMERA_NODES.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.id} — {cam.shortName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="pl-3 pr-8 py-2 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#3b82f6] cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Clear">Clear</option>
                  <option value="Blacklist">Blacklist</option>
                  <option value="Speeding">Speeding</option>
                </select>
              </div>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-[#0d1120] hover:bg-[#161f35] border border-[#1e2d45] hover:border-[#3b82f6] text-xs font-semibold text-slate-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#06b6d4]" />
              <span>{downloadSuccess ? 'Exported CSV!' : 'Export CSV'}</span>
            </button>
          </div>

          {/* Records Table */}
          <div className="bg-[#111827] border border-[#1e2d45] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0d1120] text-[#64748b] font-mono text-[10px] uppercase border-b border-[#1e2d45]">
                  <tr>
                    <th 
                      onClick={() => handleSort('plate')}
                      className="p-3.5 cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Plate Number</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="p-3.5">Vehicle Profile</th>
                    <th className="p-3.5">Camera Node</th>
                    <th className="p-3.5">Location</th>
                    <th 
                      onClick={() => handleSort('timestamp')}
                      className="p-3.5 cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Timestamp</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('speed')}
                      className="p-3.5 cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Speed</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2d45] bg-[#0d1120]/40 font-mono text-[11px]">
                  {sortedRecords.map((rec) => {
                    const isBlacklist = rec.status === 'Blacklist';
                    const isSpeeding = rec.status === 'Speeding';

                    return (
                      <tr key={rec.id} className="hover:bg-[#111827] transition-colors">
                        <td className="p-3.5 font-bold text-[#06b6d4] tracking-wider text-xs">
                          {rec.plate}
                        </td>
                        <td className="p-3.5 font-sans text-slate-300">
                          {rec.vehicleModel}
                        </td>
                        <td className="p-3.5 text-[#3b82f6] font-bold">
                          {rec.camera}
                        </td>
                        <td className="p-3.5 font-sans text-slate-200">
                          {rec.location}
                        </td>
                        <td className="p-3.5 text-slate-400">
                          {rec.timestamp}
                        </td>
                        <td className="p-3.5 text-white font-bold">
                          {rec.speed}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isBlacklist
                                ? 'bg-red-500/20 text-[#ef4444] border border-red-500/30'
                                : isSpeeding
                                ? 'bg-amber-500/20 text-[#f59e0b] border border-amber-500/30'
                                : 'bg-emerald-500/20 text-[#22c55e] border border-emerald-500/30'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-sans">
                          <button
                            onClick={() => navigate('/trajectories')}
                            className="px-3 py-1 bg-[#3b82f6]/10 hover:bg-[#3b82f6] text-[#3b82f6] hover:text-white border border-[#3b82f6]/30 rounded-md text-xs font-medium transition-all"
                          >
                            Track
                          </button>
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
