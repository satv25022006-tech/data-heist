import { GameSettings, Level, GameCard } from '../types/game.ts';

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

export const INITIAL_GAMES: GameCard[] = [
  {
    id: 'game-data-heist',
    slug: 'data-heist',
    title: 'DATA HEIST: Cyber Forensic Intrusion',
    tagline: 'Quantum Server Perimeter Breach & Malware Analysis',
    description: 'An intrusion alarm was triggered at 02:41 AM inside the Apex Quantum Reserve server bank. Intercept rogue packet logs, detect cloned NFC access badges, and decrypt Trojan memory payloads.',
    category: 'Cyber Forensics',
    icon: 'fingerprint',
    badge: 'Featured Event',
    totalLevels: 3,
    estimatedTime: '15-20 Mins',
    rules: [
      'Each team must clear exhibits one by one under strict countdown timers.',
      'Easy is open immediately. Medium requires 2 stars on Easy. Hard requires 2 stars on Medium.',
      'Speed bonus awarded for unused time; wrong answers and hints incur point penalties.',
      'Upon clearing levels, enter your Name, Register Number, College Name, and Team Name to submit final official records.'
    ],
    translations: {
      ta: {
        title: 'டேட்டா ஹெயிஸ்ட்: சைபர் கிரைம் ஊடுருவல்',
        tagline: 'குவாண்டம் சர்வர் எல்லை மீறல் & மால்வேர் பகுப்பாய்வு',
        description: 'அபெக்ஸ் குவாண்டம் ரிசர்வ் சர்வர் வங்கியில் அதிகாலை 02:41 மணிக்கு ஊடுருவல் எச்சரிக்கை ஒலித்தது. தவறான பாக்கெட் பதிவுகளை இடைமறிக்கவும், நகல் எடுக்கப்பட்ட NFC அணுகல் பேட்ஜ்களைக் கண்டறியவும் மற்றும் ட்ரோஜன் மெமரி பேலோடை டிகோட் செய்யவும்.',
        category: 'சைபர் தடயவியல்',
        rules: [
          'ஒவ்வொரு குழுவும் கடுமையான கவுண்ட்டவுன் டைமரின் கீழ் ஆதாரங்களை ஒவ்வொன்றாக ஆராய்ந்து முடிக்க வேண்டும்.',
          'எளிதான நிலை (Easy) உடனடியாக திறக்கப்பட்டுள்ளது. நடுத்தர நிலைக்கு (Medium) Easy-ல் 2 நட்சத்திரங்கள் தேவை. கடின நிலைக்கு (Hard) Medium-ல் 2 நட்சத்திரங்கள் தேவை.',
          'மீதமுள்ள நேரத்திற்கு வேக போனஸ் புள்ளிகள் வழங்கப்படும்; தவறான பதில்களுக்கும் குறிப்புகளுக்கும் புள்ளிகள் குறைக்கப்படும்.',
          'விசாரணை அமர்வை முடித்த பிறகு, அதிகாரப்பூர்வ போட்டி நிலையைப் பெற பெயர், பதிவு எண், கல்லூரி பெயர் மற்றும் குழுப் பெயரைச் சமர்ப்பிக்கவும்.'
        ]
      }
    }
  },
  {
    id: 'game-blackwood-manor',
    slug: 'blackwood-manor',
    title: 'THE BLACKWOOD MANOR CIPHER',
    tagline: 'Locked Study Crime Dynamics & Chronometer Discrepancy',
    description: 'Lord Blackwood was found paralyzed in his locked study with his cryptographic safe emptied. Investigate French door shatter ballistics, tea toxicology, and pendulum clock gear jams.',
    category: 'Forensics & Ballistics',
    icon: 'shield',
    badge: 'Victorian Cryptography',
    totalLevels: 3,
    estimatedTime: '15 Mins',
    rules: [
      'Examine physical evidence diagrams, chemical spectra, and time logs.',
      'Decisions are finalized per exhibit submission.',
      'Complete all levels to finalize college symposium ranking.'
    ],
    translations: {
      ta: {
        title: 'பிளாக்வுட் மேனர் மர்ம சங்கேதம்',
        tagline: 'பூட்டிய அறை குற்ற இயக்கவியல் & கடிகார முரண்பாடு',
        description: 'லார்ட் பிளாக்வுட் பூட்டப்பட்ட அவரது அறையில் மயக்கமுற்ற நிலையில் கண்டெடுக்கப்பட்டார், அவரது ரகசிய சேஃப் பெட்டகம் காலியாக இருந்தது. பிரெஞ்சு கதவு கண்ணாடி உடைப்பு பாலிஸ்டிக்ஸ், தேநீர் நச்சுத்தன்மை மற்றும் கடிகார முள் நெரிசலை ஆராயுங்கள்.',
        category: 'தடயவியல் & பாலிஸ்டிக்ஸ்',
        rules: [
          'உடற்கூறு சான்றுகள், வேதியியல் நிறமாலை மற்றும் நேரப் பதிவுகளை கவனமாக ஆய்வு செய்யவும்.',
          'ஒவ்வொரு ஆதாரத்திற்கும் உங்கள் துப்பறியும் முடிவை உறுதிப்படுத்திய பின் மாற்ற முடியாது.',
          'கல்லூரி சிம்போசியம் தரவரிசையை உறுதிப்படுத்த அனைத்து நிலைகளையும் முடிக்கவும்.'
        ]
      }
    }
  },
  {
    id: 'game-obsidian-syndicate',
    slug: 'obsidian-vault',
    title: 'THE OBSIDIAN SYNDICATE VAULT',
    tagline: 'Biometric Laser Grid Bypass & Maritime Extraction',
    description: 'The international syndicate Obsidian 7 breached the deep subterranean reserve. Disarm optical laser grids, identify getaway vessel exhaust heat plumes on satellite, and decode Caesar shift telegrams.',
    category: 'High Infiltration',
    icon: 'vault',
    badge: 'Syndicate Threat',
    totalLevels: 3,
    estimatedTime: '20 Mins',
    rules: [
      'Ground bypass nodes according to optical frequency wavelengths.',
      'Satellite infrared signatures distinguish idling getaway crafts.',
      'Final submission registers official symposium standing.'
    ],
    translations: {
      ta: {
        title: 'அப்சிடியன் சிண்டிகேட் சுரங்கப் பெட்டகம்',
        tagline: 'பயோமெட்ரிக் லேசர் கிரிட் புறக்கணிப்பு & கடல் தப்பித்தல்',
        description: 'சர்வதேச குற்றக் கும்பல் அப்சிடியன் 7 ஆழமான நிலத்தடி சேமிப்பகத்தை ஊடுருவியது. ஆப்டிகல் லேசர் கிரிட்களை செயலிழக்கச் செய்யவும், செயற்கைக்கோளில் தப்பியோடும் படகின் என்ஜின் வெப்பப் புகையை அடையாளம் காணவும் மற்றும் சீசர் ஷிப்ட் செய்திகளை டிகோட் செய்யவும்.',
        category: 'உயர் ஊடுருவல்',
        rules: [
          'லேசர் அதிர்வெண் அலைநீளங்களின் அடிப்படையில் சரியான பைபாஸ் முனைகளை தரையிறக்கவும்.',
          'செயற்கைக்கோள் அகச்சிவப்பு கையொப்பங்கள் தப்பிக்கும் படகுகளை துல்லியமாக வேறுபடுத்துகின்றன.',
          'இறுதி சமர்ப்பிப்பு அதிகாரப்பூர்வ போட்டித் தரவரிசையில் உங்கள் இடத்தை பதிவு செய்யும்.'
        ]
      }
    }
  }
];

export const INITIAL_LEVELS: (Level & { isUnlocked: boolean; lockReason?: string; isCompleted: boolean; highestScore: number; highestStars: number })[] = [
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
    isUnlocked: true,
    isCompleted: false,
    highestScore: 0,
    highestStars: 0,
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
    isUnlocked: true,
    isCompleted: false,
    highestScore: 0,
    highestStars: 0,
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
      minTotalScore: 380,
      customConditionDescription: 'Requires at least 2 Stars from Medium stage (Blackwood Manor)'
    },
    translations: {
      ta: {
        name: 'அப்சிடியன் சிண்டிகேட் சுரங்கப் பெட்டகம் (The Syndicate Vault)',
        description: 'சர்வதேச குற்றக் கும்பல் அப்சிடியன் 7 ஆழமான நிலத்தடி சேமிப்பகத்தை ஊடுருவியது. ஆப்டிகல் லேசர் கிரிட்களைத் தவிர்த்து துரோகியைப் பிடிக்கவும்.'
      }
    },
    isUnlocked: true,
    isCompleted: false,
    highestScore: 0,
    highestStars: 0,
    createdAt: '2026-01-03T10:00:00.000Z',
    updatedAt: '2026-01-03T10:00:00.000Z'
  }
];
