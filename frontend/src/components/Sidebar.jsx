import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Video, 
  Car, 
  Search, 
  MapPin, 
  BarChart3, 
  Bell, 
  FileText, 
  Settings, 
  LogOut, 
  Cctv,
  ShieldCheck
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Live Cameras', path: '/cameras', icon: Video },
  { name: 'Vehicles', path: '/vehicles', icon: Car },
  { name: 'ANPR Records', path: '/anpr', icon: Search },
  { name: 'Trajectories', path: '/trajectories', icon: MapPin },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Alerts', path: '/alerts', icon: Bell },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <aside className="w-[220px] min-w-[220px] h-screen bg-[#0d1120] border-r border-[#1e2d45] flex flex-col justify-between select-none z-30 fixed left-0 top-0">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-[#1e2d45]/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#06b6d4]">
            <Cctv className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-[#06b6d4] leading-tight flex items-center gap-1.5">
              Traffic Command
            </h1>
            <p className="text-[11px] font-medium text-[#64748b] tracking-wider uppercase">
              BEL · SIH 2026
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-2.5 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600/15 text-[#3b82f6] border-l-4 border-[#3b82f6] shadow-[inset_0_0_12px_rgba(59,130,246,0.15)] font-semibold pl-2'
                      : 'text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#111827]/70'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile & Sign Out Footer */}
      <div className="p-3 border-t border-[#1e2d45] bg-[#0d1120]/95">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-[#f1f5f9] truncate">Command Admin</p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-[#06b6d4]" />
                <span className="text-[10px] text-[#06b6d4] font-mono font-bold tracking-wider">SYS-ADMIN</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors duration-150 group"
        >
          <LogOut className="w-3.5 h-3.5 text-red-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
