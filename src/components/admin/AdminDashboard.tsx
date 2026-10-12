import React from 'react';
import { 
  FolderKanban, 
  School, 
  Award, 
  Clock, 
  CheckCircle, 
  Trophy, 
  Settings, 
  ArrowRight,
  Shield,
  Users
} from 'lucide-react';
import { PlayerAttempt, LeaderboardEntry } from '../../types/game.ts';

interface AdminDashboardProps {
  metrics: {
    totalPlayers: number;
    totalLevels: number;
    activeLevels: number;
    lockedLevels: number;
    totalQuestions: number;
    publishedQuestions: number;
    draftQuestions: number;
    completedAttempts: number;
    recentActivity: PlayerAttempt[];
    leaderboard: LeaderboardEntry[];
  } | null;
  totalGamesCount?: number;
  totalSubmissionsCount?: number;
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  metrics,
  totalGamesCount = 3,
  totalSubmissionsCount = 0,
  onNavigateTab
}) => {
  if (!metrics) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        Loading Bureau Telemetry...
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Case Modules (Games)', 
      value: totalGamesCount, 
      icon: FolderKanban, 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-950/40 border-cyan-800/60',
      action: () => onNavigateTab('games'),
      actionLabel: 'Manage Games'
    },
    { 
      label: 'College Team Submissions', 
      value: totalSubmissionsCount > 0 ? totalSubmissionsCount : metrics.completedAttempts, 
      icon: School, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-950/40 border-emerald-800/60',
      action: () => onNavigateTab('participants'),
      actionLabel: 'View Submissions'
    },
    { 
      label: 'Completed Investigations', 
      value: metrics.completedAttempts, 
      icon: CheckCircle, 
      color: 'text-indigo-400', 
      bg: 'bg-indigo-950/40 border-indigo-800/60',
      action: () => onNavigateTab('results'),
      actionLabel: 'View Attempts'
    },
    { 
      label: 'Leaderboard Contenders', 
      value: metrics.leaderboard.length, 
      icon: Trophy, 
      color: 'text-amber-400', 
      bg: 'bg-amber-950/40 border-amber-800/60',
      action: () => onNavigateTab('leaderboard'),
      actionLabel: 'Open Leaderboard'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Bureau Command Center</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
              OPERATIONAL
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time control of College Team Submissions, symposium leaderboards, and scoring parameters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('participants')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <School className="w-4 h-4" />
            <span>College Team Records</span>
          </button>
          <button
            onClick={() => onNavigateTab('settings')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Game Settings</span>
          </button>
        </div>
      </div>

      {/* Stats KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              onClick={card.action}
              className={`p-5 rounded-2xl border ${card.bg} shadow-lg flex flex-col justify-between cursor-pointer hover:scale-[1.01] transition`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400 uppercase">{card.label}</span>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="text-2xl font-black font-mono text-white">{card.value}</div>
              </div>
              <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-[11px] text-cyan-400 font-mono">
                <span>{card.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Recent Attempts & Top Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Attempts (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Recent Field Investigation Attempts</span>
            </h3>
            <button
              onClick={() => onNavigateTab('results')}
              className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {metrics.recentActivity.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              No recent field attempts recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="pb-2.5">Agent</th>
                    <th className="pb-2.5">Case</th>
                    <th className="pb-2.5">Difficulty</th>
                    <th className="pb-2.5">Score</th>
                    <th className="pb-2.5">Stars</th>
                    <th className="pb-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {metrics.recentActivity.slice(0, 6).map((att) => (
                    <tr key={att.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 font-sans font-medium text-white">{att.playerName}</td>
                      <td className="py-2.5 text-slate-300">{att.levelName}</td>
                      <td className="py-2.5 uppercase text-[10px] text-slate-400">{att.levelDifficulty}</td>
                      <td className="py-2.5 text-cyan-400 font-bold">{att.totalScore} pts</td>
                      <td className="py-2.5 text-amber-400">{att.starsEarned} ★</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          att.isPassed ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {att.isPassed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Agents Leaderboard (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Top Bureau Agents</span>
            </h3>
            <button
              onClick={() => onNavigateTab('leaderboard')}
              className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Board</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {metrics.leaderboard.slice(0, 5).map((entry) => (
              <div
                key={entry.playerId}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[11px] ${
                    entry.rank === 1 ? 'bg-amber-500 text-slate-950' :
                    entry.rank === 2 ? 'bg-slate-300 text-slate-950' :
                    entry.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {entry.rank}
                  </span>
                  <div>
                    <h5 className="font-semibold text-slate-200">{entry.playerName}</h5>
                    <span className="text-[10px] text-slate-500 font-mono">{entry.completedLevelsCount} cases cleared</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-cyan-400 font-bold block">{entry.totalScore} pts</span>
                  <span className="text-amber-400 text-[10px]">{entry.totalStars} Stars</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
