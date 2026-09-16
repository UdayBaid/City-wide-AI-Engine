import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Download, 
  CheckCircle2, 
  FileCode, 
  Archive, 
  FileSpreadsheet, 
  Sparkles
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api/client';

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.getReports().then(data => {
      setReports(data.reports || []);
    }).catch(err => console.error('Failed to load reports:', err));
  }, []);
  const [downloadingId, setDownloadingId] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState('Corridor Congestion & Speed Violation Audit');
  const [newReportFormat, setNewReportFormat] = useState('PDF');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = (rep) => {
    setDownloadingId(rep.id);
    setTimeout(() => {
      setDownloadingId(null);
      // Mock triggering file download
      const element = document.createElement("a");
      const file = new Blob([`AI Traffic Surveillance - Forensic Report: ${rep.title}\nReport ID: ${rep.id}\nDate: ${rep.date}`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${rep.id}_${rep.title.toLowerCase().replace(/\s+/g, '_')}.${rep.format.toLowerCase()}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1200);
  };

  const handleCreateReport = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      const newRep = {
        id: `REP-00${reports.length + 1}`,
        title: newReportTitle,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        format: newReportFormat,
        size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
        category: 'Custom Forensic'
      };
      setReports([newRep, ...reports]);
      setIsGenerating(false);
      setShowGenerateModal(false);
    }, 1200);
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'PDF':
        return <FileText className="w-4 h-4 text-red-400" />;
      case 'CSV':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
      case 'ZIP':
        return <Archive className="w-4 h-4 text-amber-400" />;
      default:
        return <FileCode className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="flex bg-[#0a0d1a] min-h-screen text-[#f1f5f9]">
      <Sidebar />

      <div className="flex-1 ml-[220px] min-h-screen flex flex-col">
        <Topbar pageTitle="Reports" />

        <main className="p-6 space-y-6 flex-1">
          {/* Header Banner */}
          <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#3b82f6]" />
                <h2 className="text-lg font-bold text-[#f1f5f9]">
                  Intelligence & Forensic Audit Reports
                </h2>
              </div>
            </div>

            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs rounded-lg transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Custom Report</span>
            </button>
          </div>

          {/* Reports Table Card */}
          <div className="bg-[#111827] border border-[#1e2d45] rounded-xl overflow-hidden">
            <div className="p-4 bg-[#0d1120] border-b border-[#1e2d45] flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Archived Reports & Forensic Exports ({reports.length})
              </span>
              <span className="text-[11px] font-mono text-[#06b6d4]">
                ENCRYPTED SHA-256 SIGNED
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0d1120]/70 text-[#64748b] font-mono text-[10px] uppercase border-b border-[#1e2d45]">
                  <tr>
                    <th className="p-3.5">Report ID</th>
                    <th className="p-3.5">Document Title</th>
                    <th className="p-3.5">Generated Date</th>
                    <th className="p-3.5">Format</th>
                    <th className="p-3.5">Size</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2d45] bg-[#0d1120]/30 font-mono text-[11px]">
                  {reports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-[#111827] transition-colors">
                      <td className="p-3.5 font-bold text-[#06b6d4]">
                        {rep.id}
                      </td>
                      <td className="p-3.5 font-sans font-medium text-slate-200">
                        <div className="flex items-center gap-2">
                          {getFormatIcon(rep.format)}
                          <span>{rep.title}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {rep.date}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#161f35] border border-[#1e2d45] text-slate-300">
                          {rep.format}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {rep.size}
                      </td>
                      <td className="p-3.5 text-right font-sans">
                        <button
                          onClick={() => handleDownload(rep)}
                          disabled={downloadingId === rep.id}
                          className="px-3 py-1.5 bg-[#0d1120] hover:bg-[#161f35] border border-[#1e2d45] hover:border-[#3b82f6] text-[#3b82f6] hover:text-blue-400 rounded-md text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                        >
                          {downloadingId === rep.id ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                              <span>Preparing...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal for Generating Custom Report */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1e2d45] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e2d45] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#06b6d4]" />
                <h3 className="text-sm font-bold text-white">Generate Custom Intelligence Report</h3>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Report Title / Subject</label>
                <input
                  type="text"
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-white focus:outline-none focus:border-[#3b82f6]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Export Format</label>
                <select
                  value={newReportFormat}
                  onChange={(e) => setNewReportFormat(e.target.value)}
                  className="w-full p-2.5 bg-[#0d1120] border border-[#1e2d45] rounded-lg text-white focus:outline-none focus:border-[#3b82f6]"
                >
                  <option value="PDF">PDF (Forensic Document)</option>
                  <option value="CSV">CSV (Raw Telemetry Matrix)</option>
                  <option value="ZIP">ZIP (Full Optical Evidence Bundle)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 bg-[#0d1120] hover:bg-[#161f35] border border-[#1e2d45] text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20"
                >
                  {isGenerating ? 'Compiling AI Telemetry...' : 'Generate & Export'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
