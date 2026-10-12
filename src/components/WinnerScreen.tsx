import React, { useEffect, useState } from 'react';
import { Award, Star, Zap, Clock, ShieldCheck, Trophy, Sparkles, CheckCircle, RotateCcw, School, Hash, User, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LeaderboardEntry, ParticipantSubmission } from '../types/game.ts';
import { sounds } from '../services/soundAndLang.ts';

interface WinnerScreenProps {
  totalStars: number;
  totalScore: number;
  completedCount: number;
  totalTimeSaved: number;
  totalTimeSpent: number;
  leaderboard: LeaderboardEntry[];
  currentUserId?: string;
  submission?: ParticipantSubmission | null;
  onReturnToHub: () => void;
  currentLang?: string;
}

export const WinnerScreen: React.FC<WinnerScreenProps> = ({
  totalStars,
  totalScore,
  completedCount,
  totalTimeSaved,
  totalTimeSpent,
  leaderboard,
  currentUserId,
  submission,
  onReturnToHub,
  currentLang = 'en'
}) => {
  const isTa = currentLang === 'ta';

  useEffect(() => {
    // Grand winner celebration confetti
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const playerRankEntry = leaderboard.find(e => e.playerId === currentUserId);
  const calculatedRank = playerRankEntry?.rank || 1;

  const achievements = [
    { id: '1', title: 'Cyber Vanguard', desc: 'Solved the Apex Quantum breach', icon: ShieldCheck, unlocked: completedCount >= 1 },
    { id: '2', title: 'Master Cryptographer', desc: 'Decoded Blackwood study cipher', icon: Sparkles, unlocked: completedCount >= 2 },
    { id: '3', title: 'Syndicate Nemesis', desc: 'Neutralized Obsidian 7 deep vault', icon: Trophy, unlocked: completedCount >= 3 },
    { id: '4', title: 'Supersonic Deduction', desc: 'Saved over 30 seconds of time', icon: Zap, unlocked: totalTimeSaved >= 30 }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-center">

      {/* Top Banner */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/40 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/60 border border-indigo-400/50 text-indigo-300 text-xs font-mono font-bold uppercase tracking-widest">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>BUREAU COMMENDATION // CASE CLOSED</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500">
          CHIEF INSPECTOR STANDING
        </h1>

        <p className="max-w-xl mx-auto text-sm text-slate-300 leading-relaxed">
          Outstanding forensic excellence, Agent. You have successfully solved all published case files, pierced criminal syndicate encryption, and preserved international security.
        </p>

        {/* Big Rank Badge */}
        <div className="inline-block p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 shadow-xl">
          <span className="text-xs font-mono text-slate-400 uppercase block mb-1">Global Bureau Rank</span>
          <span className="text-4xl font-extrabold font-mono text-amber-400">
            #{calculatedRank}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-6 text-left">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono mb-1">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>TOTAL STARS</span>
            </div>
            <span className="text-2xl font-bold font-mono text-white">{totalStars}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-mono mb-1">
              <Award className="w-4 h-4" />
              <span>TOTAL POINTS</span>
            </div>
            <span className="text-2xl font-bold font-mono text-white">{totalScore}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono mb-1">
              <Zap className="w-4 h-4" />
              <span>TIME SAVED</span>
            </div>
            <span className="text-2xl font-bold font-mono text-white">+{totalTimeSaved}s</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
              <Clock className="w-4 h-4" />
              <span>TIME SPENT</span>
            </div>
            <span className="text-2xl font-bold font-mono text-white">{totalTimeSpent}s</span>
          </div>
        </div>
      </div>

      {/* Official Registered Candidate Certificate Card */}
      {submission && (
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border-2 border-cyan-500/60 text-left shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 font-black text-[10px] tracking-widest uppercase px-4 py-1 rounded-bl-xl font-mono">
            {isTa ? 'தரவுத்தளத்தில் பதிவு செய்யப்பட்டது' : 'PERSISTED IN DATABASE'}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                {isTa ? 'அதிகாரப்பூர்வ கல்லூரி சிம்போசியம் சான்றிதழ்' : 'OFFICIAL COLLEGE SYMPOSIUM ACCREDITATION'}
              </span>
              <h3 className="text-lg font-black text-white">
                {isTa ? 'பங்கேற்பாளர் சாதனைச் சான்றிதழ்' : 'Participant Clearance Certificate'}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase block">{isTa ? 'வேட்பாளர் பெயர்' : 'Candidate Name'}</span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                {submission.name}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase block">{isTa ? 'பதிவு எண்' : 'Register Number'}</span>
              <span className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-1.5 mt-0.5">
                <Hash className="w-3.5 h-3.5" />
                {submission.registerNumber}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase block">{isTa ? 'கல்லூரி / நிறுவனம்' : 'College / Institute'}</span>
              <span className="text-sm font-bold text-slate-200 flex items-center gap-1.5 mt-0.5 truncate" title={submission.collegeName}>
                <School className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {submission.collegeName}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase block">{isTa ? 'குழுப் பெயர்' : 'Team Designation'}</span>
              <span className="text-sm font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                {submission.teamName || (isTa ? 'தனி துப்பறிவாளர்' : 'Solo Investigator')}
              </span>
            </div>
          </div>

          {submission.feedback && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
              <div className="flex items-center text-amber-400 shrink-0 font-mono">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="font-bold ml-1">{submission.rating || 5}/5</span>
              </div>
              <p className="italic font-sans text-slate-300">"{submission.feedback}"</p>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Reference Token: <span className="text-slate-300">{submission.id}</span></span>
            <span>Recorded: {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>
      )}

      {/* Achievement Badges Showcase */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-left space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Bureau Honors & Badges</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.map((ach) => {
            const Icon = ach.icon;
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border flex items-center gap-4 transition ${
                  ach.unlocked
                    ? 'bg-slate-950 border-amber-500/40 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-600 opacity-60'
                }`}
              >
                <div className={`p-3 rounded-xl ${ach.unlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-600'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{ach.title}</h4>
                  <p className="text-xs text-slate-400">{ach.desc}</p>
                </div>
                {ach.unlocked && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 ml-auto shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Return to hub or restart to beginning */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => {
            sounds.playClick();
            onReturnToHub();
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-cyan-400/20 transition cursor-pointer hover:scale-[1.02]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Finish All Cases & Restart Game to Beginning</span>
        </button>
      </div>
    </div>
  );
};
