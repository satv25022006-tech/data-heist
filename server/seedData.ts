import { GameSettings, Level, Question, UserProfile, LeaderboardEntry, AuditLog } from '../src/types/game.ts';

export const DEFAULT_SETTINGS: GameSettings = {
  id: 'global_settings',
  gameTitle: 'SMIT CENTRAL FORENSIC CRIME BUREAU',
  gameDescription: 'Crack cryptographic mysteries, inspect forensic evidence posters, decode syndicate ciphers, and neutralize international threats.',
  logoUrl: '/infoxtreme_logo.jpg',
  theme: 'noir-cyber',
  maintenanceMode: false,
  demoRulesCountdownEnabled: false,
  demoRulesCountdownSeconds: 120,
  defaultTimerSeconds: 60,
  briefingTimerSeconds: 180,
  allowTimerPause: true,
  allowQuestionRetry: false,
  autoSubmitOnTimeout: true,
  timeoutPenaltyPoints: 10,
  baseCorrectPoints: 100,
  incorrectPenaltyPoints: 25,
  hintPenaltyPoints: 15,
  speedBonusMultiplier: 1.5,
  soundEffectsEnabled: true,
  supportedLanguages: ['en', 'ta'],
  defaultLanguage: 'en',
  rulesText: 'Welcome Agent. You are tasked with solving cyber and forensic investigations. Each case has questions with evidence posters. Read the clues carefully, inspect the evidence dossier, and submit your deduction before the countdown expires. Hints are available at a point deduction penalty. Fast solvers earn substantial speed bonuses!',
  updatedAt: new Date().toISOString()
};

export const INITIAL_ADMINS: (UserProfile & { passwordHash: string })[] = [
  {
    id: 'admin-super-01',
    username: 'director_vance',
    email: 'admin@detectivebureau.org',
    role: 'super_admin',
    displayName: 'Director Vance (Super Admin)',
    isBlocked: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    passwordHash: 'admin123' // Plaintext for demo login simplicity
  },
  {
    id: 'admin-content-02',
    username: 'inspector_chen',
    email: 'content@detectivebureau.org',
    role: 'content_admin',
    displayName: 'Chief Inspector Chen',
    isBlocked: false,
    createdAt: '2026-01-05T00:00:00.000Z',
    passwordHash: 'content123'
  },
  {
    id: 'admin-analyst-03',
    username: 'agent_scully',
    email: 'analyst@detectivebureau.org',
    role: 'analyst',
    displayName: 'Specialist Scully (Read-only)',
    isBlocked: false,
    createdAt: '2026-01-10T00:00:00.000Z',
    passwordHash: 'analyst123'
  }
];

