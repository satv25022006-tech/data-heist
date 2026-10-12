// Synthesized sound effects using Web Audio API (safe, instant, zero latency)
class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {}
  }

  playCorrect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc1.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc1.frequency.setValueAtTime(1046.50, now + 0.3); // C6

      osc2.frequency.setValueAtTime(1046.50, now + 0.3);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.3);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch {}
  }

  playWrong() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.3);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  playTick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {}
  }

  playVictory() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [440, 554.37, 659.25, 880, 1108.73];
      freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.frequency.setValueAtTime(f, now + i * 0.12);
        gain.gain.setValueAtTime(0.12, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.4);
      });
    } catch {}
  }
}

export const sounds = new SoundFX();

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    gameTitle: 'Data Heist: Cyber Detective Bureau',
    startGame: 'Initiate Investigation',
    viewRules: 'Rules & Regulations',
    rulesTitle: 'RULES AND REGULATIONS',
    rulesSubtitle: 'CENTRAL CRIME BUREAU TOURNAMENT OPERATIONAL PROTOCOL',
    missionBriefingTitle: 'MISSION BRIEFING & INCIDENT SYNOPSIS',
    briefingTimer: 'BRIEFING READ TIMER: 30s',
    briefingTimerDesc: 'Review the crime incident and tactical intelligence before launching the investigation.',
    playGame: 'PLAY GAME',
    nextMissionBriefing: 'NEXT: MISSION BRIEFING (30s)',
    backToCases: 'Back to Case Dossiers',
    language: 'Language',
    overallProgress: 'Agent Career Dossier',
    casesSolved: 'Cases Closed',
    totalStars: 'Detective Stars',
    totalScore: 'Bureau Merits',
    availableCases: 'Active Case Files',
    levelSelection: 'Choose a case file',
    levelSelectionDesc: 'Select your difficulty clearance tier. Clear questions accurately and swiftly to unlock higher stages.',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    locked: 'Locked Dossier',
    unlocked: 'Available',
    questionProgress: 'Exhibit',
    timeRemaining: 'Time Window',
    seconds: 'seconds',
    hint: 'Request Bureau Intel (Hint)',
    submitAnswer: 'Confirm Deduction',
    nextQuestion: 'Proceed to Next Exhibit',
    finishCase: 'Finalize Case Report',
    casePassed: 'CASE SOLVED // THREAT NEUTRALIZED',
    caseFailed: 'CASE COLD // INSUFFICIENT EVIDENCE',
    accuracy: 'Accuracy',
    timeSpent: 'Time Elapsed',
    timeSaved: 'Time Saved',
    earnedStars: 'Stars Awarded',
    returnToHub: 'Return to Hub',
    nextCase: 'Deploy to Next Case',
    allCasesCompleted: 'All Syndicates Dismantled! Top Agent Standing.',
    adminPortal: 'Admin Command Center',
    loginAsAdmin: 'Administrator Sign-In',
    logout: 'Log Out',
    close: 'Close',
    demoRulesActive: 'Rules Demonstration Active',
    demoRulesTime: 'Demonstration Timer',
    submissionPromptTitle: 'Completed your investigation session?',
    submissionPromptDesc: 'Submit your Name, Register Number, College Name, and Team Name to persist your tournament standing in the database.',
    submitTeamDetailsBtn: 'SUBMIT TEAM DETAILS & FINISH GAME',
    restartToBeginning: 'Restart to Beginning',
    replayInvestigation: 'Replay Investigation',
    nextLevel: 'Next Level',
    finishGame: 'Finish Game'
  },
  ta: {
    gameTitle: 'டேட்டா ஹெயிஸ்ட்: சைபர் கிரைம் துப்பறியும் பிரிவு',
    startGame: 'விசாரணையைத் தொடங்கு',
    viewRules: 'விதிகள் மற்றும் ஒழுங்குமுறைகள்',
    rulesTitle: 'விதிகள் மற்றும் ஒழுங்குமுறைகள்',
    rulesSubtitle: 'மத்திய குற்றவியல் துறை போட்டி நெறிமுறைகள்',
    missionBriefingTitle: 'பணி சுருக்கம் மற்றும் சம்பவ விவரம்',
    briefingTimer: 'பணி சுருக்க அவகாசம்: 30 விநாடிகள்',
    briefingTimerDesc: 'விசாரணையைத் தொடங்குவதற்கு முன் குற்றச் சம்பவம் மற்றும் சான்றுகளை கவனமாக படிக்கவும்.',
    playGame: 'விளையாடத் தொடங்கு (PLAY GAME)',
    nextMissionBriefing: 'அடுத்து: பணி சுருக்கம் மற்றும் சம்பவ விவரம் (30 விநாடிகள்)',
    backToCases: 'வழக்கு கோப்புகளுக்குத் திரும்பு',
    language: 'மொழி',
    overallProgress: 'அதிகாரி விவரக்குறிப்பு',
    casesSolved: 'தீர்க்கப்பட்ட வழக்குகள்',
    totalStars: 'துப்பறியும் நட்சத்திரங்கள்',
    totalScore: 'மொத்த மதிப்பெண்கள்',
    availableCases: 'நடப்பு வழக்குக் கோப்புகள்',
    levelSelection: 'வழக்குக் கோப்பைத் தேர்ந்தெடுக்கவும்',
    levelSelectionDesc: 'உங்கள் கடின நிலையைத் தேர்ந்தெடுக்கவும். அடுத்த நிலைகளைத் திறக்க ஆதாரங்களை துல்லியமாகத் தீர்க்கவும்.',
    easy: 'எளிதான நிலை (EASY)',
    medium: 'நடுத்தர நிலை (MEDIUM)',
    hard: 'கடின நிலை (HARD)',
    locked: 'பூட்டப்பட்டுள்ளது',
    unlocked: 'திறக்கப்பட்டது',
    questionProgress: 'ஆதாரம்',
    timeRemaining: 'மீதமுள்ள நேரம்',
    seconds: 'விநாடிகள்',
    hint: 'துப்பு / குறிப்பு பெறுக (HINT)',
    submitAnswer: 'முடிவை உறுதிப்படுத்து',
    nextQuestion: 'அடுத்த ஆதாரத்திற்குச் செல்க',
    finishCase: 'வழக்கு அறிக்கையை முடி',
    casePassed: 'வழக்கு தீர்க்கப்பட்டது // அச்சுறுத்தல் முறியடிக்கப்பட்டது',
    caseFailed: 'வழக்கு தீர்க்கப்படவில்லை // போதிய ஆதாரங்கள் இல்லை',
    accuracy: 'துல்லியம்',
    timeSpent: 'எடுத்துக்கொண்ட நேரம்',
    timeSaved: 'சேமிக்கப்பட்ட நேரம்',
    earnedStars: 'பெற்ற நட்சத்திரங்கள்',
    returnToHub: 'முகப்பிற்குத் திரும்பு',
    nextCase: 'அடுத்த வழக்குக்குச் செல்க',
    allCasesCompleted: 'அனைத்து வழக்குகளும் வெற்றிகரமாக முடிக்கப்பட்டன!',
    adminPortal: 'நிர்வாக கட்டுப்பாட்டு மையம்',
    loginAsAdmin: 'நிர்வாகி உள்நுழைவு',
    logout: 'வெளியேறு',
    close: 'மூடு',
    demoRulesActive: 'விதிகள் விளக்கம் செயல்பாட்டில் உள்ளது',
    demoRulesTime: 'விளக்க கவுண்ட்டவுன்',
    submissionPromptTitle: 'உங்கள் துப்பறியும் அமர்வை முடித்துவிட்டீர்களா?',
    submissionPromptDesc: 'உங்கள் போட்டி நிலையை தரவுத்தளத்தில் பதிவு செய்ய உங்கள் பெயர், பதிவு எண், கல்லூரி பெயர் மற்றும் குழுப் பெயரைச் சமர்ப்பிக்கவும்.',
    submitTeamDetailsBtn: 'குழு விவரங்களைச் சமர்ப்பித்து விளையாட்டை முடிக்கவும்',
    restartToBeginning: 'தொடக்கத்திலிருந்து மீண்டும் தொடங்கு',
    replayInvestigation: 'மீண்டும் விளையாடு',
    nextLevel: 'அடுத்த நிலை',
    finishGame: 'விளையாட்டை முடி'
  }
};
