import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Search, 
  MapPin, 
  Eye
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api/client';

export default function Vehicles() {
  const navigate = useNavigate();
  const [allVehicles, setAllVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  useEffect(() => {
    api.getVehicles().then(data => {
      setAllVehicles(data.vehicleDatabase || []);
    }).catch(err => console.error('Failed to load vehicles:', err));
  }, []);

  const filteredVehicles = allVehicles.filter((veh) => {
    const matchesSearch = 
      veh.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veh.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veh.registeredCity.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'ALL' || veh.type.toLowerCase().includes(selectedType.toLowerCase());

    return matchesSearch && matchesType;
  });

  return (
    <div className="flex bg-[#0a0d1a] min-h-screen text-[#f1f5f9]">
      <Sidebar />

      <div className="flex-1 ml-[220px] min-h-screen flex flex-col">
        <Topbar pageTitle="Vehicles" />

        <main className="p-6 space-y-6 flex-1">
          {/* Header */}
          <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-[#3b82f6]" />
                <h2 className="text-lg font-bold text-[#f1f5f9]">
                  Vehicle Master Registry & Watchlist
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
              <span className="px-3 py-1.5 bg-[#0d1120] border border-[#1e2d45] rounded-lg">
                Total Vehicles: <span className="text-[#06b6d4] font-bold">{allVehicles.length}</span>
              </span>
            </div>
          </div>

          {/* Search & Type Filter */}
          <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Plate, Model or City..."
                  className="w-full pl-9 pr-3 py-2 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="pl-3 pr-8 py-2 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#3b82f6] cursor-pointer"
                >
                  <option value="ALL">All Vehicle Types</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="MPV">MPV</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vehicles Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredVehicles.map((veh) => {
              const isBlacklist = veh.flag.includes('BLACKLIST');
              const isViolator = veh.flag.includes('Violator');
              const isTracking = veh.flag.includes('Tracking');

              return (
                <div
                  key={veh.plate}
                  className={`bg-[#111827] border ${
                    isBlacklist
                      ? 'border-red-500/50 shadow-red-950/30'
                      : isViolator
                      ? 'border-amber-500/40'
                      : 'border-[#1e2d45]'
                  } rounded-xl p-5 flex flex-col justify-between shadow-lg hover:border-[#3b82f6]/50 transition-all`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-mono font-extrabold text-[#06b6d4] tracking-wider">
                        {veh.plate}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          isBlacklist
                            ? 'bg-red-500/20 text-[#ef4444] border border-red-500/30'
                            : isViolator
                            ? 'bg-amber-500/20 text-[#f59e0b] border border-amber-500/30'
                            : isTracking
                            ? 'bg-cyan-500/20 text-[#06b6d4] border border-cyan-500/30'
                            : 'bg-emerald-500/20 text-[#22c55e] border border-emerald-500/30'
                        }`}
                      >
                        {veh.flag}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1">
                      {veh.make} <span className="text-xs font-normal text-slate-400">({veh.color})</span>
                    </h4>

                    <div className="mt-3 space-y-1.5 p-3 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Category:</span>
                        <span className="text-slate-200">{veh.type}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>RTO Origin:</span>
                        <span className="text-slate-200">{veh.registeredCity}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Tax / Fitness:</span>
                        <span className={veh.taxStatus === 'Valid' ? 'text-emerald-400' : 'text-red-400'}>
                          {veh.taxStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1e2d45] flex items-center gap-2">
                    <button
                      onClick={() => navigate('/trajectories')}
                      className="flex-1 py-2 px-3 bg-[#0d1120] hover:bg-[#161f35] border border-[#1e2d45] hover:border-[#3b82f6] text-[#3b82f6] hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Trace Trajectory</span>
                    </button>
                    <button
                      onClick={() => navigate('/anpr')}
                      className="py-2 px-3 bg-[#0d1120] hover:bg-[#161f35] border border-[#1e2d45] text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-all"
                      title="View OCR Records"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
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