export const INITIAL_LEVELS: Level[] = [
  {
    id: 'level-01-heist',
    gameId: 'game-data-heist',
    slug: 'the-midnight-cyber-heist',
    levelNumber: 1,
    displayOrder: 1,
    name: 'The Midnight Cyber Heist',
    description: 'An intrusion alarm was triggered at 02:41 AM inside the Apex Quantum Reserve server bank. Identify the attack vector, breach port, and rogue payload.',
    difficulty: 'easy',
    timeLimitSeconds: 90,
    pointsPerQuestion: 100,
    passingScore: 180,
    minStarsRequiredToPass: 1,
    hintAvailable: true,
    hintPenalty: 15,
    incorrectPenalty: 25,
    speedBonusEnabled: true,
    speedBonusMax: 50,
    status: 'published',
    unlockRequirements: {
      minStarsFromEasy: 0,
      minStarsFromMedium: 0,
      minTotalStars: 0,
      minTotalScore: 0
    },
    translations: {
      ta: {
        name: 'நள்ளிரவு சைபர் கொள்ளை (The Midnight Cyber Heist)',
        description: 'அபெக்ஸ் குவாண்டம் ரிசர்வ் சர்வர் வங்கியில் அதிகாலை 02:41 மணிக்கு ஊடுருவல் எச்சரிக்கை ஒலித்தது. தாக்குதல் பாதை, போர்ட் மற்றும் போலி பேலோடை அடையாளம் காணவும்.'
      }
    },
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'level-02-manor',
    gameId: 'game-blackwood-manor',
    slug: 'the-blackwood-manor-cipher',
    levelNumber: 2,
    displayOrder: 2,
    name: 'The Vanishing Cipher at Blackwood Manor',
    description: 'Lord Blackwood was found incapacitated in his locked study. His cryptographic journal and safe combinations are missing. Examine physical forensics and time discrepancies.',
    difficulty: 'medium',
    timeLimitSeconds: 60,
    pointsPerQuestion: 120,
    passingScore: 220,
    minStarsRequiredToPass: 2,
    hintAvailable: true,
    hintPenalty: 20,
    incorrectPenalty: 30,
    speedBonusEnabled: true,
    speedBonusMax: 60,
    status: 'published',
    unlockRequirements: {
      requiredPreviousLevelId: 'level-01-heist',
      minStarsFromEasy: 2,
      minStarsFromMedium: 0,
      minTotalStars: 2,
      minTotalScore: 180,
      customConditionDescription: 'Requires at least 2 Stars from Easy stage (The Midnight Cyber Heist)'
    },
    translations: {
      ta: {
        name: 'பிளாக்வுட் மேனர் மர்ம சங்கேதம் (The Blackwood Manor Cipher)',
        description: 'லார்ட் பிளாக்வுட் பூட்டப்பட்ட அவரது அறையில் மயக்கமுற்ற நிலையில் கண்டெடுக்கப்பட்டார். அவரது ரகசிய நாட்குறிப்பு மற்றும் பெட்டக சங்கேதங்கள் காணவில்லை. தடயங்களை ஆராயவும்.'
      }
    },
    createdAt: '2026-01-02T09:00:00.000Z',
    updatedAt: '2026-01-02T09:00:00.000Z'
  },
  {
    id: 'level-03-syndicate',
    gameId: 'game-obsidian-syndicate',
    slug: 'the-syndicate-subterranean-vault',
    levelNumber: 3,
    displayOrder: 3,
    name: 'The Syndicate Subterranean Vault',
    description: 'The international syndicate Obsidian 7 breached the deep subterranean reserve. Bypass the optical laser grids and intercept the mole before extraction.',
    difficulty: 'hard',
    timeLimitSeconds: 45,
    pointsPerQuestion: 150,
    passingScore: 300,
    minStarsRequiredToPass: 2,
    hintAvailable: true,
    hintPenalty: 25,
    incorrectPenalty: 40,
    speedBonusEnabled: true,
    speedBonusMax: 75,
    status: 'published',
    unlockRequirements: {
      requiredPreviousLevelId: 'level-02-manor',
      minStarsFromEasy: 2,
      minStarsFromMedium: 2,
      minTotalStars: 4,
      minTotalScore: 400,
      customConditionDescription: 'Requires at least 2 Stars from Medium stage (Blackwood Manor)'
    },
    translations: {
      ta: {
        name: 'அப்சிடியன் சிண்டிகேட் சுரங்கப் பெட்டகம் (The Obsidian Syndicate Vault)',
        description: 'சர்வதேச குற்றக் கும்பல் அப்சிடியன் 7 ஆழமான நிலத்தடி சேமிப்பகத்தை உடைத்தது. லேசர் கிரிட்களைத் தவிர்த்து துரோகியைத் தடுத்து நிறுத்தவும்.'
      }
    },
    createdAt: '2026-01-03T10:00:00.000Z',
    updatedAt: '2026-01-03T10:00:00.000Z'
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  // LEVEL 1 QUESTIONS (EASY)
  {
    id: 'q-heist-01',
    levelId: 'level-01-heist',
    title: 'Exhibit A: Rogue Network Gateway & Port Breach',
    text: 'Review the intercepted firewall topology log below. An attacker penetrated the perimeter at 02:41:19 AM using an uncommon internal proxy relay. Which ingress port was weaponized by the unauthorized IP 198.51.100.42?',
    imagePosterUrl: '/uploads/question-posters/poster-heist-network.svg',
    imageCaption: 'Forensic Evidence Poster #CYB-01: Apex Firewall Ingress Telemetry & Packet Flow',
    imageStoragePath: 'question-posters/poster-heist-network.svg',
    answerType: 'multiple_choice',
    options: [
      { id: 'opt-1a', optionKey: 'A', text: 'Port 80 (Standard HTTP Gateway)', isCorrect: false },
      { id: 'opt-1b', optionKey: 'B', text: 'Port 443 (Encrypted SSL Tunnel)', isCorrect: false },
      { id: 'opt-1c', optionKey: 'C', text: 'Port 8443 (Rogue Quantum Relay Ingress)', isCorrect: true },
      { id: 'opt-1d', optionKey: 'D', text: 'Port 22 (SSH Administrative Console)', isCorrect: false }
    ],
    correctAnswerSecret: 'C',
    explanation: 'Telemetric diagram confirms unauthorized packet bursts targeted anomalous Port 8443, which had its firewall rule tampered with 12 minutes prior to the breach.',
    hint: 'Inspect the right branch of the topology node highlighted in neon amber labeled "Quantum Relay Ingress".',
    difficulty: 'easy',
    category: 'Cyber Forensics',
    points: 100,
    incorrectPenalty: 25,
    timerOverrideSeconds: 90,
    displayOrder: 1,
    status: 'published',
    translations: {
      ta: {
        title: 'சான்று A: அங்கீகரிக்கப்படாத நெட்வொர்க் கேட்வே மற்றும் போர்ட் ஊடுருவல்',
        text: 'கீழே உள்ள ஃபயர்வால் டோபாலஜி பதிவை மதிப்பாய்வு செய்யவும். அதிகாலை 02:41:19 மணிக்கு வழக்கத்திற்கு மாறான உள் ப்ராக்ஸி ரிலே மூலம் தாக்குதல் நடத்தியவர் பாதுகாப்பு சுற்றளவை ஊடுருவினார். அங்கீகரிக்கப்படாத IP 198.51.100.42 எந்த நுழைவு போர்ட்டை (Port) பயன்படுத்தியது?',
        caption: 'தடயவியல் சான்று போஸ்டர் #CYB-01: அபெக்ஸ் ஃபயர்வால் நுழைவு டெலிமெட்ரி மற்றும் பாக்கெட் ஓட்டம்',
        hint: 'நியான் ஆம்பரில் சிறப்பிக்கப்பட்டுள்ள "Quantum Relay Ingress" என பெயரிடப்பட்ட டோபாலஜி கிளையைக் கவனிக்கவும்.',
        explanation: 'அங்கீகரிக்கப்படாத பாக்கெட் வெடிப்புகள் போர்ட் 8443-ஐ இலக்காகக் கொண்டன என்பதை டெலிமெட்ரிக் வரைபடம் உறுதிப்படுத்துகிறது. மீறலுக்கு 12 நிமிடங்களுக்கு முன்பு இதன் விதி மாற்றப்பட்டது.',
        options: {
          A: 'போர்ட் 80 (நிலையான HTTP கேட்வே)',
          B: 'போர்ட் 443 (மறைகுறியாக்கப்பட்ட SSL சுரங்கம்)',
          C: 'போர்ட் 8443 (அங்கீகரிக்கப்படாத குவாண்டம் ரிலே நுழைவு)',
          D: 'போர்ட் 22 (SSH நிர்வாக கன்சோல்)'
        }
      }
    },
    createdAt: '2026-01-01T08:10:00.000Z',
    updatedAt: '2026-01-01T08:10:00.000Z'
  },
  {
    id: 'q-heist-02',
    levelId: 'level-01-heist',
    title: 'Exhibit B: Cloned RFID Keycard Badge Scanner Trace',
    text: 'A physical security scanner outside Server Vault 4 recorded two successive badge swipes 4 seconds apart. According to the cryptographic card frequency trace in the poster, which anomaly identifies Badge #774-K as a clone?',
    imagePosterUrl: '/uploads/question-posters/poster-rfid-badge.svg',
    imageCaption: 'Forensic Evidence Poster #CYB-02: Cryptographic NFC Frequency Analyzer & Access Log',
    imageStoragePath: 'question-posters/poster-rfid-badge.svg',
    answerType: 'multiple_choice',
    options: [
      { id: 'opt-2a', optionKey: 'A', text: 'Wrong user identification number engraved on the plastic', isCorrect: false },
      { id: 'opt-2b', optionKey: 'B', text: 'Static counter value (0x0000) failing rolling cryptographic nonce check', isCorrect: true },
      { id: 'opt-2c', optionKey: 'C', text: 'Magnetic strip demagnetized due to security scanners', isCorrect: false },
      { id: 'opt-2d', optionKey: 'D', text: 'Badge was issued to a retired director in 2018', isCorrect: false }
    ],
    correctAnswerSecret: 'B',
    explanation: 'Genuine security tokens employ rolling cryptographic nonces. Badge #774-K transmitted a frozen static counter (0x0000), proving it was captured via replay hardware (Proxmark3).',
    hint: 'Look closely at the "Rolling Counter Nonce" graph at the bottom of the analyzer screen.',
    difficulty: 'easy',
    category: 'Hardware Forensics',
    points: 100,
    incorrectPenalty: 25,
    timerOverrideSeconds: 90,
    displayOrder: 2,
    status: 'published',
    translations: {
      ta: {
        title: 'சான்று B: போலியான RFID கீகார்டு பேட்ஜ் ஸ்கேனர் பதிவு',
        text: 'சர்வர் பெட்டகம் 4-ன் வெளியே உள்ள பாதுகாப்பு ஸ்கேனர் 4 வினாடிகள் இடைவெளியில் அடுத்தடுத்த இரண்டு பேட்ஜ் தேய்ப்புகளைப் பதிவு செய்தது. போஸ்டரில் உள்ள கிரிப்டோகிராஃபிக் கார்டு அதிர்வெண் பதிவின்படி, எந்த முரண்பாடு பேட்ஜ் #774-K ஐ ஒரு போலி என அடையாளம் காட்டுகிறது?',
        caption: 'தடயவியல் சான்று போஸ்டர் #CYB-02: கிரிப்டோகிராஃபிக் NFC அலைவரிசை பகுப்பாய்வு மற்றும் அணுகல் பதிவு',
        hint: 'பகுப்பாய்வி திரையின் கீழே உள்ள "Rolling Counter Nonce" வரைபடத்தை உன்னிப்பாக கவனிக்கவும்.',
        explanation: 'உண்மையான பாதுகாப்பு டோக்கன்கள் சுழலும் நான்ஸைப் பயன்படுத்துகின்றன. பேட்ஜ் #774-K நிலையான கவுண்டரை (0x0000) அனுப்பியதால் அது ரீப்ளே வன்பொருள் மூலம் பிரதியெடுக்கப்பட்டது உறுதியாகிறது.',
        options: {
          A: 'பிளாஸ்டிக்கில் பொறிக்கப்பட்ட தவறான பயனர் அடையாள எண்',
          B: 'நிலையான கவுண்டர் மதிப்பு (0x0000) - சுழலும் கிரிப்டோகிராஃபிக் நான்ஸ் சோதனையில் தோல்வி',
          C: 'பாதுகாப்பு ஸ்கேனர்களால் காந்தப் பட்டை காந்த நீக்கம் செய்யப்பட்டது',
          D: 'இந்த பேட்ஜ் 2018-ல் ஓய்வுபெற்ற இயக்குநருக்கு வழங்கப்பட்டது'
        }
      }
    },
    createdAt: '2026-01-01T08:20:00.000Z',
    updatedAt: '2026-01-01T08:20:00.000Z'
  },
  {
    id: 'q-heist-03',
    levelId: 'level-01-heist',
    title: 'Exhibit C: Decrypted Trojan Memory Payload',
    text: 'The malware process "svchost_quantum.exe" dumped an encrypted memory string. Decrypt the hexadecimal ASCII signature shown in the debugger: "44-41-54-41-5F-48-45-49-53-54". What is the plaintext operation tag?',
    imagePosterUrl: '/uploads/question-posters/poster-malware-hex.svg',
    imageCaption: 'Forensic Evidence Poster #CYB-03: Hexadecimal Memory Dump & Disassembler Frame',
    imageStoragePath: 'question-posters/poster-malware-hex.svg',
    answerType: 'text_input',
    options: [],
    correctAnswerSecret: 'DATA_HEIST',
    explanation: 'Converting hex to ASCII: 0x44="D", 0x41="A", 0x54="T", 0x41="A", 0x5F="_", 0x48="H", 0x45="E", 0x49="I", 0x53="S", 0x54="T". Plaintext tag is "DATA_HEIST".',
    hint: '44 is D, 41 is A, 54 is T, 41 is A, 5F is an underscore...',
    difficulty: 'easy',
    category: 'Reverse Engineering',
    points: 100,
    incorrectPenalty: 25,
    timerOverrideSeconds: 90,
    displayOrder: 3,
    status: 'published',
    translations: {
      ta: {
        title: 'சான்று C: மறைகுறியீடு நீக்கப்பட்ட ட்ரோஜன் மெமரி பேலோட்',
        text: '"svchost_quantum.exe" என்ற மால்வேர் செயல்முறை ஒரு மறைகுறியாக்கப்பட்ட நினைவக சரத்தை வெளியிட்டது. பிழைத்திருத்தியில் காட்டப்படும் ஹெக்ஸாடெசிமல் ASCII குறியீட்டை மறைகுறியீடு நீக்கவும்: "44-41-54-41-5F-48-45-49-53-54". இதன் அசல் உரை (Plaintext) என்ன?',
        caption: 'தடயவியல் சான்று போஸ்டர் #CYB-03: ஹெக்ஸாடெசிமல் நினைவக டம்ப் & டிஸஅசெம்பிளர் கட்டமைப்பு',
        hint: '44 என்பது D, 41 என்பது A, 54 என்பது T, 41 என்பது A, 5F என்பது அடிக்கோடு (_)...',
        explanation: 'ஹெக்ஸாவை ASCII ஆக மாற்றினால்: 44=D, 41=A, 54=T, 41=A, 5F=_, 48=H, 45=E, 49=I, 53=S, 54=T. இதன் அசல் குறியீடு "DATA_HEIST" ஆகும்.'
      }
    },
    createdAt: '2026-01-01T08:30:00.000Z',
    updatedAt: '2026-01-01T08:30:00.000Z'
  },

  // LEVEL 2 QUESTIONS (MEDIUM)
  {
    id: 'q-manor-01',
    levelId: 'level-02-manor',
    title: 'Exhibit D: Ballistics & French Door Shatter Vector',
    text: 'Inspect the crime scene blueprint of Lord Blackwood\'s study. The suspect claims someone shattered the French patio doors from outside the garden. However, glass dispersion radial vectors reveal the exact opposite. Why?',
    imagePosterUrl: '/uploads/question-posters/poster-french-doors.svg',
    imageCaption: 'Forensic Evidence Poster #BW-01: Impact Dynamics & Fracture Dispersion Vector Analysis',
    imageStoragePath: 'question-posters/poster-french-doors.svg',
    answerType: 'multiple_choice',
    options: [
      { id: 'opt-3a', optionKey: 'A', text: 'Concentric cone fractures and 92% glass scatter are located outside on the patio, proving the impact originated from INSIDE the study', isCorrect: true },
      { id: 'opt-3b', optionKey: 'B', text: 'The glass was bulletproof laminated acrylic that cannot break', isCorrect: false },
      { id: 'opt-3c', optionKey: 'C', text: 'Footprints outside show wet mud pointing in both directions', isCorrect: false },
      { id: 'opt-3d', optionKey: 'D', text: 'The lock latch was melted with high-intensity thermite', isCorrect: false }
    ],
    correctAnswerSecret: 'A',
    explanation: 'Impact physics dictate that high-velocity glass shards project opposite the point of impact. 92% of glass was scattered outside on the terrace, proving an inside staging job.',
    hint: 'Check the dispersion percentage meter and arrows pointing towards the terrace garden.',
    difficulty: 'medium',
    category: 'Crime Scene Dynamics',
    points: 120,
    incorrectPenalty: 30,
    timerOverrideSeconds: 60,
    displayOrder: 1,
    status: 'published',
    translations: {
      ta: {
        title: 'சான்று D: பேலிஸ்டிக்ஸ் மற்றும் பிரெஞ்சு கதவு கண்ணாடி உடைப்பு திசையன்',
        text: 'லார்ட் பிளாக்வுட்டின் ஆய்வறையின் குற்றக் கள வரைபடத்தை ஆராயவும். தோட்டத்தின் வெளியிலிருந்து யாரோ பிரெஞ்சு கதவுகளை உடைத்ததாக சந்தேக நபர் கூறுகிறார். இருப்பினும், கண்ணாடி சிதறல் திசையன்கள் இதற்கு முற்றிலும் நேர்மாறானதை வெளிப்படுத்துகின்றன. ஏன்?',
        caption: 'தடயவியல் சான்று போஸ்டர் #BW-01: தாக்க இயக்கவியல் மற்றும் எலும்பு முறிவு சிதறல் திசையன் பகுப்பாய்வு',
        hint: 'மாடி தோட்டத்தை நோக்கி சுட்டிக்காட்டும் சிதறல் சதவீத மீட்டர் மற்றும் அம்புக்குறிகளை சரிபார்க்கவும்.',
        explanation: 'அதிவேக கண்ணாடித் துண்டுகள் தாக்கத்தின் புள்ளிக்கு எதிரே எறியப்படுகின்றன. 92% கண்ணாடி வெளிப்புற மாடியில் சிதறியதால், இது உள்ளே இருந்து திட்டமிடப்பட்டு செய்யப்பட்ட நாடகம் என்பது தெளிவாகிறது.',
        options: {
          A: 'மைய குவிந்த விரிசல்களும் 92% கண்ணாடி சிதறல்களும் உள் முற்றம் வெளியே உள்ளன; இது அறைக்குள்ளிருந்து தாக்கம் ஏற்பட்டதை நிரூபிக்கிறது',
          B: 'கண்ணாடி உடைய முடியாத லேமினேட் அக்ரிலிக் ஆகும்',
          C: 'வெளியே உள்ள ஈரமான சேற்று கால்தடங்கள் இரண்டு திசைகளிலும் உள்ளன',
          D: 'பூட்டு தாழ்ப்பாள் அதிக வெப்ப தெர்மைட்டால் உருக்கப்பட்டது'
        }
      }
    },
    createdAt: '2026-01-02T09:10:00.000Z',
    updatedAt: '2026-01-02T09:10:00.000Z'
  },
  {
    id: 'q-manor-02',
    levelId: 'level-02-manor',
    title: 'Exhibit E: Earl Grey Toxicology & Spectrometry',
    text: 'A delicate porcelain teacup on the cedar desk tested positive for a potent paralytic toxin. According to the spectrophotometer color spectrum match in the poster, which compound neutralized Lord Blackwood?',
    imagePosterUrl: '/uploads/question-posters/poster-tea-toxicology.svg',
    imageCaption: 'Forensic Evidence Poster #BW-02: Ultraviolet Spectrophotometry & Chemical Compound Signature',
    imageStoragePath: 'question-posters/poster-tea-toxicology.svg',
    answerType: 'multiple_choice',
    options: [
      { id: 'opt-4a', optionKey: 'A', text: 'Arsenic Trioxide (Spectral Peak 320nm)', isCorrect: false },
      { id: 'opt-4b', optionKey: 'B', text: 'Tetrodotoxin / Atropine Derivative (Exact Spectral Peak 546nm)', isCorrect: true },
      { id: 'opt-4c', optionKey: 'C', text: 'Potassium Cyanide (Spectral Peak 210nm)', isCorrect: false },
      { id: 'opt-4d', optionKey: 'D', text: 'Harmless bergamot extract', isCorrect: false }
    ],
    correctAnswerSecret: 'B',
    explanation: 'The absorbance spectrum matches the reference line for Atropine belladonna alkaloid at 546 nanometers, causing temporary paralysis without immediate fatality.',
    hint: 'Compare the highlighted neon blue peak wavelength against the reference chart values.',
    difficulty: 'medium',
    category: 'Toxicology',
    points: 120,
    incorrectPenalty: 30,
    timerOverrideSeconds: 60,
    displayOrder: 2,
    status: 'published',
    translations: {
      ta: {
        title: 'சான்று E: ஏர்ல் கிரே தேநீர் நச்சுயியல் மற்றும் நிறமாலையியல்',
        text: 'மேசையில் இருந்த ஒரு பீங்கான் தேநீர் கோப்பையில் தீவிர முடக்குவாத நச்சு இருப்பது கண்டறியப்பட்டது. போஸ்டரில் உள்ள ஸ்பெக்ட்ரோஃபோட்டோமீட்டர் வண்ண நிறமாலை பொருத்தத்தின்படி, லார்ட் பிளாக்வுட்டை முடக்கிய இரசாயன கலவை எது?',
        caption: 'தடயவியல் சான்று போஸ்டர் #BW-02: புற ஊதா ஸ்பெக்ட்ரோஃபோட்டோமெட்ரி மற்றும் இரசாயன கலவை கையொப்பம்',
        hint: 'நியான் நீல நிற உச்சி அலைநீளத்தை குறிப்பு விளக்கப்பட மதிப்புகளுடன் ஒப்பிடவும்.',
        explanation: 'உறிஞ்சும் நிறமாலை 546 நானோமீட்டரில் அட்ரோபின் பெல்லடோனா ஆல்கலாய்டுடன் பொருந்துகிறது, இது உடனடி உயிரிழப்பு இல்லாமல் தற்காலிக முடக்கத்தை ஏற்படுத்துகிறது.',
        options: {
          A: 'ஆர்சனிக் ட்ரைஆக்சைடு (நிறமாலை உச்சி 320nm)',
          B: 'டெட்ரோடோடாக்சின் / அட்ரோபின் வழித்தோன்றல் (சரியான நிறமாலை உச்சி 546nm)',
          C: 'பொட்டாசியம் சயனைடு (நிறமாலை உச்சி 210nm)',
          D: 'பாதிப்பில்லாத பெர்கமோட் சாறு'
        }
      }
    },
    createdAt: '2026-01-02T09:20:00.000Z',
    updatedAt: '2026-01-02T09:20:00.000Z'
  },
  {
    id: 'q-manor-03',
    levelId: 'level-02-manor',
    title: 'Exhibit F: The Clockmaker\'s Chronometer Alibi',
    text: 'The butler swore he heard the grandfather clock chime 11:00 PM while delivering Lord Blackwood\'s mail. However, the pendulum escapement gear teeth were physically blocked at 10:42 PM. How many minutes was the butler\'s testimony off?',
    imagePosterUrl: '/uploads/question-posters/poster-chime-clock.svg',
    imageCaption: 'Forensic Evidence Poster #BW-03: Horological Escapement Jam Analysis & Time Log',
    imageStoragePath: 'question-posters/poster-chime-clock.svg',
    answerType: 'text_input',
    options: [],
    correctAnswerSecret: '18',
    explanation: '11:00 PM (23:00) minus 10:42 PM (22:42) equals exactly 18 minutes discrepancy, completely demolishing the butler\'s fabricated alibi.',
    hint: 'Subtract 42 from 60 to find the missing elapsed minutes.',
    difficulty: 'medium',
    category: 'Timeline Reconstruction',
    points: 120,
    incorrectPenalty: 30,
    timerOverrideSeconds: 60,
    displayOrder: 3,
    status: 'published',
    translations: {
      ta: {
        title: 'சான்று F: கடிகார தயாரிப்பாளரின் காலமானி சாக்குப்போக்கு',
        text: 'கடிதங்களை வழங்கும்போது பெரிய கடிகாரம் இரவு 11:00 மணிக்கு ஒலித்ததை தான் கேட்டதாக பணியாளர் சத்தியம் செய்தார். இருப்பினும், ஊசல் பற்சக்கரம் இரவு 10:42 மணிக்கு உடல் ரீதியாக தடுக்கப்பட்டுள்ளது. பணியாளரின் சாட்சியம் எத்தனை நிமிடங்கள் முரண்படுகிறது?',
        caption: 'தடயவியல் சான்று போஸ்டர் #BW-03: கடிகார தடுப்பு பகுப்பாய்வு மற்றும் நேரப் பதிவு',
        hint: 'விடுபட்ட நிமிடங்களைக் கணக்கிட 60-லிருந்து 42-ஐ கழிக்கவும்.',
        explanation: 'இரவு 11:00 (23:00) மணியிலிருந்து இரவு 10:42 (22:42) ஐக் கழித்தால் சரியாக 18 நிமிடங்கள் முரண்பாடு வருகிறது; இது பணியாளரின் பொய்யான சாக்குப்போக்கை அம்பலப்படுத்துகிறது.'
      }
    },
    createdAt: '2026-01-02T09:30:00.000Z',
    updatedAt: '2026-01-02T09:30:00.000Z'
  },

  // LEVEL 3 QUESTIONS (HARD)
  {
    id: 'q-syndicate-01',
    levelId: 'level-03-syndicate',
    title: 'Exhibit G: Biometric Vault Laser Grid Override',
    text: 'The subterranean vault entrance is shielded by an alternating optical laser tripwire grid. Based on the wavelength pulse frequency sequence (Red: 650nm, Green: 532nm, Blue: 450nm) and node parity displayed on the schematic, which bypass node must be grounded first?',
    imagePosterUrl: '/uploads/question-posters/poster-vault-lasers.svg',
    imageCaption: 'Forensic Evidence Poster #SYN-01: Subterranean Optical Laser Tripwire Matrix & Ground Nodes',
    imageStoragePath: 'question-posters/poster-vault-lasers.svg',
    answerType: 'multiple_choice',
    options: [
      { id: 'opt-5a', optionKey: 'A', text: 'Ground Node Alpha (Primary High Voltage)', isCorrect: false },
      { id: 'opt-5b', optionKey: 'B', text: 'Ground Node Delta-9 (Green 532nm Photodiode Bypass Loop)', isCorrect: true },
      { id: 'opt-5c', optionKey: 'C', text: 'Ground Node Omega (Siren Trigger)', isCorrect: false },
      { id: 'opt-5d', optionKey: 'D', text: 'Cut all fiber cables simultaneously', isCorrect: false }
    ],
    correctAnswerSecret: 'B',
    explanation: 'The schematic clearly highlights Node Delta-9 as the neutral grounding loop for the green 532nm photodiode array. Disarming it allows 15 seconds of blind perimeter movement.',
    hint: 'Look for the green-tinted circuit track leading directly to the chassis ground symbol.',
    difficulty: 'hard',
    category: 'Security Systems',
    points: 150,
    incorrectPenalty: 40,
    timerOverrideSeconds: 45,
    displayOrder: 1,
    status: 'published',
    translations: {
      ta: {
        title: 'சான்று G: பயோமெட்ரிக் பெட்டக லேசர் கிரிட் புறக்கணிப்பு',
        text: 'நிலத்தடி பெட்டக நுழைவாயில் ஆப்டிகல் லேசர் ட்ரிப்வயர் கட்டத்தால் பாதுகாக்கப்படுகிறது. திட்ட வரைபடத்தில் காட்டப்பட்டுள்ள அலைநீள துடிப்பு வரிசை (சிவப்பு: 650nm, பச்சை: 532nm, நீலம்: 450nm) மற்றும் முனை சமநிலையின் அடிப்படையில், எந்த புறக்கணிப்பு முனையை முதலில் தரையிறக்க (Ground) வேண்டும்?',
        caption: 'தடயவியல் சான்று போஸ்டர் #SYN-01: நிலத்தடி லேசர் ட்ரிப்வயர் மேட்ரிக்ஸ் மற்றும் தரை முனைகள்',
        hint: 'சேஸிஸ் கிரவுண்ட் சின்னத்திற்கு நேரடியாக செல்லும் பச்சை நிற சர்க்யூட் பாதையைத் தேடுங்கள்.',
        explanation: 'வரைபடம் முனை டெல்டா-9-ஐ பச்சை நிற 532nm போட்டோடையோடுக்கான நடுநிலை தரையிறக்கும் வளையமாக தெளிவாகக் காட்டுகிறது. இதை செயலிழக்கச் செய்வது 15 வினாடிகள் ஊடுருவல் நேரத்தை அளிக்கிறது.',
        options: {
          A: 'கிரவுண்ட் நோட் ஆல்ஃபா (முதன்மை உயர் மின்னழுத்தம்)',
          B: 'கிரவுண்ட் நோட் டெல்டா-9 (பச்சை 532nm போட்டோடையோட் பைபாஸ் லூப்)',
          C: 'கிரவுண்ட் நோட் ஒமேகா (சைரன் தூண்டுதல்)',
          D: 'அனைத்து ஆப்டிகல் கேபிள்களையும் ஒரே நேரத்தில் வெட்டுதல்'
        }
      }
    },
    createdAt: '2026-01-03T10:10:00.000Z',
    updatedAt: '2026-01-03T10:10:00.000Z'
  },
  {
    id: 'q-syndicate-02',
    levelId: 'level-03-syndicate',
    title: 'Exhibit H: Thermal Satellite Surveillance at Extraction Dock',
    text: 'A high-orbit infrared satellite pass scanned the harbor docks at 03:15 AM. Three vessels are docked, but only one vessel displays active twin-turbodiesel thermal engine plumes in the cooling exhaust manifold. Which vessel is the getaway craft?',
    imagePosterUrl: '/uploads/question-posters/poster-thermal-dock.svg',
    imageCaption: 'Forensic Evidence Poster #SYN-02: Satellite Thermal Infrared Thermography & Dock Heat Signatures',
    imageStoragePath: 'question-posters/poster-thermal-dock.svg',
    answerType: 'multiple_choice',
    options: [
      { id: 'opt-6a', optionKey: 'A', text: 'Vessel A: "Sea Nymph" (Ambient Cold 14°C)', isCorrect: false },
      { id: 'opt-6b', optionKey: 'B', text: 'Vessel B: "Phantom Hydrofoil" (Intense Thermal Core 88°C at Transom)', isCorrect: true },
      { id: 'opt-6c', optionKey: 'C', text: 'Vessel C: "Trawler 4" (Cold Hull)', isCorrect: false },
      { id: 'opt-6d', optionKey: 'D', text: 'Dock Crane #2', isCorrect: false }
    ],
    correctAnswerSecret: 'B',
    explanation: 'Vessel B shows an intense crimson/yellow thermal core reaching 88°C, indicating idling turbine engines ready for immediate high-speed departure.',
    hint: 'Find the boat displaying bright yellow-white heat signatures at its stern transom.',
    difficulty: 'hard',
    category: 'Surveillance Intel',
    points: 150,
    incorrectPenalty: 40,
    timerOverrideSeconds: 45,
    displayOrder: 2,
    status: 'published',
    translations: {
      ta: {
        title: 'சான்று H: தப்பிக்கும் துறைமுகத்தில் வெப்ப செயற்கைக்கோள் கண்காணிப்பு',
        text: 'அதிகாலை 03:15 மணிக்கு ஒரு உயர் சுற்றுப்பாதை அகச்சிவப்பு செயற்கைக்கோள் துறைமுகத்தை ஸ்கேன் செய்தது. மூன்று கப்பல்கள் நிறுத்தப்பட்டுள்ளன, ஆனால் ஒரே ஒரு படகு மட்டுமே அதன் வெளியேற்றக் குழாயில் தீவிர இரட்டை டர்போடீசல் வெப்ப எஞ்சின் புகையைக் காட்டுகிறது. தப்பிக்கும் படகு எது?',
        caption: 'தடயவியல் சான்று போஸ்டர் #SYN-02: செயற்கைக்கோள் அகச்சிவப்பு தெர்மோகிராபி மற்றும் துறைமுக வெப்ப கையொப்பங்கள்',
        hint: 'தனது பின்புற டிரான்ஸமில் பிரகாசமான மஞ்சள்-வெள்ளை வெப்பத்தைக் காட்டும் படகைக் கண்டறியவும்.',
        explanation: 'படகு B-ல் 88°C ஐ எட்டும் தீவிர வெப்ப மையம் காணப்படுகிறது, இது உடனடியாக அதிக வேகத்தில் தப்பிக்க என்ஜின்கள் இயங்கிக் கொண்டிருப்பதைக் குறிக்கிறது.',
        options: {
          A: 'படகு A: "சீ நிம்ஃப்" (குளிர்ந்த சூழல் 14°C)',
          B: 'படகு B: "பாண்டம் ஹைட்ரோஃபாயில்" (பின்புறத்தில் 88°C தீவிர வெப்ப மையம்)',
          C: 'படகு C: "ட்ராலர் 4" (குளிர்ந்த உடல்)',
          D: 'கப்பல்துறை கிரேன் #2'
        }
      }
    },
    createdAt: '2026-01-03T10:20:00.000Z',
    updatedAt: '2026-01-03T10:20:00.000Z'
  },
  {
    id: 'q-syndicate-03',
    levelId: 'level-03-syndicate',
    title: 'Exhibit I: The Double Agent\'s Caesar Shift Cipher',
    text: 'A secret radio burst was intercepted: "VKDGRZ". Using the cryptographic cipher wheel with Caesar rotation shift +3 (where D=A, E=B, etc.), decode the codename of the syndicate mole.',
    imagePosterUrl: '/uploads/question-posters/poster-cipher-wheel.svg',
    imageCaption: 'Forensic Evidence Poster #SYN-03: Cryptographic Caesar Disc & Radio Frequency Intercept',
    imageStoragePath: 'question-posters/poster-cipher-wheel.svg',
    answerType: 'text_input',
    options: [],
    correctAnswerSecret: 'SHADOW',
    explanation: 'Applying shift -3: V(-3)=S, K(-3)=H, D(-3)=A, G(-3)=D, R(-3)=O, Z(-3)=W. The unmasked alias of the mole is "SHADOW".',
    hint: 'V minus 3 letters is S. K minus 3 letters is H...',
    difficulty: 'hard',
    category: 'Cryptography',
    points: 150,
    incorrectPenalty: 40,
    timerOverrideSeconds: 45,
    displayOrder: 3,
    status: 'published',
    translations: {
      ta: {
        title: 'சான்று I: இரட்டை உளவாளியின் சீசர் மாற்றுக் குறியீடு',
        text: 'ஒரு ரகசிய வானொலி சமிக்ஞை இடைமறிக்கப்பட்டது: "VKDGRZ". சீசர் சுழற்சி மாற்றம் +3 (D=A, E=B) கொண்ட கிரிப்டோகிராஃபிக் குறியீட்டு சக்கரத்தைப் பயன்படுத்தி, கும்பலின் உளவாளியின் குறியீட்டுப் பெயரை டிகோட் செய்யவும்.',
        caption: 'தடயவியல் சான்று போஸ்டர் #SYN-03: கிரிப்டோகிராஃபிக் சீசர் சக்கரம் மற்றும் வானொலி அதிர்வெண் இடைமறிப்பு',
        hint: 'V எழுத்திலிருந்து 3 எழுத்துக்களைக் கழித்தால் S. K எழுத்திலிருந்து 3 எழுத்துக்களைக் கழித்தால் H...',
        explanation: 'மாற்றம் -3 ஐப் பயன்படுத்தினால்: V->S, K->H, D->A, G->D, R->O, Z->W. உளவாளியின் ரகசிய பெயர் "SHADOW" ஆகும்.'
      }
    },
    createdAt: '2026-01-03T10:30:00.000Z',
    updatedAt: '2026-01-03T10:30:00.000Z'
  }
];

export const INITIAL_PLAYERS: UserProfile[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
