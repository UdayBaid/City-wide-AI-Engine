import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  ShieldAlert, 
  Save, 
  CheckCircle2, 
  Database
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function Settings() {
  const [engine, setEngine] = useState('YOLOv8x (High Precision/CUDA)');
  const [confidence, setConfidence] = useState(85);
  const [speedTrigger, setSpeedTrigger] = useState(60);
  const [autoFlagCrimeHotlist, setAutoFlagCrimeHotlist] = useState(true);
  const [opticalTrackingFPS, setOpticalTrackingFPS] = useState('60');
  const edgeDeviceCluster = 'BEL-EDGE-CLUSTER-NCR-01';
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex bg-[#0a0d1a] min-h-screen text-[#f1f5f9]">
      <Sidebar />

      <div className="flex-1 ml-[220px] min-h-screen flex flex-col">
        <Topbar pageTitle="Settings" />

        <main className="p-6 space-y-6 flex-1 max-w-4xl">
          {/* Header Banner */}
          <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5">
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-[#3b82f6]" />
              <h2 className="text-lg font-bold text-[#f1f5f9]">
                Surveillance Platform Settings
              </h2>
            </div>
            <p className="text-xs text-[#64748b] mt-1">
              Tune AI detection confidence, neural models and automated violation alert triggers
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* SECTION 1: Vision Detection Engine */}
            <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#1e2d45]">
                <Cpu className="w-4 h-4 text-[#06b6d4]" />
                <h3 className="text-sm font-semibold text-[#f1f5f9]">
                  Vision Detection Engine
                </h3>
              </div>

              {/* Object Detection Engine Dropdown */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Object Detection Engine
                </label>
                <select
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  className="w-full max-w-md p-2.5 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#3b82f6] cursor-pointer"
                >
                  <option value="YOLOv8x (High Precision/CUDA)">
                    YOLOv8x (High Precision / CUDA TensorRT Core)
                  </option>
                  <option value="YOLOv8m (Balanced / 60 FPS)">
                    YOLOv8m (Balanced / 60 FPS Edge)
                  </option>
                  <option value="YOLOv9-E (SOTA Optical Multi-Task)">
                    YOLOv9-E (SOTA Optical Multi-Task)
                  </option>
                  <option value="Faster-RCNN-ResNet101 (Legacy Reference)">
                    Faster-RCNN-ResNet101 (Legacy Reference)
                  </option>
                </select>
                <p className="text-[11px] text-[#64748b] mt-1">
                  Selected neural backend executes inference on NVIDIA Jetson / Tesla T4 nodes.
                </p>
              </div>

              {/* OCR Confidence Threshold Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-medium text-slate-300">
                    OCR Confidence Threshold
                  </label>
                  <span className="font-mono font-bold text-[#06b6d4] bg-[#0d1120] px-2.5 py-0.5 rounded border border-[#1e2d45]">
                    {confidence}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value)}
                  className="w-full max-w-md h-2 bg-[#0d1120] rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
                />
                <p className="text-[11px] text-[#64748b]">
                  Plates detected below this probability threshold will be queued for manual forensic verification.
                </p>
              </div>
            </div>

            {/* SECTION 2: Automated Violation Alarms */}
            <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#1e2d45]">
                <ShieldAlert className="w-4 h-4 text-[#ef4444]" />
                <h3 className="text-sm font-semibold text-[#f1f5f9]">
                  Automated Violation Alarms
                </h3>
              </div>

              {/* Speeding Trigger input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Speeding Violation Trigger (km/h)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="30"
                    max="150"
                    value={speedTrigger}
                    onChange={(e) => setSpeedTrigger(e.target.value)}
                    className="w-32 p-2.5 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-[#3b82f6]"
                  />
                  <span className="text-xs text-[#64748b]">km/h corridor upper velocity ceiling</span>
                </div>
              </div>

              {/* Checkbox: NCR Crime Database hotlist */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoFlagCrimeHotlist}
                    onChange={(e) => setAutoFlagCrimeHotlist(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded bg-[#0d1120] border-[#1e2d45] text-[#3b82f6] focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-medium text-slate-200">
                      Auto-flag plates matching NCR Crime Database hotlist
                    </span>
                    <p className="text-[11px] text-[#64748b] mt-0.5">
                      Sends real-time high-priority alerts to Delhi Police Command & Intercept units upon match.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Edge Node Hardware Cluster Config */}
            <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#1e2d45]">
                <Database className="w-4 h-4 text-[#22c55e]" />
                <h3 className="text-sm font-semibold text-[#f1f5f9]">
                  Hardware Telemetry & Node Cluster
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[#64748b] block mb-1">Primary Node Cluster ID</span>
                  <input
                    type="text"
                    disabled
                    value={edgeDeviceCluster}
                    className="w-full p-2.5 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-slate-400 text-xs"
                  />
                </div>
                <div>
                  <span className="text-[#64748b] block mb-1">Target Optical FPS</span>
                  <select
                    value={opticalTrackingFPS}
                    onChange={(e) => setOpticalTrackingFPS(e.target.value)}
                    className="w-full p-2.5 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-white text-xs"
                  >
                    <option value="30">30 FPS (Standard Energy Save)</option>
                    <option value="60">60 FPS (High Velocity Tracking)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-[#3b82f6] hover:bg-blue-600 text-white font-bold text-xs rounded-lg transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>

              {savedSuccess && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#22c55e] animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Platform settings saved & deployed to 8 edge nodes!</span>
                </div>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
