import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Award, 
  Star, 
  Clock, 
  Lock, 
  Unlock, 
  Play, 
  Terminal, 
  UserCheck, 
  HelpCircle, 
  Trophy, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  FolderKanban, 
  FileQuestion, 
  Image as ImageIcon, 
  Settings as SettingsIcon, 
  FileText,
  AlertTriangle,
  Zap,
  Globe,
  Search,
  Brain,
  Flame,
  Fingerprint,
  School,
  Hash,
  BookOpen,
  ChevronRight,
  Info,
  MessageSquare
} from 'lucide-react';
import { 
  GameSettings, 
  Level, 
  Question, 
  UserProfile, 
  PlayerAttempt, 
  LeaderboardEntry,
  QuestionPoster,
  AuditLog,
  GameCard,
  ParticipantSubmission
} from './types/game.ts';
import { DEFAULT_SETTINGS, DEFAULT_GAMES, DEFAULT_LEVELS, DEFAULT_QUESTIONS } from './data/defaultData.ts';
import { api, authStorage } from './services/api.ts';
import { sounds, TRANSLATIONS } from './services/soundAndLang.ts';
import { Navbar } from './components/Navbar.tsx';
import { RulesModal } from './components/RulesModal.tsx';
import { GameSettingsModal } from './components/GameSettingsModal.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';
import { InvestigationView } from './components/InvestigationView.tsx';
import { ResultView } from './components/ResultView.tsx';
import { WinnerScreen } from './components/WinnerScreen.tsx';
import { ParticipantSubmitModal } from './components/ParticipantSubmitModal.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { AdminGames } from './components/admin/AdminGames.tsx';
import { AdminParticipants } from './components/admin/AdminParticipants.tsx';
import { AdminFeedback } from './components/admin/AdminFeedback.tsx';
import { AdminSettings } from './components/admin/AdminSettings.tsx';
import { AdminResults } from './components/admin/AdminResults.tsx';

