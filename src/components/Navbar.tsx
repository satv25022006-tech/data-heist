import React from 'react';
import { Fingerprint, Trophy, Volume2, VolumeX, Globe, Lock, LogOut, Shield, Settings, Clock } from 'lucide-react';
import { UserProfile, GameSettings } from '../types/game.ts';
import { sounds, TRANSLATIONS } from '../services/soundAndLang.ts';

interface NavbarProps {
  settings: GameSettings;
  currentUser: UserProfile | null;
  currentLang: string;
  onLanguageChange: (lang: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenRules?: () => void;
  onOpenGameSettings: () => void;
  onOpenAdminLogin: () => void;
  onOpenAdminPanel: () => void;
  onLogout: () => void;
  totalStars: number;
  totalScore: number;
  viewMode: 'player' | 'admin';
  onSwitchToPlayer: () => void;
  onGoToCases: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  currentUser,
  currentLang,
  onLanguageChange,
  soundEnabled,
  onToggleSound,
  onOpenRules,
  onOpenGameSettings,
  onOpenAdminLogin,
  onOpenAdminPanel,
  onLogout,
  totalStars,
  totalScore,
  viewMode,
  onSwitchToPlayer,
  onGoToCases
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const isAdmin = currentUser && ['super_admin', 'content_admin', 'game_manager', 'analyst'].includes(currentUser.role);

  return (
    <header className="sticky top-0 z-40 bg-[#070d18]/95 backdrop-blur-md border-b border-slate-800/80 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Custom Logo + Branding */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group select-none" 
          onClick={onGoToCases}
        >
          <div className="w-9 h-9 rounded-full bg-cyan-950/80 border-2 border-cyan-400/80 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.4)] group-hover:shadow-[0_0_18px_rgba(34,211,238,0.7)] group-hover:scale-105 transition-all duration-300 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20" />
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover relative z-10" />
            ) : (
              <Fingerprint className="w-5 h-5 text-cyan-300 relative z-10" />
            )}
          </div>
          <span className="font-extrabold tracking-wider text-base sm:text-lg text-cyan-400 group-hover:text-cyan-300 transition-colors uppercase font-mono">
            SMIT CENTRAK FORENSIC CRIME BUREAU
          </span>
        </div>

        {/* Right: Cases, Trophy + Score, and Control Utilities */}
        <div className="flex items-center gap-3 sm:gap-5 text-sm">
          {viewMode === 'player' && (
            <>
              {/* Cases link */}
              <button
                onClick={() => {
                  sounds.playClick();
                  onGoToCases();
                }}
                className="text-slate-200 hover:text-cyan-400 font-semibold transition-colors cursor-pointer"
              >
                Cases
              </button>

              {/* Trophy Score Badge */}
              <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>{totalScore}</span>
              </div>

              {/* Replaced Rules option with Game Settings */}
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenGameSettings();
                }}
                title={currentLang === 'ta' ? 'விளையாட்டு அமைப்புகள் & டைமர்கள்' : 'Game Settings & Timers'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer text-xs font-semibold"
              >
                <Settings className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentLang === 'ta' ? 'அமைப்புகள்' : 'Game Settings'}</span>
              </button>
            </>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sounds.playClick();
            }}
            title="Toggle Sound Effects"
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {/* Language Selector */}
          <div className="relative hidden sm:flex items-center">
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
            <select
              value={currentLang}
              onChange={(e) => {
                onLanguageChange(e.target.value);
                sounds.playClick();
              }}
              className="pl-6 pr-2.5 py-1 rounded-lg bg-slate-900/90 border border-cyan-800/80 text-[11px] font-semibold text-cyan-300 hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer appearance-none"
            >
              <option value="en">English (EN)</option>
              <option value="ta">தமிழ் (TA)</option>
            </select>
          </div>

          {/* Admin Navigation or Login Button */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              {viewMode === 'player' ? (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenAdminPanel();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onSwitchToPlayer();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition cursor-pointer"
                >
                  <span>Player Mode</span>
                </button>
              )}

              <button
                onClick={() => {
                  sounds.playClick();
                  onLogout();
                }}
                title="Log Out"
                className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenAdminLogin();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs transition cursor-pointer"
              title="Administrator Sign In"
            >
              <Lock className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

