import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Clock, 
  Award, 
  Globe, 
  ShieldAlert, 
  Save, 
  Volume2, 
  CheckCircle,
  HelpCircle,
  Database,
  RefreshCw,
  ExternalLink,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { GameSettings } from '../../types/game.ts';
import { api } from '../../services/api.ts';
import { sounds } from '../../services/soundAndLang.ts';
import { getStoredSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../../services/supabaseClient.ts';

interface AdminSettingsProps {
  settings: GameSettings;
  onRefresh: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings: initialSettings,
  onRefresh
}) => {
  const [form, setForm] = useState<GameSettings>({ ...initialSettings });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Supabase connection state
  const storedSb = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(storedSb.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(storedSb.anonKey);
  const [isTestingSb, setIsTestingSb] = useState(false);
  const [sbTestResult, setSbTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Clear All Data state
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [clearNotice, setClearNotice] = useState<string | null>(null);

  const handleClearAllData = async () => {
    setIsClearingData(true);
    sounds.playClick();
    try {
      const res = await api.clearAllData();
      sounds.playCorrect();
      setClearNotice(res.message || 'All competition attempts, participant submissions, leaderboard records, and progress successfully cleared!');
      setShowClearModal(false);
      onRefresh();
      setTimeout(() => setClearNotice(null), 6000);
    } catch (err: any) {
      sounds.playWrong();
      alert(`Clear failed: ${err.message}`);
    } finally {
      setIsClearingData(false);
    }
  };

  const handleTestSupabase = async () => {
    setIsTestingSb(true);
    setSbTestResult(null);
    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    try {
      const res = await testSupabaseConnection();
      setSbTestResult(res);
    } catch (err: any) {
      setSbTestResult({ success: false, message: err.message || 'Connection test failed' });
    } finally {
      setIsTestingSb(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
      await api.updateAdminSettings(form);
      sounds.playVictory();
      setSaveSuccess(true);
      onRefresh();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          <span>Game Engine & Bureau Directives Configuration</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Adjust global timer presets, scoring multipliers, hint penalties, multi-language support, and operational policies.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Global Bureau directives successfully saved and published!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* General Bureau Branding */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-cyan-400 uppercase tracking-wide">
            1. Bureau Identity & Directives
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Game Title</label>
              <input
                type="text"
                required
                value={form.gameTitle}
                onChange={(e) => setForm({ ...form, gameTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-sans text-xs focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Default Bureau Language</label>
              <select
                value={form.defaultLanguage}
                onChange={(e) => setForm({ ...form, defaultLanguage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
              >
                <option value="en">English (en)</option>
                <option value="ta">தமிழ் (ta)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 font-semibold block flex items-center justify-between">
              <span>Bureau Logo Image (URL or Upload File)</span>
              {form.logoUrl && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, logoUrl: '' })}
                  className="text-red-400 hover:text-red-300 text-[10px]"
                >
                  Remove Logo
                </button>
              )}
            </label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-[10px] text-slate-500 font-mono text-center px-1">No Logo</div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="https://example.com/logo.png or data URL"
                  value={form.logoUrl || ''}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                />
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 transition text-[11px] font-semibold flex items-center gap-1.5">
                    <span>Upload Logo Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setForm({ ...form, logoUrl: event.target.result as string });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <span className="text-[10px] text-slate-400">Supports PNG, JPG, SVG, WebP</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Game Mission Description</label>
            <textarea
              rows={2}
              value={form.gameDescription}
              onChange={(e) => setForm({ ...form, gameDescription: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-sans text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Bureau Investigation Rules & Instructions Text</label>
            <textarea
              rows={3}
              value={form.rulesText}
              onChange={(e) => setForm({ ...form, rulesText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-sans text-xs"
            />
          </div>
        </div>

        {/* TIMER CONFIGURATION (SECTION 10) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>2. Authoritative Timer Configuration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Default Timer Duration (Seconds)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={300}
                  value={form.defaultTimerSeconds}
                  onChange={(e) => setForm({ ...form, defaultTimerSeconds: parseInt(e.target.value) || 60 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-400 font-mono text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono text-slate-400">
                <span>Presets:</span>
                {[30, 60, 90, 120].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setForm({ ...form, defaultTimerSeconds: preset })}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {preset}s
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Mission Briefing Timer (Seconds)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={form.briefingTimerSeconds ?? 180}
                  onChange={(e) => setForm({ ...form, briefingTimerSeconds: parseInt(e.target.value) || 180 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-400 font-mono text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono text-slate-400">
                <span>Presets:</span>
                {[30, 60, 120, 180].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setForm({ ...form, briefingTimerSeconds: preset })}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {preset >= 60 ? `${preset / 60}m` : `${preset}s`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Timeout Penalty (Points Deducted)</label>
              <input
                type="number"
                min={0}
                value={form.timeoutPenaltyPoints}
                onChange={(e) => setForm({ ...form, timeoutPenaltyPoints: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-rose-400 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoSubmitOnTimeout}
                onChange={(e) => setForm({ ...form, autoSubmitOnTimeout: e.target.checked })}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span className="text-slate-300 font-medium">Auto-Submit on Timeout</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allowTimerPause}
                onChange={(e) => setForm({ ...form, allowTimerPause: e.target.checked })}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span className="text-slate-300 font-medium">Allow Timer Pause</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={form.demoRulesCountdownEnabled}
                onChange={(e) => setForm({ ...form, demoRulesCountdownEnabled: e.target.checked })}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span className="text-slate-300 font-medium">Demo 120s Rules Countdown</span>
            </label>
          </div>
        </div>

        {/* SCORING & REWARDS (SECTION 11) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>3. Scoring Multipliers & Deductions</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Base Correct Points</label>
              <input
                type="number"
                min={10}
                value={form.baseCorrectPoints}
                onChange={(e) => setForm({ ...form, baseCorrectPoints: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Incorrect Answer Penalty</label>
              <input
                type="number"
                min={0}
                value={form.incorrectPenaltyPoints}
                onChange={(e) => setForm({ ...form, incorrectPenaltyPoints: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-rose-400 font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Hint Consultation Penalty</label>
              <input
                type="number"
                min={0}
                value={form.hintPenaltyPoints}
                onChange={(e) => setForm({ ...form, hintPenaltyPoints: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Supabase Connection Panel */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-cyan-400 uppercase tracking-wide flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>Supabase Cloud Database Integration</span>
            </h3>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
              PostgreSQL Ready
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Connect your Supabase project to persist profiles, levels, questions, and player submissions. Run <code className="text-cyan-300">supabase/schema.sql</code> in your Supabase SQL Editor.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Supabase Project URL</label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Supabase Anon / Public Key</label>
              <input
                type="password"
                placeholder="eyJhbGciOi..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={isTestingSb || !supabaseUrl || !supabaseAnonKey}
              onClick={handleTestSupabase}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingSb ? 'animate-spin' : ''}`} />
              <span>{isTestingSb ? 'Testing Connection...' : 'Test Supabase Connection'}</span>
            </button>
            <span className="text-[11px] text-slate-500">
              Schema provided in <code className="text-slate-400">supabase/schema.sql</code>
            </span>
          </div>

          {sbTestResult && (
            <div className={`p-3 rounded-xl text-xs border flex items-center gap-2 animate-fade-in ${sbTestResult.success ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300' : 'bg-rose-950/70 border-rose-800 text-rose-300'}`}>
              <CheckCircle className={`w-4 h-4 shrink-0 ${sbTestResult.success ? 'text-emerald-400' : 'text-rose-400'}`} />
              <span>{sbTestResult.message}</span>
            </div>
          )}
        </div>

        {/* System Operations & Maintenance */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>4. Bureau System Operations</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={form.maintenanceMode}
                onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="text-slate-200 font-bold block">Maintenance Mode</span>
                <span className="text-[11px] text-slate-500">Lock game access for general field agents</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={form.soundEffectsEnabled}
                onChange={(e) => setForm({ ...form, soundEffectsEnabled: e.target.checked })}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="text-slate-200 font-bold block">Sound Effects</span>
                <span className="text-[11px] text-slate-500">Enable synthesized crime ambience and chimes</span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/20 transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Directives...' : 'Save & Publish Bureau Directives'}</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Clear All Data */}
      <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/60 shadow-xl space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4" />
            <span>5. Danger Zone: Clear Competition & Live Data</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
            IRREVERSIBLE ACTION
          </span>
        </div>

        <p className="text-slate-400 text-xs">
          Clear all live participant submissions, player attempts, symposium leaderboard entries, and player clearance progress. Case levels, questions, and posters remain preserved for new competitors.
        </p>

        {clearNotice && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{clearNotice}</span>
          </div>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setShowClearModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              if (confirm('Are you sure you want to reset the database to factory defaults? This will overwrite all custom levels and questions!')) {
                sounds.playClick();
                try {
                  await api.resetDatabaseToDefaults();
                  sounds.playVictory();
                  alert('Database reset to factory defaults.');
                  window.location.reload();
                } catch (err: any) {
                  sounds.playWrong();
                  alert(`Reset failed: ${err.message}`);
                }
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </button>
        </div>
      </div>

      {/* Clear All Data Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Clear All Live Data?</h3>
                <p className="text-xs text-rose-300">Confirmation Required</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to clear <strong>ALL</strong> live investigation records? This will permanently wipe:
            </p>

            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-mono">
              <li>All college team candidate submissions</li>
              <li>All player investigation attempts and timers</li>
              <li>All leaderboard ranks and participant scores</li>
              <li>All player clearance unlocks and progress logs</li>
            </ul>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                disabled={isClearingData}
                onClick={() => {
                  sounds.playClick();
                  setShowClearModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isClearingData}
                onClick={handleClearAllData}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearingData ? 'Clearing All Data...' : 'Yes, Clear All Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
