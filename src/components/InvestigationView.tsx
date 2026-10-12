import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  HelpCircle, 
  Send, 
  ZoomIn, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Globe,
  Award 
} from 'lucide-react';
import { Question, Level, GameSettings, PlayerAttempt } from '../types/game.ts';
import { api } from '../services/api.ts';
import { sounds, TRANSLATIONS } from '../services/soundAndLang.ts';
import { PosterModal } from './PosterModal.tsx';

interface InvestigationViewProps {
  level: Level;
  questions: Question[];
  attempt: PlayerAttempt;
  settings: GameSettings;
  currentLang: string;
  onLanguageChange?: (lang: string) => void;
  onFinishCase: (completedAttempt: PlayerAttempt) => void;
  onAbandon: () => void;
}

export const InvestigationView: React.FC<InvestigationViewProps> = ({
  level,
  questions,
  attempt: initialAttempt,
  settings,
  currentLang,
  onLanguageChange,
  onFinishCase,
  onAbandon
}) => {
  const isTa = currentLang === 'ta';
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [hintRevealed, setHintRevealed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    isCorrect: boolean;
    pointsAwarded: number;
    penaltyDeducted: number;
    netScore: number;
    timeSaved: number;
  } | null>(null);

  const [currentScore, setCurrentScore] = useState<number>(0);
  const [enlargedPoster, setEnlargedPoster] = useState<{ url: string; caption?: string; title?: string } | null>(null);
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
  const [autoAdvanceSeconds, setAutoAdvanceSeconds] = useState<number | null>(null);

  const currentQ = questions[currentIndex] || questions[0];

  // Effective timer determination:
  // Priority order: Question override -> Level setting -> Global default
  const effectiveTimeLimit = 
    currentQ?.timerOverrideSeconds ?? 
    (level.timeLimitSeconds > 0 ? level.timeLimitSeconds : null) ?? 
    settings.defaultTimerSeconds;

  const [timeLeft, setTimeLeft] = useState<number>(effectiveTimeLimit);
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  // Reset question state when navigating
  useEffect(() => {
    setTimeLeft(effectiveTimeLimit);
    questionStartTimeRef.current = Date.now();
    setSelectedAnswer('');
    setTextAnswer('');
    setHintRevealed(false);
    setIsAnswerSubmitted(false);
    setIsTimedOut(false);
    setAutoAdvanceSeconds(null);
    setSubmissionFeedback(null);
  }, [currentIndex, effectiveTimeLimit]);

  // Auto-advance countdown on timeout
  useEffect(() => {
    if (autoAdvanceSeconds === null) return;
    if (autoAdvanceSeconds <= 0) {
      handleNextOrFinish();
      return;
    }
    const timer = setTimeout(() => {
      setAutoAdvanceSeconds((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoAdvanceSeconds]);

  // Timer logic - runs continuously without pause interruptions
  useEffect(() => {
    if (isAnswerSubmitted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        if (prev <= 10 && prev > 1) {
          sounds.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isAnswerSubmitted]);

  // Handle timeout auto-submission
  const handleTimeout = async () => {
    if (isAnswerSubmitted) return;
    sounds.playWrong();
    setIsTimedOut(true);
    await submitDeduction('', true);
    setAutoAdvanceSeconds(3);
  };

  // Submit deduction
  const submitDeduction = async (answerValue: string, isTimeout: boolean = false) => {
    if (isSubmitting || isAnswerSubmitted) return;
    setIsSubmitting(true);

    try {
      const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
      const res = await api.submitAnswer(
        initialAttempt.id,
        currentQ.id,
        answerValue,
        timeSpent,
        hintRevealed
      );

      setSubmissionFeedback(res);
      setIsAnswerSubmitted(true);
      setCurrentScore((prev) => prev + res.netScore);

      if (res.isCorrect) {
        sounds.playCorrect();
      } else {
        sounds.playWrong();
      }
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Proceed to next question or finalize
  const handleNextOrFinish = async () => {
    if (currentIndex < questions.length - 1) {
      sounds.playClick();
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finalize Case
      setIsSubmitting(true);
      try {
        const finalized = await api.finishAttempt(initialAttempt.id);
        sounds.playVictory();
        onFinishCase(finalized);
      } catch (err: any) {
        alert(`Failed to finish investigation: ${err.message}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Translation helpers for questions
  const langOverrides = currentQ?.translations?.[currentLang];
  const qTitle = langOverrides?.title || currentQ?.title;
  const qText = langOverrides?.text || currentQ?.text;
  const qCaption = langOverrides?.caption || currentQ?.imageCaption;
  const qHint = langOverrides?.hint || currentQ?.hint;
  const levelDisplayName = level.translations?.[currentLang]?.name || level.name;

  // Timer color urgency
  const isTimeCritical = timeLeft <= 15;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Top Header & Telemetry Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
              {isTa ? 'வழக்கு கோப்பு:' : 'CASE FILE:'} {levelDisplayName}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-slate-800 text-slate-300">
              {level.difficulty}
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <span>
              {isTa ? `கேள்வி ${currentIndex + 1} / ${questions.length}` : `${t.questionProgress} ${currentIndex + 1} of ${questions.length}`}
            </span>
            <span className="text-slate-500 font-mono text-sm">({currentQ?.category})</span>
          </h2>
        </div>

        {/* Timer, Language Toggle & Live Score */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Quick Language Toggle */}
          {onLanguageChange && (
            <button
              type="button"
              onClick={() => {
                const nextLang = currentLang === 'ta' ? 'en' : 'ta';
                sounds.playClick();
                onLanguageChange(nextLang);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-800 hover:border-cyan-500 text-[11px] font-semibold text-cyan-300 hover:bg-slate-800 transition cursor-pointer"
              title="Toggle Language / மொழியை மாற்றவும்"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isTa ? 'English (EN)' : 'தமிழ் (TA)'}</span>
            </button>
          )}

          {/* Countdown Clock Display (No Pause Interruptions) */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border font-mono font-bold text-sm sm:text-base transition-all ${
              isTimeCritical
                ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse'
                : 'bg-slate-950 border-cyan-800 text-cyan-300'
            }`}
          >
            <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-rose-400' : 'text-cyan-400'}`} />
            <span>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>

          {/* Live Merits Tally */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm text-amber-400">
            <Award className="w-4 h-4" />
            <span>+{currentScore} pts</span>
          </div>
        </div>
      </div>

      {/* Main Investigation Exhibit Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          {/* EVIDENCE POSTER (When configured) */}
          {currentQ?.imagePosterUrl && (
            <div className="space-y-2">
              <div 
                className="relative group rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 flex items-center justify-center cursor-pointer shadow-lg hover:border-cyan-500 transition max-h-[380px]"
                onClick={() => setEnlargedPoster({ url: currentQ.imagePosterUrl!, caption: qCaption, title: qTitle })}
              >
                <img
                  src={currentQ.imagePosterUrl}
                  alt={qCaption || 'Forensic Evidence Poster'}
                  className="w-full h-auto max-h-[360px] object-contain transition group-hover:scale-[1.01]"
                />
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] font-mono text-cyan-400 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>{isTa ? 'சான்றை பெரிதாக்குக' : 'Inspect Evidence'}</span>
                </div>
              </div>

              {qCaption && (
                <p className="text-xs font-mono text-slate-400 text-center italic">
                  {qCaption}
                </p>
              )}
            </div>
          )}

          {/* Exhibit Title & Briefing */}
          <div className="space-y-2">
            <h3 className="text-lg md:text-xl font-bold text-slate-100 leading-snug">
              {qTitle}
            </h3>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed whitespace-pre-wrap">
              {qText}
            </p>
          </div>

          {/* Hint Box (if revealed) */}
          {hintRevealed && qHint && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-700/60 text-xs text-amber-200 flex items-start gap-3 animate-fade-in">
              <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold font-mono uppercase block mb-1">
                  {isTa ? 'ரகசிய புலனாய்வு தகவல் (குறிப்பு):' : 'Bureau Classified Intel (Hint):'}
                </span>
                <p>{qHint}</p>
              </div>
            </div>
          )}

          {/* Deduction Input / Options */}
          {!isAnswerSubmitted ? (
            <div className="space-y-4 pt-2">
              {currentQ?.answerType === 'multiple_choice' ? (
                <div className="grid grid-cols-1 gap-3">
                  {currentQ.options?.map((opt) => {
                    const isSelected = selectedAnswer === opt.optionKey;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setSelectedAnswer(opt.optionKey);
                        }}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/70 border-cyan-400 text-white ring-1 ring-cyan-400'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {opt.optionKey}
                        </span>
                        <span className="text-sm leading-snug pt-0.5">
                          {langOverrides?.options?.[opt.optionKey] || opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-mono text-cyan-400 block font-semibold">
                    {isTa ? 'மறைகுறியீட்டு விடை / தடயவியல் பதிவு உள்ளிடவும்:' : 'DECRYPTED CIPHER / FORENSIC ENTRY:'}
                  </label>
                  <input
                    type="text"
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder={isTa ? 'கண்டுபிடிக்கப்பட்ட அசல் உரையை உள்ளிடவும்...' : 'Type deduced signature or plaintext...'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-cyan-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && textAnswer.trim()) {
                        submitDeduction(textAnswer.trim());
                      }
                    }}
                  />
                </div>
              )}

              {/* Action controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                {/* Hint Button */}
                {level.hintAvailable && qHint && !hintRevealed && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setHintRevealed(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-800/60 text-xs font-mono text-amber-300 transition cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>{isTa ? 'குறிப்பு' : t.hint} (-{level.hintPenalty || settings.hintPenaltyPoints} pts)</span>
                  </button>
                )}

                {hintRevealed && (
                  <div className="text-xs font-mono text-amber-400/80">
                    {isTa ? 'குறிப்பு திறக்கப்பட்டது' : 'Hint intel unlocked'}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="button"
                  disabled={isSubmitting || (currentQ?.answerType === 'multiple_choice' ? !selectedAnswer : !textAnswer.trim())}
                  onClick={() => submitDeduction(currentQ?.answerType === 'multiple_choice' ? selectedAnswer : textAnswer.trim())}
                  className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? (isTa ? 'மதிப்பிடுகிறது...' : 'Evaluating...') : (isTa ? 'விடையை சமர்ப்பிக்கவும்' : t.submitAnswer)}</span>
                </button>
              </div>
            </div>
          ) : (
            /* POST-SUBMISSION FEEDBACK BANNER */
            <div className="space-y-4 pt-4 border-t border-slate-800 animate-fade-in">
              {isTimedOut && (
                <div className="p-4 rounded-xl border bg-amber-950/70 border-amber-500/80 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                    </div>
                    <div>
                      <span className="font-bold text-xs uppercase block text-amber-300 tracking-wider">
                        {isTa ? '⏱️ நேரம் முடிந்தது — கேள்வி முடிவுக்கு வந்தது' : '⏱️ TIME LIMIT EXPIRED — QUESTION AUTO-CLOSED'}
                      </span>
                      <span className="text-[11px] text-amber-200/80">
                        {isTa 
                          ? `நேரம் முடிந்தது. அடுத்த கேள்விக்கு ${autoAdvanceSeconds ?? 0} வினாடிகளில் மாறுகிறது...`
                          : `Time limit expired. Answers locked. Automatically proceeding to next exhibit in ${autoAdvanceSeconds ?? 0}s...`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleNextOrFinish}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0"
                  >
                    {isTa ? 'இப்போதே தொடர்க' : 'Advance Now'}
                  </button>
                </div>
              )}

              <div
                className={`p-5 rounded-xl border flex items-start gap-4 ${
                  submissionFeedback?.isCorrect
                    ? 'bg-emerald-950/50 border-emerald-600/80 text-emerald-200'
                    : 'bg-rose-950/50 border-rose-600/80 text-rose-200'
                }`}
              >
                {submissionFeedback?.isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                )}

                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm tracking-wide">
                    {submissionFeedback?.isCorrect 
                      ? (isTa ? 'சரியான தடயவியல் முடிவு!' : 'ACCURATE DEDUCTION') 
                      : (isTa ? 'தவறான முடிவு' : 'INCORRECT EVALUATION')}
                  </h4>
                  <p className="text-xs leading-relaxed opacity-90">
                    {submissionFeedback?.isCorrect
                      ? (isTa 
                          ? `சான்று உறுதிப்படுத்தப்பட்டது. +${submissionFeedback.pointsAwarded} புள்ளிகள் வழங்கப்பட்டன.`
                          : `Evidence confirmed. Awarded +${submissionFeedback.pointsAwarded} merits (including speed bonus).`)
                      : (isTa 
                          ? `தவறான முடிவு. புள்ளிகள் குறைக்கப்பட்டன (-${submissionFeedback?.penaltyDeducted} pts).`
                          : `Forensic deduction failed. Penalty deducted (-${submissionFeedback?.penaltyDeducted} pts).`)}
                  </p>
                </div>
              </div>

              {/* Proceed Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNextOrFinish}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                >
                  <span>
                    {currentIndex < questions.length - 1 
                      ? (isTa ? 'அடுத்த தடயவியல் கேள்வி' : t.nextQuestion) 
                      : (isTa ? 'வழக்கை நிறைவு செய்க' : t.finishCase)}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom status & Abandon button */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-2 font-mono">
        <button
          onClick={onAbandon}
          className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
        >
          {isTa ? 'விசாரணையிலிருந்து வெளியேறு' : 'Abort Investigation'}
        </button>
        <span>CASE ID: {initialAttempt.id.slice(0, 16)}</span>
      </div>

      {/* High-res poster modal */}
      {enlargedPoster && (
        <PosterModal
          isOpen={true}
          onClose={() => setEnlargedPoster(null)}
          imageUrl={enlargedPoster.url}
          caption={enlargedPoster.caption}
          title={enlargedPoster.title}
        />
      )}
    </div>
  );
};
