import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Star, 
  Search, 
  RefreshCw, 
  Trash2, 
  School, 
  User, 
  Hash, 
  Users, 
  Award, 
  Calendar,
  Filter,
  CheckCircle,
  ThumbsUp,
  FileText
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { sounds } from '../../services/soundAndLang.ts';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal.tsx';

interface FeedbackItem {
  id: string;
  name: string;
  registerNumber: string;
  collegeName: string;
  teamName: string;
  gameTitle: string;
  rating: number;
  feedback: string;
  totalScore: number;
  submittedAt: string;
}

export const AdminFeedback: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  
  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getFeedbackList();
      setFeedbackList(data);
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id: string, name: string) => {
    sounds.playClick();
    setDeleteTarget({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    sounds.playClick();
    try {
      await api.deleteFeedback(deleteTarget.id);
      setFeedbackList(prev => prev.filter(f => f.id !== deleteTarget.id));
      setActionNotice({ type: 'success', message: `Feedback from "${deleteTarget.name}" deleted.` });
      sounds.playCorrect();
      setDeleteTarget(null);
    } catch (err: any) {
      sounds.playWrong();
      setActionNotice({ type: 'error', message: `Delete failed: ${err.message}` });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // Filtered feedback
  const filtered = feedbackList.filter(item => {
    if (ratingFilter !== 'all' && item.rating.toString() !== ratingFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = 
        item.name.toLowerCase().includes(q) ||
        item.registerNumber.toLowerCase().includes(q) ||
        item.collegeName.toLowerCase().includes(q) ||
        item.teamName.toLowerCase().includes(q) ||
        item.feedback.toLowerCase().includes(q) ||
        item.gameTitle.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalReviews = feedbackList.length;
  const avgRating = totalReviews > 0
    ? (feedbackList.reduce((acc, f) => acc + (f.rating || 5), 0) / totalReviews).toFixed(1)
    : '5.0';
  const fiveStarsCount = feedbackList.filter(f => f.rating === 5).length;
  const fourStarsCount = feedbackList.filter(f => f.rating === 4).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
            PARTICIPANT EXPERIENCE & REVIEWS
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-cyan-400" />
            <span>Tournament Feedback & Ratings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Student team feedback submitted along with final registration standing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Refresh feedback"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Average Rating</span>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-black text-amber-400 font-mono">{avgRating}</p>
            <div className="flex items-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Feedbacks</span>
          <p className="text-2xl font-black text-white mt-1 font-mono">{totalReviews}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase">5-Star Ratings</span>
          <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">{fiveStarsCount}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase">4-Star Ratings</span>
          <p className="text-2xl font-black text-cyan-400 mt-1 font-mono">{fourStarsCount}</p>
        </div>
      </div>

      {/* Notification */}
      {actionNotice && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          actionNotice.type === 'success' 
            ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300' 
            : 'bg-rose-950/80 border border-rose-800 text-rose-300'
        }`}>
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate, team, college or text..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Filter Rating:</span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">All Stars</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars Only</option>
            <option value="3">3 Stars Only</option>
          </select>
        </div>
      </div>

      {/* Feedback List Cards */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Feedback Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {search || ratingFilter !== 'all'
              ? 'No feedback entries matched your current search criteria.'
              : 'Feedback submitted by candidate teams on the final investigation submission screen will be cataloged and displayed here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-3">
                {/* Top: Candidate and Rating */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        {item.name}
                      </span>
                      {item.teamName && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-semibold">
                          {item.teamName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <School className="w-3 h-3 text-slate-500" />
                      <span>{item.collegeName}</span>
                      <span className="text-slate-600">•</span>
                      <span className="font-mono text-slate-400">{item.registerNumber}</span>
                    </p>
                  </div>

                  {/* Stars Badge */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-950/60 border border-amber-800/80 shrink-0">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3.5 h-3.5 ${
                            starIdx <= (item.rating || 5)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold font-mono text-amber-300 ml-1">
                      {item.rating || 5}/5
                    </span>
                  </div>
                </div>

                {/* Feedback Comment Body */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <p className="text-xs text-slate-200 leading-relaxed font-sans italic">
                    "{item.feedback || 'Great investigation session and interesting evidence posters!'}"
                  </p>
                </div>
              </div>

              {/* Bottom Info & Delete */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-semibold">{item.gameTitle}</span>
                  <span>•</span>
                  <span>{item.totalScore} pts</span>
                  <span>•</span>
                  <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                </div>

                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                  title="Delete feedback"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={!!deleteTarget}
          title="Delete Candidate Feedback"
          message={`Are you sure you want to remove the feedback review submitted by "${deleteTarget.name}"? This action cannot be undone.`}
          confirmText="Delete Feedback"
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
