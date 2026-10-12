import React, { useState, useEffect } from 'react';
import { X, Clock, ShieldCheck, Award, Zap, HelpCircle, AlertTriangle } from 'lucide-react';
import { GameSettings } from '../types/game.ts';
import { TRANSLATIONS } from '../services/soundAndLang.ts';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  currentLang: string;
  caseRules?: string[];
  caseTitle?: string;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  settings,
  currentLang,
  caseRules,
  caseTitle
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const isCountdownConfigured = settings.demoRulesCountdownEnabled;
  const [countdown, setCountdown] = useState<number>(settings.demoRulesCountdownSeconds || 120);

  useEffect(() => {
    if (!isOpen || !isCountdownConfigured) return;
    setCountdown(settings.demoRulesCountdownSeconds || 120);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isCountdownConfigured, settings.demoRulesCountdownSeconds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{t.rulesTitle}</h2>
              <p className="text-xs text-slate-400 font-mono">BUREAU OPERATIONAL CODE OF CONDUCT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optional Demo Countdown Bar (Only if enabled in settings) */}
        {isCountdownConfigured && (
          <div className="bg-amber-950/60 border-b border-amber-800/60 px-6 py-2.5 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{t.demoRulesActive}: Demonstration Countdown Window</span>
            </div>
            <div className="font-mono font-bold bg-amber-900/80 px-2 py-0.5 rounded border border-amber-700">
              {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h3 className="font-semibold text-cyan-400 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              {currentLang === 'ta' ? 'பணி சுருக்கம் & குறிக்கோள்' : 'Mission Briefing & Objective'}
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              {currentLang === 'ta'
                ? 'ஒவ்வொரு தடயவியல் ஆதாரத்தையும் கவனமாக ஆய்வு செய்யுங்கள். ஆதாரக் கையொப்பங்களை பொருத்தி, நேர முத்திரைகளை பகுப்பாய்வு செய்து, கவுண்ட்டவுன் டைமர் முடிவதற்குள் சரியான முடிவை உறுதி செய்யுங்கள்.'
                : (settings.rulesText || 'Inspect each forensic exhibit carefully. Match evidence signatures, analyze timestamps, decrypt rogue ciphers, and choose the correct deduction before the countdown timer expires.')}
            </p>
          </div>

          {/* Grid of Rule Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1 text-xs">
                <Award className="w-4 h-4" />
                {currentLang === 'ta' ? 'மதிப்பெண்கள் & நட்சத்திரங்கள்' : 'Scoring & Stars'}
              </div>
              <p className="text-xs text-slate-400">
                {currentLang === 'ta'
                  ? `சரியான பதில்களுக்கு அடிப்படை புள்ளிகள் (${settings.baseCorrectPoints} pts) வழங்கப்படும். துல்லியமாக விடையளித்து வழக்குகளுக்கு 3 நட்சத்திரங்கள் வரை பெறலாம்.`
                  : `Correct answers award base points (${settings.baseCorrectPoints} pts). Earn up to 3 Detective Stars per case by exceeding passing scores and demonstrating high accuracy.`}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1 text-xs">
                <Zap className="w-4 h-4" />
                {currentLang === 'ta' ? 'வேக போனஸ்' : 'Speed Bonuses'}
              </div>
              <p className="text-xs text-slate-400">
                {currentLang === 'ta'
                  ? 'சேமிக்கப்பட்ட நேரம் வெகுமதியளிக்கப்படுகிறது! விரைவாக விடையளித்தால் அதிக வேக போனஸ் புள்ளிகள் கிடைக்கும்.'
                  : 'Time saved is rewarded! The faster you submit a correct deduction, the higher your speed merit multiplier. Unused seconds are tallied toward your career bureau standing.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1 text-xs">
                <HelpCircle className="w-4 h-4" />
                {currentLang === 'ta' ? 'குறிப்புகள் கொள்கை' : 'Bureau Hints Policy'}
              </div>
              <p className="text-xs text-slate-400">
                {currentLang === 'ta'
                  ? `சந்தேகங்கள் உள்ளதா? துறையிடமிருந்து குறிப்புகளைக் கோரலாம். ஒவ்வொரு குறிப்பிற்கும் (${settings.hintPenaltyPoints} pts) புள்ளிகள் குறைக்கப்படும்.`
                  : `Stuck on a complex cipher? Request forensic hints from the Bureau. Beware: each hint consultation incurs a penalty (${settings.hintPenaltyPoints} pts).`}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1 text-xs">
                <AlertTriangle className="w-4 h-4" />
                {currentLang === 'ta' ? 'அபராதங்கள் & டைமர்கள்' : 'Penalties & Timers'}
              </div>
              <p className="text-xs text-slate-400">
                {currentLang === 'ta'
                  ? `தவறான பதில்களுக்கு ${settings.incorrectPenaltyPoints} புள்ளிகள் குறைக்கப்படும். நேரம் முடிந்தால் கேள்வி தானாகவே முடிவடையும்.`
                  : `Incorrect deductions deduct ${settings.incorrectPenaltyPoints} pts. If time runs out, your answer is automatically finalized under forensic timeout protocol.`}
              </p>
            </div>
          </div>

          {/* Progression Rules or Case Specific Rules */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-indigo-400 flex items-center justify-between">
              <span>{currentLang === 'ta' ? 'வழக்கு விதிகள் & ஒழுங்குமுறைகள்' : `Rules & Regulations${caseTitle ? ` — ${caseTitle}` : ''}`}</span>
              {caseTitle && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/50 text-indigo-300">Case Specific</span>}
            </h4>
            <ul className="text-xs text-slate-300 list-disc list-inside space-y-1.5 font-sans">
              {caseRules && caseRules.length > 0 ? (
                caseRules.map((rule, idx) => (
                  <li key={idx} className="leading-relaxed">{rule}</li>
                ))
              ) : currentLang === 'ta' ? (
                <>
                  <li>எளிதான வழக்குகள் உடனடியாக அனைத்து அதிகாரிகளுக்கும் திறக்கப்படும்.</li>
                  <li>நடுத்தர வழக்குகள் எளிதான வழக்கில் 2 நட்சத்திரங்கள் பெற்றால் திறக்கப்படும்.</li>
                  <li>கடினமான வழக்குகள் நடுத்தர வழக்கில் 2 நட்சத்திரங்கள் பெற்றால் திறக்கப்படும்.</li>
                </>
              ) : (
                <>
                  <li>Easy cases are accessible immediately to all field agents.</li>
                  <li>Medium difficulty cases unlock upon earning at least 2 Detective Stars from Easy cases.</li>
                  <li>Hard syndicate cases require clearance of Medium cases and high star ratings.</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
