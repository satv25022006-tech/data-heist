import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Award, 
  School, 
  User, 
  Hash, 
  Users, 
  Star, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Shield,
  MessageSquare
} from 'lucide-react';
import { ParticipantSubmission } from '../types/game.ts';
import { api } from '../services/api.ts';
import { sounds } from '../services/soundAndLang.ts';

interface ParticipantSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameTitle: string;
  totalScore: number;
  totalStars: number;
  accuracyPercentage: number;
  totalTimeSpentSeconds: number;
  totalTimeSavedSeconds: number;
  completedLevelsCount: number;
  onSuccess: (sub: ParticipantSubmission) => void;
  onViewAdmin?: () => void;
  currentLang?: string;
}

export const ParticipantSubmitModal: React.FC<ParticipantSubmitModalProps> = ({
  isOpen,
  onClose,
  gameTitle,
  totalScore,
  totalStars,
  accuracyPercentage,
  totalTimeSpentSeconds,
  totalTimeSavedSeconds,
  completedLevelsCount,
  onSuccess,
  onViewAdmin,
  currentLang = 'en'
}) => {
  const isTa = currentLang === 'ta';
  const [name, setName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !registerNumber.trim() || !collegeName.trim()) {
      setError(isTa ? 'பெயர், பதிவு எண் மற்றும் கல்லூரி பெயர் கட்டாயமானவை.' : 'Name, Register Number, and College Name are required fields.');
      sounds.playWrong();
      return;
    }

    setSubmitting(true);
    setError(null);
    sounds.playClick();

    try {
      const res = await api.submitParticipant({
        name: name.trim(),
        registerNumber: registerNumber.trim().toUpperCase(),
        collegeName: collegeName.trim(),
        teamName: (teamName || '').trim() || (isTa ? 'தனி துப்பறிவாளர்' : 'Solo Investigator'),
        gameTitle,
        totalScore,
        totalStars,
        accuracyPercentage,
        totalTimeSpentSeconds,
        totalTimeSavedSeconds,
        completedLevelsCount,
        feedback: feedback.trim(),
        rating
      });

      sounds.playCorrect();
      onSuccess(res.submission);
    } catch (err: any) {
      setError(err.message || (isTa ? 'சமர்ப்பிப்பதில் பிழை ஏற்பட்டது.' : 'Failed to submit official performance.'));
      sounds.playWrong();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#091122] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              {isTa ? 'அதிகாரப்பூர்வ துறை சான்றிதழ் & போட்டிப் பதிவு' : 'OFFICIAL BUREAU CERTIFICATION & SYMPOSIUM RECORD'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {isTa ? 'உங்கள் துப்பறியும் அமர்வை முடித்துவிட்டீர்களா?' : 'Completed your investigation session?'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {isTa 
                ? 'உங்கள் போட்டி நிலையை தரவுத்தளத்தில் பதிவு செய்ய உங்கள் பெயர், பதிவு எண், கல்லூரி பெயர் மற்றும் குழுப் பெயரைச் சமர்ப்பிக்கவும்.' 
                : 'Submit your Name, Register Number, College Name, and Team Name to persist your tournament standing in the database.'}
            </p>
            <p className="text-[11px] text-cyan-400 font-mono mt-1">
              {isTa ? 'வழக்கு நடவடிக்கை: ' : 'Case Operation: '}<span className="text-cyan-300 font-bold">{gameTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Performance Recap Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 uppercase block font-mono">{isTa ? 'புள்ளிகள்' : 'Score'}</span>
            <span className="text-lg font-black text-cyan-400 font-mono">{totalScore}</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 uppercase block font-mono">{isTa ? 'நட்சத்திரங்கள்' : 'Stars'}</span>
            <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
              {totalStars} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 uppercase block font-mono">{isTa ? 'துல்லியம்' : 'Accuracy'}</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{accuracyPercentage}%</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 uppercase block font-mono">{isTa ? 'சேமித்த நேரம்' : 'Time Saved'}</span>
            <span className="text-lg font-black text-indigo-400 font-mono">+{totalTimeSavedSeconds}s</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isTa ? 'முழுப் பெயர்' : 'Full Name'} <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isTa ? 'எ.கா. அரவிந்த் குமார்' : 'e.g. John Miller'}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-medium"
              />
            </div>

            {/* Register Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isTa ? 'பதிவு எண் / Roll No' : 'Register Number / Roll No'} <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="text"
                required
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                placeholder={isTa ? 'எ.கா. 21CS042' : 'e.g. 21CS042 / REG-9842'}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono font-medium"
              />
            </div>

            {/* College Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isTa ? 'கல்லூரி / கல்வி நிறுவனத்தின் பெயர்' : 'College / Institution Name'} <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="text"
                required
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder={isTa ? 'எ.கா. அண்ணா பல்கலைக்கழகம்' : 'e.g. National Institute of Technology'}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-medium"
              />
            </div>

            {/* Team Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isTa ? 'குழுப் பெயர் (Team Name)' : 'Team Name'}</span>
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder={isTa ? 'எ.கா. சைபர் நைட்ஸ்' : 'e.g. CyberKnights / BinarySolvers'}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-medium"
              />
            </div>
          </div>

          {/* Feedback & Rating Section */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isTa ? 'விசாரணை அனுபவம் & மதிப்பீடு (Feedback & Rating)' : 'Investigation Rating & Feedback'}</span>
              </label>

              {/* Interactive Stars Picker */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((starNum) => (
                  <button
                    type="button"
                    key={starNum}
                    onClick={() => {
                      sounds.playClick();
                      setRating(starNum);
                    }}
                    className="p-1 text-slate-600 hover:text-amber-400 transition cursor-pointer"
                    title={`${starNum} Stars`}
                  >
                    <Star
                      className={`w-4 h-4 transition ${
                        starNum <= rating
                          ? 'text-amber-400 fill-amber-400 scale-110'
                          : 'text-slate-600 hover:text-slate-400'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-mono font-bold text-amber-400 ml-1.5">
                  {rating}/5
                </span>
              </div>
            </div>

            {/* Feedback textarea */}
            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={isTa ? 'உங்கள் அனுபவம், பரிந்துரைகள் அல்லது கருத்துக்களைப் பகிரவும்...' : 'Share your case observations, feedback, or suggestions for the bureau...'}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none font-sans"
            />
          </div>

          <p className="text-[11px] text-slate-400 font-mono bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
            ℹ️ {isTa 
              ? 'சமர்ப்பிப்பது உங்கள் விவரங்கள், கருத்துக்கள் மற்றும் போட்டித் தரவுகளை தரவுத்தளத்தில் நிரந்தரமாகப் பதிவு செய்யும்.'
              : 'Submitting will persist your candidate profile, team feedback, and forensic clearance stats directly into the Bureau database for admin evaluation and tournament leaderboards.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                {isTa ? 'ரத்து செய்' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{submitting 
                  ? (isTa ? 'தரவுத்தளத்தில் பதிவு செய்யப்படுகிறது...' : 'RECORDING IN DATABASE...') 
                  : (isTa ? 'சமர்ப்பித்து விளையாட்டை முடிக்கவும்' : 'SUBMIT & FINISH GAME')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
