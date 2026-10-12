import React, { useEffect } from 'react';
import { 
  Award, 
  Star, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ChevronRight, 
  Home, 
  Zap, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlayerAttempt, Level } from '../types/game.ts';
import { TRANSLATIONS } from '../services/soundAndLang.ts';

interface ResultViewProps {
  attempt: PlayerAttempt;
  levels: (Level & { isUnlocked: boolean; lockReason?: string; isCompleted?: boolean })[];
  currentLang: string;
  onDeployNextLevel?: (levelId: string) => void;
  onReplayLevel: (levelId: string) => void;
  onReturnToHub: () => void;
  onViewWinnerScreen: () => void;
  onFinishGame?: () => void;
  onRestartToBeginning?: () => void;
  onOpenAdmin?: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  attempt,
  levels,
  currentLang,
  onDeployNextLevel,
  onReplayLevel,
  onReturnToHub,
  onViewWinnerScreen,
  onFinishGame,
  onRestartToBeginning,
  onOpenAdmin
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Trigger victory confetti on pass
  useEffect(() => {
    if (attempt.isPassed && attempt.starsEarned >= 2) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [attempt.isPassed, attempt.starsEarned]);

  // Current level and next level lookup
  const currentLevelIndex = levels.findIndex(l => l.id === attempt.levelId);
  const nextLevel = currentLevelIndex >= 0 && currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : null;

  // Determine if next level is unlocked (either from backend OR because current attempt achieved required stars)
  const isCurrentLevelJustCompleted = attempt.isPassed && attempt.starsEarned >= 1;
  const earnedSufficientStars = attempt.starsEarned >= 2;
  const isNextLevelUnlocked = Boolean(
    nextLevel && (
      nextLevel.isUnlocked ||
      (isCurrentLevelJustCompleted && earnedSufficientStars) ||
      (nextLevel.unlockRequirements?.requiredPreviousLevelId === attempt.levelId && earnedSufficientStars) ||
      earnedSufficientStars
    )
  );

  // Check if all levels are completed
  const allLevelsDone = levels.every(l => l.isCompleted || (l.id === attempt.levelId && attempt.isPassed));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Top Victory / Defeat Dossier Card */}
      <div className={`p-6 md:p-8 rounded-3xl border shadow-2xl relative overflow-hidden text-center space-y-4 ${
        attempt.isPassed 
          ? 'bg-gradient-to-b from-slate-900 to-emerald-950/40 border-emerald-500/40' 
          : 'bg-gradient-to-b from-slate-900 to-rose-950/40 border-rose-500/40'
      }`}>
        {/* Badge status */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-slate-950 border border-slate-700">
          {attempt.isPassed ? (
            <span className="text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              {t.casePassed}
            </span>
          ) : (
            <span className="text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {t.caseFailed}
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          Case Clearance Report: {attempt.levelName}
        </h1>

        {/* Stars Earned */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {[1, 2, 3].map((starIndex) => {
            const isEarned = starIndex <= attempt.starsEarned;
            return (
              <div
                key={starIndex}
                className={`p-3 rounded-2xl border transition-all ${
                  isEarned
                    ? 'bg-amber-500/20 border-amber-400 text-amber-400 scale-110 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-600'
                }`}
              >
                <Star className={`w-8 h-8 ${isEarned ? 'fill-amber-400' : ''}`} />
              </div>
            );
          })}
        </div>

        {/* Summary Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">{t.totalScore}</span>
            <span className="text-xl font-bold font-mono text-cyan-400">{attempt.totalScore}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">{t.accuracy}</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{attempt.accuracyPercentage}%</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">{t.timeSpent}</span>
            <span className="text-xl font-bold font-mono text-slate-200">{attempt.totalTimeSpentSeconds}s</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">{t.timeSaved}</span>
            <span className="text-xl font-bold font-mono text-amber-400 flex items-center justify-center gap-1">
              <Zap className="w-4 h-4" />
              +{attempt.totalTimeSavedSeconds}s
            </span>
          </div>
        </div>
      </div>

      {/* Next Case Clearance Status / Unlock Notice */}
      {nextLevel ? (
        <div className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-5 transition shadow-2xl ${
          isNextLevelUnlocked
            ? 'bg-gradient-to-r from-[#0b172d] via-[#092237] to-[#071d2e] border-cyan-400/80 shadow-cyan-950/60 ring-1 ring-cyan-400/40'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-0.5 rounded ${
                isNextLevelUnlocked ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}>
                {isNextLevelUnlocked ? 'STAGE UNLOCKED' : 'STAGE LOCKED'}
              </span>
              <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
                NEXT UPCOMING CASE: {nextLevel.name}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-medium">
              {isNextLevelUnlocked
                ? `Security clearance confirmed! You cleared ${attempt.levelName} with ${attempt.starsEarned} stars. Ready for immediate field deployment.`
                : `Locked: ${nextLevel.lockReason || 'Requires at least 2 stars on previous stages.'}`}
            </p>
          </div>

          {isNextLevelUnlocked && onDeployNextLevel && (
            <button
              onClick={() => onDeployNextLevel(nextLevel.id)}
              className="px-6 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-400/25 shrink-0 transition cursor-pointer hover:scale-[1.03]"
            >
              <span>PROCEED TO NEXT LEVEL</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      ) : allLevelsDone ? (
        <div className="p-5 rounded-2xl bg-indigo-950/60 border border-indigo-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h3 className="font-bold text-indigo-200 text-sm">
              All Investigation Cases Completed!
            </h3>
            <p className="text-xs text-indigo-300/80">
              You have neutralized every active syndicate threat in the database.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-center sm:justify-end">
            <button
              onClick={onViewWinnerScreen}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Open Winner Ceremony</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* EXHIBIT BY EXHIBIT AUDIT RECAP */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <span>Forensic Breakdown & Deduction Logs</span>
          <span className="text-xs font-mono text-slate-500">({attempt.answers.length} Exhibits)</span>
        </h3>

        <div className="space-y-3">
          {attempt.answers.map((ans, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all ${
                ans.isCorrect
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-slate-900/90 border-rose-900/50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {ans.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-slate-400 block font-semibold">
                      EXHIBIT #{idx + 1}
                    </span>
                    <div className="text-xs space-y-1">
                      <p>
                        <span className="text-slate-400">Your Deduction:</span>{' '}
                        <span className={`font-mono font-bold ${ans.isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {ans.submittedAnswer || '(None / Timed Out)'}
                        </span>
                      </p>
                      {!ans.isCorrect && ans.correctAnswer && (
                        <p>
                          <span className="text-slate-400">Correct Bureau Key:</span>{' '}
                          <span className="font-mono font-bold text-cyan-400">{ans.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score breakdown tags */}
                <div className="text-right font-mono text-xs shrink-0">
                  <div className={ans.isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                    {ans.isCorrect ? `+${ans.pointsAwarded} pts` : `-${ans.penaltyDeducted} pts`}
                  </div>
                  {ans.hintUsed && (
                    <span className="text-[10px] text-amber-400 block">Hint Consulted</span>
                  )}
                </div>
              </div>

              {/* Forensic explanation */}
              {ans.explanation && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl">
                  <span className="font-semibold text-cyan-400 block mb-0.5">Forensic Explanation:</span>
                  <p>{ans.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Official Team / Participant Registration Banner - Only show if next level is not unlocked or no next level */}
      {(!isNextLevelUnlocked || !nextLevel || allLevelsDone) && onFinishGame && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-cyan-950/80 border-2 border-cyan-400/80 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">
              {currentLang === 'ta' ? 'அதிகாரப்பூர்வ போட்டி சமர்ப்பிப்பு' : 'OFFICIAL SYMPOSIUM SUBMISSION'}
            </span>
            <h4 className="text-base sm:text-lg font-black text-white mt-0.5">
              {currentLang === 'ta' ? 'உங்கள் துப்பறியும் அமர்வை முடித்துவிட்டீர்களா?' : 'Completed your investigation session?'}
            </h4>
            <p className="text-xs text-slate-300 max-w-xl">
              {currentLang === 'ta'
                ? 'உங்கள் போட்டி நிலையை தரவுத்தளத்தில் பதிவு செய்ய உங்கள் பெயர், பதிவு எண், கல்லூரி பெயர் மற்றும் குழுப் பெயரைச் சமர்ப்பிக்கவும்.'
                : 'Submit your Name, Register Number, College Name, and Team Name to persist your tournament standing in the database.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={onFinishGame}
              className="px-6 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-cyan-400/25 shrink-0 cursor-pointer transition hover:scale-[1.03]"
            >
              <Award className="w-4 h-4 stroke-[2.5]" />
              <span>{currentLang === 'ta' ? 'விவரங்களைச் சமர்ப்பித்து பதிவு செய்' : 'SUBMIT DETAILS TO PERSIST STANDING'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <button
          onClick={onReturnToHub}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>{t.returnToHub}</span>
        </button>

        <div className="flex items-center gap-3">
          {isNextLevelUnlocked && nextLevel && onDeployNextLevel && (
            <button
              onClick={() => onDeployNextLevel(nextLevel.id)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-400/20 transition cursor-pointer hover:scale-105"
            >
              <span>Next Level</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          {(!isNextLevelUnlocked || !nextLevel || allLevelsDone) && onFinishGame && (
            <button
              onClick={onFinishGame}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Submit & Finish Game</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
