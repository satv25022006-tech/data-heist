import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  Clock, 
  BookOpen, 
  Zap, 
  School,
  FileQuestion,
  Key,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import { GameCard, Level, Question, LevelDifficulty, AnswerOption } from '../../types/game.ts';
import { api } from '../../services/api.ts';
import { sounds } from '../../services/soundAndLang.ts';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal.tsx';

interface AdminGamesProps {
  games: GameCard[];
  onRefresh: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const AdminGames: React.FC<AdminGamesProps> = ({ 
  games, 
  onRefresh,
  onNavigateTab
}) => {
  // All levels and questions loaded from database
  const [levels, setLevels] = useState<Level[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Active Selected Game Card
  const [activeGameId, setActiveGameId] = useState<string>(() => games[0]?.id || 'game-data-heist');
  
  // Selected Level Difficulty Tab: 'easy' | 'medium' | 'hard'
  const [activeDifficulty, setActiveDifficulty] = useState<LevelDifficulty>('easy');

  // Case Module Edit/Create Modal
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Partial<GameCard> | null>(null);
  const [rulesInput, setRulesInput] = useState('');

  // Question Add/Edit Modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{
    id?: string;
    levelId: string;
    difficulty: LevelDifficulty;
    displayOrder: number;
    title: string;
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswerKey: string;
    timerSeconds: number;
    autoClosed: boolean;
    points: number;
    penalty: number;
    explanation: string;
    hint: string;
    imagePosterUrl: string;
    imageCaption: string;
  } | null>(null);

  // Level Edit Modal
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Partial<Level> | null>(null);

  // In-App Confirm Delete State (replaces blocked window.confirm)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'question' | 'case' | 'level_questions';
    id: string;
    title: string;
    message?: string;
    confirmText?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load levels & questions
  const loadLevelsAndQuestions = async () => {
    setIsLoading(true);
    try {
      const [lvls, qs] = await Promise.all([
        api.getAdminLevels(),
        api.getAdminQuestions()
      ]);
      setLevels(lvls);
      setQuestions(qs);
    } catch (err) {
      console.error('Failed to load levels or questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('AdminGames mounted');
    loadLevelsAndQuestions();
  }, []);

  // Update active game ID if current selection is invalid
  useEffect(() => {
    if (games.length > 0 && !games.some(g => g.id === activeGameId)) {
      setActiveGameId(games[0].id);
    }
  }, [games, activeGameId]);

  const activeGame = games.find(g => g.id === activeGameId) || games[0];

  // Helper: Find or prepare levels for active game
  // Each game has 3 tiers: Easy, Medium, Hard
  const getLevelForDifficulty = (diff: LevelDifficulty): Level | undefined => {
    if (!activeGame) return undefined;
    // 1. Level directly matching this gameId and difficulty
    const directMatch = levels.find(l => l.gameId === activeGame.id && l.difficulty === diff);
    if (directMatch) return directMatch;

    // 2. Fallback to existing system levels matching this difficulty
    return levels.find(l => l.difficulty === diff);
  };

  const currentLevel = getLevelForDifficulty(activeDifficulty);

  // Filter questions for the current level
  const currentQuestions = questions
    .filter(q => {
      const lvl = getLevelForDifficulty(activeDifficulty);
      if (lvl) {
        return q.levelId === lvl.id;
      }
      return q.difficulty === activeDifficulty;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Ensure a level exists when admin needs to add questions
  const ensureLevelExists = async (diff: LevelDifficulty): Promise<Level> => {
    const existing = getLevelForDifficulty(diff);
    if (existing) return existing;

    const diffNames: Record<LevelDifficulty, { name: string; time: number; pts: number }> = {
      easy: { name: 'Easy Clearance Stage', time: 90, pts: 100 },
      medium: { name: 'Medium Forensic Challenge', time: 60, pts: 120 },
      hard: { name: 'Hard Deep Investigation', time: 45, pts: 150 }
    };
    const meta = diffNames[diff];
    const order = diff === 'easy' ? 1 : diff === 'medium' ? 2 : 3;

    const created = await api.createLevel({
      gameId: activeGame?.id || 'game-data-heist',
      slug: `${activeGame?.id || 'case'}-${diff}`,
      name: `${activeGame?.title || 'Case'} - ${meta.name}`,
      description: `Official ${diff.toUpperCase()} tier exhibits for ${activeGame?.title}.`,
      difficulty: diff,
      levelNumber: order,
      displayOrder: order,
      timeLimitSeconds: meta.time,
      pointsPerQuestion: meta.pts,
      passingScore: diff === 'easy' ? 180 : diff === 'medium' ? 220 : 300,
      minStarsRequiredToPass: diff === 'easy' ? 1 : 2,
      hintAvailable: true,
      hintPenalty: 20,
      incorrectPenalty: 25,
      speedBonusEnabled: true,
      status: 'published'
    });

    await loadLevelsAndQuestions();
    return created;
  };

  // --- QUESTION HANDLERS ---
  const handleOpenAddQuestion = async (targetDiff: LevelDifficulty = activeDifficulty) => {
    sounds.playClick();
    const lvl = await ensureLevelExists(targetDiff);
    const existingQs = questions.filter(q => q.levelId === lvl.id);
    const nextOrder = existingQs.length + 1;

    setEditingQuestion({
      levelId: lvl.id,
      difficulty: targetDiff,
      displayOrder: nextOrder,
      title: `Question ${nextOrder}: Forensic Exhibit #${nextOrder}`,
      text: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswerKey: 'A',
      timerSeconds: targetDiff === 'easy' ? 45 : targetDiff === 'medium' ? 30 : 20,
      autoClosed: true,
      points: targetDiff === 'easy' ? 100 : targetDiff === 'medium' ? 120 : 150,
      penalty: 25,
      explanation: '',
      hint: '',
      imagePosterUrl: '',
      imageCaption: ''
    });
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: Question) => {
    sounds.playClick();
    const optA = q.options.find(o => o.optionKey === 'A')?.text || '';
    const optB = q.options.find(o => o.optionKey === 'B')?.text || '';
    const optC = q.options.find(o => o.optionKey === 'C')?.text || '';
    const optD = q.options.find(o => o.optionKey === 'D')?.text || '';

    setEditingQuestion({
      id: q.id,
      levelId: q.levelId,
      difficulty: q.difficulty,
      displayOrder: q.displayOrder || 1,
      title: q.title || '',
      text: q.text || '',
      optionA: optA,
      optionB: optB,
      optionC: optC,
      optionD: optD,
      correctAnswerKey: (q.correctAnswerSecret || 'A').toUpperCase(),
      timerSeconds: q.timerOverrideSeconds || 30,
      autoClosed: q.autoClosedOnTimeout !== false,
      points: q.points || 100,
      penalty: q.incorrectPenalty || 25,
      explanation: q.explanation || '',
      hint: q.hint || '',
      imagePosterUrl: q.imagePosterUrl || '',
      imageCaption: q.imageCaption || ''
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !editingQuestion.title || !editingQuestion.text) return;
    sounds.playClick();

    const options: AnswerOption[] = [
      { id: 'opt_A', optionKey: 'A', text: editingQuestion.optionA || 'Option A' },
      { id: 'opt_B', optionKey: 'B', text: editingQuestion.optionB || 'Option B' },
      { id: 'opt_C', optionKey: 'C', text: editingQuestion.optionC || 'Option C' },
      { id: 'opt_D', optionKey: 'D', text: editingQuestion.optionD || 'Option D' }
    ];

    const payload: Partial<Question> = {
      levelId: editingQuestion.levelId,
      difficulty: editingQuestion.difficulty,
      title: editingQuestion.title,
      text: editingQuestion.text,
      displayOrder: editingQuestion.displayOrder,
      answerType: 'multiple_choice',
      options,
      correctAnswerSecret: editingQuestion.correctAnswerKey.toUpperCase(),
      timerOverrideSeconds: editingQuestion.timerSeconds,
      autoClosedOnTimeout: editingQuestion.autoClosed,
      points: editingQuestion.points,
      incorrectPenalty: editingQuestion.penalty,
      explanation: editingQuestion.explanation,
      hint: editingQuestion.hint,
      imagePosterUrl: editingQuestion.imagePosterUrl || '',
      imageCaption: editingQuestion.imageCaption || '',
      status: 'published',
      category: activeGame?.category || 'Cyber Forensics'
    };

    try {
      if (editingQuestion.id) {
        await api.updateQuestion(editingQuestion.id, payload);
      } else {
        await api.createQuestion(payload);
      }
      sounds.playCorrect();
      setIsQuestionModalOpen(false);
      setEditingQuestion(null);
      await loadLevelsAndQuestions();
      onRefresh();
    } catch (err: any) {
      setActionNotice({ type: 'error', message: `Failed to save question: ${err.message}` });
      sounds.playWrong();
    }
  };

  const handleDeleteQuestion = (id: string, title: string) => {
    sounds.playClick();
    setDeleteModal({
      isOpen: true,
      type: 'question',
      id,
      title,
      message: `Are you sure you want to permanently delete question "${title}"? This forensic exhibit will be removed immediately.`,
      confirmText: 'Delete Question'
    });
  };

  const handleDeleteCase = (id: string, title: string) => {
    sounds.playClick();
    setDeleteModal({
      isOpen: true,
      type: 'case',
      id,
      title,
      message: `Are you sure you want to delete Case Module "${title}"? All levels and questions associated with this case file will also be removed.`,
      confirmText: 'Delete Case Module'
    });
  };

  const handleClearLevelQuestions = (lvlId: string, lvlName: string) => {
    sounds.playClick();
    setDeleteModal({
      isOpen: true,
      type: 'level_questions',
      id: lvlId,
      title: lvlName,
      message: `Are you sure you want to delete ALL questions from "${lvlName}"? This difficulty stage will be cleared.`,
      confirmText: 'Clear All Questions'
    });
  };

  const handleExecuteDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    sounds.playClick();
    try {
      if (deleteModal.type === 'question') {
        await api.deleteQuestion(deleteModal.id);
        setActionNotice({ type: 'success', message: `Question "${deleteModal.title}" permanently deleted.` });
        if (editingQuestion?.id === deleteModal.id) {
          setIsQuestionModalOpen(false);
          setEditingQuestion(null);
        }
      } else if (deleteModal.type === 'case') {
        await api.deleteGame(deleteModal.id);
        setActionNotice({ type: 'success', message: `Case Module "${deleteModal.title}" deleted.` });
        if (editingCase?.id === deleteModal.id) {
          setIsCaseModalOpen(false);
          setEditingCase(null);
        }
      } else if (deleteModal.type === 'level_questions') {
        await api.clearLevelQuestions(deleteModal.id);
        setActionNotice({ type: 'success', message: `All questions in "${deleteModal.title}" cleared.` });
      }
      sounds.playCorrect();
      setDeleteModal(null);
      await loadLevelsAndQuestions();
      onRefresh();
    } catch (err: any) {
      sounds.playWrong();
      setActionNotice({ type: 'error', message: `Delete failed: ${err.message}` });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  // --- CASE HANDLERS ---
  const handleOpenCreateCase = () => {
    sounds.playClick();
    setEditingCase({
      title: '',
      tagline: '',
      description: '',
      category: 'Cyber Forensics',
      icon: 'fingerprint',
      badge: 'Active Tournament',
      totalLevels: 3,
      estimatedTime: '15 Mins',
      rules: [
        'Time limit for Rules & Regulations is 120s.',
        'Easy stage is open immediately; earn 2 stars to unlock Medium.',
        'Each question has a strict countdown timer and auto-closes on timeout.',
        'Upon completing all levels, submit college team credentials for the official symposium record.'
      ]
    });
    setRulesInput(
      'Time limit for Rules & Regulations is 120s.\n' +
      'Easy stage is open immediately; earn 2 stars to unlock Medium.\n' +
      'Each question has a strict countdown timer and auto-closes on timeout.\n' +
      'Upon completing all levels, submit college team credentials for the official symposium record.'
    );
    setIsCaseModalOpen(true);
  };

  const handleOpenEditCase = (g: GameCard) => {
    sounds.playClick();
    setEditingCase({ ...g });
    setRulesInput((g.rules || []).join('\n'));
    setIsCaseModalOpen(true);
  };

  const handleSaveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCase || !editingCase.title) return;
    sounds.playClick();

    const rules = rulesInput.split('\n').map(r => r.trim()).filter(Boolean);

    try {
      if (editingCase.id && !editingCase.id.startsWith('new')) {
        await api.updateGame(editingCase.id, { ...editingCase, rules });
      } else {
        const created = await api.createGame({ ...editingCase, rules });
        setActiveGameId(created.id);
      }
      sounds.playCorrect();
      setIsCaseModalOpen(false);
      setEditingCase(null);
      onRefresh();
      loadLevelsAndQuestions();
    } catch (err: any) {
      setActionNotice({ type: 'error', message: `Failed to save case: ${err.message}` });
      sounds.playWrong();
    }
  };

  // --- LEVEL HANDLERS ---
  const handleOpenEditLevel = (lvl: Level) => {
    sounds.playClick();
    setEditingLevel({ ...lvl });
    setIsLevelModalOpen(true);
  };

  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLevel || !editingLevel.id) return;
    sounds.playClick();
    try {
      await api.updateLevel(editingLevel.id, editingLevel);
      sounds.playCorrect();
      setIsLevelModalOpen(false);
      setEditingLevel(null);
      await loadLevelsAndQuestions();
      onRefresh();
    } catch (err: any) {
      setActionNotice({ type: 'error', message: `Failed to update level: ${err.message}` });
      sounds.playWrong();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-800">
              MODULE & LEVEL ARCHITECTURE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
              {games.length} Case Modules Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <FolderKanban className="w-7 h-7 text-cyan-400" />
            <span>Case Modules & Level Engineering</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Manage your Case Modules, configure their 3 difficulty levels (<strong>Easy</strong>, <strong>Medium</strong>, <strong>Hard</strong>), and construct question exhibits with custom options, answer keys, time limits, and auto-close triggers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('participants')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition cursor-pointer"
            >
              <School className="w-4 h-4 text-emerald-400" />
              <span>College Team Records</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateCase}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Case Module</span>
          </button>
        </div>
      </div>

      {/* 2. Case Modules Selector Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Select Active Case Module to Configure:</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-500">
            Click any case card below to edit its Easy, Medium & Hard levels
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {games.map((g) => {
            const isSelected = g.id === activeGameId;
            const gameLevelsList = levels.filter(l => l.gameId === g.id);
            const totalQsForGame = questions.filter(q => {
              const lvl = levels.find(l => l.id === q.levelId);
              return lvl && (lvl.gameId === g.id || gameLevelsList.some(gl => gl.id === lvl.id));
            }).length;

            return (
              <div
                key={g.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveGameId(g.id);
                }}
                className={`relative rounded-2xl p-5 border transition-all cursor-pointer text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-400'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-800">
                      {g.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-900/60">
                      {g.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{g.title}</h3>
                  <p className="text-xs text-cyan-300 font-medium mb-2">{g.tagline}</p>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{g.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span>3 Levels</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{totalQsForGame || 3} Questions</span>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={async () => {
                        if (confirm(`DANGER: This will clear all data (attempts, progress, etc.) for "${g.title}". Proceed?`)) {
                          await api.clearGameData(g.id);
                          onRefresh();
                          loadLevelsAndQuestions();
                        }
                      }}
                      title="Clear Case Data"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-orange-950 hover:text-orange-400 text-slate-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`DANGER: This will RESET "${g.title}" to factory defaults (wipes current questions/levels). Proceed?`)) {
                          await api.resetGameToDefaults(g.id);
                          onRefresh();
                          loadLevelsAndQuestions();
                        }
                      }}
                      title="Reset Case to Defaults"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-950 hover:text-amber-400 text-slate-400 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditCase(g)}
                      title="Edit Case Details"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                    {games.length > 1 && (
                      <button
                        onClick={() => handleDeleteCase(g.id, g.title)}
                        title="Delete Case Module"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Level Workstation: Easy, Medium, Hard Tabs */}
      {activeGame && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Active Case Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
                  Active Case Module:
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-200">
                  {activeGame.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {activeGame.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure the 3 levels and question exhibits for this case file below.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenEditCase(activeGame)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Edit Case Info & Rules</span>
              </button>
            </div>
          </div>

          {/* 3 Difficulty Level Cards: Easy, Medium, Hard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['easy', 'medium', 'hard'] as LevelDifficulty[]).map((diff) => {
              const isTabActive = activeDifficulty === diff;
              const lvl = getLevelForDifficulty(diff);
              const qCount = questions.filter(q => {
                if (lvl) return q.levelId === lvl.id;
                return q.difficulty === diff;
              }).length;

              const badgeColors: Record<LevelDifficulty, { border: string; bg: string; text: string; badge: string }> = {
                easy: {
                  border: 'border-cyan-500/80',
                  bg: 'bg-cyan-950/40',
                  text: 'text-cyan-400',
                  badge: 'bg-cyan-900/60 text-cyan-300'
                },
                medium: {
                  border: 'border-amber-500/80',
                  bg: 'bg-amber-950/40',
                  text: 'text-amber-400',
                  badge: 'bg-amber-900/60 text-amber-300'
                },
                hard: {
                  border: 'border-rose-500/80',
                  bg: 'bg-rose-950/40',
                  text: 'text-rose-400',
                  badge: 'bg-rose-900/60 text-rose-300'
                }
              };

              const colors = badgeColors[diff];

              return (
                <div
                  key={diff}
                  onClick={() => {
                    sounds.playClick();
                    setActiveDifficulty(diff);
                  }}
                  className={`rounded-2xl p-5 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isTabActive
                      ? `${colors.border} ${colors.bg} ring-2 ring-current shadow-lg`
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider ${colors.badge}`}>
                        {diff.toUpperCase()} LEVEL
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-bold">
                        {qCount} Questions
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white mb-1">
                      {lvl?.name || `${diff.toUpperCase()} Clearance`}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {lvl?.description || `Investigation exhibits configured for ${diff} tier.`}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">
                      Base Limit: {lvl?.timeLimitSeconds || (diff === 'easy' ? 90 : diff === 'medium' ? 60 : 45)}s
                    </span>

                    <span className={`font-bold uppercase ${colors.text}`}>
                      {isTabActive ? 'Active' : 'Select →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. Questions Manager for the Active Level */}
          <div className="pt-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    activeDifficulty === 'easy' ? 'text-cyan-400 bg-cyan-950 border border-cyan-800' :
                    activeDifficulty === 'medium' ? 'text-amber-400 bg-amber-950 border border-amber-800' :
                    'text-rose-400 bg-rose-950 border border-rose-800'
                  }`}>
                    {activeDifficulty.toUpperCase()} LEVEL QUESTIONS
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ({currentQuestions.length} Total Configured)
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {currentLevel?.name || `${activeDifficulty.toUpperCase()} Level Exhibits`}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Each question has options, an answer key, a set countdown time limit, and automatically closes on timeout.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {currentLevel && (
                  <button
                    onClick={() => handleOpenEditLevel(currentLevel)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
                  >
                    Edit Level Settings
                  </button>
                )}

                {currentLevel && currentQuestions.length > 0 && (
                  <button
                    onClick={() => handleClearLevelQuestions(currentLevel.id, currentLevel.name)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-400 font-semibold text-xs border border-slate-700 hover:border-rose-800 flex items-center gap-1.5 transition cursor-pointer"
                    title="Clear all questions in this level"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span className="hidden sm:inline">Clear Level</span>
                  </button>
                )}

                <button
                  onClick={() => handleOpenAddQuestion(activeDifficulty)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Question to {activeDifficulty.toUpperCase()}</span>
                </button>
              </div>
            </div>

            {/* Questions List */}
            {currentQuestions.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 space-y-3">
                <FileQuestion className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">
                  No Questions Created in {activeDifficulty.toUpperCase()} Level Yet
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click the button below to add your first question exhibit with number, prompt, options (A-D), answer key, and countdown time limit.
                </p>
                <button
                  onClick={() => handleOpenAddQuestion(activeDifficulty)}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs inline-flex items-center gap-2 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Question</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {currentQuestions.map((q, index) => {
                  const correctSecret = (q.correctAnswerSecret || 'A').toUpperCase();
                  const timerSeconds = q.timerOverrideSeconds || currentLevel?.timeLimitSeconds || 30;

                  return (
                    <div
                      key={q.id}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-4 transition"
                    >
                      {/* Top Question Row */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                              Question #{q.displayOrder || index + 1}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                              ⏱️ Time Limit: {timerSeconds}s
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                              <Key className="w-3 h-3" />
                              <span>Answer Key: Option {correctSecret}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/80">
                              🔒 Auto-Closed: Yes
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white pt-1">{q.title}</h4>
                          <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                            {q.text}
                          </p>

                          {q.imagePosterUrl && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 mt-2">
                              <img
                                src={q.imagePosterUrl}
                                alt={q.imageCaption || 'Poster'}
                                className="w-20 h-14 object-cover rounded-lg border border-slate-700"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&auto=format&fit=crop&q=60'; }}
                              />
                              <div className="text-xs">
                                <span className="font-mono text-cyan-400 font-bold block flex items-center gap-1.5">
                                  <ImageIcon className="w-3.5 h-3.5" />
                                  <span>Question Image Poster Configured</span>
                                </span>
                                <span className="text-slate-400 truncate block">{q.imageCaption || q.imagePosterUrl}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                          <button
                            onClick={() => handleOpenEditQuestion(q)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                            title="Edit Question"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id, q.title)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 text-xs transition cursor-pointer"
                            title="Delete Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-900">
                        {q.options.map((opt) => {
                          const isCorrect = opt.optionKey.toUpperCase() === correctSecret;
                          return (
                            <div
                              key={opt.id || opt.optionKey}
                              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition ${
                                isCorrect
                                  ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200'
                                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5 ${
                                isCorrect
                                  ? 'bg-emerald-500 text-slate-950 font-black'
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {opt.optionKey}
                              </span>
                              <div className="flex-1">
                                <span className="leading-snug">{opt.text}</span>
                                {isCorrect && (
                                  <span className="block text-[10px] font-mono text-emerald-400 font-bold mt-1">
                                    ✓ DESIGNATED ANSWER KEY
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Question Footer Info */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-900">
                        <div className="flex items-center gap-4">
                          <span>Points: <strong className="text-amber-400">+{q.points || 100} pts</strong></span>
                          <span>Penalty: <strong className="text-rose-400">-{q.incorrectPenalty || 25} pts</strong></span>
                          {q.hint && <span>Hint Configured: <strong className="text-cyan-400">Yes</strong></span>}
                        </div>

                        {q.explanation && (
                          <span className="text-slate-400 truncate max-w-xs" title={q.explanation}>
                            Explanation: {q.explanation}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. ADD / EDIT QUESTION MODAL */}
      {/* ======================================================== */}
      {isQuestionModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {editingQuestion.difficulty.toUpperCase()} LEVEL
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Case: {activeGame?.title}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {editingQuestion.id ? 'Edit Question Exhibit' : 'Add New Question Exhibit'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set question number, prompt, options (A-D), answer key, and countdown time limit with auto-close.
                </p>
              </div>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-5 mt-5 text-xs">
              {/* Question Order & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-300 mb-1">Question # *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingQuestion.displayOrder}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-300 mb-1">Question Title / Headline *</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.title}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                    placeholder="e.g. Question 1: Server Intrusion Vector"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Question Prompt / Text */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Question Prompt / Inquiry Text *</label>
                <textarea
                  rows={3}
                  required
                  value={editingQuestion.text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                  placeholder="Enter the investigation challenge, forensic evidence description, or question statement..."
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-xs leading-relaxed"
                />
              </div>

              {/* Question Image Poster & Evidence Dossier */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5 font-mono">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span>Question Image Poster / Evidence Dossier URL</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    Optional evidence image displayed in player mode
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-2">
                    <input
                      type="text"
                      value={editingQuestion.imagePosterUrl}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, imagePosterUrl: e.target.value })}
                      placeholder="e.g. /uploads/question-posters/poster-heist-network.svg or upload image below"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-800/80 text-cyan-300 font-mono text-[11px] cursor-pointer transition">
                        <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Upload Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (uploadEvent) => {
                                const result = uploadEvent.target?.result as string;
                                if (result) {
                                  setEditingQuestion({
                                    ...editingQuestion,
                                    imagePosterUrl: result,
                                    imageCaption: editingQuestion.imageCaption || file.name
                                  });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={editingQuestion.imageCaption}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, imageCaption: e.target.value })}
                      placeholder="Poster caption / alt text"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Preset Poster Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-mono text-slate-400">Presets:</span>
                  {[
                    { label: 'Network Heist', url: '/uploads/question-posters/poster-heist-network.svg' },
                    { label: 'RFID Badge', url: '/uploads/question-posters/poster-rfid-badge.svg' },
                    { label: 'Malware Hex', url: '/uploads/question-posters/poster-malware-hex.svg' },
                    { label: 'French Doors', url: '/uploads/question-posters/poster-french-doors.svg' },
                    { label: 'Toxicology', url: '/uploads/question-posters/poster-tea-toxicology.svg' },
                    { label: 'Cipher Wheel', url: '/uploads/question-posters/poster-cipher-wheel.svg' }
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.label}
                      onClick={() => setEditingQuestion({ ...editingQuestion, imagePosterUrl: p.url, imageCaption: p.label })}
                      className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 transition cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                  {editingQuestion.imagePosterUrl && (
                    <button
                      type="button"
                      onClick={() => setEditingQuestion({ ...editingQuestion, imagePosterUrl: '', imageCaption: '' })}
                      className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-[10px] font-mono text-rose-300 transition cursor-pointer ml-auto"
                    >
                      Clear Poster
                    </button>
                  )}
                </div>

                {/* Live Preview */}
                {editingQuestion.imagePosterUrl && (
                  <div className="pt-2 flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <img
                      src={editingQuestion.imagePosterUrl}
                      alt="Preview"
                      className="w-20 h-14 object-cover rounded-lg border border-slate-700"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&auto=format&fit=crop&q=60'; }}
                    />
                    <div className="text-xs">
                      <span className="font-mono text-cyan-400 font-bold block">✓ Poster Preview Active</span>
                      <span className="text-slate-400">{editingQuestion.imageCaption || editingQuestion.imagePosterUrl}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Multiple Choice Options (A, B, C, D) */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Options & Answer Key Designation *</span>
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Select the radio button on the correct answer key
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(['A', 'B', 'C', 'D'] as const).map((key) => {
                    const isSelectedKey = editingQuestion.correctAnswerKey === key;
                    const fieldName = `option${key}` as 'optionA' | 'optionB' | 'optionC' | 'optionD';

                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition ${
                          isSelectedKey
                            ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        {/* Radio Selector for Answer Key */}
                        <label className="flex items-center gap-2 cursor-pointer shrink-0">
                          <input
                            type="radio"
                            name="correctAnswerKey"
                            checked={isSelectedKey}
                            onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswerKey: key })}
                            className="w-4 h-4 text-emerald-500 accent-emerald-500 cursor-pointer"
                          />
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                            isSelectedKey ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {key}
                          </span>
                        </label>

                        {/* Option Text Input */}
                        <input
                          type="text"
                          required
                          value={editingQuestion[fieldName]}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, [fieldName]: e.target.value })}
                          placeholder={`Enter text for Option ${key}...`}
                          className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
                        />

                        {isSelectedKey && (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider shrink-0 hidden sm:inline">
                            ✓ Answer Key
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Time Limit and Auto-Closed Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                {/* Time Limit Setting */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-white text-xs flex items-center gap-1.5 font-mono">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span>Set Question Time Limit *</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {editingQuestion.timerSeconds} Seconds
                    </span>
                  </div>

                  <input
                    type="number"
                    min="5"
                    max="600"
                    required
                    value={editingQuestion.timerSeconds}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, timerSeconds: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                  />

                  {/* Preset Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[15, 20, 30, 45, 60, 90, 120].map((sec) => (
                      <button
                        type="button"
                        key={sec}
                        onClick={() => setEditingQuestion({ ...editingQuestion, timerSeconds: sec })}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                          editingQuestion.timerSeconds === sec
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Closed Behavior */}
                <div className="space-y-2 flex flex-col justify-between">
                  <div>
                    <label className="font-bold text-white text-xs flex items-center gap-1.5 font-mono mb-1">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>Auto-Closed on Timeout</span>
                    </label>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      When enabled, the question automatically closes, locks all choices, and advances to the next exhibit when the timer hits zero.
                    </p>
                  </div>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingQuestion.autoClosed}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, autoClosed: e.target.checked })}
                      className="w-4 h-4 text-cyan-500 accent-cyan-500 rounded cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-200">
                      Auto-close and lock answer on timeout
                    </span>
                  </label>
                </div>
              </div>

              {/* Points & Penalties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Points for Correct Answer</label>
                  <input
                    type="number"
                    min="10"
                    value={editingQuestion.points}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, points: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Penalty for Wrong Answer</label>
                  <input
                    type="number"
                    min="0"
                    value={editingQuestion.penalty}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, penalty: parseInt(e.target.value) || 25 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Optional Explanation & Hint */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Answer Explanation (Debrief)</label>
                  <textarea
                    rows={2}
                    value={editingQuestion.explanation}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                    placeholder="Explanation revealed to players in results..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Investigative Hint (Optional)</label>
                  <textarea
                    rows={2}
                    value={editingQuestion.hint}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, hint: e.target.value })}
                    placeholder="Hint text if player requests help..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
                {editingQuestion.id ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(editingQuestion.id!, editingQuestion.title)}
                    className="px-3.5 py-2 rounded-xl border border-rose-800/80 bg-rose-950/40 hover:bg-rose-900 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Delete Question</span>
                  </button>
                ) : (
                  <div />
                )}
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsQuestionModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    Save Question Exhibit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. CREATE / EDIT CASE MODULE MODAL */}
      {/* ======================================================== */}
      {isCaseModalOpen && editingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingCase.id ? 'Edit Case Module' : 'Create New Case Module'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure case title, narrative briefing, and tournament rules & regulations.
                </p>
              </div>
              <button
                onClick={() => setIsCaseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCase} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Case Title *</label>
                  <input
                    type="text"
                    required
                    value={editingCase.title || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, title: e.target.value })}
                    placeholder="e.g. THE CYBER HEIST"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tagline / Operation *</label>
                  <input
                    type="text"
                    required
                    value={editingCase.tagline || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, tagline: e.target.value })}
                    placeholder="e.g. Quantum Server Perimeter Breach"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingCase.category || 'Cyber Forensics'}
                    onChange={(e) => setEditingCase({ ...editingCase, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={editingCase.badge || 'Active Tournament'}
                    onChange={(e) => setEditingCase({ ...editingCase, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Case Narrative Briefing</label>
                <textarea
                  rows={3}
                  value={editingCase.description || ''}
                  onChange={(e) => setEditingCase({ ...editingCase, description: e.target.value })}
                  placeholder="Narrative brief explaining the scenario, incident, and objectives..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Rules and Regulations (One rule per line)
                </label>
                <textarea
                  rows={4}
                  value={rulesInput}
                  onChange={(e) => setRulesInput(e.target.value)}
                  placeholder="Enter tournament rules for this specific case..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
                {editingCase.id && !editingCase.id.startsWith('new') && games.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteCase(editingCase.id!, editingCase.title || 'Case')}
                    className="px-3.5 py-2 rounded-xl border border-rose-800/80 bg-rose-950/40 hover:bg-rose-900 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Delete Case</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCaseModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 cursor-pointer"
                  >
                    Save Case Module
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. EDIT LEVEL SETTINGS MODAL */}
      {/* ======================================================== */}
      {isLevelModalOpen && editingLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Edit {editingLevel.difficulty?.toUpperCase()} Level Settings
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adjust level clearance name, passing threshold, and baseline timers.
                </p>
              </div>
              <button
                onClick={() => setIsLevelModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLevel} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Level Name *</label>
                <input
                  type="text"
                  required
                  value={editingLevel.name || ''}
                  onChange={(e) => setEditingLevel({ ...editingLevel, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Level Description</label>
                <textarea
                  rows={2}
                  value={editingLevel.description || ''}
                  onChange={(e) => setEditingLevel({ ...editingLevel, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Base Level Timer (Sec)</label>
                  <input
                    type="number"
                    min="10"
                    value={editingLevel.timeLimitSeconds || 60}
                    onChange={(e) => setEditingLevel({ ...editingLevel, timeLimitSeconds: parseInt(e.target.value) || 60 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Passing Score Threshold</label>
                  <input
                    type="number"
                    min="0"
                    value={editingLevel.passingScore || 180}
                    onChange={(e) => setEditingLevel({ ...editingLevel, passingScore: parseInt(e.target.value) || 180 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLevelModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 cursor-pointer"
                >
                  Save Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Toast Notification */}
      {actionNotice && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in ${
          actionNotice.type === 'success' 
            ? 'bg-emerald-950 border-emerald-700 text-emerald-200' 
            : 'bg-rose-950 border-rose-700 text-rose-200'
        }`}>
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{actionNotice.message}</span>
          <button 
            onClick={() => setActionNotice(null)}
            className="p-1 hover:bg-white/10 rounded-lg ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Reusable In-App Confirm Delete Modal */}
      {deleteModal && (
        <ConfirmDeleteModal
          isOpen={deleteModal.isOpen}
          title={deleteModal.title ? `Delete ${deleteModal.type === 'question' ? 'Question Exhibit' : deleteModal.type === 'case' ? 'Case Module' : 'Level Exhibits'}` : 'Confirm Deletion'}
          itemTitle={deleteModal.title}
          message={deleteModal.message}
          confirmText={deleteModal.confirmText}
          isDeleting={isDeleting}
          onConfirm={handleExecuteDelete}
          onCancel={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
};
