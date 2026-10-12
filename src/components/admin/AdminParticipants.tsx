import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  Trash2, 
  School, 
  Hash, 
  Award, 
  Star, 
  Clock, 
  CheckCircle, 
  RefreshCw,
  Zap,
  Filter
} from 'lucide-react';
import { ParticipantSubmission } from '../../types/game.ts';
import { api } from '../../services/api.ts';
import { sounds } from '../../services/soundAndLang.ts';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal.tsx';

export const AdminParticipants: React.FC = () => {
  const [submissions, setSubmissions] = useState<ParticipantSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState('all');

  // In-app delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single'; id: string; name: string } | { type: 'all' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getParticipantSubmissions(search);
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load participant submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleDelete = (id: string, name: string) => {
    sounds.playClick();
    setDeleteTarget({ type: 'single', id, name });
  };

  const handleClearAll = () => {
    sounds.playClick();
    setDeleteTarget({ type: 'all' });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    sounds.playClick();
    try {
      if (deleteTarget.type === 'single') {
        await api.deleteParticipantSubmission(deleteTarget.id);
        setSubmissions(prev => prev.filter(s => s.id !== deleteTarget.id));
        setActionNotice({ type: 'success', message: `Participant record for "${deleteTarget.name}" deleted.` });
      } else {
        await api.clearAllParticipantSubmissions();
        setSubmissions([]);
        setActionNotice({ type: 'success', message: 'All candidate submissions cleared.' });
      }
      sounds.playCorrect();
      setDeleteTarget(null);
    } catch (err: any) {
      sounds.playWrong();
      setActionNotice({ type: 'error', message: `Delete failed: ${err.message}` });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleExportCSV = () => {
    sounds.playClick();
    window.location.href = '/api/admin/participant-submissions/export-csv';
  };

  // Filtered
  const filtered = submissions.filter(s => {
    if (selectedGameFilter !== 'all' && s.gameTitle !== selectedGameFilter) return false;
    return true;
  });

  const uniqueGames = Array.from(new Set(submissions.map(s => s.gameTitle).filter(Boolean)));
  const uniqueCollegesCount = new Set(submissions.map(s => s.collegeName.toLowerCase())).size;
  const topScore = submissions.reduce((max, s) => Math.max(max, s.totalScore), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
            COLLEGE SYMPOSIUM & EVENT RECORDS
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <School className="w-6 h-6 text-cyan-400" />
            <span>Participant Team Submissions</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official candidate records submitted upon investigation completion (Name, Reg No, College & Team).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Refresh submissions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {submissions.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2.5 rounded-xl border border-rose-900/60 bg-rose-950/40 hover:bg-rose-900 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Delete all candidate submissions"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear All</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Official CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Submissions</span>
          <p className="text-2xl font-black text-white mt-1 font-mono">{submissions.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Unique Colleges</span>
          <p className="text-2xl font-black text-cyan-400 mt-1 font-mono">{uniqueCollegesCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Tournament High Score</span>
          <p className="text-2xl font-black text-amber-400 mt-1 font-mono">{topScore} pts</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Database Status</span>
          <p className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Persisted
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name, reg no, college, team..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {uniqueGames.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedGameFilter}
              onChange={(e) => setSelectedGameFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Case Operations</option>
              {uniqueGames.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Register Number</th>
                <th className="py-3 px-4">College / Institution</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Case Operation</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-center">Stars</th>
                <th className="py-3 px-4 text-center">Accuracy</th>
                <th className="py-3 px-4 text-center">Time Saved</th>
                <th className="py-3 px-4 text-center">Feedback</th>
                <th className="py-3 px-4 text-right">Submitted</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500 font-mono">
                    No participant submissions found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {item.registerNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap max-w-[180px] truncate" title={item.collegeName}>
                      {item.collegeName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 text-[11px] text-cyan-300">
                        {item.teamName || 'Solo'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap max-w-[160px] truncate" title={item.gameTitle}>
                      {item.gameTitle}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-cyan-400">
                      {item.totalScore}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-400">
                      {item.totalStars} ★
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-emerald-400">
                      {item.accuracyPercentage}%
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-indigo-400">
                      +{item.totalTimeSavedSeconds}s
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {item.rating ? (
                        <div className="inline-flex items-center gap-1 text-amber-400 font-mono text-[11px]" title={item.feedback || 'No comments'}>
                          <span>{item.rating}</span>
                          <Star className="w-3 h-3 fill-amber-400" />
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[11px] font-mono text-slate-400 whitespace-nowrap">
                      {new Date(item.submittedAt).toLocaleDateString()} {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition cursor-pointer"
                        title="Delete candidate submission"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Toast Notification */}
      {actionNotice && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in ${
          actionNotice.type === 'success' 
            ? 'bg-emerald-950 border-emerald-700 text-emerald-200' 
            : 'bg-rose-950 border-rose-700 text-rose-200'
        }`}>
          {actionNotice.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* Reusable In-App Confirm Delete Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={Boolean(deleteTarget)}
          title={deleteTarget.type === 'single' ? 'Delete Candidate Record' : 'Clear All Candidate Submissions'}
          itemTitle={deleteTarget.type === 'single' ? deleteTarget.name : `${submissions.length} Total Registered Candidate Submissions`}
          message={deleteTarget.type === 'single' 
            ? `Are you sure you want to delete the submission record for "${deleteTarget.name}"? This action cannot be reversed.`
            : `Are you sure you want to delete ALL ${submissions.length} candidate team submissions? This will completely reset the symposium participant records list.`
          }
          confirmText={deleteTarget.type === 'single' ? 'Delete Record' : 'Clear All Records'}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
