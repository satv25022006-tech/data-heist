import React, { useState } from 'react';
import { 
  Award, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter,
  Zap,
  HelpCircle,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { PlayerAttempt, Level } from '../../types/game.ts';
import { api } from '../../services/api.ts';
import { sounds } from '../../services/soundAndLang.ts';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal.tsx';

interface AdminResultsProps {
  attempts: PlayerAttempt[];
  levels: Level[];
  onRefresh?: () => void;
}

export const AdminResults: React.FC<AdminResultsProps> = ({
  attempts: initialAttempts,
  levels,
  onRefresh
}) => {
  const [attemptsList, setAttemptsList] = useState<PlayerAttempt[]>(initialAttempts);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single'; id: string; name: string } | { type: 'all' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  React.useEffect(() => {
    setAttemptsList(initialAttempts);
  }, [initialAttempts]);

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
        await api.deleteAttempt(deleteTarget.id);
        setAttemptsList(prev => prev.filter(a => a.id !== deleteTarget.id));
        setActionNotice({ type: 'success', message: `Attempt record for "${deleteTarget.name}" deleted.` });
      } else {
        await api.clearAllAttempts();
        setAttemptsList([]);
        setActionNotice({ type: 'success', message: 'All attempt records cleared.' });
      }
      sounds.playCorrect();
      setDeleteTarget(null);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      sounds.playWrong();
      setActionNotice({ type: 'error', message: `Delete failed: ${err.message}` });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const filtered = attemptsList.filter((a) => {
    if (filterLevel !== 'all' && a.levelId !== filterLevel) return false;
    if (filterDifficulty !== 'all' && a.levelDifficulty !== filterDifficulty) return false;
    if (searchTerm && !a.playerName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <span>Investigation Results & Attempt Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative records of completed investigations, time bonuses, penalties, and accuracy ratings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {attemptsList.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2.5 rounded-xl border border-rose-900/60 bg-rose-950/40 hover:bg-rose-900 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Delete all attempts"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear All Results</span>
            </button>
          )}

          <a
            href="/api/admin/results/export-csv"
            download="investigation_results.csv"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition shrink-0"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Results CSV</span>
          </a>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono">Case:</span>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
          >
            <option value="all">All Cases</option>
            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono">Difficulty:</span>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="relative max-w-xs flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by agent..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs"
          />
        </div>

        <span className="text-slate-500 font-mono ml-auto">
          Showing {filtered.length} of {attemptsList.length} attempts
        </span>
      </div>

      {/* Attempts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-mono uppercase">
                <th className="p-4">Agent</th>
                <th className="p-4">Case Level</th>
                <th className="p-4">Score</th>
                <th className="p-4">Stars</th>
                <th className="p-4">Accuracy</th>
                <th className="p-4">Time Spent</th>
                <th className="p-4">Time Saved</th>
                <th className="p-4">Status</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    No attempt records found.
                  </td>
                </tr>
              ) : (
                filtered.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 font-sans font-bold text-white">
                      {att.playerName}
                    </td>
                    <td className="p-4">
                      <span className="text-slate-200 block font-medium">{att.levelName}</span>
                      <span className="text-[10px] uppercase text-slate-500 font-mono">{att.levelDifficulty}</span>
                    </td>
                    <td className="p-4 text-cyan-400 font-bold">
                      {att.totalScore} pts
                    </td>
                    <td className="p-4 text-amber-400 font-bold">
                      {att.starsEarned} ★
                    </td>
                    <td className="p-4 text-emerald-400">
                      {att.accuracyPercentage}%
                    </td>
                    <td className="p-4 text-slate-300">
                      {att.totalTimeSpentSeconds}s
                    </td>
                    <td className="p-4 text-amber-400">
                      +{att.totalTimeSavedSeconds}s
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        att.isPassed ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {att.isPassed ? 'CLEARED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-[11px]">
                      {new Date(att.startedAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(att.id, `${att.playerName} - ${att.levelName}`)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition cursor-pointer"
                        title="Delete attempt record"
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
          title={deleteTarget.type === 'single' ? 'Delete Attempt Record' : 'Clear All Attempt Records'}
          itemTitle={deleteTarget.type === 'single' ? deleteTarget.name : `${attemptsList.length} Total Investigation Attempts`}
          message={deleteTarget.type === 'single' 
            ? `Are you sure you want to permanently delete the attempt log for "${deleteTarget.name}"?`
            : `Are you sure you want to clear ALL ${attemptsList.length} recorded investigation attempts? This will reset the attempt audit logs.`
          }
          confirmText={deleteTarget.type === 'single' ? 'Delete Attempt' : 'Clear All Attempts'}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
