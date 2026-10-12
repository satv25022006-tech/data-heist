import fs from 'fs';
import path from 'path';

export function ensureUploadsAndPosters(rootDir: string) {
  const uploadDir = path.join(rootDir, 'uploads', 'question-posters');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const posters: Record<string, string> = {
    'poster-heist-network.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0a0f1d"/>
          <stop offset="100%" stop-color="#060913"/>
        </linearGradient>
        <linearGradient id="neonGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10b981"/>
          <stop offset="100%" stop-color="#059669"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="900" height="500" fill="url(#bg)"/>
      <g stroke="#1e293b" stroke-width="1" opacity="0.4">
        <line x1="0" y1="100" x2="900" y2="100"/><line x1="0" y1="200" x2="900" y2="200"/>
        <line x1="0" y1="300" x2="900" y2="300"/><line x1="0" y1="400" x2="900" y2="400"/>
        <line x1="150" y1="0" x2="150" y2="500"/><line x1="300" y1="0" x2="300" y2="500"/>
        <line x1="450" y1="0" x2="450" y2="500"/><line x1="600" y1="0" x2="600" y2="500"/>
        <line x1="750" y1="0" x2="750" y2="500"/>
      </g>
      <!-- Title banner -->
      <rect x="30" y="25" width="840" height="45" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
      <text x="50" y="52" fill="#38bdf8" font-family="monospace" font-size="16" font-weight="bold">EVIDENCE DOSSIER #CYB-01 // APEX QUANTUM FIREWALL PACKET LOG</text>
      <text x="730" y="52" fill="#f43f5e" font-family="monospace" font-size="14" font-weight="bold">CONFIDENTIAL</text>
      <circle cx="850" cy="47" r="6" fill="#f43f5e"/>

      <!-- Node 1: External IP -->
      <rect x="50" y="160" width="180" height="90" rx="8" fill="#1e1b4b" stroke="#6366f1" stroke-width="2"/>
      <text x="70" y="190" fill="#a5b4fc" font-family="monospace" font-size="12">EXTERNAL INTRUDER</text>
      <text x="70" y="215" fill="#ffffff" font-family="monospace" font-size="14" font-weight="bold">198.51.100.42</text>
      <text x="70" y="235" fill="#f43f5e" font-family="monospace" font-size="11">FLAGGED: PROXY CHAIN</text>

      <!-- Connecting line 1 to router -->
      <path d="M 230 205 L 340 205" stroke="#6366f1" stroke-width="3" stroke-dasharray="6,4"/>
      <polygon points="340,205 330,199 330,211" fill="#6366f1"/>

      <!-- Router Node -->
      <rect x="340" y="150" width="180" height="110" rx="8" fill="#0f2937" stroke="#38bdf8" stroke-width="2"/>
      <text x="360" y="180" fill="#7dd3fc" font-family="monospace" font-size="12">EDGE GATEWAY</text>
      <text x="360" y="205" fill="#ffffff" font-family="monospace" font-size="14" font-weight="bold">FIREWALL #01</text>
      <text x="360" y="228" fill="#38bdf8" font-family="monospace" font-size="11">INSPECT: 02:41:19 AM</text>
      <text x="360" y="246" fill="#94a3b8" font-family="monospace" font-size="10">BLOCKED: 4,112 PKTS</text>

      <!-- Branch A: Port 80 (Blocked) -->
      <path d="M 520 185 L 630 130" stroke="#64748b" stroke-width="2"/>
      <rect x="630" y="100" width="220" height="60" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
      <text x="645" y="125" fill="#94a3b8" font-family="monospace" font-size="12">PORT 80 / HTTP</text>
      <text x="645" y="145" fill="#ef4444" font-family="monospace" font-size="11">[BLOCKED BY ACL]</text>

      <!-- Branch B: Target Rogue Port 8443 (BREACH!) -->
      <path d="M 520 205 L 630 205" stroke="#f59e0b" stroke-width="3" filter="url(#glow)"/>
      <rect x="630" y="175" width="230" height="80" rx="6" fill="#451a03" stroke="#f59e0b" stroke-width="2.5" filter="url(#glow)"/>
      <text x="645" y="202" fill="#fbbf24" font-family="monospace" font-size="13" font-weight="bold">PORT 8443 // INGRESS</text>
      <text x="645" y="222" fill="#ffffff" font-family="monospace" font-size="11">QUANTUM RELAY INGRESS</text>
      <text x="645" y="242" fill="#22c55e" font-family="monospace" font-size="11" font-weight="bold">[UNAUTHORIZED ENTRY GRANTED]</text>

      <!-- Branch C: Port 22 (Refused) -->
      <path d="M 520 225 L 630 285" stroke="#64748b" stroke-width="2"/>
      <rect x="630" y="270" width="220" height="60" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
      <text x="645" y="295" fill="#94a3b8" font-family="monospace" font-size="12">PORT 22 / SSH</text>
      <text x="645" y="315" fill="#ef4444" font-family="monospace" font-size="11">[CONN REFUSED]</text>

      <!-- Bottom Telemetry Terminal Box -->
      <rect x="50" y="360" width="810" height="105" rx="6" fill="#020617" stroke="#334155" stroke-width="1"/>
      <text x="70" y="388" fill="#10b981" font-family="monospace" font-size="12">[02:41:19] PACKET CAPTURE: TCP SYN src=198.51.100.42:51241 dst=10.0.4.12:8443 (RELAY ACTIVE)</text>
      <text x="70" y="412" fill="#38bdf8" font-family="monospace" font-size="12">[02:41:20] FORENSIC NOTE: Rule #8443 was bypassed via temporary administrator backdoor hash.</text>
      <text x="70" y="436" fill="#f43f5e" font-family="monospace" font-size="12">[02:41:24] ALERT: Exfiltration stream initiated towards offshore quantum node.</text>
    </svg>`,

    'poster-rfid-badge.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="100%" height="100%">
      <rect width="900" height="500" fill="#0b0f19"/>
      <!-- Header -->
      <rect x="40" y="30" width="820" height="50" rx="6" fill="#111827" stroke="#374151"/>
      <text x="60" y="62" fill="#a855f7" font-family="monospace" font-size="17" font-weight="bold">SECURITY ARCHIVE #CYB-02 // NFC CRYPTOGRAPHIC BADGE ANALYZER</text>
      
      <!-- Left side: Badge Mockup -->
      <rect x="60" y="110" width="340" height="210" rx="12" fill="#1e1b4b" stroke="#818cf8" stroke-width="2"/>
      <text x="85" y="145" fill="#c7d2fe" font-family="monospace" font-size="14" font-weight="bold">APEX QUANTUM FACILITY</text>
      <text x="85" y="170" fill="#94a3b8" font-family="monospace" font-size="12">ACCESS BADGE: #774-K</text>
      <circle cx="340" cy="155" r="22" fill="#4338ca"/>
      <text x="330" y="161" fill="#ffffff" font-family="monospace" font-size="16">RFID</text>
      <!-- Magnetic chip -->
      <rect x="85" y="190" width="60" height="45" rx="4" fill="#eab308"/>
      <line x1="85" y1="212" x2="145" y2="212" stroke="#ca8a04" stroke-width="2"/>
      <text x="85" y="270" fill="#f87171" font-family="monospace" font-size="12">SWIPE #1: 02:40:58 AM (Genuine)</text>
      <text x="85" y="295" fill="#ef4444" font-family="monospace" font-size="12" font-weight="bold">SWIPE #2: 02:41:02 AM (ANOMALOUS)</text>

      <!-- Right side: Frequency & Nonce Graph -->
      <rect x="430" y="110" width="430" height="210" rx="8" fill="#030712" stroke="#1f2937"/>
      <text x="450" y="140" fill="#38bdf8" font-family="monospace" font-size="13">NFC TELEMETRY INSPECTOR</text>
      <text x="450" y="168" fill="#10b981" font-family="monospace" font-size="12">GENUINE BADGE NONCE: 0x8F9B, 0x90A1, 0x91F4 (Rolling)</text>
      
      <!-- Nonce alert box -->
      <rect x="450" y="185" width="390" height="105" rx="6" fill="#2d060e" stroke="#f43f5e" stroke-width="1.5"/>
      <text x="465" y="215" fill="#fca5a5" font-family="monospace" font-size="12" font-weight="bold">CLONED REPLAY ATTACK DETECTED</text>
      <text x="465" y="240" fill="#ffffff" font-family="monospace" font-size="13">TRANSMITTED NONCE: <tspan fill="#facc15" font-weight="bold">0x0000 (FROZEN STATIC COUNTER)</tspan></text>
      <text x="465" y="265" fill="#cbd5e1" font-family="monospace" font-size="11">ANALYSIS: Hardware emulator cloned UID without dynamic private key.</text>

      <!-- Footer terminal -->
      <rect x="40" y="350" width="820" height="110" rx="6" fill="#020617" stroke="#1e293b"/>
      <text x="60" y="380" fill="#94a3b8" font-family="monospace" font-size="12">DEVICE LOG: Proxmark3 / Flipper Zero signature matches RF field perturbation.</text>
      <text x="60" y="405" fill="#38bdf8" font-family="monospace" font-size="12">CONCLUSION: The intruder cloned Badge 774-K using a recorded 13.56 MHz carrier wave.</text>
      <text x="60" y="430" fill="#fbbf24" font-family="monospace" font-size="12">FORENSIC RULE: Static counter 0x0000 conclusively demonstrates cryptographic counterfeit.</text>
    </svg>`,

    'poster-malware-hex.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="100%" height="100%">
      <rect width="900" height="500" fill="#050811"/>
      <rect x="40" y="30" width="820" height="45" rx="6" fill="#0f172a" stroke="#1e293b"/>
      <text x="60" y="58" fill="#22c55e" font-family="monospace" font-size="16" font-weight="bold">FORENSIC DISASSEMBLER // MEMORY DUMP: SVCHOST_QUANTUM.EXE</text>

      <!-- Hex frame -->
      <rect x="40" y="95" width="820" height="240" rx="8" fill="#020617" stroke="#334155"/>
      
      <!-- Hex lines -->
      <text x="60" y="130" fill="#64748b" font-family="monospace" font-size="14">OFFSET</text>
      <text x="180" y="130" fill="#38bdf8" font-family="monospace" font-size="14">HEXADECIMAL DUMP</text>
      <text x="640" y="130" fill="#f59e0b" font-family="monospace" font-size="14">DECODED ASCII</text>

      <line x1="40" y1="145" x2="860" y2="145" stroke="#1e293b" stroke-width="1.5"/>

      <text x="60" y="180" fill="#64748b" font-family="monospace" font-size="14">0x0040A10</text>
      <text x="180" y="180" fill="#e2e8f0" font-family="monospace" font-size="14">7F 45 4C 46 02 01 01 00 00 00 00 00 00 00 00 00</text>
      <text x="640" y="180" fill="#94a3b8" font-family="monospace" font-size="14">.ELF............</text>

      <!-- Target payload line highlighted -->
      <rect x="50" y="198" width="800" height="40" rx="4" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
      <text x="60" y="224" fill="#fb7185" font-family="monospace" font-size="14">0x0040A20</text>
      <text x="180" y="224" fill="#facc15" font-family="monospace" font-size="15" font-weight="bold">44 41 54 41 5F 48 45 49 53 54 00 58 90 90 CC FF</text>
      <text x="640" y="224" fill="#4ade80" font-family="monospace" font-size="15" font-weight="bold">[ ??????????? ]</text>

      <text x="60" y="270" fill="#64748b" font-family="monospace" font-size="14">0x0040A30</text>
      <text x="180" y="270" fill="#e2e8f0" font-family="monospace" font-size="14">E8 22 01 00 00 48 89 C7 E8 50 02 00 00 B8 01 00</text>
      <text x="640" y="270" fill="#94a3b8" font-family="monospace" font-size="14">."...H...P......</text>

      <text x="60" y="310" fill="#64748b" font-family="monospace" font-size="14">0x0040A40</text>
      <text x="180" y="310" fill="#e2e8f0" font-family="monospace" font-size="14">48 83 C4 08 5B 5D 41 5C 41 5D C3 90 90 90 90 90</text>
      <text x="640" y="310" fill="#94a3b8" font-family="monospace" font-size="14">H...[]A\A]......</text>

      <!-- Bottom Hint & Converter Guide -->
      <rect x="40" y="355" width="820" height="110" rx="6" fill="#0f172a" stroke="#334155"/>
      <text x="60" y="385" fill="#f43f5e" font-family="monospace" font-size="13" font-weight="bold">FORENSIC CONVERSION TABLE (HEX TO ASCII):</text>
      <text x="60" y="410" fill="#e2e8f0" font-family="monospace" font-size="13">0x44='D' | 0x41='A' | 0x54='T' | 0x41='A' | 0x5F='_' | 0x48='H' | 0x45='E' | 0x49='I' | 0x53='S' | 0x54='T'</text>
      <text x="60" y="440" fill="#38bdf8" font-family="monospace" font-size="12">TYPE THE ENTIRE DECODED STRING INTO THE CRIME TERMINAL TO NEUTRALIZE THE PROCESS.</text>
    </svg>`,

    'poster-french-doors.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="100%" height="100%">
      <rect width="900" height="500" fill="#0c1222"/>
      <rect x="40" y="30" width="820" height="45" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="60" y="58" fill="#38bdf8" font-family="monospace" font-size="16" font-weight="bold">BLACKWOOD MANOR FORENSICS // EXHIBIT D: FRENCH DOOR GLASS IMPACT VECTORS</text>

      <!-- Floorplan layout -->
      <rect x="60" y="100" width="360" height="240" fill="#1e1b4b" stroke="#6366f1" stroke-width="2"/>
      <text x="80" y="130" fill="#c7d2fe" font-family="monospace" font-size="14" font-weight="bold">STUDY INTERIOR</text>
      <text x="80" y="155" fill="#94a3b8" font-family="monospace" font-size="12">DESK POSITION // LORD BLACKWOOD FOUND</text>
      <circle cx="200" cy="220" r="14" fill="#f43f5e"/>
      <text x="160" y="260" fill="#f43f5e" font-family="monospace" font-size="11">POINT OF ORIGIN</text>

      <!-- French Patio Door Line -->
      <line x1="420" y1="100" x2="420" y2="340" stroke="#facc15" stroke-width="6" stroke-dasharray="10,6"/>
      <text x="360" y="90" fill="#facc15" font-family="monospace" font-size="12">FRENCH DOORS</text>

      <!-- Terrace Garden Exterior -->
      <rect x="425" y="100" width="415" height="240" fill="#052e16" stroke="#16a34a" stroke-width="2"/>
      <text x="450" y="130" fill="#86efac" font-family="monospace" font-size="14" font-weight="bold">TERRACE &amp; GARDEN EXTERIOR</text>

      <!-- Glass Shards dispersion vectors -->
      <g stroke="#38bdf8" stroke-width="2">
        <line x1="420" y1="180" x2="580" y2="140"/>
        <line x1="420" y1="210" x2="680" y2="210"/>
        <line x1="420" y1="230" x2="620" y2="280"/>
        <line x1="420" y1="260" x2="540" y2="320"/>
      </g>
      <!-- Glass Shards dots -->
      <circle cx="510" cy="160" r="4" fill="#38bdf8"/><circle cx="560" cy="180" r="3" fill="#38bdf8"/>
      <circle cx="610" cy="220" r="5" fill="#38bdf8"/><circle cx="650" cy="210" r="4" fill="#38bdf8"/>
      <circle cx="580" cy="260" r="3" fill="#38bdf8"/><circle cx="530" cy="290" r="4" fill="#38bdf8"/>
      <circle cx="490" cy="230" r="4" fill="#38bdf8"/>

      <!-- Statistics bar -->
      <rect x="445" y="150" width="375" height="150" rx="8" fill="#022c22" stroke="#22c55e" opacity="0.9"/>
      <text x="465" y="180" fill="#4ade80" font-family="monospace" font-size="13" font-weight="bold">BALLISTIC DISPERSION RATIO:</text>
      <text x="465" y="210" fill="#ffffff" font-family="monospace" font-size="14">EXTERIOR PATIO GLASS: <tspan fill="#facc15" font-weight="bold">92.4% (OUTWARD)</tspan></text>
      <text x="465" y="235" fill="#ffffff" font-family="monospace" font-size="14">INTERIOR STUDY GLASS: <tspan fill="#94a3b8">7.6%</tspan></text>
      <text x="465" y="270" fill="#f87171" font-family="monospace" font-size="12" font-weight="bold">DEDUCTION: IMPACT APPLIED FROM INSIDE STUDY!</text>

      <!-- Footer -->
      <rect x="40" y="360" width="820" height="105" rx="6" fill="#0f172a" stroke="#334155"/>
      <text x="60" y="390" fill="#cbd5e1" font-family="monospace" font-size="12">CASE FINDING: Suspect claim of outdoor garden intruder smashing glass is refuted by physics.</text>
      <text x="60" y="415" fill="#38bdf8" font-family="monospace" font-size="12">CONE FRACTURES: Apex of cone points toward the room interior, proving an inside staging job.</text>
      <text x="60" y="440" fill="#fbbf24" font-family="monospace" font-size="12">STATUS: FAKED BREAK-IN BY INTERNAL RESIDENT.</text>
    </svg>`,

    'poster-tea-toxicology.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="100%" height="100%">
      <rect width="900" height="500" fill="#0f172a"/>
      <rect x="40" y="30" width="820" height="45" rx="6" fill="#1e293b" stroke="#475569"/>
      <text x="60" y="58" fill="#f43f5e" font-family="monospace" font-size="16" font-weight="bold">TOXICOLOGY LAB REPORT // SPECTROPHOTOMETRY ABSORBANCE CHART</text>

      <!-- Graph container -->
      <rect x="60" y="100" width="780" height="240" rx="8" fill="#020617" stroke="#334155"/>
      <line x1="120" y1="120" x2="120" y2="300" stroke="#64748b" stroke-width="2"/>
      <line x1="120" y1="300" x2="800" y2="300" stroke="#64748b" stroke-width="2"/>

      <text x="70" y="200" fill="#94a3b8" font-family="monospace" font-size="11" transform="rotate(-90 70,200)">ABSORBANCE (OD)</text>
      <text x="420" y="325" fill="#94a3b8" font-family="monospace" font-size="12">WAVELENGTH (NANOMETERS)</text>

      <!-- Wavelength markings -->
      <text x="200" y="318" fill="#64748b" font-family="monospace" font-size="10">320 nm</text>
      <text x="360" y="318" fill="#64748b" font-family="monospace" font-size="10">450 nm</text>
      <text x="520" y="318" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">546 nm (PEAK)</text>
      <text x="680" y="318" fill="#64748b" font-family="monospace" font-size="10">680 nm</text>

      <!-- Curve -->
      <path d="M 140 290 Q 300 280 420 230 T 520 140 T 620 260 T 780 295" fill="none" stroke="#38bdf8" stroke-width="4"/>
      
      <!-- Peak indicator dot & label -->
      <circle cx="520" cy="140" r="8" fill="#f43f5e" stroke="#ffffff" stroke-width="2"/>
      <line x1="520" y1="140" x2="520" y2="300" stroke="#f43f5e" stroke-dasharray="4,4"/>
      
      <!-- Callout badge -->
      <rect x="540" y="125" width="280" height="75" rx="6" fill="#881337" stroke="#fb7185" stroke-width="1.5"/>
      <text x="555" y="150" fill="#fecdd3" font-family="monospace" font-size="13" font-weight="bold">SAMPLE #TEA-447 PEAK: 546nm</text>
      <text x="555" y="172" fill="#ffffff" font-family="monospace" font-size="12">EXACT MATCH: ATROPINE DERIVATIVE</text>
      <text x="555" y="190" fill="#fed7aa" font-family="monospace" font-size="11">PARALYTIC BELLADONNA ALKALOID</text>

      <!-- Comparison Reference Card -->
      <rect x="40" y="360" width="820" height="105" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="60" y="390" fill="#cbd5e1" font-family="monospace" font-size="12">REFERENCE STANDARDS: Arsenic (320nm) | Potassium Cyanide (210nm) | Atropine/Belladonna (546nm)</text>
      <text x="60" y="415" fill="#4ade80" font-family="monospace" font-size="12">PHYSIOLOGICAL EFFECT: Rapid muscular paralysis within 8 minutes; leaves subject conscious but unable to move.</text>
      <text x="60" y="440" fill="#facc15" font-family="monospace" font-size="12">MATCH CONFIDENCE: 99.8% match against deadly nightshade formulation.</text>
    </svg>`,

    'poster-chime-clock.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="100%" height="100%">
      <rect width="900" height="500" fill="#0b0f19"/>
      <rect x="40" y="30" width="820" height="45" rx="6" fill="#1f2937" stroke="#374151"/>
      <text x="60" y="58" fill="#eab308" font-family="monospace" font-size="16" font-weight="bold">HOROLOGY FORENSICS // GRANDFATHER CLOCK MECHANICAL JAM</text>

      <!-- Left clock face -->
      <circle cx="220" cy="220" r="100" fill="#1e293b" stroke="#ca8a04" stroke-width="4"/>
      <!-- Hour marks -->
      <text x="212" y="145" fill="#fde047" font-family="serif" font-size="18">XII</text>
      <text x="295" y="226" fill="#fde047" font-family="serif" font-size="18">III</text>
      <text x="214" y="305" fill="#fde047" font-family="serif" font-size="18">VI</text>
      <text x="135" y="226" fill="#fde047" font-family="serif" font-size="18">IX</text>
      <!-- Hands showing 10:42 PM -->
      <!-- Hour hand pointing around 10 -->
      <line x1="220" y1="220" x2="160" y2="170" stroke="#fef08a" stroke-width="5" stroke-linecap="round"/>
      <!-- Minute hand pointing at 42 mins (between 8 and 9) -->
      <line x1="220" y1="220" x2="140" y2="250" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
      <circle cx="220" cy="220" r="6" fill="#ca8a04"/>

      <!-- Right analysis board -->
      <rect x="360" y="100" width="480" height="240" rx="8" fill="#030712" stroke="#1f2937"/>
      <text x="385" y="135" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold">CHRONOMETER DISCREPANCY TIMELINE</text>
      
      <rect x="385" y="150" width="430" height="50" rx="4" fill="#1e1b4b" stroke="#6366f1"/>
      <text x="400" y="172" fill="#c7d2fe" font-family="monospace" font-size="12">BUTLER'S TESTIMONY:</text>
      <text x="400" y="190" fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold">"Heard 11:00 PM Chime while serving mail"</text>

      <rect x="385" y="215" width="430" height="70" rx="4" fill="#450a0a" stroke="#ef4444"/>
      <text x="400" y="238" fill="#fca5a5" font-family="monospace" font-size="12">PHYSICAL GEAR JAM TIMESTAMP:</text>
      <text x="400" y="258" fill="#ffffff" font-family="monospace" font-size="15" font-weight="bold">JAMMED AT EXACTLY 10:42 PM</text>
      <text x="400" y="276" fill="#fde047" font-family="monospace" font-size="11">DISCREPANCY: 11:00 PM - 10:42 PM = 18 MINUTES OFF</text>

      <!-- Footer terminal -->
      <rect x="40" y="360" width="820" height="105" rx="6" fill="#111827" stroke="#374151"/>
      <text x="60" y="390" fill="#94a3b8" font-family="monospace" font-size="12">EXAMINATION: The clock pendulum wire was wedged by a steel paperclip at 10:42 PM.</text>
      <text x="60" y="415" fill="#38bdf8" font-family="monospace" font-size="12">It could not possibly have chimed at 11:00 PM. The butler\'s testimony is completely fabricated.</text>
      <text x="60" y="440" fill="#eab308" font-family="monospace" font-size="12">ENTER NUMBER OF DISCREPANCY MINUTES INTO TERMINAL.</text>
    </svg>`,

    'poster-vault-lasers.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="100%" height="100%">
      <rect width="900" height="500" fill="#030712"/>
      <rect x="40" y="30" width="820" height="45" rx="6" fill="#0f172a" stroke="#1e293b"/>
      <text x="60" y="58" fill="#10b981" font-family="monospace" font-size="16" font-weight="bold">SUBTERRANEAN BIOMETRIC VAULT // OPTICAL LASER TRIPWIRE MATRIX</text>

      <!-- Laser Grid Schematics -->
      <rect x="60" y="95" width="420" height="250" rx="8" fill="#020617" stroke="#1e293b"/>
      
      <!-- Red lasers -->
      <line x1="80" y1="130" x2="460" y2="130" stroke="#ef4444" stroke-width="2"/>
      <line x1="80" y1="210" x2="460" y2="210" stroke="#ef4444" stroke-width="2"/>
      <!-- Green lasers -->
      <line x1="80" y1="170" x2="460" y2="170" stroke="#22c55e" stroke-width="3"/>
      <line x1="80" y1="270" x2="460" y2="270" stroke="#22c55e" stroke-width="3"/>
      <!-- Blue lasers -->
      <line x1="160" y1="105" x2="160" y2="330" stroke="#3b82f6" stroke-width="2"/>
      <line x1="360" y1="105" x2="360" y2="330" stroke="#3b82f6" stroke-width="2"/>

      <!-- Target Node Delta-9 highlight -->
      <circle cx="260" cy="170" r="14" fill="#052e16" stroke="#22c55e" stroke-width="3"/>
      <text x="245" y="175" fill="#4ade80" font-family="monospace" font-size="11" font-weight="bold">Δ-9</text>

      <!-- Right control panel -->
      <rect x="500" y="95" width="340" height="250" rx="8" fill="#091427" stroke="#1e3a8a"/>
      <text x="520" y="125" fill="#60a5fa" font-family="monospace" font-size="13" font-weight="bold">NODE PARITY DIRECTORY</text>
      
      <rect x="520" y="140" width="300" height="40" rx="4" fill="#1e293b"/>
      <text x="535" y="165" fill="#94a3b8" font-family="monospace" font-size="11">NODE ALPHA: HIGH VOLTAGE GRID (DO NOT GROUND)</text>

      <!-- Delta 9 highlight box -->
      <rect x="520" y="190" width="300" height="75" rx="4" fill="#064e3b" stroke="#22c55e" stroke-width="2"/>
      <text x="535" y="215" fill="#86efac" font-family="monospace" font-size="12" font-weight="bold">GROUND NODE DELTA-9 (532nm)</text>
      <text x="535" y="235" fill="#ffffff" font-family="monospace" font-size="11">TARGET LOOP: GREEN PHOTODIODE</text>
      <text x="535" y="255" fill="#fde047" font-family="monospace" font-size="10">BYPASS DURATION: 15 SEC WINDOW</text>

      <rect x="520" y="275" width="300" height="40" rx="4" fill="#1e293b"/>
      <text x="535" y="300" fill="#94a3b8" font-family="monospace" font-size="11">NODE OMEGA: AUDIBLE KLAXON SIREN</text>

      <!-- Footer terminal -->
      <rect x="40" y="365" width="820" height="100" rx="6" fill="#020617" stroke="#1e293b"/>
      <text x="60" y="395" fill="#4ade80" font-family="monospace" font-size="12">PROTOCOL: Grounding Node Delta-9 opens a dark corridor for Vault Sector 4.</text>
      <text x="60" y="420" fill="#94a3b8" font-family="monospace" font-size="12">WARNING: Any error triggers silent lockdown and fills chamber with Halon gas.</text>
    </svg>`,

    'poster-thermal-dock.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="100%" height="100%">
      <rect width="900" height="500" fill="#070a14"/>
      <rect x="40" y="30" width="820" height="45" rx="6" fill="#1e1b4b" stroke="#4338ca"/>
      <text x="60" y="58" fill="#c084fc" font-family="monospace" font-size="16" font-weight="bold">SATELLITE THERMAL SURVEILLANCE // HARBOR DOCK INFRARED SWEEP</text>

      <!-- Infrared dock imagery -->
      <rect x="60" y="95" width="760" height="250" rx="8" fill="#020617" stroke="#1f2937"/>
      
      <!-- Water cold zone (Deep blue/purple) -->
      <rect x="80" y="115" width="720" height="210" fill="#172554"/>
      <text x="100" y="140" fill="#60a5fa" font-family="monospace" font-size="12">SEAWATER (14°C AMBIENT)</text>

      <!-- Boat A: Cold Sea Nymph -->
      <rect x="120" y="170" width="150" height="60" rx="15" fill="#1e3a8a" stroke="#3b82f6"/>
      <text x="135" y="195" fill="#93c5fd" font-family="monospace" font-size="11">VESSEL A</text>
      <text x="135" y="215" fill="#cbd5e1" font-family="monospace" font-size="10">TEMP: 14.2°C (COLD)</text>

      <!-- Boat B: Phantom Hydrofoil (HOT! YELLOW/RED) -->
      <rect x="340" y="160" width="200" height="80" rx="20" fill="#7f1d1d" stroke="#ef4444" stroke-width="2"/>
      <ellipse cx="500" cy="200" rx="35" ry="25" fill="#eab308"/>
      <circle cx="510" cy="200" r="15" fill="#ffffff"/>
      <text x="355" y="190" fill="#ffffff" font-family="monospace" font-size="12" font-weight="bold">VESSEL B: PHANTOM</text>
      <text x="355" y="210" fill="#facc15" font-family="monospace" font-size="11">HOT EXHAUST: 88.6°C</text>
      <text x="355" y="228" fill="#fca5a5" font-family="monospace" font-size="10">TURBINES RUNNING</text>

      <!-- Boat C: Trawler 4 (Cold) -->
      <rect x="600" y="170" width="160" height="60" rx="15" fill="#1e3a8a" stroke="#3b82f6"/>
      <text x="615" y="195" fill="#93c5fd" font-family="monospace" font-size="11">VESSEL C: TRAWLER</text>
      <text x="615" y="215" fill="#cbd5e1" font-family="monospace" font-size="10">TEMP: 15.0°C (COLD)</text>

      <!-- Thermal Gradient Legend -->
      <rect x="120" y="280" width="640" height="25" rx="4" fill="#0f172a" stroke="#334155"/>
      <text x="135" y="297" fill="#60a5fa" font-family="monospace" font-size="10">0°C (COLD BLUE)</text>
      <text x="400" y="297" fill="#22c55e" font-family="monospace" font-size="10">40°C (WARM)</text>
      <text x="640" y="297" fill="#facc15" font-family="monospace" font-size="10">88°C+ (HOT RED/WHITE)</text>

      <!-- Footer terminal -->
      <rect x="40" y="365" width="820" height="100" rx="6" fill="#0f172a" stroke="#1e293b"/>
      <text x="60" y="395" fill="#f43f5e" font-family="monospace" font-size="12">INTEL REPORT: Vessel B (Phantom Hydrofoil) has active twin-diesel turbine spool-up signatures.</text>
      <text x="60" y="420" fill="#38bdf8" font-family="monospace" font-size="12">The syndicate getaway team is onboard and preparing for maritime extraction.</text>
    </svg>`,

    'poster-cipher-wheel.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="100%" height="100%">
      <rect width="900" height="500" fill="#0b0f19"/>
      <rect x="40" y="30" width="820" height="45" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="60" y="58" fill="#f59e0b" font-family="monospace" font-size="16" font-weight="bold">CRYPTOGRAPHIC CIPHER WHEEL // CAESAR SHIFT +3 WHEEL</text>

      <!-- Cipher wheel graphic -->
      <circle cx="230" cy="220" r="110" fill="#1e293b" stroke="#d97706" stroke-width="4"/>
      <circle cx="230" cy="220" r="75" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
      
      <!-- Wheel sample letters -->
      <text x="222" y="130" fill="#fbbf24" font-family="monospace" font-size="16" font-weight="bold">A</text>
      <text x="310" y="225" fill="#fbbf24" font-family="monospace" font-size="16" font-weight="bold">G</text>
      <text x="222" y="315" fill="#fbbf24" font-family="monospace" font-size="16" font-weight="bold">N</text>
      <text x="140" y="225" fill="#fbbf24" font-family="monospace" font-size="16" font-weight="bold">T</text>
      <!-- Inner shifted wheel -->
      <text x="222" y="165" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold">D</text>
      <text x="280" y="225" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold">J</text>
      <text x="222" y="280" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold">Q</text>
      <text x="170" y="225" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold">W</text>
      <circle cx="230" cy="220" r="6" fill="#f59e0b"/>

      <!-- Right intercepted message card -->
      <rect x="380" y="100" width="460" height="240" rx="8" fill="#020617" stroke="#1e293b"/>
      <text x="405" y="135" fill="#ef4444" font-family="monospace" font-size="14" font-weight="bold">INTERCEPTED TELEGRAM BURST</text>
      
      <rect x="405" y="150" width="410" height="60" rx="6" fill="#311015" stroke="#f43f5e"/>
      <text x="420" y="175" fill="#fca5a5" font-family="monospace" font-size="12">ENCRYPTED CODENAME:</text>
      <text x="420" y="198" fill="#facc15" font-family="monospace" font-size="18" font-weight="bold">"V K D G R Z"</text>

      <!-- Decryption hint box -->
      <rect x="405" y="225" width="410" height="95" rx="6" fill="#042f2e" stroke="#0d9488"/>
      <text x="420" y="250" fill="#5eead4" font-family="monospace" font-size="12" font-weight="bold">ROTATION RULE: CAESAR -3 (REVERSE SHIFT)</text>
      <text x="420" y="275" fill="#ffffff" font-family="monospace" font-size="12">V -> S | K -> H | D -> A | G -> D | R -> O | Z -> W</text>
      <text x="420" y="300" fill="#cbd5e1" font-family="monospace" font-size="11">DEDUCTION: Decode the six-letter operative name and input below.</text>

      <!-- Footer terminal -->
      <rect x="40" y="365" width="820" height="100" rx="6" fill="#0f172a" stroke="#334155"/>
      <text x="60" y="395" fill="#38bdf8" font-family="monospace" font-size="12">OPERATIVE INTEL: The mole holds high security clearance inside the ministry.</text>
      <text x="60" y="420" fill="#facc15" font-family="monospace" font-size="12">Enter their unmasked plaintext alias to alert federal task force.</text>
    </svg>`
  };

  for (const [filename, content] of Object.entries(posters)) {
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, content.trim(), 'utf8');
  }
}