export default function App() {
  // Global App States
  const [viewMode, setViewMode] = useState<'player' | 'admin'>('player');
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  
  // Game Workflow States:
  // 1. games_list: Card list of games
  // 2. rules: Rules and Regulations ONLY of selected game
  // 3. briefing: Mission Briefing & Incident Synopsis with 30s countdown and Play Game button
  // 4. levels: Levels on that game (Easy, Medium, Hard)
  // 5. investigation: Active questioning/investigation
  // 6. results: Score recap & exhibit analysis (with Final Submission Prompt at the very end)
  // 7. winner: Final victory & official symposium certificate
  const [gameState, setGameState] = useState<'games_list' | 'rules' | 'briefing' | 'levels' | 'investigation' | 'results' | 'winner'>('games_list');

  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentLang, setCurrentLang] = useState<string>(() => localStorage.getItem('detective_lang') || 'en');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => localStorage.getItem('detective_sound') !== 'false');

  // Modals
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isGameSettingsOpen, setIsGameSettingsOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [playerInputName, setPlayerInputName] = useState('');

  // Data Collections
  const [games, setGames] = useState<GameCard[]>(DEFAULT_GAMES);
  const [selectedGame, setSelectedGame] = useState<GameCard | null>(DEFAULT_GAMES[0] || null);
  const [levels, setLevels] = useState<(Level & { isUnlocked: boolean; lockReason?: string; isCompleted: boolean; highestScore: number; highestStars: number })[]>(DEFAULT_LEVELS);
  const [allQuestions, setAllQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  
  // Admin Data Collections
  const [adminGames, setAdminGames] = useState<GameCard[]>([]);
  const [adminResults, setAdminResults] = useState<PlayerAttempt[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Active Game Session
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<PlayerAttempt | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [lastFinishedAttempt, setLastFinishedAttempt] = useState<PlayerAttempt | null>(null);
  const [latestSubmission, setLatestSubmission] = useState<ParticipantSubmission | null>(null);

  // Time Limit for Mission Briefing & Incident Synopsis (30s)
  const [briefingCountdown, setBriefingCountdown] = useState<number>(30);

  // Initialize app
  const loadGameData = async () => {
    try {
      const [init, gamesList, levelsList, board, me, qList] = await Promise.all([
        api.getGameInit().catch(() => null),
        api.getGames().catch(() => null),
        api.getLevels().catch(() => null),
        api.getLeaderboard().catch(() => []),
        api.getCurrentUser().catch(() => null),
        api.getGameQuestions().catch(() => [])
      ]);

      if (init?.settings) {
        setSettings(init.settings);
      }
      sounds.enabled = soundEnabled;
      if (gamesList && gamesList.length > 0) {
        setGames(gamesList);
        if (!selectedGame) {
          setSelectedGame(gamesList[0]);
        }
      } else {
        setGames(DEFAULT_GAMES);
        if (!selectedGame) {
          setSelectedGame(DEFAULT_GAMES[0]);
        }
      }
      if (levelsList && levelsList.length > 0) {
        setLevels(levelsList);
      } else {
        setLevels(DEFAULT_LEVELS);
      }
      if (board && Array.isArray(board)) {
        setLeaderboard(board);
      }
      if (me) {
        setCurrentUser(me);
      }
      if (qList && qList.length > 0) {
        setAllQuestions(qList);
      } else {
        setAllQuestions(DEFAULT_QUESTIONS);
      }
    } catch (err) {
      console.warn('Initialization error:', err);
    }
  };

  const loadAdminData = async () => {
    try {
      const [dash, gms, res, setts] = await Promise.all([
        api.getDashboard(),
        api.getAdminGames(),
        api.getAdminResults(),
        api.getAdminSettings()
      ]);
      setDashboardMetrics(dash);
      setAdminGames(gms);
      setAdminResults(res);
      setSettings(setts);
    } catch (err) {
      console.error('Admin data load error:', err);
    }
  };

  useEffect(() => {
    loadGameData();
  }, []);

  useEffect(() => {
    if (viewMode === 'admin') {
      loadAdminData();
    }
  }, [viewMode, adminTab]);

  // Mission Briefing & Incident Synopsis countdown timer in Play Mode
  useEffect(() => {
    if (gameState === 'briefing') {
      const duration = settings?.briefingTimerSeconds || 30;
      setBriefingCountdown(duration);
      const timer = setInterval(() => {
        setBriefingCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            sounds.playClick();
            setGameState('levels');
            return 0;
          }
          if (prev <= 5 && prev > 1) {
            sounds.playTick();
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, settings?.briefingTimerSeconds]);

  const handleLanguageChange = (lang: string) => {
    setCurrentLang(lang);
    localStorage.setItem('detective_lang', lang);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    localStorage.setItem('detective_sound', String(next));
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setViewMode('player');
    setGameState('games_list');
    loadGameData();
  };

  const handlePlayerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerInputName.trim()) return;
    try {
      const res = await api.playerRegister(playerInputName.trim());
      setCurrentUser(res.user);
      setIsPlayerModalOpen(false);
      loadGameData();
    } catch (err: any) {
      alert(`Registration failed: ${err.message}`);
    }
  };

  // Launch a Case Level
  const handleStartCase = async (lvl: Level & { isUnlocked?: boolean; lockReason?: string }) => {
    const isEffectivelyUnlocked = lvl.isUnlocked ||
      Boolean(lastFinishedAttempt && lastFinishedAttempt.starsEarned >= 2) ||
      lvl.difficulty === 'easy';

    if (!isEffectivelyUnlocked) {
      sounds.playWrong();
      alert(`Case Dossier Locked: ${lvl.lockReason || 'Clear previous cases to earn necessary security stars.'}`);
      return;
    }

    sounds.playClick();
    try {
      const res = await api.startAttempt(lvl.id);
      setActiveLevel(lvl);
      setActiveAttempt(res.attempt);
      setActiveQuestions(res.questions);
      setGameState('investigation');
    } catch (err: any) {
      alert(`Cannot start case: ${err.message}`);
    }
  };

  // On Case Level Finished
  const handleFinishCase = (completedAttempt: PlayerAttempt & { updatedLevels?: any[] }) => {
    setLastFinishedAttempt(completedAttempt);

    // Update levels immediately in state
    setLevels((prev) => {
      const nextLevels = (completedAttempt.updatedLevels && Array.isArray(completedAttempt.updatedLevels))
        ? completedAttempt.updatedLevels
        : prev;

      return nextLevels.map((l) => {
        if (l.id === completedAttempt.levelId) {
          return {
            ...l,
            isCompleted: true,
            highestStars: Math.max(l.highestStars || 0, completedAttempt.starsEarned),
            highestScore: Math.max(l.highestScore || 0, completedAttempt.totalScore)
          };
        }
        // Unlock next stage if previous level completed with >= 2 stars
        if (
          (l.unlockRequirements?.requiredPreviousLevelId === completedAttempt.levelId || l.difficulty === 'medium') &&
          completedAttempt.starsEarned >= 2
        ) {
          return {
            ...l,
            isUnlocked: true,
            lockReason: undefined
          };
        }
        return l;
      });
    });

    setGameState('results');
    loadGameData();
  };

  // On Official Participant Submission Succeeded
  const handleSubmissionComplete = (sub: ParticipantSubmission) => {
    setLatestSubmission(sub);
    setIsParticipantModalOpen(false);
    setGameState('winner');
    loadGameData();
  };

  // Auto-refresh and reset all game states to start from beginning
  const handleResetGameToBeginning = async () => {
    sounds.playClick();
    try {
      await api.resetGameSession();
    } catch (err) {
      console.warn('Session reset error:', err);
    }
    setActiveLevel(null);
    setActiveAttempt(null);
    setLastFinishedAttempt(null);
    setLatestSubmission(null);
    setIsParticipantModalOpen(false);
    setGameState('games_list');
    await loadGameData();
  };

  // Calculations for Career Dossier
  const totalStars = levels.reduce((acc, l) => acc + (l.highestStars || 0), 0);
  const totalScore = levels.reduce((acc, l) => acc + (l.highestScore || 0), 0);
  const completedCount = levels.filter(l => l.isCompleted).length;
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Universal Navbar */}
      {settings && (
        <Navbar
          settings={settings}
          currentUser={currentUser}
          currentLang={currentLang}
          onLanguageChange={handleLanguageChange}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onOpenRules={() => setIsRulesModalOpen(true)}
          onOpenGameSettings={() => setIsGameSettingsOpen(true)}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          onOpenAdminPanel={() => {
            setViewMode('admin');
          }}
          onLogout={handleLogout}
          totalStars={totalStars}
          totalScore={totalScore}
          viewMode={viewMode}
          onSwitchToPlayer={() => {
            setViewMode('player');
            setGameState('games_list');
            loadGameData();
          }}
          onGoToCases={() => {
            setViewMode('player');
            setGameState('games_list');
            loadGameData();
          }}
        />
      )}

      {/* ======================================================== */}
      {/* 1. PLAYER INTERFACE */}
      {/* ======================================================== */}
      {viewMode === 'player' && (
        <main className="pb-16">
          {/* ---------------------------------------------------- */}
          {/* STEP 1: CARD LIST OF GAMES */}
          {/* ---------------------------------------------------- */}
          {gameState === 'games_list' && (
            <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 md:py-16 bg-[#070d18] relative overflow-hidden">
              {/* Subtle Ambient Radial Glow */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-cyan-950/25 blur-[130px] rounded-full pointer-events-none" />

              <div className="w-full max-w-5xl relative z-10 space-y-8">
                {/* Header */}
                <div className="text-center space-y-4 flex flex-col items-center">
                  <div className="w-[80%] max-w-xl mx-auto h-40 sm:h-52 rounded-2xl bg-cyan-950/60 border-2 border-cyan-500/50 p-2 shadow-[0_0_30px_rgba(34,211,238,0.35)] flex items-center justify-center overflow-hidden mb-1 animate-fade-in hover:scale-105 transition-transform duration-300">
                    <img 
                      src={settings?.logoUrl || '/infoxtreme_logo.jpg'} 
                      alt="InfoXtreme '26 Cyber Crime Bureau Logo" 
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-[11px] font-mono text-cyan-400 font-bold tracking-wider uppercase">
                    <Shield className="w-3.5 h-3.5" />
                    {currentLang === 'ta' ? 'மத்திய தடயவியல் குற்றப் பிரிவு' : 'SMIT CENTRAL FORENSIC CRIME BUREAU'}
                  </span>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-sans">
                    {currentLang === 'ta' ? 'வழக்குக் கோப்பைத் தேர்ந்தெடுக்கவும்' : 'Choose a case file'}
                  </h1>
                  <p className="max-w-xl mx-auto text-sm text-slate-400">
                    {currentLang === 'ta'
                      ? 'செயலில் உள்ள குற்றவியல் விசாரணையை கீழே தேர்வு செய்யவும். சான்றுகளை ஆய்வு செய்து, மறைகுறியீடுகளை அவிழ்த்து, உங்கள் அணியின் அதிகாரப்பூர்வ மதிப்பெண்ணைச் சமர்ப்பிக்கவும்.'
                      : 'Select an active criminal investigation below. Review case exhibits, analyze forensic posters, decrypt rogue data, and submit your official team score.'}
                  </p>
                </div>

                {/* Cards List of Games */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch justify-center">
                  {games.map((g) => {
                    const isSelected = selectedGame?.id === g.id;
                    const gameTitle = currentLang === 'ta' && g.translations?.ta?.title ? g.translations.ta.title : g.title;
                    const gameTagline = currentLang === 'ta' && g.translations?.ta?.tagline ? g.translations.ta.tagline : g.tagline;
                    const gameDescription = currentLang === 'ta' && g.translations?.ta?.description ? g.translations.ta.description : g.description;
                    const gameCategory = currentLang === 'ta' && g.translations?.ta?.category ? g.translations.ta.category : g.category;

                    return (
                      <div
                        key={g.id}
                        className={`bg-[#0b1324]/90 border rounded-2xl p-7 flex flex-col justify-between shadow-2xl transition-all duration-200 relative group ${
                          isSelected
                            ? 'border-cyan-500/80 ring-1 ring-cyan-500/30 shadow-cyan-500/10'
                            : 'border-slate-800/80 hover:border-slate-700/90'
                        }`}
                      >
                        <div>
                          {/* Badges */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-mono font-bold text-cyan-400 px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 uppercase">
                              {gameCategory}
                            </span>
                            <span className="text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-900/50">
                              {g.badge}
                            </span>
                          </div>

                          {/* Icon Graphic */}
                          <div className="w-14 h-14 rounded-2xl bg-cyan-950/40 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition">
                            {g.icon === 'fingerprint' ? (
                              <Fingerprint className="w-8 h-8" />
                            ) : g.icon === 'shield' ? (
                              <Shield className="w-8 h-8" />
                            ) : (
                              <Terminal className="w-8 h-8" />
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-white mb-1.5 tracking-tight">
                            {gameTitle}
                          </h3>
                          <p className="text-xs font-semibold text-cyan-300 mb-3">
                            {gameTagline}
                          </p>
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-5">
                            {gameDescription}
                          </p>
                        </div>

                        {/* Meta info & Action */}
                        <div className="space-y-4 pt-4 border-t border-slate-800/80">
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span>{currentLang === 'ta' ? 'நிலைகள்:' : 'Stages:'} <strong className="text-white">{g.totalLevels} {currentLang === 'ta' ? 'நிலைகள்' : 'Levels'}</strong></span>
                            <span>{currentLang === 'ta' ? 'அவகாசம்:' : 'Est:'} <strong className="text-white">{g.estimatedTime}</strong></span>
                          </div>

                          <button
                            onClick={() => {
                              sounds.playClick();
                              setSelectedGame(g);
                              setGameState('rules');
                            }}
                            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
                          >
                            <span>{currentLang === 'ta' ? 'வழக்கைத் தேர்ந்தெடு (விதிகள்)' : 'SELECT CASE & VIEW RULES'}</span>
                            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>


              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 2: RULES AND REGULATIONS ONLY FOR SELECTED GAME */}
          {/* ---------------------------------------------------- */}
          {gameState === 'rules' && selectedGame && (
            <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 bg-[#070d18] relative overflow-hidden animate-fade-in">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-cyan-950/20 blur-[130px] rounded-full pointer-events-none" />

              <div className="w-full max-w-4xl relative z-10 space-y-6">
                {/* Back button */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    setGameState('games_list');
                  }}
                  className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{currentLang === 'ta' ? 'வேறு வழக்கைத் தேர்ந்தெடுக்கவும்' : 'Choose a Different Case File'}</span>
                </button>

                {/* Rules Container */}
                <div className="bg-[#0b1324]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-[10px] font-mono text-cyan-400 font-bold tracking-wider uppercase mb-2">
                        <Shield className="w-3 h-3" />
                        {currentLang === 'ta' ? 'அதிகாரப்பூர்வ போட்டி நெறிமுறைகள்' : 'OFFICIAL BUREAU PROTOCOLS'}
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
                        <Shield className="w-7 h-7 text-cyan-400" />
                        <span>{currentLang === 'ta' ? 'விதிகள் மற்றும் ஒழுங்குமுறைகள்' : 'RULES AND REGULATIONS'}</span>
                      </h1>
                      <p className="text-xs font-mono text-cyan-300 mt-1">
                        {currentLang === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட வழக்கு: ' : 'ACTIVE CASE DOSSIER: '}
                        <strong>{currentLang === 'ta' && selectedGame.translations?.ta?.title ? selectedGame.translations.ta.title : selectedGame.title}</strong>
                      </p>
                    </div>

                    <div className="bg-slate-950/90 border border-slate-800 rounded-2xl px-4 py-2.5 text-center shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">
                        {currentLang === 'ta' ? 'விதிகள் மொழி' : 'DIRECTIVES LANGUAGE'}
                      </span>
                      <span className="text-xs font-bold text-cyan-400 font-mono">
                        {currentLang === 'ta' ? 'தமிழ் (TAMIL)' : 'ENGLISH (EN)'}
                      </span>
                    </div>
                  </div>

                  {/* Rules and Regulations Detail Cards */}
                  <div className="space-y-3.5">
                    {(selectedGame?.rules && selectedGame.rules.length > 0
                      ? selectedGame.rules.map((ruleText, idx) => ({
                          titleEn: `Rule ${idx + 1}`,
                          titleTa: `விதி ${idx + 1}`,
                          descEn: ruleText,
                          descTa: ruleText,
                          icon: Shield,
                          color: 'text-cyan-400'
                        }))
                      : [
                      {
                        titleEn: '1. Strict Countdown Timers',
                        titleTa: '1. கடுமையான கவுண்ட்டவுன் டைமர்',
                        descEn: 'Each exhibit is governed by an authoritative countdown timer. Inspect the forensic evidence poster, evaluate timestamps, and confirm your deduction before the time window expires.',
                        descTa: 'ஒவ்வொரு ஆதாரத்திற்கும் குறிப்பிட்ட கவுண்ட்டவுன் டைமர் நிர்ணயிக்கப்பட்டுள்ளது. சான்றுகளைப் பார்த்து நேரம் முடிவதற்குள் உங்கள் துப்பறியும் முடிவை உறுதி செய்ய வேண்டும்.',
                        icon: Clock,
                        color: 'text-cyan-400'
                      },
                      {
                        titleEn: '2. Difficulty Clearance & Progression',
                        titleTa: '2. நிலை அனுமதி மற்றும் முன்னேற்றம்',
                        descEn: 'Easy stage is open immediately. Medium stage requires at least 2 Detective Stars from Easy. Hard stage requires at least 2 Stars from Medium.',
                        descTa: 'எளிதான நிலை (Easy) உடனடியாக திறக்கப்பட்டுள்ளது. நடுத்தர நிலைக்கு (Medium) Easy-ல் 2 நட்சத்திரங்களும், கடின நிலைக்கு (Hard) Medium-ல் 2 நட்சத்திரங்களும் தேவை.',
                        icon: Star,
                        color: 'text-amber-400'
                      },
                      {
                        titleEn: '3. Speed Bonuses & Deductions',
                        titleTa: '3. வேக போனஸ் & அபராதங்கள்',
                        descEn: 'Generous speed bonuses are awarded for every unused second. Incorrect deductions and consulting Bureau hints incur point penalties.',
                        descTa: 'மிச்சப்படுத்திய ஒவ்வொரு விநாடிக்கும் வேக போனஸ் புள்ளிகள் வழங்கப்படும். தவறான பதில்களுக்கும் குறிப்புகளுக்கும் புள்ளிகள் குறைக்கப்படும்.',
                        icon: Zap,
                        color: 'text-emerald-400'
                      },
                      {
                        titleEn: '4. Evidence Inspection Protocol',
                        titleTa: '4. சான்றுகள் ஆய்வு முறை',
                        descEn: 'Click "Inspect Evidence" on any question to zoom into full-resolution network topologies, frequency spectrums, and crime scene blueprints.',
                        descTa: 'போஸ்டர் சான்றுகள், வரைபடங்கள் மற்றும் வேதியியல் நிறமாலையை பெரிதாக்கி ஆராய "Inspect Evidence" கருவியைப் பயன்படுத்தவும்.',
                        icon: Search,
                        color: 'text-indigo-400'
                      },
                      {
                        titleEn: '5. Official Database Submission',
                        titleTa: '5. அதிகாரப்பூர்வ போட்டிப் பதிவு',
                        descEn: 'Only upon completing your full investigation session, submit your Name, Register Number, College Name, and Team Name to persist your tournament standing in the database.',
                        descTa: 'உங்கள் முழு துப்பறியும் அமர்வை முடித்த பின்னரே உங்கள் பெயர், பதிவு எண், கல்லூரி பெயர் மற்றும் குழுப் பெயரைச் சமர்ப்பித்து தரவுத்தளத்தில் பதிவு செய்ய வேண்டும்.',
                        icon: Award,
                        color: 'text-cyan-300'
                      }
                    ]).map((rule, idx) => {
                      const Icon = rule.icon;
                      return (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex items-start gap-3.5 transition hover:border-slate-700">
                          <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 ${rule.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs sm:text-sm font-bold text-white">
                              {currentLang === 'ta' ? rule.titleTa : rule.titleEn}
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {currentLang === 'ta' ? rule.descTa : rule.descEn}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Primary Next Action */}
                  <div className="pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-400 font-mono">
                      {currentLang === 'ta' ? 'அடுத்த படி: ' : 'Next Protocol: '}
                      <strong className="text-white">{currentLang === 'ta' ? 'பணி சுருக்கம் & சம்பவ விவரம் (30 விநாடிகள்)' : 'Mission Briefing & Incident Synopsis (30s)'}</strong>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        setGameState('briefing');
                      }}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-400/20 transition cursor-pointer hover:scale-[1.02]"
                    >
                      <span>{currentLang === 'ta' ? 'அடுத்து: பணி சுருக்கம் & சம்பவ விவரம் (30s)' : 'NEXT: MISSION BRIEFING & INCIDENT SYNOPSIS (30s)'}</span>
                      <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 2B: MISSION BRIEFING & INCIDENT SYNOPSIS IN 30S */}
          {/* ---------------------------------------------------- */}
          {gameState === 'briefing' && selectedGame && (
            <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 bg-[#070d18] relative overflow-hidden animate-fade-in">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-cyan-950/20 blur-[130px] rounded-full pointer-events-none" />

              <div className="w-full max-w-4xl relative z-10 space-y-6">
                {/* Back button */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    setGameState('rules');
                  }}
                  className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{currentLang === 'ta' ? 'விதிகளுக்குத் திரும்பு' : 'Back to Rules and Regulations'}</span>
                </button>

                {/* Case Dossier Container */}
                <div className="bg-[#0b1324]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
                  {/* Top Bar with 30s Countdown Widget */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2.5 py-0.5 rounded">
                          {currentLang === 'ta' && selectedGame.translations?.ta?.category ? selectedGame.translations.ta.category : selectedGame.category}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-900/50 px-2.5 py-0.5 rounded">
                          {selectedGame.badge}
                        </span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-black text-white">
                        {currentLang === 'ta' && selectedGame.translations?.ta?.title ? selectedGame.translations.ta.title : selectedGame.title}
                      </h1>
                      <p className="text-xs font-mono text-cyan-300 mt-1">
                        OPERATION BRIEFING // {currentLang === 'ta' && selectedGame.translations?.ta?.tagline ? selectedGame.translations.ta.tagline : selectedGame.tagline}
                      </p>
                    </div>

                    {/* Time limit for Briefing: Briefing Timer Widget */}
                    <div className="bg-slate-950/90 border border-cyan-500/70 rounded-2xl p-4 text-center shrink-0 min-w-[220px] shadow-xl shadow-cyan-950/50 space-y-2">
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                        <Clock className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                        <span>{currentLang === 'ta' ? `பணி சுருக்க அவகாசம்: ${settings?.briefingTimerSeconds || 30}s` : `BRIEFING TIMER: ${settings?.briefingTimerSeconds || 30}s`}</span>
                      </div>

                      <div className="text-3xl font-black font-mono tracking-tight text-white flex items-center justify-center gap-1.5">
                        <span className={briefingCountdown <= 5 ? "text-rose-400 animate-pulse" : "text-cyan-400"}>
                          00:{briefingCountdown.toString().padStart(2, '0')}
                        </span>
                        <span className="text-xs text-slate-500 font-normal font-mono">({briefingCountdown}s)</span>
                      </div>

                      {/* Animated Progress Bar for Briefing Timer */}
                      <div className="w-full bg-slate-800/90 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${briefingCountdown <= 5 ? 'bg-rose-500' : 'bg-cyan-400'}`}
                          style={{ width: `${Math.max(0, Math.min(100, (briefingCountdown / (settings?.briefingTimerSeconds || 30)) * 100))}%` }}
                        />
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 block">
                        {currentLang === 'ta' ? 'கவுண்ட்டவுன் முடிந்ததும் தானாகத் தொடங்கும்' : 'Auto-starts game upon countdown expiry'}
                      </span>
                    </div>
                  </div>

                  {/* Narrative Dossier */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono uppercase text-cyan-400 tracking-wider font-bold flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span>{currentLang === 'ta' ? 'பணி சுருக்கம் மற்றும் சம்பவ விவரம்' : 'MISSION BRIEFING & INCIDENT SYNOPSIS'}</span>
                    </h3>
                    <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                        {currentLang === 'ta' && selectedGame.translations?.ta?.description ? selectedGame.translations.ta.description : selectedGame.description}
                      </p>
                    </div>
                  </div>

                  {/* Tactical Intelligence Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">
                        {currentLang === 'ta' ? 'இலக்கு 1: சான்றுகள்' : 'TARGET 1: EVIDENCE'}
                      </span>
                      <p className="text-xs text-slate-400">
                        {currentLang === 'ta' ? 'தடயவியல் போஸ்டர்கள் மற்றும் டோபாலஜி பதிவுகளை ஆராயவும்.' : 'Inspect forensic posters, network topologies, and evidence frames.'}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left">
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block mb-1">
                        {currentLang === 'ta' ? 'இலக்கு 2: குறியாக்கம்' : 'TARGET 2: DECRYPTION'}
                      </span>
                      <p className="text-xs text-slate-400">
                        {currentLang === 'ta' ? 'போலி அட்டைகள், சங்கேதங்கள் மற்றும் நச்சு நிறமாலையைக் கண்டறியவும்.' : 'Detect cloned RFID badges, spectral toxins, and rogue payloads.'}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-1">
                        {currentLang === 'ta' ? 'இலக்கு 3: நடுநிலையாக்கம்' : 'TARGET 3: NEUTRALIZE'}
                      </span>
                      <p className="text-xs text-slate-400">
                        {currentLang === 'ta' ? 'லேசர் கிரிட்டை செயலிழக்கச் செய்து தப்பிக்கும் வாகனத்தை மறிக்கவும்.' : 'Disarm laser arrays and intercept the getaway craft before extraction.'}
                      </p>
                    </div>
                  </div>

                  {/* Primary Start Action */}
                  <div className="pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-400 font-mono">
                      {currentLang === 'ta' ? 'நிலைகள்: ' : 'Target Stages: '}
                      <strong className="text-white">{currentLang === 'ta' ? '3 புலனாய்வு நிலைகள் (Easy, Medium, Hard)' : '3 Investigation Levels (Easy, Medium, Hard)'}</strong>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        setGameState('levels');
                      }}
                      className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-cyan-400/20 transition cursor-pointer hover:scale-[1.02]"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{currentLang === 'ta' ? 'விளையாடத் தொடங்கு (PLAY GAME)' : 'PLAY GAME'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 3: LEVELS ON THAT GAME (EASY, MEDIUM, HARD) */}
          {/* ---------------------------------------------------- */}
          {gameState === 'levels' && (
            <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 md:py-14 bg-[#070d18] relative overflow-hidden animate-fade-in">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-cyan-950/20 blur-[130px] rounded-full pointer-events-none" />

              <div className="w-full max-w-5xl relative z-10 space-y-8">
                {/* Top Nav: Back to Briefing */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setGameState('briefing');
                    }}
                    className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{currentLang === 'ta' ? 'பணி சுருக்கத்திற்குத் திரும்பு' : 'Back to Mission Briefing'}</span>
                  </button>

                  {selectedGame && (
                    <span className="text-xs font-mono text-cyan-400">
                      {currentLang === 'ta' ? 'செயலில் உள்ள வழக்கு: ' : 'Active Case: '}
                      <strong>{currentLang === 'ta' && selectedGame.translations?.ta?.title ? selectedGame.translations.ta.title : selectedGame.title}</strong>
                    </span>
                  )}
                </div>

                {/* Centered Headline */}
                <div className="text-center space-y-2">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-sans">
                    {currentLang === 'ta' ? 'வழக்குக் கோப்பைத் தேர்ந்தெடுக்கவும்' : 'Choose a case file'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                    {currentLang === 'ta'
                      ? 'உங்கள் கடின நிலையைத் தேர்ந்தெடுக்கவும். அடுத்த நிலைகளைத் திறக்க ஆதாரங்களை துல்லியமாகத் தீர்க்கவும்.'
                      : 'Select your difficulty clearance tier. Clear questions accurately and swiftly to unlock higher stages.'}
                  </p>
                </div>

                {/* 3 Main Level Cards (Easy, Medium, Hard) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch justify-center">
                  {/* CARD 1: EASY */}
                  {(() => {
                    const gameLevels = levels.filter(l => l.gameId === selectedGame?.id);
                    const easyLvl = gameLevels.find(l => l.difficulty === 'easy') || levels.find(l => l.difficulty === 'easy') || levels[0];
                    const count = allQuestions.filter(q => q.levelId === easyLvl?.id).length || 3;
                    return (
                      <div className="bg-[#0b1324]/90 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-8 flex flex-col items-center text-center justify-between min-h-[380px] shadow-2xl transition-all">
                        <div className="flex flex-col items-center w-full">
                          {/* Magnifying Glass Icon in Cyan */}
                          <div className="w-14 h-14 rounded-full flex items-center justify-center text-cyan-400 mb-4">
                            <Search className="w-9 h-9 text-cyan-400 stroke-[2.2]" />
                          </div>

                          <h2 className="text-xl font-bold tracking-wider text-white mb-2 font-sans uppercase">
                            EASY
                          </h2>

                          {/* 3 Stars */}
                          <div className="flex items-center justify-center gap-1.5 my-2">
                            {[1, 2, 3].map((starNum) => {
                              const isEarned = (easyLvl?.highestStars || 0) >= starNum;
                              return (
                                <Star
                                  key={starNum}
                                  className={`w-5 h-5 ${
                                    isEarned
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-600 stroke-[1.5]'
                                  }`}
                                />
                              );
                            })}
                          </div>

                          <p className="text-sm text-slate-400 mb-6 font-medium">
                            {count} Questions
                          </p>
                        </div>

                        {/* PLAY Button */}
                        <div className="w-full flex flex-col items-center">
                          <button
                            onClick={() => easyLvl && handleStartCase(easyLvl)}
                            className="w-full max-w-[170px] border-2 border-cyan-400 bg-transparent hover:bg-cyan-400 hover:text-slate-950 text-cyan-400 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm tracking-widest uppercase transition-all shadow-lg shadow-cyan-400/10 cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>PLAY</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* CARD 2: MEDIUM */}
                  {(() => {
                    const gameLevels = levels.filter(l => l.gameId === selectedGame?.id);
                    const mediumLvl = gameLevels.find(l => l.difficulty === 'medium') || levels.find(l => l.difficulty === 'medium') || levels[1];
                    const easyStarsEarned = levels.filter(l => l.difficulty === 'easy').reduce((max, l) => Math.max(max, l.highestStars || 0), 0) || 
                      (lastFinishedAttempt && lastFinishedAttempt.levelDifficulty === 'easy' ? lastFinishedAttempt.starsEarned : 0);
                    const isUnlocked = (mediumLvl?.isUnlocked ?? false) || easyStarsEarned >= 2;
                    const count = allQuestions.filter(q => q.levelId === mediumLvl?.id).length || 3;
                    return (
                      <div className="bg-[#0b1324]/90 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-8 flex flex-col items-center text-center justify-between min-h-[380px] shadow-2xl transition-all">
                        <div className="flex flex-col items-center w-full">
                          {/* Brain Icon in Gold/Amber */}
                          <div className="w-14 h-14 rounded-full flex items-center justify-center text-[#e5a93c] mb-4">
                            <Brain className="w-9 h-9 text-[#e5a93c] stroke-[2.2]" />
                          </div>

                          <h2 className="text-xl font-bold tracking-wider text-white mb-2 font-sans uppercase">
                            MEDIUM
                          </h2>

                          {/* 3 Stars */}
                          <div className="flex items-center justify-center gap-1.5 my-2">
                            {[1, 2, 3].map((starNum) => {
                              const isEarned = (mediumLvl?.highestStars || 0) >= starNum;
                              return (
                                <Star
                                  key={starNum}
                                  className={`w-5 h-5 ${
                                    isEarned
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-600 stroke-[1.5]'
                                  }`}
                                />
                              );
                            })}
                          </div>

                          <p className="text-sm text-slate-400 mb-6 font-medium">
                            {count} Questions
                          </p>
                        </div>

                        {/* PLAY or LOCKED Button */}
                        <div className="w-full flex flex-col items-center">
                          {isUnlocked ? (
                            <button
                              onClick={() => mediumLvl && handleStartCase(mediumLvl)}
                              className="w-full max-w-[170px] border-2 border-amber-400 bg-transparent hover:bg-amber-400 hover:text-slate-950 text-amber-400 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm tracking-widest uppercase transition-all shadow-lg shadow-amber-400/10 cursor-pointer"
                            >
                              <Play className="w-4 h-4 fill-current" />
                              <span>PLAY</span>
                            </button>
                          ) : (
                            <>
                              <button
                                disabled
                                className="w-full max-w-[170px] bg-[#121929] border border-slate-800 text-slate-500 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm tracking-widest uppercase cursor-not-allowed select-none"
                              >
                                <Lock className="w-4 h-4 text-slate-500" />
                                <span>LOCKED</span>
                              </button>
                              <p className="text-slate-500 text-xs mt-3.5 font-medium">
                                Earn 2 stars on Easy
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* CARD 3: HARD */}
                  {(() => {
                    const gameLevels = levels.filter(l => l.gameId === selectedGame?.id);
                    const hardLvl = gameLevels.find(l => l.difficulty === 'hard') || levels.find(l => l.difficulty === 'hard') || levels[2];
                    const mediumStarsEarned = levels.filter(l => l.difficulty === 'medium').reduce((max, l) => Math.max(max, l.highestStars || 0), 0) || 
                      (lastFinishedAttempt && lastFinishedAttempt.levelDifficulty === 'medium' ? lastFinishedAttempt.starsEarned : 0);
                    const isUnlocked = (hardLvl?.isUnlocked ?? false) || mediumStarsEarned >= 2;
                    const count = allQuestions.filter(q => q.levelId === hardLvl?.id).length || 3;
                    return (
                      <div className="bg-[#0b1324]/90 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-8 flex flex-col items-center text-center justify-between min-h-[380px] shadow-2xl transition-all">
                        <div className="flex flex-col items-center w-full">
                          {/* Flame Icon in Rose/Pink */}
                          <div className="w-14 h-14 rounded-full flex items-center justify-center text-[#f43f5e] mb-4">
                            <Flame className="w-9 h-9 text-[#f43f5e] stroke-[2.2]" />
                          </div>

                          <h2 className="text-xl font-bold tracking-wider text-white mb-2 font-sans uppercase">
                            HARD
                          </h2>

                          {/* 3 Stars */}
                          <div className="flex items-center justify-center gap-1.5 my-2">
                            {[1, 2, 3].map((starNum) => {
                              const isEarned = (hardLvl?.highestStars || 0) >= starNum;
                              return (
                                <Star
                                  key={starNum}
                                  className={`w-5 h-5 ${
                                    isEarned
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-600 stroke-[1.5]'
                                  }`}
                                />
                              );
                            })}
                          </div>

                          <p className="text-sm text-slate-400 mb-6 font-medium">
                            {count} Questions
                          </p>
                        </div>

                        {/* PLAY or LOCKED Button */}
                        <div className="w-full flex flex-col items-center">
                          {isUnlocked ? (
                            <button
                              onClick={() => hardLvl && handleStartCase(hardLvl)}
                              className="w-full max-w-[170px] border-2 border-rose-500 bg-transparent hover:bg-rose-500 hover:text-slate-950 text-rose-400 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm tracking-widest uppercase transition-all shadow-lg shadow-rose-500/10 cursor-pointer"
                            >
                              <Play className="w-4 h-4 fill-current" />
                              <span>PLAY</span>
                            </button>
                          ) : (
                            <>
                              <button
                                disabled
                                className="w-full max-w-[170px] bg-[#121929] border border-slate-800 text-slate-500 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm tracking-widest uppercase cursor-not-allowed select-none"
                              >
                                <Lock className="w-4 h-4 text-slate-500" />
                                <span>LOCKED</span>
                              </button>
                              <p className="text-slate-500 text-xs mt-3.5 font-medium">
                                Earn 2 stars on Medium
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 4: INVESTIGATION GAMEPLAY VIEW */}
          {/* ---------------------------------------------------- */}
          {gameState === 'investigation' && activeLevel && activeAttempt && settings && (
            <InvestigationView
              level={activeLevel}
              questions={activeQuestions}
              attempt={activeAttempt}
              settings={settings}
              currentLang={currentLang}
              onFinishCase={handleFinishCase}
              onAbandon={() => {
                setGameState('levels');
                loadGameData();
              }}
            />
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 5: RESULTS AND SCORE RECAP VIEW */}
          {/* ---------------------------------------------------- */}
          {gameState === 'results' && lastFinishedAttempt && (
            <ResultView
              attempt={lastFinishedAttempt}
              levels={levels}
              currentLang={currentLang}
              onDeployNextLevel={(nextId) => {
                const nextLvl = levels.find(l => l.id === nextId);
                if (nextLvl) handleStartCase({ ...nextLvl, isUnlocked: true });
              }}
              onReplayLevel={(levelId) => {
                const lvl = levels.find(l => l.id === levelId);
                if (lvl) handleStartCase(lvl);
              }}
              onReturnToHub={() => {
                setGameState('levels');
                loadGameData();
              }}
              onViewWinnerScreen={() => setGameState('winner')}
              onFinishGame={() => {
                sounds.playClick();
                setIsParticipantModalOpen(true);
              }}
              onRestartToBeginning={handleResetGameToBeginning}
              onOpenAdmin={() => {
                if (currentUser && ['super_admin', 'content_admin', 'game_manager', 'analyst'].includes(currentUser.role)) {
                  setViewMode('admin');
                } else {
                  setIsAdminLoginOpen(true);
                }
              }}
            />
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 6: WINNER & CERTIFICATE SCREEN */}
          {/* ---------------------------------------------------- */}
          {gameState === 'winner' && (
            <WinnerScreen
              totalStars={totalStars}
              totalScore={totalScore}
              completedCount={completedCount}
              totalTimeSaved={lastFinishedAttempt?.totalTimeSavedSeconds || 36}
              totalTimeSpent={lastFinishedAttempt?.totalTimeSpentSeconds || 84}
              leaderboard={leaderboard}
              currentUserId={currentUser?.id}
              submission={latestSubmission}
              onReturnToHub={handleResetGameToBeginning}
              currentLang={currentLang}
            />
          )}
        </main>
      )}

      {/* ======================================================== */}
      {/* 2. ADMIN PANEL INTERFACE */}
      {/* ======================================================== */}
      {viewMode === 'admin' && (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
          {/* Admin Sidebar Navigation */}
          <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-6 shrink-0">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                COMMAND CENTER
              </span>
              <h2 className="text-base font-bold text-white">Bureau Administration</h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Operator: {currentUser?.displayName || 'Admin'}
              </p>
            </div>

            <nav className="space-y-1 text-xs font-medium">
              {[
                { id: 'dashboard', label: 'Dashboard Overview', icon: Shield },
                { id: 'games', label: 'Case Modules (Game Cards)', icon: FolderKanban },
                { id: 'participants', label: 'College Team Records', icon: School },
                { id: 'feedback', label: 'Team Reviews & Feedback', icon: MessageSquare },
                { id: 'results', label: 'Results & Attempts', icon: Award },
                { id: 'leaderboard', label: 'Clearance Leaderboard', icon: Trophy },
                { id: 'settings', label: 'Game Settings & Timers', icon: SettingsIcon }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      sounds.playClick();
                      setAdminTab(item.id);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                      isActive
                        ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setViewMode('player');
                  setGameState('games_list');
                  loadGameData();
                }}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Switch to Player Mode
              </button>
            </div>
          </aside>

          {/* Admin Content Canvas */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {adminTab === 'dashboard' && (
              <AdminDashboard
                metrics={dashboardMetrics}
                totalGamesCount={adminGames.length}
                onNavigateTab={(tab) => setAdminTab(tab)}
              />
            )}

            {adminTab === 'games' && (
              <AdminGames
                games={adminGames}
                onRefresh={loadAdminData}
                onNavigateTab={(tab) => setAdminTab(tab)}
              />
            )}

            {adminTab === 'participants' && (
              <AdminParticipants />
            )}

            {adminTab === 'feedback' && (
              <AdminFeedback />
            )}

            {adminTab === 'results' && (
              <AdminResults
                attempts={adminResults}
                levels={levels}
                onRefresh={loadAdminData}
              />
            )}

            {adminTab === 'leaderboard' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Leaderboard Standing</span>
                </h2>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-3">Rank</th>
                        <th className="pb-3">Agent</th>
                        <th className="pb-3">Cases Cleared</th>
                        <th className="pb-3">Detective Stars</th>
                        <th className="pb-3">Score Merits</th>
                        <th className="pb-3">Time Saved</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {leaderboard.map((entry) => (
                        <tr key={entry.playerId} className="hover:bg-slate-800/30">
                          <td className="py-3 font-bold text-cyan-400">#{entry.rank}</td>
                          <td className="py-3 font-bold text-white">{entry.playerName}</td>
                          <td className="py-3">{entry.completedLevelsCount} cases</td>
                          <td className="py-3 text-amber-400 font-bold">{entry.totalStars} ★</td>
                          <td className="py-3 text-cyan-400 font-bold">{entry.totalScore} pts</td>
                          <td className="py-3 text-emerald-400">+{entry.totalTimeSaved}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminTab === 'settings' && settings && (
              <AdminSettings
                settings={settings}
                onRefresh={loadAdminData}
              />
            )}
          </main>
        </div>
      )}

      {/* Rules Modal */}
      {settings && (
        <RulesModal
          isOpen={isRulesModalOpen}
          onClose={() => setIsRulesModalOpen(false)}
          settings={settings}
          currentLang={currentLang}
          caseRules={selectedGame?.rules}
          caseTitle={selectedGame?.title}
        />
      )}

      {/* Game Settings & Maintained Timers Modal */}
      {settings && (
        <GameSettingsModal
          isOpen={isGameSettingsOpen}
          onClose={() => setIsGameSettingsOpen(false)}
          settings={settings}
          currentLang={currentLang}
          onLanguageChange={handleLanguageChange}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          onOpenAdminPanel={() => setViewMode('admin')}
          isAdmin={!!(currentUser && ['super_admin', 'content_admin', 'game_manager', 'analyst'].includes(currentUser.role))}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setViewMode('admin');
        }}
      />

      {/* Official Team / Participant Registration Modal */}
      {isParticipantModalOpen && (
        <ParticipantSubmitModal
          isOpen={isParticipantModalOpen}
          onClose={() => setIsParticipantModalOpen(false)}
          gameTitle={selectedGame?.title || 'SMIT CENTRAK FORENSIC CRIME BUREAU: Cyber Forensic Intrusion'}
          totalScore={lastFinishedAttempt?.totalScore || totalScore || 450}
          totalStars={lastFinishedAttempt?.starsEarned || totalStars || 3}
          accuracyPercentage={lastFinishedAttempt?.accuracyPercentage || 88.5}
          totalTimeSpentSeconds={lastFinishedAttempt?.totalTimeSpentSeconds || 95}
          totalTimeSavedSeconds={lastFinishedAttempt?.totalTimeSavedSeconds || 25}
          completedLevelsCount={completedCount || 1}
          onSuccess={handleSubmissionComplete}
          onViewAdmin={() => {
            if (currentUser && ['super_admin', 'content_admin', 'game_manager', 'analyst'].includes(currentUser.role)) {
              setViewMode('admin');
            } else {
              setIsAdminLoginOpen(true);
            }
          }}
          currentLang={currentLang}
        />
      )}

      {/* Quick Player Registration Modal */}
      {isPlayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              <span>Register Field Codename</span>
            </h3>
            <p className="text-xs text-slate-400">
              Enter your detective pseudonym to track investigation clearance, earn stars, and compete on the bureau leaderboard.
            </p>

            <form onSubmit={handlePlayerRegister} className="space-y-4 text-xs">
              <input
                type="text"
                required
                value={playerInputName}
                onChange={(e) => setPlayerInputName(e.target.value)}
                placeholder="e.g. Agent Miller, CipherBlade..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:ring-2 focus:ring-cyan-500"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlayerModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Confirm Agent ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
