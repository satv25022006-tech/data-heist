import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Volume2, 
  VolumeX, 
  Clock, 
  Globe, 
  ShieldCheck, 
  Zap, 
  Award, 
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Shield,
  HelpCircle
} from 'lucide-react';
import { GameSettings } from '../types/game.ts';
import { sounds, TRANSLATIONS } from '../services/soundAndLang.ts';

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  currentLang: string;
  onLanguageChange: (lang: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAdminLogin?: () => void;
  onOpenAdminPanel?: () => void;
  isAdmin?: boolean;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  currentLang,
  onLanguageChange,
  soundEnabled,
  onToggleSound,
  onOpenAdminLogin,
  onOpenAdminPanel,
  isAdmin = false
}) => {
  const isTa = currentLang === 'ta';
  const [activeTab, setActiveTab] = useState<'general' | 'timers' | 'rules'>('general');
  const [testSoundPlayed, setTestSoundPlayed] = useState<string | null>(null);

  if (!isOpen) return null;

  const playPreviewSound = (type: 'click' | 'correct' | 'wrong' | 'tick' | 'victory') => {
    switch (type) {
      case 'click': sounds.playClick(); break;
      case 'correct': sounds.playCorrect(); break;
      case 'wrong': sounds.playWrong(); break;
      case 'tick': sounds.playTick(); break;
      case 'victory': sounds.playVictory(); break;
    }
    setTestSoundPlayed(type);
    setTimeout(() => setTestSoundPlayed(null), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#091122] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-700/80 text-cyan-400">
              <Settings className="w-5 h-5 animate-[spin_6s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                  {isTa ? 'கட்டுப்பாட்டு மையம்' : 'BUREAU PREFERENCES'}
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.2 rounded font-bold uppercase">
                  {isTa ? 'டைமர்கள் செயலில்' : 'TIMERS ACTIVE'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {isTa ? 'விளையாட்டு அமைப்புகள் & டைமர்கள்' : 'Game Settings & Timers'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-slate-800/80">
          <button
            onClick={() => { sounds.playClick(); setActiveTab('general'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'general'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isTa ? 'பொது & ஒலி' : 'Audio & Language'}</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); setActiveTab('timers'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'timers'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isTa ? 'டைமர்கள் அமைப்பு' : 'Timer Systems (Maintained)'}</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); setActiveTab('rules'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isTa ? 'விதிகள் நெறிமுறை' : 'Investigation Rules'}</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 text-xs text-slate-300">
          {/* TAB 1: GENERAL & AUDIO */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Language Card */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>{isTa ? 'போட்டி மொழி' : 'Investigation Language'}</span>
                  </span>
                  <p className="text-slate-400 text-xs">
                    {isTa ? 'வழக்குகள், கேள்விகள் மற்றும் விதிகள் தேர்ந்தெடுக்கப்பட்ட மொழியில் காட்டப்படும்.' : 'Cases, question forensics, and rules are rendered in your selected language.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onLanguageChange('en');
                      sounds.playClick();
                    }}
                    className={`px-4 py-2 rounded-xl font-bold font-mono text-xs transition cursor-pointer border ${
                      currentLang === 'en'
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    English (EN)
                  </button>
                  <button
                    onClick={() => {
                      onLanguageChange('ta');
                      sounds.playClick();
                    }}
                    className={`px-4 py-2 rounded-xl font-bold font-mono text-xs transition cursor-pointer border ${
                      currentLang === 'ta'
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    தமிழ் (TA)
                  </button>
                </div>
              </div>

              {/* Sound Effects Toggle */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                    <span>{isTa ? 'ஒலி விளைவுகள் (Sound Effects)' : 'Forensic Audio & Sound Effects'}</span>
                  </span>
                  <p className="text-slate-400 text-xs">
                    {isTa ? 'டைமர் டிக், வெற்றி, தவறான பதில்கள் மற்றும் பொத்தான் கிளிக் ஒலிகள்.' : 'Auditory feedback for countdown ticks, evidence inspects, correct and wrong deductions.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onToggleSound();
                    sounds.playClick();
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer border ${
                    soundEnabled
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/50'
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {soundEnabled ? (isTa ? 'இயக்கத்தில் உள்ளது' : 'ENABLED') : (isTa ? 'முடக்கப்பட்டுள்ளது' : 'MUTED')}
                </button>
              </div>

              {/* Sound Test Panel */}
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  {isTa ? 'ஒலி சோதனை மாதிரிகள்' : 'AUDIO TEST SAMPLES'}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => playPreviewSound('click')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-[11px] transition cursor-pointer"
                  >
                    Click
                  </button>
                  <button
                    onClick={() => playPreviewSound('tick')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 font-mono text-[11px] transition cursor-pointer flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    Timer Tick
                  </button>
                  <button
                    onClick={() => playPreviewSound('correct')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-mono text-[11px] transition cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Correct (+pts)
                  </button>
                  <button
                    onClick={() => playPreviewSound('wrong')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-400 font-mono text-[11px] transition cursor-pointer"
                  >
                    Wrong Penalty
                  </button>
                  <button
                    onClick={() => playPreviewSound('victory')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 font-mono text-[11px] transition cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Victory Fanfare
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMER SYSTEMS (MAINTAINED) */}
          {activeTab === 'timers' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 text-xs flex items-center gap-2.5">
                <Clock className="w-4 h-4 shrink-0 text-cyan-400 animate-pulse" />
                <span>
                  {isTa 
                    ? 'அனைத்து கவுண்ட்டவுன் டைமர்களும் துல்லியமாக பராமரிக்கப்பட்டு கண்காணிக்கப்படுகின்றன.'
                    : 'All authoritative tournament timers and countdown clocks are active, calibrated, and maintained across sessions.'}
                </span>
              </div>

              {/* Timer 1: 30s Mission Briefing Timer */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm">
                        {isTa ? '1. பணி சுருக்க அவகாசம் (Mission Briefing Timer)' : '1. Mission Briefing & Incident Synopsis Window'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {isTa ? `ஒவ்வொரு வழக்கைத் தேர்ந்தெடுத்ததும் ${settings.briefingTimerSeconds || 30} விநாடிகள் அவகாசம்.` : `Authoritative countdown before difficulty level progression (${settings.briefingTimerSeconds || 30}s).`}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-300 font-mono font-bold text-xs">
                    {settings.briefingTimerSeconds || 30}s Window
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 w-full animate-pulse" />
                </div>
              </div>

              {/* Timer 2: Question Countdown Timer */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm">
                        {isTa ? '2. கேள்வி புலனாய்வு டைமர் (Question Timers)' : '2. Active Investigation Countdown'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {isTa ? 'ஒவ்வொரு தடயவியல் ஆதார கேள்விக்கும் தனித்தனி கவுண்ட்டவுன்.' : 'Strict countdown clock per exhibit question with timeout penalty.'}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-amber-950 border border-amber-700 text-amber-300 font-mono font-bold text-xs">
                    {settings.defaultTimerSeconds || 60}s / Exhibit
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  {isTa ? 'மிச்சப்படுத்தப்படும் ஒவ்வொரு விநாடிக்கும் வேக போனஸ் புள்ளிகள் கணக்கிடப்பட்டு வழங்கப்படும்.' : 'Unused seconds award generous speed bonus score points to increase global ranking.'}
                </p>
              </div>

              {/* Timer 3: Auto-Refresh Countdown Timer */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm">
                        {isTa ? '3. தானியங்கி மறுதொடக்கம் டைமர் (Auto-Refresh)' : '3. Tournament Winner Auto-Refresh'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {isTa ? 'அனைத்து வழக்குகளும் முடிந்தபின் அடுத்த அணிக்கான 15 விநாடி டைமர்.' : 'Auto-recycles app state to clean start for subsequent symposium teams.'}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-indigo-950 border border-indigo-700 text-indigo-300 font-mono font-bold text-xs">
                    15s Cycle
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RULES & REGULATIONS */}
          {activeTab === 'rules' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  {isTa ? 'அதிகாரப்பூர்வ விதிமுறைகள்' : 'OFFICIAL RULES & REGULATIONS'}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {isTa
                    ? '1. ஒவ்வொரு கேள்விக்கும் கடுமையான கவுண்ட்டவுன் டைமர் நிர்ணயிக்கப்பட்டுள்ளது. 2. எளிய நிலையில் 2 நட்சத்திரங்களைப் பெற்ற பின்னரே நடுத்தர நிலை திறக்கப்படும். 3. வேக போனஸ் மற்றும் துல்லிய மதிப்பெண்கள் தரவுத்தளத்தில் பதிவு செய்யப்படும். 4. உங்கள் முழு அமர்வை முடித்த பிறகே கடைசி பக்கத்தில் பெயர், பதிவு எண், கல்லூரி மற்றும் குழுப் பெயரைச் சமர்ப்பிக்கவும்.'
                    : (settings.rulesText || 'Inspect evidence posters carefully. Clear each question within the countdown window to maximize speed bonuses. Higher tiers require stars from prior levels. Submit candidate details only on the final conclusion screen.')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                  <span className="font-bold text-emerald-400 block mb-0.5">{isTa ? 'சரியான பதில்' : 'Correct Deduction'}</span>
                  <p className="text-[11px] text-slate-400">+{settings.baseCorrectPoints} pts base reward</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                  <span className="font-bold text-rose-400 block mb-0.5">{isTa ? 'தவறான பதில்' : 'Wrong Penalty'}</span>
                  <p className="text-[11px] text-slate-400">-{settings.incorrectPenaltyPoints} pts penalty</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button
                onClick={() => {
                  sounds.playClick();
                  onClose();
                  if (onOpenAdminPanel) onOpenAdminPanel();
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isTa ? 'நிர்வாகக் குழுவிற்குச் செல்' : 'Open Admin Command Center'}</span>
              </button>
            ) : (
              onOpenAdminLogin && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                    onOpenAdminLogin();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isTa ? 'நிர்வாகி உள்நுழைவு' : 'Admin Login'}</span>
                </button>
              )
            )}
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-cyan-500/20"
          >
            {isTa ? 'முடிந்தது' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
