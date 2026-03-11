//═══════════════════════════════════════════════════════════════════
//  🦅  FALCON ARCADE DEFENSE  |  CrowdStrike 2026
//  Protect. Detect. Respond. — We Stop Breaches.
// ═══════════════════════════════════════════════════════════════════

"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx    = canvas.getContext("2d", { alpha: false });
canvas.width  = 800;
canvas.height = 600;
canvas.style.width  = canvas.width  + "px";
canvas.style.height = canvas.height + "px";

// ─── PALETTE ─────────────────────────────────────────────────────
const CS = Object.freeze({
  RED:"#E0003C", ORANGE:"#FF6A00", RED_GLOW:"#FF1744",
  CYAN:"#00E5FF", BLUE:"#0066FF", GREEN:"#39FF14",
  YELLOW:"#FFE600", WHITE:"#FFFFFF", GREY:"#A0A8B8",
  LTGREY:"#D0D8E8", BG:"#04010C", TEAL:"#00FFD0",
  PURPLE:"#AA00FF", PINK:"#FF00CC", GOLD:"#FFD700",
});

// ─── GAME STATES ─────────────────────────────────────────────────
const STATE = Object.freeze({
  TITLE:"TITLE", MODULE_CHOICE:"MODULE_CHOICE",
  WAVE_BANNER:"WAVE_BANNER", PLAYING:"PLAYING",
  BOSS_WARNING:"BOSS_WARNING", BOSS:"BOSS",
  OVERWATCH_SEQ:"OVERWATCH_SEQ", FALCON_COMPLETE:"FALCON_COMPLETE",
  INCIDENT_REPORT:"INCIDENT_REPORT", GAME_OVER:"GAME_OVER", YOU_WIN:"YOU_WIN",
});

// ─── MODULES ─────────────────────────────────────────────────────
const MODULES = Object.freeze({
  PREVENT:{id:"PREVENT",name:"Falcon Prevent",shortName:"PREVENT",
    tagline:"Next-Gen AV & EPP",
    desc:"AI-powered endpoint protection stops ransomware and zero-days before execution.",
    mechanic:"Triple shot + reflects first malware bullet per wave.",
    emoji:"🛡️",color:CS.CYAN,duration:12},
  INSIGHT:{id:"INSIGHT",name:"Falcon Insight XDR",shortName:"INSIGHT XDR",
    tagline:"Extended Detection & Response",
    desc:"Full attack surface visibility. Correlates every signal into one attack story.",
    mechanic:"Reveals hidden enemies. Correlated kills give 2x combo multiplier.",
    emoji:"🔍",color:CS.BLUE,duration:10},
  IDENTITY:{id:"IDENTITY",name:"Falcon Identity",shortName:"IDENTITY",
    tagline:"Identity Threat Detection",
    desc:"Detects credential abuse and MFA bypass the moment they occur.",
    mechanic:"Blocks one hit. Exposes impostor enemies. Disables fake signals.",
    emoji:"🪪",color:CS.YELLOW,duration:9},
  CLOUD:{id:"CLOUD",name:"Falcon Cloud Security",shortName:"CLOUD SEC",
    tagline:"Cloud-Native Protection",
    desc:"CNAPP securing every workload, container and cloud service.",
    mechanic:"Opens cloud lane. Eliminates cloud-pivot enemies. 20s assisted containment.",
    emoji:"☁️",color:CS.ORANGE,duration:20},
  FEM:{id:"FEM",name:"Falcon Exposure Mgmt",shortName:"EXPOSURE",
    tagline:"Attack Surface Management",
    desc:"Discovers exposed assets before adversaries exploit them.",
    mechanic:"Reveals hidden nodes. Slows enemies 40%. Marks weak points.",
    emoji:"🗺️",color:CS.TEAL,duration:8},
  CHARLOTTE:{id:"CHARLOTTE",name:"Charlotte AI",shortName:"CHARLOTTE",
    tagline:"Generative AI Security",
    desc:"AI co-pilot that neutralises the five highest-value threats autonomously.",
    mechanic:"Auto-targets 5 priority threats. Enhanced aim for 15s after.",
    emoji:"🤖",color:CS.GREEN,duration:15},
  PANGEA:{id:"PANGEA",name:"Falcon Pangea",shortName:"PANGEA",
    tagline:"Global Threat Intelligence",
    desc:"Planet-scale intelligence. Blocks adversary infrastructure globally.",
    mechanic:"Freezes all enemies 7s. Marks priority targets. Clears active bullets.",
    emoji:"🌍",color:CS.TEAL,duration:7},
  OVERWATCH:{id:"OVERWATCH",name:"Falcon OverWatch",shortName:"OVERWATCH",
    tagline:"Managed Threat Hunting 24/7",
    desc:"Elite hunters tracking adversaries around the clock.",
    mechanic:"Hunts 3 elite targets. Predicts next attack path. Paints hunt markers.",
    emoji:"👁️",color:CS.ORANGE,duration:0},
  COMPLETE:{id:"COMPLETE",name:"Falcon Complete MDR",shortName:"COMPLETE",
    tagline:"Managed Detection & Response",
    desc:"Your fully-managed security team. Analysts respond in minutes.",
    mechanic:"30s assisted containment. SOC analysts neutralise threats progressively.",
    emoji:"🦅",color:CS.RED,duration:30},
});

const MODULE_POOL = Object.values(MODULES);

// ─── NUCLEAR MODULES (excluded from early wave drops / choice) ────
// These modules wipe enemies instantly and must not appear in waves 0–1
const NUCLEAR_MODULE_IDS = new Set(["OVERWATCH","COMPLETE","CLOUD","CHARLOTTE"]);

// ─── KONAMI CODE ─────────────────────────────────────────────────
const KONAMI_SEQ = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"
];


// ─── SOC COMMS ───────────────────────────────────────────────────
const SOC_COMMS = {
  fancy_bear:[
    "Helpdesk reset issued — CFO account flagged.",
    "Credential spray detected across identity systems.",
    "Impossible travel flag: Moscow → NYC in 4 minutes.",
    "Lateral movement detected in finance subnet.",
    "Living-off-the-land: PowerShell abuse confirmed.",
    "OverWatch: FANCY BEAR TTP pattern confirmed.",
    "MFA prompt fatigue attack in progress — user bombarded.",
    "Kerberoasting attempt against service accounts detected.",
    "Pass-the-hash attack: domain controller traffic anomaly.",
    "Weaponised Word document opened — macro blocked by Prevent.",
    "Spear-phish link clicked — sandbox detonation in progress.",
    "FANCY BEAR C2 beacon: encrypted traffic to known GRU infra.",
  ],
  ai_syndicate:[
    "LLM-generated phishing — zero grammar errors, zero signatures.",
    "Deepfake audio call detected — executive impersonation attempt.",
    "Novel malware variant discovered. No TTPs match anywhere.",
    "AI attack velocity now exceeding analyst triage capacity.",
    "Charlotte AI: autonomous prioritisation engaged.",
    "Machine-speed threat detected — machine-speed response required.",
    "Polymorphic payload: binary changes on every execution.",
    "Synthetic identity created using stolen PII and AI generation.",
    "AI-assisted reconnaissance: 40,000 exposed ports mapped in 8s.",
    "Prompt injection attack on internal LLM detected.",
    "Deepfake video call to CFO in progress — verify out-of-band.",
    "AI-generated OSINT package on CEO distributed on dark forum.",
  ],
  carbon_spider:[
    "Staging phase detected: credential harvest under way.",
    "Shadow copies deleted — ransomware pre-positioning confirmed.",
    "Fileless payload running in memory. Zero disk writes.",
    "Encryption staging confirmed. You have seconds to contain.",
    "Backup systems targeted. Isolate now before wiper triggers.",
    "OverWatch: pre-ransomware indicators confirmed on POS network.",
    "LOLBin abuse: wmic.exe used for lateral movement.",
    "CARBON SPIDER affiliate broker sold initial access 48h ago.",
    "Domain admin credentials harvested via Mimikatz in memory.",
    "RDP brute-force succeeded on an unpatched retail endpoint.",
    "Cobalt Strike beacon active — C2 channel established.",
    "VSS deletion imminent. Prevent must act before encryption starts.",
  ],
  cozy_bear:[
    "OAuth consent spike detected — cloud pivot likely.",
    "Service account abuse confirmed in cloud tenant.",
    "Endpoint went dark — adversary reappeared in cloud lane.",
    "Token theft confirmed. No password required for cloud access.",
    "Cloud workload compromised — runtime threat active.",
    "Dwell time estimate: 47 days if this goes undetected.",
    "Azure AD Global Admin role silently assigned to rogue account.",
    "Cloud storage enumeration: 3TB of sensitive data identified.",
    "COZY BEAR using trusted SaaS app as C2 exfiltration channel.",
    "SAML token forged — identity provider trust abused.",
    "OAuth app granted Mail.Read permissions without user notice.",
    "API key rotated by attacker — locking out legitimate team.",
  ],
  scattered_spider:[
    "Vishing call active right now. Helpdesk is being targeted.",
    "MFA reset requested by unknown caller claiming to be IT.",
    "Impostor authenticated with valid, socially-engineered credentials.",
    "Social engineering confirmed: attacker has employee badge number.",
    "Fake trusted signal detected — IDENTITY protection required.",
    "SCATTERED SPIDER: no malware deployed. This is a people problem.",
    "Employee tricked into installing remote admin tool as 'IT support'.",
    "Attacker now has persistent VPN access via socially-reset account.",
    "SIM-swapping attempt detected against executive mobile number.",
    "Phishing portal spoofing the company SSO login — 14 submissions.",
    "Internal Slack account compromised — spreading phish internally.",
    "Attacker pivoted to cloud after bypassing identity — now in Azure.",
  ],
  volt_typhoon:[
    "Stealth movement detected near OT boundary",
    "Living-off-the-land confirmed — no custom tooling, just built-ins.",
    "Pre-positioning detected adjacent to critical infrastructure.",
    "Hidden node activated — power grid adjacent system compromised.",
    "Dwell time estimate: 300 days. Patient, deliberate adversary.",
    "Exposure Management: unknown legacy asset found — unpatched since 2019.",
    "LSASS memory access using Task Manager — not a threat tool.",
    "Scheduled task created using schtasks.exe for persistence.",
    "VOLT TYPHOON using Fortinet FIPS device as relay node.",
    "OT historian server queried — SCADA data exfiltrated over DNS.",
    "Netsh port forwarding rules added — covert tunnel established.",
    "PowerShell constrained mode bypassed via LOLBin proxy execution.",
  ],
  midnight_blizzard_boss:[
    "Supply chain alert: vendor update package shows code anomaly.",
    "Password spray: one attempt per account — no lockout triggered.",
    "MFA token stolen from developer workstation — no brute force used.",
    "NOBELIUM TTP confirmed via OverWatch global threat intelligence.",
    "Trusted vendor update pushed to 18,000 downstream customers.",
    "Falcon Complete: NOBELIUM-specific response playbook engaged.",
    "OAuth application added silently — persistent access backdoor.",
    "MIDNIGHT BLIZZARD reading emails of senior security leadership.",
    "Compromise started 6 months ago via a test environment — unnoticed.",
    "Digital certificate stolen from code signing infrastructure.",
    "NOBELIUM actor installed custom malware inside security vendor tools.",
    "Downstream customer count infected via SolarWinds-style mechanism: 1,847.",
  ],
  sandworm:[
    "Wiper malware staging confirmed — destructive intent verified.",
    "OT systems targeted — physical damage risk is real.",
    "MBR destruction sequence initiated — drive overwrite imminent.",
    "Industrial control systems at risk. Physical isolation required now.",
    "NotPetya-class payload staged on domain controller.",
    "Prevent: behavioural AI triggered on mass file overwrite pattern.",
    "Scheduled task created to trigger wiper at 02:00 local time.",
    "SANDWORM accessed HMI terminals — operational disruption possible.",
    "Power substation SCADA commands queued — NOT a test.",
    "Wiper has renamed system binaries — rollback is impossible.",
    "Lateral movement through IT-OT bridge confirmed — 14 PLCs at risk.",
    "Data destruction rate: 40,000 endpoints in under 60 minutes.",
  ],
  blackcat_boss:[
    "BLACKCAT affiliate active — Rust-based payload confirmed.",
    "ESXi enumeration in progress — all 94 VMs at risk of encryption.",
    "Triple extortion confirmed: encrypt, publish, DDoS all engaged.",
    "Alert volume critical: 847 alerts in 4 minutes — triage required.",
    "Backup deletion confirmed — no recovery path without MDR.",
    "Multi-lane encryption: simultaneous Windows, Linux and ESXi strike.",
    "Affiliate purchased initial access from broker 3 weeks ago.",
    "BLACKCAT using Intermittent Encryption — faster, harder to detect.",
    "Exfiltration complete: 2.1TB sent to adversary infrastructure.",
    "Ransom demand: $4.5M — timer showing 72 hours to payment.",
    "BLACKCAT leak site updated — company name now listed publicly.",
    "Charlotte AI autonomous response: 5 highest-velocity threats queued.",
  ],
  lazarus_final:[
    "Crypto treasury targeted — North Korean RGB Bureau 121 confirmed.",
    "Custom implant deployed — never seen before in any threat library.",
    "Multi-phase operation active: theft, then stealth, then destruction.",
    "Dwell time estimate: 14 months if LAZARUS is not fully evicted.",
    "LAZARUS: simultaneous espionage, financial theft, and destruction.",
    "Full Falcon platform required — no single module stops this actor.",
    "Cryptocurrency mixing infrastructure identified by Pangea telemetry.",
    "LAZARUS pivot: after crypto theft, now targeting executive email.",
    "Custom RAT installed on CFO workstation — keylogging confirmed.",
    "SWIFT messaging system access detected — wire transfer risk.",
    "Destructive wiper staged as contingency — eviction window closing.",
    "OverWatch: LAZARUS persistence mechanisms found on 4 systems.",
  ],
};

// ─── LEGACY TOOLS ────────────────────────────────────────────────
const LEGACY_TOOLS = [
  {name:"FIREWALL", shortMsg:"PERIMETER BREACHED", color:"#00AAFF",
   failMsg:"Firewalls block ports — not identity abuse or encrypted C2."},
  {name:"WAF", shortMsg:"APP LAYER BYPASSED", color:"#AA00FF",
   failMsg:"WAFs stop known web exploits — not zero-days or supply chain."},
  {name:"SASE", shortMsg:"EDGE COMPROMISED", color:"#00FFD0",
   failMsg:"SASE secures the edge — not lateral movement inside the perimeter."},
  {name:"IPS", shortMsg:"SIGNATURE EVADED", color:"#FF6A00",
   failMsg:"IPS catches known signatures — not fileless or LOTL attacks."},
  {name:"ANTIVIRUS", shortMsg:"PAYLOAD UNKNOWN", color:"#FFE600",
   failMsg:"Legacy AV needs signatures — AI-generated malware has none."},
  {name:"IAM", shortMsg:"CREDENTIAL STOLEN", color:"#FF1744",
   failMsg:"IAM manages access — it cannot detect stolen valid credentials."},
];

// ─── PHASES ──────────────────────────────────────────────────────
const PHASES = [
  {
    id:"fancy_bear",waveNum:1,isBoss:false,color:CS.ORANGE,
    name:"FANCY BEAR",shortName:"FANCY BEAR",
    aka:"APT28 / Sofacy / Forest Blizzard",
    nation:"🇷🇺 Russia — GRU",shortNation:"🇷🇺 Russia — GRU",
    threat:"CRITICAL",vector:"Credential Theft & Spear-Phishing",
    environment:"HELPDESK / IDENTITY SYSTEMS",
    environmentDesc:"Employee credentials and identity infrastructure are the target.",
    objective:"Stop credential theft before lateral movement begins.",
    threatCard:"FANCY BEAR is harvesting credentials via spear-phishing. They will authenticate as your employees and mirror your defences. Stop them before they reach finance systems.",
    desc:"Russian GRU military intelligence. Targets governments and defence contractors using stolen credentials and weaponised documents.",
    attackDesc:"FANCY BEAR harvests credentials via spear-phishing, then authenticates as legitimate users — making them nearly invisible to traditional tools.",
    falconFix:"Falcon Identity establishes behavioural baselines for every account. Impossible travel and atypical access patterns trigger immediate alerts.",
    keyModules:["IDENTITY","INSIGHT","OVERWATCH","PREVENT"],
    moduleNarrative:{
      IDENTITY:"Detects stolen credentials the moment they're used — even if the password is correct.",
      INSIGHT:"Correlates login anomalies with endpoint signals to expose the full attack chain.",
      OVERWATCH:"Elite hunters find the lateral movement FANCY BEAR performs after initial access.",
      PREVENT:"Blocks weaponised documents and first-stage malware droppers before execution.",
    },
    behavior:{
      credentialGhosts:true,trackPlayer:0.3,fakeDrops:false,
      impostorEnemies:false,stealth:false,stagingPhase:false,
      cloudLane:false,cloudVanish:false,corruption:false,wiperMode:false,
      hiddenNodes:false,slowStealth:false,supplyChain:false,
      corruptedAsset:false,multiPhase:false,multiLane:false,
      alertFlood:false,esxiRow:false,adaptivePatterns:false,encryptionRush:false,
    },
    drops:{IDENTITY:0.38,INSIGHT:0.28,PREVENT:0.24,FEM:0.10},
    deathMessages:{
      IDENTITY:{
        headline:"NO IDENTITY PROTECTION — CREDENTIAL ATTACK SUCCEEDED",
        body:"This environment was not running Falcon Identity Protection. FANCY BEAR authenticated freely using stolen credentials — no behavioural baseline existed to flag the impossible travel or atypical login patterns.",
        cta:"Falcon Identity: behavioural baselines that make stolen credentials detectable. crowdstrike.com/falcon-identity",
      },
    },
    incidentReport:{
      title:"IDENTITY INTRUSION ATTEMPT",
      stopped:"Credential theft campaign disrupted before lateral movement.",
      keyLesson:"Valid credentials are not proof of legitimate access — behaviour is.",
      moduleHighlight:"IDENTITY",
    },
  },
  {
    id:"ai_syndicate",waveNum:2,isBoss:false,color:CS.GREEN,
    name:"AI SYNDICATE",shortName:"AI SYNDICATE",
    aka:"AI-Augmented eCrime / Gen-AI Threat Actors",
    nation:"🌐 Global AI eCrime",shortNation:"🌐 AI eCrime",
    threat:"CRITICAL",vector:"AI Phishing · Deepfakes · LLM Malware",
    environment:"AI PIPELINE / FINANCE WORKFLOW",
    environmentDesc:"Finance systems and AI infrastructure are under AI-augmented attack.",
    objective:"Counter machine-speed attacks with machine-speed defence.",
    threatCard:"AI SYNDICATE is deploying LLM-generated malware at machine speed. Some power-ups in this wave are deepfake traps. Trust nothing — use Charlotte AI or Identity to verify.",
    desc:"A new class of threat actor weaponising generative AI at unprecedented scale.",
    attackDesc:"LLM-generated phishing campaigns. Deepfake audio authorises fraudulent transfers. AI-generated malware variants evade signature detection automatically.",
    falconFix:"Charlotte AI fights AI with AI — autonomous threat analysis at machine speed.",
    keyModules:["CHARLOTTE","PREVENT","IDENTITY","OVERWATCH"],
    moduleNarrative:{
      CHARLOTTE:"Counters AI-generated attacks with AI-powered autonomous detection — speed vs speed.",
      PREVENT:"Behavioural AI blocks LLM-crafted malware variants that signature tools have never seen.",
      IDENTITY:"Flags deepfake impersonation attempts and exposes fake module signals.",
      OVERWATCH:"Human hunters recognise AI attack patterns that automated tools misclassify.",
    },
    behavior:{
      credentialGhosts:false,trackPlayer:0.2,fakeDrops:true,
      impostorEnemies:false,adaptivePatterns:true,stealth:false,
      stagingPhase:false,cloudLane:false,cloudVanish:false,corruption:false,
      wiperMode:false,hiddenNodes:false,slowStealth:false,supplyChain:false,
      corruptedAsset:false,multiPhase:false,multiLane:false,
      alertFlood:false,esxiRow:false,encryptionRush:false,
    },
    drops:{PREVENT:0.30,IDENTITY:0.28,INSIGHT:0.22,FEM:0.12,PANGEA:0.08},
    deathMessages:{
      CHARLOTTE:{
        headline:"NO AI DEFENCE — AI ATTACK OPERATED UNOPPOSED",
        body:"AI SYNDICATE deployed LLM-generated malware faster than any human analyst could respond. Without Charlotte AI countering at machine speed, each new variant was a fresh unknown threat.",
        cta:"Charlotte AI: fight AI attacks with AI defence. crowdstrike.com/charlotte-ai",
      },
    },
    incidentReport:{
      title:"AI-AUGMENTED ATTACK CAMPAIGN",
      stopped:"LLM-generated malware campaign neutralised before finance system access.",
      keyLesson:"AI-generated threats require AI-native defence — signatures are obsolete.",
      moduleHighlight:"CHARLOTTE",
    },
  },
  {
    id:"carbon_spider",waveNum:3,isBoss:true,color:CS.RED,
    name:"CARBON SPIDER",shortName:"CARBON SPIDER",
    aka:"FIN7 / Sangria Tempest",
    nation:"🌐 eCrime Syndicate",shortNation:"🌐 eCrime",
    threat:"HIGH",vector:"Ransomware-as-a-Service · POS Malware",
    environment:"RETAIL ENDPOINTS / POS NETWORK",
    environmentDesc:"Point-of-sale systems and retail endpoints are being staged for ransomware.",
    objective:"Stop the staging phase before encryption begins. Every second counts.",
    threatCard:"CARBON SPIDER is staging ransomware across your retail network. Enemies are slow now — staging. Once staging completes they double speed. Stop them early.",
    desc:"Prolific eCrime group deploying ransomware across retail and hospitality.",
    attackDesc:"CARBON SPIDER stages ransomware in memory using living-off-the-land binaries. No files written to disk.",
    falconFix:"Falcon Prevent's memory scanning stops in-memory ransomware before encryption.",
    keyModules:["PREVENT","COMPLETE","OVERWATCH","INSIGHT"],
    moduleNarrative:{
      PREVENT:"Memory scanning and behavioural AI detect fileless ransomware before first encryption.",
      COMPLETE:"MDR analysts contain the incident before ransomware reaches critical systems.",
      OVERWATCH:"Hunters detect pre-ransomware staging — lateral movement and privilege escalation.",
      INSIGHT:"XDR correlates the full ransomware kill chain across every endpoint.",
    },
    behavior:{
      credentialGhosts:false,trackPlayer:0.4,fakeDrops:false,
      impostorEnemies:false,stagingPhase:true,encryptionRush:true,
      stealth:false,cloudLane:false,cloudVanish:false,corruption:false,
      wiperMode:false,hiddenNodes:false,slowStealth:false,supplyChain:false,
      corruptedAsset:false,multiPhase:false,multiLane:false,
      alertFlood:false,esxiRow:false,adaptivePatterns:false,
    },
    drops:{PREVENT:0.28,COMPLETE:0.20,OVERWATCH:0.18,INSIGHT:0.14,PANGEA:0.10,FEM:0.06,CHARLOTTE:0.04},
    deathMessages:{
      PREVENT:{
        headline:"LEGACY ANTIVIRUS INSTALLED — FILELESS RANSOMWARE EXECUTED FREELY",
        body:"CARBON SPIDER's fileless ransomware ran entirely in memory. No files, no signatures, no AV alert. Falcon Prevent's memory scanning and behavioural AI would have terminated execution before a single file was encrypted.",
        cta:"Falcon Prevent: AI-native EPP that stops ransomware before encryption begins. crowdstrike.com/falcon-prevent",
      },
    },
    incidentReport:{
      title:"RANSOMWARE STAGING DISRUPTED",
      stopped:"Pre-ransomware staging detected and neutralised before encryption phase.",
      keyLesson:"Ransomware is stoppable — but only if you detect the staging, not the encryption.",
      moduleHighlight:"PREVENT",
    },
  },
  {
    id:"cozy_bear",waveNum:4,isBoss:false,color:CS.ORANGE,
    name:"COZY BEAR",shortName:"COZY BEAR",
    aka:"APT29 / Midnight Blizzard",
    nation:"🇷🇺 Russia — SVR",shortNation:"🇷🇺 Russia — SVR",
    threat:"CRITICAL",vector:"Cloud Infrastructure · OAuth Abuse",
    environment:"CLOUD TENANT / CONTAINER ESTATE",
    environmentDesc:"Cloud workloads and OAuth infrastructure are being pivoted through.",
    objective:"Detect cloud-native movement. Endpoint tools are blind here.",
    threatCard:"COZY BEAR has stolen OAuth tokens. Enemies vanish from endpoint view and reappear from cloud lanes. Without Cloud Security you cannot hit them.",
    desc:"Russian SVR foreign intelligence. Compromises cloud environments and identity providers.",
    attackDesc:"COZY BEAR abuses OAuth tokens to pivot through cloud workloads entirely within trusted infrastructure.",
    falconFix:"Falcon Cloud Security delivers runtime protection across every workload.",
    keyModules:["CLOUD","INSIGHT","OVERWATCH","IDENTITY"],
    moduleNarrative:{
      CLOUD:"Runtime protection across every cloud workload — blocks OAuth token abuse.",
      INSIGHT:"Correlates cloud API calls with endpoint signals to expose the full attack chain.",
      OVERWATCH:"Hunters proactively search for COZY BEAR's cloud-native TTPs.",
      IDENTITY:"Detects OAuth token theft and service account abuse before persistence is established.",
    },
    behavior:{
      credentialGhosts:false,trackPlayer:0.25,fakeDrops:false,
      impostorEnemies:false,stagingPhase:false,cloudLane:true,cloudVanish:true,
      stealth:false,corruption:false,wiperMode:false,hiddenNodes:false,
      slowStealth:false,supplyChain:false,corruptedAsset:false,
      multiPhase:false,multiLane:false,alertFlood:false,
      esxiRow:false,adaptivePatterns:false,encryptionRush:false,
    },
    drops:{CLOUD:0.30,INSIGHT:0.22,OVERWATCH:0.18,IDENTITY:0.14,FEM:0.08,PANGEA:0.06,CHARLOTTE:0.02},
    deathMessages:{
      CLOUD:{
        headline:"NO CLOUD SECURITY — ENTIRE CLOUD ESTATE UNMONITORED",
        body:"COZY BEAR identified the unmonitored cloud environment and pivoted entirely into cloud infrastructure — beyond the reach of every endpoint tool deployed. They operated in the cloud for 47 days.",
        cta:"Falcon Cloud Security: CNAPP protection for every cloud workload. crowdstrike.com/cloud-security",
      },
    },
    incidentReport:{
      title:"CLOUD INFRASTRUCTURE PIVOT BLOCKED",
      stopped:"OAuth token abuse detected and cloud lateral movement contained.",
      keyLesson:"Endpoint tools are blind to cloud-native attacks. You need cloud-native defence.",
      moduleHighlight:"CLOUD",
    },
  },
  {
    id:"scattered_spider",waveNum:5,isBoss:true,color:CS.BLUE,
    name:"SCATTERED SPIDER",shortName:"SCATTERED SPIDER",
    aka:"UNC3944 / Muddled Libra",
    nation:"🌐 Western eCrime",shortNation:"🌐 eCrime",
    threat:"CRITICAL",vector:"Social Engineering · MFA Bypass",
    environment:"EXECUTIVE COMMS / IDENTITY PROVIDER",
    environmentDesc:"Your identity provider and executive accounts are under social engineering attack.",
    objective:"Identify the impostor. Not every friendly signal is real.",
    threatCard:"SCATTERED SPIDER is among your employees. Some enemies look friendly. Some power-ups are traps. Collecting a fake signal without Identity costs a life. Trust nothing.",
    desc:"Native-English-speaking threat actors who social-engineer IT help desks and bypass MFA.",
    attackDesc:"SCATTERED SPIDER calls your helpdesk posing as an employee, resets MFA, obtains valid credentials and operates as a trusted user.",
    falconFix:"Falcon Identity detects MFA reset anomalies and impossible travel.",
    keyModules:["IDENTITY","COMPLETE","OVERWATCH","INSIGHT"],
    moduleNarrative:{
      IDENTITY:"Detects MFA reset anomalies and exposes impostors — the moment a socially-engineered account activates.",
      COMPLETE:"MDR analysts receive alerts in under 60 seconds and contain the intrusion before persistence.",
      OVERWATCH:"Elite hunters recognise SCATTERED SPIDER's post-access behaviour patterns.",
      INSIGHT:"XDR correlates the vishing-to-access-to-persistence chain.",
    },
    behavior:{
      credentialGhosts:false,trackPlayer:0.35,fakeDrops:true,
      impostorEnemies:true,socialEngineering:true,stealth:false,
      stagingPhase:false,cloudLane:false,cloudVanish:false,corruption:false,
      wiperMode:false,hiddenNodes:false,slowStealth:false,supplyChain:false,
      corruptedAsset:false,multiPhase:false,multiLane:false,
      alertFlood:false,esxiRow:false,adaptivePatterns:false,encryptionRush:false,
    },
    drops:{IDENTITY:0.30,COMPLETE:0.22,OVERWATCH:0.20,INSIGHT:0.14,PREVENT:0.08,PANGEA:0.06},
    deathMessages:{
      IDENTITY:{
        headline:"NO IDENTITY PROTECTION — MFA BYPASS WENT UNDETECTED",
        body:"SCATTERED SPIDER called the helpdesk, socially engineered an MFA reset and authenticated using valid credentials. Without Falcon Identity's behavioural analytics, the login appeared legitimate.",
        cta:"Falcon Identity: behavioural analytics that make valid credentials an unreliable weapon. crowdstrike.com/falcon-identity",
      },
    },
    incidentReport:{
      title:"SOCIAL ENGINEERING CAMPAIGN NEUTRALISED",
      stopped:"MFA bypass attempt detected. Impostor account isolated before lateral movement.",
      keyLesson:"No malware was used. Identity analytics stopped what endpoint tools cannot see.",
      moduleHighlight:"IDENTITY",
    },
  },
  {
    id:"volt_typhoon",waveNum:6,isBoss:false,color:CS.TEAL,
    name:"VOLT TYPHOON",shortName:"VOLT TYPHOON",
    aka:"Bronze Silhouette / Vanguard Panda",
    nation:"🇨🇳 China — PLA",shortNation:"🇨🇳 China — PLA",
    threat:"CRITICAL",vector:"Living-off-the-Land · Critical Infrastructure",
    environment:"OT NETWORK / CRITICAL INFRASTRUCTURE",
    environmentDesc:"Operational technology and critical infrastructure are being pre-positioned against.",
    objective:"Find the hidden threats. VOLT TYPHOON moves slowly and silently.",
    threatCard:"VOLT TYPHOON operates near-invisibly. Hidden nodes are pre-positioned and will activate if not found. Use Exposure Management to reveal them before they detonate.",
    desc:"Chinese state-sponsored group pre-positioning inside US critical infrastructure.",
    attackDesc:"VOLT TYPHOON uses exclusively built-in Windows tools. No malware, no custom code. They blend into legitimate network administration traffic completely.",
    falconFix:"Falcon Exposure Management discovers every asset VOLT TYPHOON could target.",
    keyModules:["FEM","INSIGHT","OVERWATCH","PREVENT"],
    moduleNarrative:{
      FEM:"Maps every exposed OT asset VOLT TYPHOON could exploit before they find it.",
      INSIGHT:"Detects living-off-the-land abuse by baselining legitimate admin tool usage.",
      OVERWATCH:"Hunters identify slow pre-positioning activity that spans months.",
      PREVENT:"Behavioural AI detects misuse of legitimate binaries even without malware.",
    },
    behavior:{
      credentialGhosts:false,trackPlayer:0.1,fakeDrops:false,
      impostorEnemies:false,stealth:true,slowStealth:true,hiddenNodes:true,
      cloudLane:false,cloudVanish:false,corruption:false,wiperMode:false,
      stagingPhase:false,supplyChain:false,corruptedAsset:false,
      multiPhase:false,multiLane:false,alertFlood:false,
      esxiRow:false,adaptivePatterns:false,encryptionRush:false,
    },
    drops:{FEM:0.30,INSIGHT:0.24,OVERWATCH:0.20,PREVENT:0.14,PANGEA:0.08,CHARLOTTE:0.04},
    deathMessages:{
      FEM:{
        headline:"NO EXPOSURE MANAGEMENT — VOLT TYPHOON FOUND ASSETS YOU DIDN'T KNOW EXISTED",
        body:"VOLT TYPHOON's reconnaissance identified 23 internet-exposed legacy systems the security team had no record of. Falcon Exposure Management continuously discovers and prioritises every exposed asset.",
        cta:"Falcon Exposure Management: know your attack surface before adversaries do. crowdstrike.com/exposure-management",
      },
    },
    incidentReport:{
      title:"OT PRE-POSITIONING DISRUPTED",
      stopped:"Hidden infrastructure staging detected before activation. OT systems protected.",
      keyLesson:"The most dangerous adversaries make no noise. Visibility requires active hunting.",
      moduleHighlight:"FEM",
    },
  },
  {
    id:"midnight_blizzard_boss",waveNum:7,isBoss:true,color:CS.BLUE,
    name:"MIDNIGHT BLIZZARD",shortName:"MIDNIGHT BLIZZARD",
    aka:"APT29 / NOBELIUM — Elite Tier",
    nation:"🇷🇺 Russia — SVR Tier-1",shortNation:"🇷🇺 Russia — SVR",
    threat:"CRITICAL",vector:"Supply Chain · MFA Bypass · Vendor Abuse",
    environment:"SOFTWARE SUPPLY CHAIN",
    environmentDesc:"A trusted software vendor has been compromised. Every downstream customer is at risk.",
    objective:"Detect the supply chain compromise before it propagates to downstream systems.",
    threatCard:"MIDNIGHT BLIZZARD has compromised a trusted vendor. One of your blocks is already corrupted and will fire on you. One enemy per row looks friendly — it is not.",
    desc:"The elite SVR operational arm responsible for SolarWinds and the Microsoft corporate email breach.",
    attackDesc:"MIDNIGHT BLIZZARD compromises trusted software vendors and pushes malicious updates to thousands of downstream customers simultaneously.",
    falconFix:"Falcon Complete MDR provides managed expertise to detect supply chain compromises.",
    keyModules:["COMPLETE","IDENTITY","OVERWATCH","INSIGHT","PANGEA"],
    moduleNarrative:{
      COMPLETE:"MDR analysts with NOBELIUM-specific expertise respond to supply chain indicators.",
      IDENTITY:"Detects low-velocity password spray and MFA token theft.",
      OVERWATCH:"Elite hunters track NOBELIUM TTPs globally.",
      INSIGHT:"XDR correlates supply chain telemetry with endpoint and identity signals.",
      PANGEA:"Planet-scale intelligence identifies MIDNIGHT BLIZZARD infrastructure before first contact.",
    },
    behavior:{
      credentialGhosts:false,trackPlayer:0.3,fakeDrops:false,
      impostorEnemies:false,supplyChain:true,corruptedAsset:true,
      stealth:false,cloudLane:false,cloudVanish:false,corruption:false,
      wiperMode:false,hiddenNodes:false,slowStealth:false,
      stagingPhase:false,multiPhase:false,multiLane:false,
      alertFlood:false,esxiRow:false,adaptivePatterns:false,encryptionRush:false,
    },
    drops:{COMPLETE:0.26,IDENTITY:0.22,OVERWATCH:0.20,INSIGHT:0.14,PANGEA:0.12,FEM:0.06},
    deathMessages:{
      COMPLETE:{
        headline:"NO MDR CAPABILITY — SUPPLY CHAIN COMPROMISE PROPAGATED",
        body:"A trusted software vendor was compromised and pushed a malicious update. Without Falcon Complete MDR, there was no team with the expertise to recognise the supply chain indicators.",
        cta:"Falcon Complete MDR: managed expertise that detects supply chain compromises. crowdstrike.com/falcon-complete",
      },
    },
    incidentReport:{
      title:"SUPPLY CHAIN COMPROMISE CONTAINED",
      stopped:"Malicious vendor update detected before downstream propagation.",
      keyLesson:"Supply chain attacks bypass perimeter defences entirely. Behavioural detection is the only answer.",
      moduleHighlight:"COMPLETE",
    },
  },
  {
    id:"sandworm",waveNum:8,isBoss:false,color:CS.RED,
    name:"SANDWORM",shortName:"SANDWORM",
    aka:"Voodoo Bear / IRIDIUM / Unit 74455",
    nation:"🇷🇺 Russia — GRU Unit 74455",shortNation:"🇷🇺 Russia — GRU",
    threat:"CRITICAL",vector:"Destructive Malware · OT/ICS · Wiper",
    environment:"INDUSTRIAL SYSTEMS / OT NETWORK",
    environmentDesc:"Industrial control systems are being targeted for physical destruction.",
    objective:"Stop the wiper before it reaches OT systems. Destruction is irreversible.",
    threatCard:"SANDWORM bullets corrupt your own defences. Corrupted blocks turn hostile and fire back at you. Prevent every bullet from hitting your blocks or they become weapons against you.",
    desc:"The most destructive cyber threat actor ever documented. Caused the first confirmed power outage via cyberattack.",
    attackDesc:"SANDWORM deploys wiper malware designed to permanently destroy data and render systems unrecoverable.",
    falconFix:"Falcon Prevent's behavioural AI detects wiper malware execution before destruction begins.",
    keyModules:["PREVENT","FEM","COMPLETE","OVERWATCH"],
    moduleNarrative:{
      PREVENT:"Behavioural AI detects wiper malware execution patterns before a single file is destroyed.",
      FEM:"Discovers every OT and ICS boundary SANDWORM could target.",
      COMPLETE:"Immediate containment to isolate affected systems before wiper propagates.",
      OVERWATCH:"Hunters identify SANDWORM's pre-destruction staging before detonation.",
    },
    behavior:{
      credentialGhosts:false,trackPlayer:0.4,fakeDrops:false,
      impostorEnemies:false,stagingPhase:false,corruption:true,wiperMode:true,
      stealth:false,cloudLane:false,cloudVanish:false,hiddenNodes:false,
      slowStealth:false,supplyChain:false,corruptedAsset:false,
      multiPhase:false,multiLane:false,alertFlood:false,
      esxiRow:false,adaptivePatterns:false,encryptionRush:false,
    },
    drops:{PREVENT:0.28,FEM:0.22,COMPLETE:0.20,OVERWATCH:0.18,INSIGHT:0.08,PANGEA:0.04},
    deathMessages:{
      PREVENT:{
        headline:"NO BEHAVIOURAL AI — WIPER EXECUTED AND DESTROYED 40,000 ENDPOINTS",
        body:"SANDWORM's wiper malware had never been seen before — no signature existed. Legacy tools were completely blind. Falcon Prevent's behavioural AI detects the behaviour: mass file overwrite, MBR destruction, VSS deletion.",
        cta:"Falcon Prevent: behavioural AI that stops destructive malware before the first file is wiped. crowdstrike.com/falcon-prevent",
      },
    },
    incidentReport:{
      title:"DESTRUCTIVE WIPER CAMPAIGN STOPPED",
      stopped:"Wiper malware execution blocked before OT systems were reached.",
      keyLesson:"Destructive attacks cannot be remediated — only prevented. Behavioural AI is the only defence.",
      moduleHighlight:"PREVENT",
    },
  },
  {
    id:"blackcat_boss",waveNum:9,isBoss:true,color:CS.PURPLE,
    name:"ALPHV BLACKCAT",shortName:"BLACKCAT",
    aka:"ALPHV / Noberus — RaaS Operator",
    nation:"🌐 RaaS Operator",shortNation:"🌐 RaaS",
    threat:"HIGH",vector:"Ransomware-as-a-Service · Triple Extortion",
    environment:"HYBRID ESTATE / ESXi INFRASTRUCTURE",
    environmentDesc:"Windows endpoints, Linux servers and VMware ESXi are being encrypted simultaneously.",
    objective:"Contain the multi-lane encryption before it reaches ESXi. All VMs are at risk.",
    threatCard:"BLACKCAT affiliates strike simultaneously from multiple directions. Alert floods will scramble your HUD. Charlotte AI is essential to keep pace with machine-speed multi-vector encryption.",
    desc:"The most technically sophisticated RaaS operation ever observed. Written in Rust for cross-platform capability.",
    attackDesc:"BLACKCAT affiliates deploy ransomware across the entire estate simultaneously — endpoints, servers and VMware infrastructure in one coordinated strike.",
    falconFix:"Falcon Prevent detects BLACKCAT's Rust-based payload through behavioural analysis.",
    keyModules:["PREVENT","COMPLETE","CHARLOTTE","OVERWATCH","INSIGHT"],
    moduleNarrative:{
      PREVENT:"Behavioural AI detects BLACKCAT's Rust payload — language is irrelevant to behavioural detection.",
      COMPLETE:"MDR analysts detect and evict initial access broker activity weeks before ransomware deploys.",
      CHARLOTTE:"Autonomous AI neutralises the high-velocity multi-vector activity that overwhelms human teams.",
      OVERWATCH:"Hunters identify pre-ransomware staging — credential harvesting, ESXi enumeration, backup destruction.",
      INSIGHT:"XDR correlates the full BLACKCAT kill chain across every domain.",
    },
    behavior:{
      credentialGhosts:false,trackPlayer:0.45,fakeDrops:false,
      impostorEnemies:false,stagingPhase:false,multiLane:true,alertFlood:true,
      stealth:false,cloudLane:false,cloudVanish:false,corruption:false,
      wiperMode:false,hiddenNodes:false,slowStealth:false,supplyChain:false,
      corruptedAsset:false,multiPhase:false,esxiRow:false,
      adaptivePatterns:false,encryptionRush:false,
    },
    drops:{PREVENT:0.24,COMPLETE:0.22,CHARLOTTE:0.18,OVERWATCH:0.16,INSIGHT:0.12,PANGEA:0.08},
    deathMessages:{
      CHARLOTTE:{
        headline:"ANALYST TEAM OVERWHELMED — MULTI-VECTOR DEPLOYMENT SUCCEEDED",
        body:"BLACKCAT affiliates simultaneously encrypted endpoints, VMware ESXi hosts and backup infrastructure. 847 alerts in four minutes overwhelmed the security team. Charlotte AI autonomously triages and neutralises at machine speed.",
        cta:"Charlotte AI: autonomous threat response that cannot be overwhelmed by alert volume. crowdstrike.com/charlotte-ai",
      },
    },
    incidentReport:{
      title:"MULTI-VECTOR RANSOMWARE CONTAINED",
      stopped:"Simultaneous endpoint, server and ESXi encryption attempt blocked.",
      keyLesson:"RaaS attacks are designed to overwhelm. Autonomous AI response is not optional.",
      moduleHighlight:"CHARLOTTE",
    },
  },
  {
    id:"lazarus_final",waveNum:10,isBoss:true,color:CS.PURPLE,
    name:"LAZARUS GROUP",shortName:"LAZARUS",
    aka:"Hidden Cobra / Zinc / Diamond Sleet",
    nation:"🇰🇵 N. Korea — RGB Bureau 121",shortNation:"🇰🇵 N. Korea",
    threat:"CRITICAL",vector:"Financial Theft · Crypto Heist · Destructive",
    environment:"CRYPTO TREASURY / PRIVILEGED SYSTEMS",
    environmentDesc:"Cryptocurrency treasury and privileged access systems are the final target.",
    objective:"This is the final test. LAZARUS uses every technique. The full platform is required.",
    threatCard:"LAZARUS GROUP operates in three phases: THEFT, STEALTH, then DESTRUCTION. Each phase changes the rules. The full platform is required. No single module is enough.",
    desc:"North Korea's premier cyber unit. Responsible for stealing over $3 billion in cryptocurrency.",
    attackDesc:"LAZARUS conducts multi-year financial operations with custom tooling built specifically for each target. When discovered, they deploy destructive malware to cover tracks.",
    falconFix:"The full Falcon platform is required. Prevent stops custom malware. Identity detects credential abuse. Complete MDR provides expert-led response.",
    keyModules:["COMPLETE","PREVENT","IDENTITY","CHARLOTTE","OVERWATCH","PANGEA"],
    moduleNarrative:{
      COMPLETE:"Expert-led MDR response is essential to fully evict a nation-state actor.",
      PREVENT:"Behavioural AI stops LAZARUS custom malware regardless of how bespoke the tooling.",
      IDENTITY:"Detects credential abuse and privileged account reconnaissance during financial targeting.",
      CHARLOTTE:"Autonomous AI processes the massive telemetry volume LAZARUS operations generate.",
      OVERWATCH:"A decade of LAZARUS hunting experience — OverWatch knows their infrastructure and timing.",
      PANGEA:"Global intelligence identifies LAZARUS cryptocurrency mixing infrastructure before first contact.",
    },
    behavior:{
      credentialGhosts:false,trackPlayer:0.5,fakeDrops:false,
      impostorEnemies:false,stagingPhase:false,multiPhase:true,multiLane:true,
      stealth:false,cloudLane:false,cloudVanish:false,corruption:true,
      wiperMode:false,hiddenNodes:false,slowStealth:false,supplyChain:false,
      corruptedAsset:false,alertFlood:false,esxiRow:false,
      adaptivePatterns:false,encryptionRush:false,
    },
    drops:{COMPLETE:0.22,PREVENT:0.18,IDENTITY:0.16,CHARLOTTE:0.14,OVERWATCH:0.14,PANGEA:0.10,INSIGHT:0.06},
    deathMessages:{
      COMPLETE:{
        headline:"NATION-STATE ACTOR NOT FULLY EVICTED — LAZARUS RE-ESTABLISHED ACCESS",
        body:"This organization attempted to respond using internal resources. The team removed the initial implant — but LAZARUS had already established four additional persistence mechanisms. Without MDR expertise in nation-state eviction, remediation was incomplete.",
        cta:"Falcon Complete MDR: complete nation-state eviction, not just incident containment. crowdstrike.com/falcon-complete",
      },
    },
    incidentReport:{
      title:"NATION-STATE OPERATION NEUTRALISED",
      stopped:"Multi-phase LAZARUS operation disrupted across all three stages.",
      keyLesson:"Nation-state actors require the full platform — no single tool is sufficient.",
      moduleHighlight:"COMPLETE",
    },
  },
];

// ─── UTILITIES ───────────────────────────────────────────────────
function pickModuleForPhase(phase, excludeNuclear=false){
  const base={...phase.drops};
  if(!base.PREVENT)  base.PREVENT  =0.10;
  if(!base.OVERWATCH)base.OVERWATCH=0.10;
  // In early waves or when explicitly requested, strip nuclear modules from drop pool
  if(excludeNuclear){
    for(const id of NUCLEAR_MODULE_IDS) delete base[id];
  }
  const ids=Object.keys(base),weights=Object.values(base);
  const total=weights.reduce((a,b)=>a+b,0);
  let rand=Math.random()*total;
  for(let i=0;i<ids.length;i++){rand-=weights[i];if(rand<=0)return ids[i];}
  return ids[ids.length-1];
}

function getDeathContext(phase,modulesCollected){
  if(!phase)return{
    headline:"UNPROTECTED ENVIRONMENT — NO FALCON DEPLOYED",
    body:"This system was not running CrowdStrike Falcon. Without unified endpoint, identity and cloud protection, adversaries operate without resistance.",
    cta:"crowdstrike.com — See how Falcon stops breaches before they start.",
  };
  const missing=phase.keyModules.filter(m=>!modulesCollected.has(m));
  for(const mod of missing){const msg=phase.deathMessages?.[mod];if(msg)return msg;}
  return{
    headline:`${phase.name} OPERATED WITHOUT RESISTANCE`,
    body:`${phase.attackDesc} Organizations with the full Falcon platform stop this attack before it progresses past initial access.`,
    cta:`Recommended: ${phase.keyModules.map(m=>MODULES[m]?.name??m).join(" + ")}`,
  };
}

// ─── CFG ─────────────────────────────────────────────────────────
const CFG=Object.freeze({
  COLS:8,ROWS:3,
  ATK_W:38,ATK_H:28,ATK_SX:26,ATK_SY:26,
  PLR_W:46,PLR_H:24,PLR_SPEED:230,PLR_LIVES:3,
  BLT_W:3,BLT_H:12,
  PLR_BLT_SPEED:470,ATK_BLT_SPEED:185,MAX_ATK_BLTS:5,
  BLK_W:52,BLK_H:18,BLK_COLS:6,BLK_STRENGTH:4,
  UFO_W:58,UFO_H:24,UFO_SPEED:115,UFO_INTERVAL:15000,
  BOSS_W:110,BOSS_H:60,
  SCORE_ROW:[80,150,220],SCORE_UFO:[200,350,500],SCORE_BOSS:3000,
  COMBO_WINDOW:3000,HIT_PAUSE_MS:700,
  WAVE_BANNER_MS:2800,BOSS_WARN_MS:2800,
  MODULE_CHOICE_MS:20000,INCIDENT_REPORT_MS:6000,
  DROP_CHANCE:0.22,IMAGE_COUNT:16,SOC_COMMS_INTERVAL:7000,
  WAVE_GRACE_S:3.5,          // seconds of slow movement at wave start
  BONUS_MODULE_MIN:18,       // earliest a bonus module can appear (seconds)
  BONUS_MODULE_MAX:34,       // latest a bonus module can appear (seconds)
});

// ─── ASSET MANAGER ───────────────────────────────────────────────
class AssetManager{
  #cache=new Map();
  loadImage(key,src){
    return new Promise(res=>{
      const img=new Image();
      img.onload =()=>{ this.#cache.set(key,img); res(img); };
      img.onerror=()=>{ res(null); };
      img.src=src;
    });
  }
  async loadAll(manifest,onProgress){
    let done=0;
    await Promise.all(manifest.map(async m=>{
      await this.loadImage(m.key,m.src);
      onProgress?.(++done,manifest.length);
    }));
  }
  get(key){ return this.#cache.get(key)??null; }
}

// ─── POOL ────────────────────────────────────────────────────────
class Pool{
  #free=[];#factory;
  constructor(factory,n=40){this.#factory=factory;for(let i=0;i<n;i++)this.#free.push(factory());}
  acquire(p){return Object.assign(this.#free.pop()??this.#factory(),p);}
  release(o){this.#free.push(o);}
}

// ─── AUDIO ───────────────────────────────────────────────────────
class AudioEngine{
  #ac;#bgm=false;
  constructor(){this.#ac=new(window.AudioContext||window.webkitAudioContext)();}
  #resume(){if(this.#ac.state!=="running")this.#ac.resume();}
  #tone({type="square",f0,f1,dur,gain=0.22,filt=null,det=0,delay=0}){
    setTimeout(()=>{
      this.#resume();
      const ac=this.#ac,osc=ac.createOscillator(),g=ac.createGain();
      osc.type=type;osc.detune.value=det;
      osc.frequency.setValueAtTime(f0,ac.currentTime);
      if(f1)osc.frequency.exponentialRampToValueAtTime(f1,ac.currentTime+dur);
      g.gain.setValueAtTime(0,ac.currentTime);
      g.gain.linearRampToValueAtTime(gain,ac.currentTime+0.008);
      g.gain.exponentialRampToValueAtTime(0.0001,ac.currentTime+dur);
      if(filt){const fl=ac.createBiquadFilter();fl.type="lowpass";fl.frequency.value=filt;osc.connect(fl);fl.connect(g);}
      else osc.connect(g);
      g.connect(ac.destination);osc.start();osc.stop(ac.currentTime+dur);
    },delay);
  }
  laser(){this.#tone({type:"sawtooth",f0:900,f1:200,dur:0.12,gain:0.2});}
  boom(){
    this.#tone({type:"square",f0:300,f1:30,dur:0.45,gain:0.32,filt:600});
    this.#tone({type:"sawtooth",f0:150,f1:20,dur:0.3,gain:0.18,delay:80});
  }
  playerHit(){
    this.#tone({type:"triangle",f0:520,f1:80,dur:0.55,gain:0.3});
    this.#tone({type:"sawtooth",f0:300,f1:60,dur:0.4,gain:0.15,det:15});
  }
  moduleUp(){[0,100,200,310].forEach((d,i)=>this.#tone({type:"sine",f0:330+i*165,dur:0.16,gain:0.2,delay:d}));}
  bonusModule(){
    // Distinct golden chime for bonus module drops
    [0,80,160,260,400].forEach((d,i)=>
      this.#tone({type:"sine",f0:440*Math.pow(1.25,i),dur:0.22,gain:0.18,delay:d}));
  }
  pangea(){
    this.#tone({type:"sine",f0:200,f1:60,dur:1.2,gain:0.3,filt:500});
    this.#tone({type:"square",f0:100,f1:30,dur:1.0,gain:0.2,delay:60});
  }
  overwatch(){
    this.#tone({type:"sawtooth",f0:55,f1:220,dur:0.9,gain:0.4,filt:800});
    this.#tone({type:"square",f0:110,f1:440,dur:0.7,gain:0.25,delay:200});
  }
  complete(){[0,80,180,320,500].forEach((d,i)=>this.#tone({type:"sawtooth",f0:80*Math.pow(1.4,i),f1:30,dur:0.7,gain:0.35,filt:700,delay:d}));}
  charlotte(){
    this.#tone({type:"sine",f0:880,f1:1760,dur:0.25,gain:0.18});
    this.#tone({type:"sine",f0:440,f1:1320,dur:0.2,gain:0.12,delay:30});
  }
  ufoBeep(){this.#tone({type:"sine",f0:720,f1:360,dur:0.07,gain:0.12});}
  levelUp(){[0,120,240,400].forEach((d,i)=>this.#tone({type:"square",f0:220*Math.pow(1.5,i),dur:0.18,gain:0.18,delay:d}));}
  bossRoar(){
    this.#tone({type:"sawtooth",f0:55,f1:18,dur:1.1,gain:0.5,filt:300});
    this.#tone({type:"square",f0:80,f1:25,dur:0.9,gain:0.3,det:30,delay:80});
  }
  fem(){
    this.#tone({type:"sine",f0:440,f1:880,dur:0.3,gain:0.2});
    this.#tone({type:"triangle",f0:330,f1:660,dur:0.25,gain:0.15,delay:60});
  }
  corruptAlert(){this.#tone({type:"square",f0:220,f1:110,dur:0.3,gain:0.25,filt:400});}
  phaseTransition(){[0,60,140,260].forEach((d,i)=>this.#tone({type:"sawtooth",f0:440-i*80,dur:0.4,gain:0.28,filt:600,delay:d}));}
  socComm(){this.#tone({type:"sine",f0:660,f1:440,dur:0.08,gain:0.08});}
  startBGM(){
    if(this.#bgm)return;this.#bgm=true;this.#resume();
    const ac=this.#ac;
    const bass=[55,55,65,55,49,49,55,49],mel=[220,262,220,196,175,196,220,175];
    const step=60/148;let beat=0;
    const tick=()=>{
      if(!this.#bgm)return;const now=ac.currentTime;
      [bass,mel].forEach((seq,si)=>{
        const osc=ac.createOscillator(),g=ac.createGain();
        osc.type=si===0?"square":"triangle";
        osc.frequency.value=seq[beat%seq.length];
        g.gain.setValueAtTime(si===0?0.05:0.04,now);
        g.gain.exponentialRampToValueAtTime(0.001,now+step*0.7);
        osc.connect(g);g.connect(ac.destination);
        osc.start();osc.stop(now+step*0.7);
      });
      beat++;setTimeout(tick,step*1000);
    };tick();
  }
  stopBGM(){this.#bgm=false;}
}

// ─── SOC FEED ────────────────────────────────────────────────────
class SOCFeed{
  #lines=[];#current=null;#t=0;#showT=5.5;#idx=0;#active=false;
  start(phaseId){
    this.#lines=[...(SOC_COMMS[phaseId]??[])];
    // shuffle so lines appear in different order each playthrough
    for(let i=this.#lines.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [this.#lines[i],this.#lines[j]]=[this.#lines[j],this.#lines[i]];
    }
    this.#idx=0;this.#t=0;this.#active=true;this.#next();
  }
  stop(){this.#active=false;this.#current=null;}
  #next(){
    if(!this.#active||!this.#lines.length)return;
    this.#current=this.#lines[this.#idx%this.#lines.length];
    this.#idx++;this.#t=0;
  }
  update(dt){
    if(!this.#active||!this.#current)return;
    this.#t+=dt;
    if(this.#t>this.#showT+CFG.SOC_COMMS_INTERVAL/1000)this.#next();
  }
  draw(ctx,w,h){
    if(!this.#active||!this.#current)return;
    const t=this.#t;
    const fadeIn=Math.min(1,t/0.4);
    const fadeOut=t>this.#showT?Math.max(0,1-(t-this.#showT)/0.8):1;
    const alpha=fadeIn*fadeOut;if(alpha<0.01)return;
    ctx.save();ctx.globalAlpha=alpha;
    const barW=380,barH=28,bx=(w-barW)/2,by=h-42;
    ctx.fillStyle="rgba(4,1,18,0.88)";ctx.strokeStyle=CS.GREEN;ctx.lineWidth=1;
    ctx.shadowColor=CS.GREEN;ctx.shadowBlur=8;
    ctx.beginPath();ctx.roundRect(bx,by,barW,barH,4);ctx.fill();ctx.stroke();
    const blink=Math.sin(performance.now()*0.015)>0;
    if(blink){
      ctx.fillStyle=CS.GREEN;ctx.shadowBlur=0;
      ctx.beginPath();ctx.arc(bx+12,by+14,4,0,Math.PI*2);ctx.fill();
    }
    ctx.font="bold 10px 'Courier New'";ctx.textAlign="left";
    ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=6;
    ctx.fillText("SOC ▶",bx+22,by+18);
    const maxMsgW=barW-82;ctx.font="10px 'Courier New'";
    let msg=this.#current;
    while(msg.length>0&&ctx.measureText(msg).width>maxMsgW)msg=msg.slice(0,-1);
    if(msg.length<this.#current.length)msg=msg.slice(0,-1)+"…";
    ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
    ctx.fillText(msg,bx+72,by+18);
    ctx.restore();
  }
}

// ─── MODULE CHOICE SCREEN ────────────────────────────────────────
class ModuleChoiceScreen{
  #choices=[];#selected=0;#t=0;#confirmed=false;

  prepare(phase, waveIdx){
    const isEarlyWave = waveIdx < 2;
    // For early waves, filter out nuclear modules from the key module pool
    const keyPool = [...phase.keyModules].filter(id =>
      !isEarlyWave || !NUCLEAR_MODULE_IDS.has(id)
    );
    // If filtering removed all key modules, fall back to safe modules
    const safePool = keyPool.length >= 2 ? keyPool :
      ["PREVENT","INSIGHT","IDENTITY","FEM","PANGEA"].filter(id => !NUCLEAR_MODULE_IDS.has(id));

    for(let i=safePool.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [safePool[i],safePool[j]]=[safePool[j],safePool[i]];
    }
    const chosen=safePool.slice(0,2);

    // Wildcard: pick from non-key modules, also filtering nuclear in early waves
    const wildcards=MODULE_POOL.filter(m=>
      !phase.keyModules.includes(m.id) &&
      (!isEarlyWave || !NUCLEAR_MODULE_IDS.has(m.id))
    );
    if(wildcards.length){
      const wild=wildcards[Math.floor(Math.random()*wildcards.length)];
      chosen.push(wild.id);
    }
    for(let i=chosen.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [chosen[i],chosen[j]]=[chosen[j],chosen[i]];
    }
    this.#choices=chosen.map(id=>MODULES[id]).filter(Boolean).slice(0,3);
    this.#selected=1;this.#t=0;this.#confirmed=false;
  }

  get confirmed(){return this.#confirmed;}
  get chosenModule(){return this.#choices[this.#selected]??null;}

  update(dt,input){
    this.#t+=dt;
    if(input.consumePressed("ArrowRight"))
      this.#selected=Math.min(this.#choices.length-1,this.#selected+1);
    if(input.consumePressed("ArrowLeft"))
      this.#selected=Math.max(0,this.#selected-1);
    if(input.consume(" ")||this.#t>CFG.MODULE_CHOICE_MS/1000)
      this.#confirmed=true;
  }

  draw(ctx,w,h,phase){
    ctx.save();
    ctx.fillStyle="rgba(4,1,12,0.94)";ctx.fillRect(0,0,w,h);
    ctx.fillStyle=phase.color;ctx.fillRect(0,0,w,4);ctx.fillRect(0,h-4,w,4);
    ctx.textAlign="center";
    ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText(`DEFENDING: ${phase.environment}`,w/2,28);
    ctx.font="bold 13px 'Courier New'";
    ctx.fillStyle=phase.color;ctx.shadowColor=phase.color;ctx.shadowBlur=12;
    ctx.fillText(`⚠ ${phase.name} — THREAT ACTIVE`,w/2,52);
    ctx.font="12px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
    const words=phase.threatCard.split(" ");let line="",ly=74;
    for(const word of words){
      const test=line+word+" ";
      if(ctx.measureText(test).width>w*0.62&&line!==""){
        ctx.fillText(line,w/2,ly);line=word+" ";ly+=16;
      }else line=test;
    }
    ctx.fillText(line,w/2,ly);
    ctx.font="bold 12px 'Courier New'";
    ctx.fillStyle=CS.YELLOW;ctx.shadowColor=CS.YELLOW;ctx.shadowBlur=8;
    ctx.fillText("CHOOSE YOUR PRIMARY MODULE",w/2,ly+30);
    ctx.font="10px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText("← → to select   SPACE to deploy",w/2,ly+46);
    const CW=180,CH=178,gap=20;
    const totalCW=this.#choices.length*(CW+gap)-gap;
    const cx0=(w-totalCW)/2,cy=ly+62;
    this.#choices.forEach((m,i)=>{
      const x=cx0+i*(CW+gap),isSelected=i===this.#selected;
      const pulse=0.7+Math.sin(performance.now()*0.003+i)*0.3;
      ctx.save();
      if(isSelected){
        ctx.translate(x+CW/2,cy+CH/2);ctx.scale(1.05,1.05);
        ctx.translate(-(x+CW/2),-(cy+CH/2));
      }
      ctx.fillStyle=isSelected?"rgba(8,2,26,0.98)":"rgba(4,1,18,0.75)";
      ctx.strokeStyle=m.color;ctx.lineWidth=isSelected?2.5:1.2;
      ctx.shadowColor=m.color;ctx.shadowBlur=isSelected?20:6*pulse;
      ctx.beginPath();ctx.roundRect(x,cy,CW,CH,6);ctx.fill();ctx.stroke();
      if(isSelected){
        ctx.fillStyle=m.color;
        ctx.beginPath();ctx.roundRect(x,cy,CW,22,[6,6,0,0]);ctx.fill();
        ctx.font="bold 9px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
        ctx.fillText("▶ SELECTED",x+CW/2,cy+15);
      }
      ctx.font="28px serif";ctx.shadowBlur=0;
      ctx.fillText(m.emoji,x+CW/2,cy+(isSelected?52:42));
      ctx.font=`bold ${m.name.length>14?10:12}px 'Courier New'`;
      ctx.fillStyle=m.color;ctx.shadowColor=m.color;ctx.shadowBlur=8;
      ctx.fillText(m.name,x+CW/2,cy+(isSelected?74:64));
      ctx.font="9px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
      ctx.fillText(m.tagline,x+CW/2,cy+(isSelected?88:78));
      ctx.font="8px 'Courier New'";ctx.fillStyle=CS.LTGREY;
      const mwords=m.mechanic.split(" ");let ml="",mly=cy+(isSelected?104:94);
      for(const mw of mwords){
        const mt=ml+mw+" ";
        if(ctx.measureText(mt).width>CW-16&&ml!==""){
          ctx.fillText(ml,x+CW/2,mly);ml=mw+" ";mly+=12;
        }else ml=mt;
      }
      ctx.fillText(ml,x+CW/2,mly);
      const narr=phase.moduleNarrative?.[m.id];
      if(narr&&isSelected){
        ctx.font="italic 8px 'Courier New'";ctx.fillStyle=CS.GREEN;
        ctx.shadowColor=CS.GREEN;ctx.shadowBlur=4;
        const nwords=narr.split(" ");let nl="",nly=mly+16;
        for(const nw of nwords){
          const nt=nl+nw+" ";
          if(ctx.measureText(nt).width>CW-16&&nl!==""){
            ctx.fillText(nl,x+CW/2,nly);nl=nw+" ";nly+=11;
          }else nl=nt;
        }
        ctx.fillText(nl,x+CW/2,nly);
      }
      ctx.restore();
    });
    const prog=Math.max(0,1-this.#t/(CFG.MODULE_CHOICE_MS/1000));
    const barW=300,bx=(w-barW)/2,by=h-44;
    ctx.fillStyle="#1a1a2e";ctx.fillRect(bx,by,barW,6);
    ctx.fillStyle=phase.color;ctx.shadowColor=phase.color;ctx.shadowBlur=8;
    ctx.fillRect(bx,by,barW*prog,6);
    ctx.font="9px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText(`AUTO-DEPLOY IN ${Math.max(0,CFG.MODULE_CHOICE_MS/1000-this.#t).toFixed(0)}s`,w/2,by+18);
    ctx.textAlign="left";ctx.restore();
  }
}

// ─── INCIDENT REPORT ─────────────────────────────────────────────
function drawIncidentReport(ctx,w,h,phase,score,modulesCollected,t,totalT,skipBlink){
  const fi=Math.min(1,t/0.4),fo=t>totalT-0.5?Math.max(0,1-(t-(totalT-0.5))/0.5):1;
  ctx.save();ctx.globalAlpha=fi*fo;
  ctx.fillStyle="rgba(4,1,12,0.94)";ctx.fillRect(0,0,w,h);
  ctx.fillStyle=CS.GREEN;ctx.fillRect(0,0,w,4);ctx.fillRect(0,h-4,w,4);
  ctx.textAlign="center";
  ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
  ctx.fillText("🦅  CROWDSTRIKE INCIDENT REPORT",w/2,22);
  ctx.font="bold 28px 'Courier New'";
  ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=22;
  ctx.fillText(`✅ ${phase.incidentReport.title}`,w/2,54);
  const cols=[
    {label:"WHAT HAPPENED",   val:phase.incidentReport.stopped,   col:CS.ORANGE},
    {label:"KEY LESSON",      val:phase.incidentReport.keyLesson, col:CS.CYAN},
    {label:"MODULE THAT WON", val:MODULES[phase.incidentReport.moduleHighlight]?.name??"—",col:CS.GREEN},
  ];
  const CW=210,gap=12,cy=68;
  const totalCW=cols.length*(CW+gap)-gap,cx0=(w-totalCW)/2;
  cols.forEach((c,i)=>{
    const x=cx0+i*(CW+gap);
    ctx.fillStyle="rgba(8,2,26,0.9)";ctx.strokeStyle=c.col;ctx.lineWidth=1.2;
    ctx.shadowColor=c.col;ctx.shadowBlur=8;
    ctx.beginPath();ctx.roundRect(x,cy,CW,110,5);ctx.fill();ctx.stroke();
    ctx.fillStyle=c.col;ctx.shadowBlur=0;
    ctx.beginPath();ctx.roundRect(x,cy,CW,20,[5,5,0,0]);ctx.fill();
    ctx.font="bold 8px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.textAlign="left";
    ctx.fillText(c.label,x+8,cy+14);
    ctx.font="10px 'Courier New'";ctx.fillStyle=CS.LTGREY;
    const words=c.val.split(" ");let line="",ly=cy+34;
    for(const word of words){
      const test=line+word+" ";
      if(ctx.measureText(test).width>CW-14&&line!==""){
        ctx.fillText(line,x+8,ly);line=word+" ";ly+=13;
      }else line=test;
    }
    ctx.fillText(line,x+8,ly);
  });
  const collected=[...modulesCollected].map(id=>MODULES[id]).filter(Boolean);
  if(collected.length){
    ctx.textAlign="center";
    ctx.font="bold 9px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText("MODULES DEPLOYED THIS WAVE:",w/2,cy+128);
    let mx=w/2-(collected.length*44)/2;
    collected.forEach(m=>{
      ctx.font="16px serif";ctx.fillText(m.emoji,mx+16,cy+148);
      ctx.font="bold 7px 'Courier New'";ctx.fillStyle=m.color;
      ctx.fillText(m.shortName,mx+16,cy+160);mx+=44;
    });
  }
  ctx.font="bold 16px 'Courier New'";
  ctx.fillStyle=CS.YELLOW;ctx.shadowColor=CS.YELLOW;ctx.shadowBlur=10;
  ctx.fillText(`WAVE SCORE: ${score.toLocaleString()}`,w/2,cy+182);
  const rank=score>5000?"ELITE ANALYST":score>2500?"SENIOR ANALYST":score>1000?"ANALYST":"JUNIOR ANALYST";
  ctx.font="bold 12px 'Courier New'";ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=8;
  ctx.fillText(`RANK: ${rank}`,w/2,cy+200);
  const prog=Math.max(0,1-t/totalT),barW=260,bx=(w-barW)/2,by=h-46;
  ctx.fillStyle="#1a1a2e";ctx.fillRect(bx,by,barW,5);
  ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=6;
  ctx.fillRect(bx,by,barW*prog,5);
  if(skipBlink){
    ctx.font="bold 11px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
    ctx.fillText("[ SPACE ] ADVANCE TO NEXT THREAT",w/2,h-22);
  }
  ctx.textAlign="left";ctx.restore();
}

// ─── PARTICLES ───────────────────────────────────────────────────
class Particles{
  #list=[];
  #pool=new Pool(()=>({x:0,y:0,vx:0,vy:0,life:0,maxLife:1,r:255,g:255,b:255,size:3}),400);
  burst(x,y,n=20,pal,opts={}){
    for(let i=0;i<n;i++){
      const ang=Math.random()*Math.PI*2;
      const spd=(opts.minSpd??40)+Math.random()*(opts.maxSpd??180);
      const col=pal[Math.floor(Math.random()*pal.length)];
      this.#list.push(this.#pool.acquire({
        x,y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,life:0,
        maxLife:(opts.life??0.4)+Math.random()*(opts.lifeVar??0.3),
        r:col[0],g:col[1],b:col[2],
        size:(opts.size??2)+Math.random()*(opts.sizeVar??3),
      }));
    }
  }
  csExplosion(x,y){
    this.burst(x,y,28,[[224,0,60],[255,106,0],[255,200,50],[255,255,255]],{maxSpd:210,life:0.5});
    this.burst(x,y,10,[[255,255,255]],{minSpd:60,maxSpd:100,size:1,sizeVar:1,life:0.2});
  }
  playerHit(x,y){this.burst(x,y,32,[[0,200,255],[0,120,255],[200,240,255],[255,255,255]],{maxSpd:220,life:0.6});}
  bossExplode(x,y){for(let i=0;i<7;i++)setTimeout(()=>{const ox=(Math.random()-0.5)*90,oy=(Math.random()-0.5)*45;this.csExplosion(x+ox,y+oy);},i*110);}
  moduleCollect(x,y,col){
    const r=parseInt(col.slice(1,3),16),g=parseInt(col.slice(3,5),16),b=parseInt(col.slice(5,7),16);
    this.burst(x,y,22,[[r,g,b],[255,255,255]],{maxSpd:130,life:0.5});
  }
  bonusDrop(x,y){
    // Golden sparkle for bonus module drops
    this.burst(x,y,30,[[255,215,0],[255,255,150],[255,180,0],[255,255,255]],{maxSpd:160,life:0.7,size:2,sizeVar:3});
  }
  overWatchKill(x,y){this.burst(x,y,35,[[255,106,0],[255,200,0],[224,0,60],[255,255,255]],{maxSpd:250,life:0.7,size:3,sizeVar:3});}
  completeKill(x,y){this.burst(x,y,40,[[224,0,60],[255,106,0],[255,255,255],[255,220,0]],{maxSpd:280,life:0.8,size:3,sizeVar:4});}
  pangeaFreeze(x,y){this.burst(x,y,15,[[0,229,255],[0,150,255],[200,240,255]],{maxSpd:80,life:0.6,size:3});}
  femReveal(x,y){this.burst(x,y,18,[[0,255,208],[0,200,180],[255,255,255]],{maxSpd:100,life:0.5,size:2});}
  corruptBlock(x,y){this.burst(x,y,20,[[224,0,60],[255,50,50],[180,0,30],[255,255,255]],{maxSpd:120,life:0.5,size:2});}
  phaseTransition(x,y){this.burst(x,y,50,[[170,0,255],[255,0,204],[255,255,255],[224,0,60]],{maxSpd:280,life:0.8,size:3,sizeVar:4});}
  update(dt){
    for(let i=this.#list.length-1;i>=0;i--){
      const p=this.#list[i];p.life+=dt;
      if(p.life>=p.maxLife){this.#pool.release(p);this.#list.splice(i,1);continue;}
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=85*dt;p.vx*=0.98;
    }
  }
  draw(ctx){
    for(const p of this.#list){
      const t=1-p.life/p.maxLife;
      ctx.globalAlpha=t*0.88;
      ctx.fillStyle=`rgb(${p.r},${p.g},${p.b})`;
      ctx.beginPath();ctx.arc(p.x,p.y,Math.max(0.5,p.size*t),0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
  }
}

// ─── FLOAT TEXT ──────────────────────────────────────────────────
class FloatText{
  #list=[];
  spawn(x,y,text,color=CS.YELLOW,size=18){
    this.#list.push({x,y,vy:-58,life:0,maxLife:1.3,text,color,size});
  }
  update(dt){
    for(let i=this.#list.length-1;i>=0;i--){
      const f=this.#list[i];f.life+=dt;f.y+=f.vy*dt;f.vy+=18*dt;
      if(f.life>f.maxLife)this.#list.splice(i,1);
    }
  }
  draw(ctx){
    for(const f of this.#list){
      const t=1-f.life/f.maxLife;
      ctx.globalAlpha=Math.min(1,t*1.8);
      ctx.font=`bold ${f.size}px 'Courier New',monospace`;
      ctx.textAlign="center";
      ctx.fillStyle=f.color;ctx.shadowColor=f.color;ctx.shadowBlur=10;
      ctx.fillText(f.text,f.x,f.y);ctx.shadowBlur=0;
    }
    ctx.globalAlpha=1;ctx.textAlign="left";
  }
}

// ─── SCREEN FX ───────────────────────────────────────────────────
class ScreenFX{
  #trauma=0;#ox=0;#oy=0;
  #flash={a:0,r:255,g:255,b:255};
  #chroma=0;#scan=0;#warp=[];
  shake(v){this.#trauma=Math.min(1,this.#trauma+v);}
  flash(r=255,g=255,b=255,a=0.7){Object.assign(this.#flash,{r,g,b,a});}
  chroma(v=0.025){this.#chroma=v;}
  get chromaAmt(){return this.#chroma;}
  startWarp(w,h){
    this.#warp=Array.from({length:90},()=>({
      x:Math.random()*w,y:Math.random()*h,
      vx:(Math.random()-0.5)*900,vy:(Math.random()-0.5)*900,
      life:0,maxLife:0.5+Math.random()*0.4,
    }));
  }
  update(dt){
    this.#trauma=Math.max(0,this.#trauma-dt*2.2);
    const s=this.#trauma**2;
    this.#ox=(Math.random()*2-1)*s*15;this.#oy=(Math.random()*2-1)*s*15;
    this.#flash.a=Math.max(0,this.#flash.a-dt*3);
    this.#chroma=Math.max(0,this.#chroma-dt*0.12);
    this.#scan=(this.#scan+dt*44)%4;
    for(let i=this.#warp.length-1;i>=0;i--){
      const p=this.#warp[i];p.life+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(p.life>p.maxLife)this.#warp.splice(i,1);
    }
  }
  applyShake(ctx){ctx.save();ctx.translate(this.#ox,this.#oy);}
  restoreShake(ctx){ctx.restore();}
  drawPost(ctx,w,h){
    if(this.#flash.a>0.005){
      ctx.globalAlpha=this.#flash.a;
      ctx.fillStyle=`rgb(${this.#flash.r},${this.#flash.g},${this.#flash.b})`;
      ctx.fillRect(0,0,w,h);ctx.globalAlpha=1;
    }
    ctx.fillStyle="rgba(0,0,0,0.16)";
    for(let y=(this.#scan|0);y<h;y+=4)ctx.fillRect(0,y,w,1);
    const vig=ctx.createRadialGradient(w/2,h/2,h*0.28,w/2,h/2,h*0.82);
    vig.addColorStop(0,"rgba(0,0,0,0)");vig.addColorStop(1,"rgba(4,1,12,0.72)");
    ctx.fillStyle=vig;ctx.fillRect(0,0,w,h);
    if(this.#warp.length){
      ctx.save();
      for(const p of this.#warp){
        const t=1-p.life/p.maxLife;
        ctx.globalAlpha=t*0.85;ctx.strokeStyle=CS.WHITE;ctx.lineWidth=1.5;
        ctx.beginPath();
        ctx.moveTo(p.x-p.vx*0.03,p.y-p.vy*0.03);
        ctx.lineTo(p.x,p.y);ctx.stroke();
      }
      ctx.globalAlpha=1;ctx.restore();
    }
  }
}

// ─── STARFIELD ───────────────────────────────────────────────────
class Starfield{
  #layers;#hexes;
  constructor(w,h){
    this.#layers=[
      this.#make(90,w,h,0.4,1,"rgba(255,255,255,0.30)"),
      this.#make(50,w,h,1.1,1.5,"rgba(255,255,255,0.50)"),
      this.#make(18,w,h,2.6,2,"rgba(0,200,255,0.70)"),
    ];
    this.#hexes=Array.from({length:24},()=>({
      x:Math.random()*w,y:Math.random()*h,
      phase:Math.random()*Math.PI*2,r:2+Math.random()*4,
    }));
  }
  #make(n,w,h,spd,sz,col){
    return{spd,sz,col,w,h,stars:Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*h}))};
  }
  update(dt){
    for(const l of this.#layers)
      for(const s of l.stars){
        s.y+=l.spd*dt*60;
        if(s.y>l.h){s.y=0;s.x=Math.random()*l.w;}
      }
  }
  draw(ctx){
    for(const l of this.#layers){
      ctx.fillStyle=l.col;
      for(const s of l.stars)ctx.fillRect(s.x,s.y,l.sz,l.sz);
    }
    const now=performance.now()*0.001;
    for(const h of this.#hexes){
      const a=0.05+Math.sin(h.phase+now)*0.04;
      ctx.save();ctx.strokeStyle=`rgba(224,0,60,${a})`;ctx.lineWidth=1;
      ctx.beginPath();
      for(let i=0;i<6;i++){
        const ang=i*Math.PI/3;
        i===0
          ?ctx.moveTo(h.x+h.r*Math.cos(ang),h.y+h.r*Math.sin(ang))
          :ctx.lineTo(h.x+h.r*Math.cos(ang),h.y+h.r*Math.sin(ang));
      }
      ctx.closePath();ctx.stroke();ctx.restore();
    }
  }
}

// ─── INPUT ───────────────────────────────────────────────────────
class Input{
  #down=new Set();#pressed=new Set();
  constructor(){
    window.addEventListener("keydown",e=>{
      if(!this.#down.has(e.key))this.#pressed.add(e.key);
      this.#down.add(e.key);
      if([" ","ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key))
        e.preventDefault();
    });
    window.addEventListener("keyup",e=>this.#down.delete(e.key));
  }
  isDown(k){return this.#down.has(k);}
  consume(k){const had=this.#pressed.has(k)||this.#down.has(k);this.#pressed.delete(k);return had;}
  consumePressed(k){const had=this.#pressed.has(k);this.#pressed.delete(k);return had;}
  flushAll(){this.#pressed.clear();this.#down.clear();}
}

// ─── MODULE NOTIFICATION ─────────────────────────────────────────
class ModuleNotification{
  #queue=[];#current=null;#t=0;
  static SHOW=3.2;
  push(mod,isBonus=false){this.#queue.push({mod,isBonus});}
  update(dt){
    if(this.#current){
      this.#t+=dt;
      if(this.#t>ModuleNotification.SHOW){this.#current=null;this.#t=0;}
    }
    if(!this.#current&&this.#queue.length){this.#current=this.#queue.shift();this.#t=0;}
  }
  draw(ctx,w){
    if(!this.#current)return;
    const {mod,isBonus}=this.#current;
    const dur=ModuleNotification.SHOW,t=this.#t;
    const CW=290,CH=112,cy=96;let sx;
    const si=0.22,so=dur-0.28;
    if(t<si)sx=w+(1-t/si)*(CW+20);
    else if(t>so)sx=w-CW+((t-so)/0.28)*(CW+20);
    else sx=w-CW-8;
    ctx.save();
    const borderCol=isBonus?CS.GOLD:mod.color;
    ctx.shadowColor=borderCol;ctx.shadowBlur=16;
    ctx.fillStyle="rgba(4,1,18,0.96)";ctx.strokeStyle=borderCol;ctx.lineWidth=isBonus?2.5:1.6;
    ctx.beginPath();ctx.roundRect(sx,cy,CW,CH,6);ctx.fill();ctx.stroke();
    ctx.shadowBlur=0;ctx.fillStyle=isBonus?CS.GOLD:mod.color;
    ctx.beginPath();ctx.roundRect(sx,cy,CW,24,[6,6,0,0]);ctx.fill();
    ctx.font="bold 9px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.textAlign="left";
    ctx.fillText(isBonus?"✨ ALLY ASSIST — BONUS MODULE":"🦅 MODULE ACTIVATED",sx+8,cy+16);
    ctx.font="bold 12px 'Courier New'";ctx.fillStyle=isBonus?CS.GOLD:mod.color;
    ctx.shadowColor=isBonus?CS.GOLD:mod.color;ctx.shadowBlur=7;
    ctx.fillText(`${mod.emoji}  ${mod.name}`,sx+8,cy+44);
    ctx.font="10px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText(mod.tagline,sx+8,cy+58);
    ctx.font="8px 'Courier New'";ctx.fillStyle=CS.WHITE;
    const words=mod.mechanic.split(" ");let line="",ly=cy+72;
    for(const word of words){
      const test=line+word+" ";
      if(ctx.measureText(test).width>CW-14&&line!==""){
        ctx.fillText(line,sx+8,ly);line=word+" ";ly+=11;
      }else line=test;
    }
    ctx.fillText(line,sx+8,ly);
    ctx.textAlign="left";ctx.shadowBlur=0;ctx.restore();
  }
}

// ─── BONUS MODULE DROP ───────────────────────────────────────────
// A random ally module that descends from the top of the screen
// independently of enemy kills. Excluded in first 2 waves.
class BonusModuleDrop{
  #x=0;#y=0;#vy=40;#alive=false;#mod=null;#life=0;#maxLife=13;
  #w=36;#h=36;
  spawn(phase,waveIdx){
    if(waveIdx<2)return; // grace period — no bonus in early waves
    // Pick any safe module (never nuclear in early, anything later)
    const pool=MODULE_POOL.filter(m=>
      m.id!=="OVERWATCH" // overwatch has its own special sequence
    );
    this.#mod=pool[Math.floor(Math.random()*pool.length)];
    this.#x=60+Math.random()*(canvas.width-120);
    this.#y=-this.#h-10;
    this.#vy=38+Math.random()*18;
    this.#alive=true;
    this.#life=0;
  }
  get alive(){return this.#alive;}
  get mod(){return this.#mod;}
  get x(){return this.#x-this.#w/2;}
  get y(){return this.#y;}
  get w(){return this.#w;}
  get h(){return this.#h;}
  update(dt){
    if(!this.#alive)return;
    this.#y+=this.#vy*dt;
    this.#life+=dt;
    if(this.#y>canvas.height+20||this.#life>this.#maxLife)this.#alive=false;
  }
  collect(){this.#alive=false;}
  draw(ctx){
    if(!this.#alive||!this.#mod)return;
    const now=performance.now();
    const pulse=0.7+Math.sin(now*0.007)*0.3;
    const fade=Math.min(1,1-this.#life/this.#maxLife*0.4);
    ctx.save();ctx.globalAlpha=fade*pulse;
    // golden outer ring — signals this is special
    ctx.shadowColor=CS.GOLD;ctx.shadowBlur=18*pulse;
    ctx.strokeStyle=CS.GOLD;ctx.lineWidth=2.2;
    ctx.fillStyle="rgba(4,1,18,0.92)";
    ctx.beginPath();ctx.roundRect(this.#x-this.#w/2,this.#y,this.#w,this.#h,5);
    ctx.fill();ctx.stroke();
    // inner mod colour ring
    ctx.strokeStyle=this.#mod.color;ctx.lineWidth=1;ctx.shadowBlur=8;
    ctx.beginPath();ctx.roundRect(this.#x-this.#w/2+3,this.#y+3,this.#w-6,this.#h-6,3);
    ctx.stroke();
    // emoji
    ctx.font="18px serif";ctx.textAlign="center";ctx.shadowBlur=0;
    ctx.fillText(this.#mod.emoji,this.#x,this.#y+this.#h*0.74);
    // "ALLY" label
    ctx.font="bold 6px 'Courier New'";ctx.fillStyle=CS.GOLD;
    ctx.shadowColor=CS.GOLD;ctx.shadowBlur=6;
    ctx.fillText("ALLY",this.#x,this.#y-3);
    ctx.restore();
  }
}

// ─── OVERWATCH SYSTEM ────────────────────────────────────────────
class OverWatchSystem{
  #active=false;#phase=0;#t=0;#targets=[];#onKill=null;
  activate(attackers,cols,rows,onKill){
    this.#active=true;this.#phase=0;this.#t=0;this.#onKill=onKill;
    const alive=[];
    for(let r=rows-1;r>=0;r--)
      for(let c=0;c<cols;c++){
        const a=attackers[c]?.[r];
        if(a?.alive)alive.push(a);
        if(alive.length>=3)break;
      }
    this.#targets=alive.map(a=>({a,locked:false,fired:false}));
  }
  get isActive(){return this.#active;}
  update(dt){
    if(!this.#active)return;this.#t+=dt;
    if(this.#phase===0&&this.#t>1.0){this.#phase=1;this.#t=0;}
    if(this.#phase===1&&this.#t>1.4){this.#phase=2;this.#t=0;}
    if(this.#phase===2){
      this.#targets.forEach((tg,i)=>{
        if(!tg.fired&&this.#t>i*0.4+0.1){
          tg.fired=true;
          if(tg.a.alive){tg.a.alive=false;this.#onKill?.(tg.a);}
        }
      });
      if(this.#t>this.#targets.length*0.4+0.6){this.#phase=3;this.#t=0;}
    }
    if(this.#phase===3&&this.#t>1.2)this.#active=false;
  }
  draw(ctx){
    if(!this.#active)return;
    const now=performance.now();
    if(this.#phase<=2){
      ctx.save();ctx.fillStyle="rgba(0,0,0,0.55)";ctx.fillRect(0,0,canvas.width,52);
      ctx.font="bold 14px 'Courier New'";ctx.textAlign="center";
      ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=16;
      ctx.fillText(
        this.#phase===0?"👁️  FALCON OVERWATCH — SCANNING THREAT LANDSCAPE…":
        this.#phase===1?"👁️  FALCON OVERWATCH — HIGH-VALUE TARGETS ACQUIRED":
        "👁️  FALCON OVERWATCH — NEUTRALIZATION IN PROGRESS",
        canvas.width/2,32);
      ctx.restore();
    }
    for(const tg of this.#targets){
      if(!tg.a.alive&&tg.fired)continue;
      const x=tg.a.x+CFG.ATK_W/2,y=tg.a.y+CFG.ATK_H/2;
      const pulse=Math.sin(now*0.008)*0.4+0.6;
      const r=this.#phase===1?20:26+Math.sin(now*0.01)*4;
      ctx.save();ctx.strokeStyle=CS.ORANGE;ctx.lineWidth=2;
      ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=12*pulse;ctx.globalAlpha=0.9;
      const rot=now*0.003*(this.#phase===1?2:1);
      ctx.translate(x,y);ctx.rotate(rot);
      ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
      [0,Math.PI/2,Math.PI,Math.PI*3/2].forEach(a=>{
        ctx.beginPath();
        ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);
        ctx.lineTo(Math.cos(a)*(r+8),Math.sin(a)*(r+8));
        ctx.stroke();
      });
      ctx.rotate(-rot);ctx.globalAlpha=0.35;
      ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(r,0);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(0,r);ctx.stroke();
      if(this.#phase>=1){
        ctx.globalAlpha=1;ctx.font="bold 8px 'Courier New'";
        ctx.textAlign="center";ctx.fillStyle=CS.ORANGE;ctx.shadowBlur=6;
        ctx.fillText("LOCKED",0,r+16);
      }
      ctx.restore();
    }
    if(this.#phase===2){
      for(const tg of this.#targets){
        if(!tg.fired)continue;
        const x=tg.a.x+CFG.ATK_W/2,y=tg.a.y+CFG.ATK_H/2;
        const age=this.#t-this.#targets.indexOf(tg)*0.4;
        if(age<0||age>0.4)continue;
        const prog=1-age/0.4;
        ctx.save();ctx.globalAlpha=prog*0.9;ctx.strokeStyle=CS.ORANGE;
        ctx.lineWidth=3*prog;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=22;
        ctx.beginPath();ctx.moveTo(canvas.width/2,0);ctx.lineTo(x,y);ctx.stroke();
        ctx.restore();
      }
    }
    if(this.#phase===3){
      const a=Math.max(0,1-this.#t/0.9);
      ctx.save();ctx.globalAlpha=a;ctx.textAlign="center";
      ctx.font="bold 17px 'Courier New'";
      ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=20;
      ctx.fillText("✅  THREATS ELIMINATED — OVERWATCH STANDS DOWN",canvas.width/2,canvas.height/2-30);
      ctx.restore();
    }
  }
}

// ─── FALCON COMPLETE SYSTEM ──────────────────────────────────────
class FalconCompleteSystem{
  #active=false;#phase=0;#t=0;#tagged=[];#onKill=null;
  #killIdx=0;#total=0;#isBossWave=false;

  activate(attackers,cols,rows,onKill,isBossWave=false){
    this.#active=true;this.#phase=0;this.#t=0;
    this.#onKill=onKill;this.#killIdx=0;this.#tagged=[];
    this.#isBossWave=isBossWave;
    for(let c=0;c<cols;c++)
      for(let r=0;r<rows;r++){
        const a=attackers[c]?.[r];if(a?.alive)this.#tagged.push(a);
      }
    this.#total=this.#tagged.length;
  }

  get isActive(){return this.#active;}

  update(dt){
    if(!this.#active)return;this.#t+=dt;
    if(this.#phase===0&&this.#t>1.6){this.#phase=1;this.#t=0;}
    if(this.#phase===1){
      const kps=Math.max(8,this.#total/1.8),exp=Math.floor(this.#t*kps);
      while(this.#killIdx<exp&&this.#killIdx<this.#tagged.length){
        const a=this.#tagged[this.#killIdx];
        if(a.alive){a.alive=false;this.#onKill?.(a,this.#killIdx);}
        this.#killIdx++;
      }
      if(this.#killIdx>=this.#tagged.length&&this.#t>0.5){this.#phase=2;this.#t=0;}
    }
    if(this.#phase===2&&this.#t>2.8)this.#active=false;
  }

  draw(ctx,w,h){
    if(!this.#active)return;
    const oa=this.#phase===0?Math.min(0.88,this.#t/0.5)*0.88:0.88;
    ctx.fillStyle=`rgba(4,1,12,${oa})`;ctx.fillRect(0,0,w,h);
    ctx.fillStyle=CS.RED;ctx.fillRect(0,0,w,3);ctx.fillRect(0,h-3,w,3);
    if(this.#phase===0){
      ctx.save();ctx.textAlign="center";
      ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
      ctx.fillText("INCOMING TRANSMISSION — CROWDSTRIKE SOC OPS",w/2,h*0.26);
      ctx.font="bold 38px 'Courier New'";ctx.fillStyle=CS.RED;
      ctx.shadowColor=CS.RED;ctx.shadowBlur=32;
      ctx.fillText("🦅 FALCON COMPLETE",w/2,h*0.40);
      ctx.font="bold 15px 'Courier New'";ctx.fillStyle=CS.ORANGE;
      ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=12;
      ctx.fillText(
        this.#isBossWave
          ?"MANAGED DETECTION & RESPONSE — DIRECT ENGAGEMENT"
          :"MANAGED DETECTION & RESPONSE — ACTIVATED",
        w/2,h*0.50);
      ctx.font="12px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
      ctx.fillText(
        this.#isBossWave
          ?"SOC analysts are engaging the primary threat directly."
          :"Our SOC team has assumed control of the incident.",
        w/2,h*0.59);
      const bW=300,bH=8,bx=(w-bW)/2,by=h*0.70,prog=Math.min(1,this.#t/1.5);
      ctx.fillStyle="#1a1a2e";ctx.fillRect(bx,by,bW,bH);
      ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=10;
      ctx.fillRect(bx,by,bW*prog,bH);
      ctx.font="9px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
      ctx.fillText(`DEPLOYING… ${Math.round(prog*100)}%`,w/2,by+22);
      ctx.restore();
    }
    if(this.#phase===1){
      ctx.save();ctx.textAlign="center";
      ctx.font="bold 24px 'Courier New'";ctx.fillStyle=CS.RED;
      ctx.shadowColor=CS.RED;ctx.shadowBlur=20;
      ctx.fillText("🦅 FALCON COMPLETE — ACTIVE",w/2,h*0.20);
      ctx.font="12px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
      ctx.fillText(
        this.#isBossWave
          ?"SOC ANALYSTS ENGAGING PRIMARY THREAT"
          :"SOC ANALYSTS NEUTRALIZING ACTIVE THREATS",
        w/2,h*0.29);
      if(this.#total>0){
        ctx.font="bold 17px 'Courier New'";ctx.fillStyle=CS.ORANGE;
        ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=10;
        ctx.fillText(`CONTAINED: ${this.#killIdx} / ${this.#total}`,w/2,h*0.38);
      }
      if(this.#isBossWave){
        ctx.font="bold 13px 'Courier New'";ctx.fillStyle=CS.RED;
        ctx.shadowColor=CS.RED;ctx.shadowBlur=12;
        ctx.fillText("⚔️ BOSS HP REDUCED 40% — FINISH THE FIGHT",w/2,h*0.48);
      }
      ctx.restore();
    }
    if(this.#phase===2){
      const fi=Math.min(1,this.#t/0.4);
      ctx.save();ctx.globalAlpha=fi;ctx.textAlign="center";
      ctx.font="bold 38px 'Courier New'";ctx.fillStyle=CS.GREEN;
      ctx.shadowColor=CS.GREEN;ctx.shadowBlur=26;
      ctx.fillText(
        this.#isBossWave?"⚔️ MDR STRIKE DELIVERED":"✅ BREACH CONTAINED",
        w/2,h*0.32);
      ctx.font="13px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
      ctx.fillText(
        this.#isBossWave
          ?"Boss HP reduced. SOC team standing by — complete the engagement."
          :"CrowdStrike Falcon Complete neutralized all active threats.",
        w/2,h*0.44);
      ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.RED;
      ctx.shadowColor=CS.RED;ctx.shadowBlur=10;
      ctx.fillText("🦅  crowdstrike.com  |  We Stop Breaches — Guaranteed.",w/2,h*0.60);
      ctx.restore();
    }
  }
}

// ─── CHARLOTTE AI ────────────────────────────────────────────────
class CharlotteAI{
  #active=false;#t=0;#targets=[];#killIdx=0;#onKill=null;
  activate(attackers,cols,rows,onKill){
    this.#active=true;this.#t=0;this.#killIdx=0;this.#onKill=onKill;
    const alive=[];
    for(let c=0;c<cols;c++)
      for(let r=0;r<rows;r++){
        const a=attackers[c]?.[r];if(a?.alive)alive.push(a);
      }
    alive.sort((a,b)=>b.y-a.y);
    this.#targets=alive.slice(0,5);
  }
  get isActive(){return this.#active;}
  update(dt){
    if(!this.#active)return;this.#t+=dt;
    const exp=Math.floor(this.#t/0.18);
    while(this.#killIdx<exp&&this.#killIdx<this.#targets.length){
      const a=this.#targets[this.#killIdx];
      if(a.alive){a.alive=false;this.#onKill?.(a);}
      this.#killIdx++;
    }
    if(this.#killIdx>=this.#targets.length&&this.#t>0.3)this.#active=false;
  }
  draw(ctx){
    if(!this.#active)return;
    for(let i=0;i<this.#killIdx;i++){
      const a=this.#targets[i];
      const x=a.x+CFG.ATK_W/2,y=a.y+CFG.ATK_H/2;
      const age=this.#t-i*0.18;if(age>0.35)continue;
      const prog=1-age/0.35;
      ctx.save();ctx.globalAlpha=prog*0.9;ctx.strokeStyle=CS.GREEN;ctx.lineWidth=2;
      ctx.shadowColor=CS.GREEN;ctx.shadowBlur=16;
      ctx.beginPath();
      ctx.moveTo(canvas.width/2,canvas.height/2);ctx.lineTo(x,y);ctx.stroke();
      ctx.font="bold 8px 'Courier New'";ctx.textAlign="center";
      ctx.fillStyle=CS.GREEN;ctx.fillText("AI NEUTRALIZED",x,y-12);
      ctx.restore();
    }
  }
}

// ─── BLOCK ───────────────────────────────────────────────────────
class Block{
  constructor(x,y,toolIndex,startCorrupted=false){
    this.x=x;this.y=y;this.w=CFG.BLK_W;this.h=CFG.BLK_H;
    this.strength=CFG.BLK_STRENGTH;
    this.tool=LEGACY_TOOLS[toolIndex%LEGACY_TOOLS.length];
    this.flashT=0;this.particles=[];
    this.corrupted=startCorrupted;
    this.corruptT=startCorrupted?Math.random()*3:0;
    this.corruptFireInterval=3.5+Math.random()*2;
    this.pendingFire=false;
  }
  hit(extra=0){
    this.strength=Math.max(0,this.strength-1-extra);
    this.flashT=0.18;
    if(this.strength===0)this.#spawnDebris();
  }
  corrupt(){
    if(!this.corrupted){
      this.corrupted=true;this.corruptT=0;
      this.corruptFireInterval=3.5+Math.random()*2;
      this.flashT=0.5;
    }
  }
  updateCorrupt(dt){
    if(!this.corrupted||!this.alive)return false;
    this.corruptT+=dt;
    if(this.corruptT>=this.corruptFireInterval){
      this.corruptT=0;
      this.corruptFireInterval=3.0+Math.random()*2.5;
      return true;
    }
    return false;
  }
  #spawnDebris(){
    for(let i=0;i<12;i++){
      const ang=Math.random()*Math.PI*2,spd=20+Math.random()*60;
      this.particles.push({
        x:this.x+this.w/2,y:this.y+this.h/2,
        vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,
        life:0,maxLife:0.6+Math.random()*0.4,size:1+Math.random()*3,
      });
    }
  }
  get alive(){return this.strength>0;}
  update(dt){
    if(this.flashT>0)this.flashT=Math.max(0,this.flashT-dt);
    for(let i=this.particles.length-1;i>=0;i--){
      const p=this.particles[i];p.life+=dt;
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=40*dt;
      if(p.life>p.maxLife)this.particles.splice(i,1);
    }
  }
  draw(ctx){
    for(const p of this.particles){
      const t=1-p.life/p.maxLife;ctx.globalAlpha=t*0.8;
      ctx.fillStyle=this.corrupted?CS.RED:this.tool.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*t,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;if(!this.alive)return;
    const t=this.strength/CFG.BLK_STRENGTH,now=performance.now();
    ctx.save();
    if(this.flashT>0)ctx.globalAlpha=0.5+this.flashT*2;
    const drawColor=this.corrupted?CS.RED:this.tool.color;
    ctx.fillStyle=`rgba(4,1,18,${0.7+t*0.2})`;
    ctx.strokeStyle=drawColor;ctx.lineWidth=this.corrupted?2:1.5;
    ctx.shadowColor=drawColor;
    ctx.shadowBlur=this.corrupted?14+Math.sin(now*0.01)*6:6+Math.sin(now*0.003+this.x)*3;
    ctx.beginPath();ctx.roundRect(this.x,this.y,this.w,this.h,3);ctx.fill();ctx.stroke();
    if(this.corrupted){
      const cp=0.15+Math.sin(now*0.008)*0.1;
      ctx.fillStyle=`rgba(224,0,60,${cp})`;
      ctx.fillRect(this.x+1,this.y+1,this.w-2,this.h-2);
    }
    ctx.fillStyle=drawColor;ctx.globalAlpha=(0.2+t*0.3);ctx.shadowBlur=0;
    ctx.fillRect(this.x+1,this.y+this.h-3,(this.w-2)*t,2);
    ctx.globalAlpha=1;
    const nl=this.tool.name.length;
    ctx.font=`bold ${nl>7?7:nl>5?8:9}px 'Courier New'`;ctx.textAlign="center";
    ctx.fillStyle=drawColor;ctx.shadowColor=drawColor;ctx.shadowBlur=t>0.5?8:4;
    ctx.fillText(this.corrupted?"CORRUPTED":this.tool.name,this.x+this.w/2,this.y+this.h*0.65);
    if(this.strength<CFG.BLK_STRENGTH&&!this.corrupted){
      ctx.globalAlpha=(1-t)*0.65;
      ctx.strokeStyle=`rgba(255,255,255,${(1-t)*0.5})`;ctx.lineWidth=0.8;ctx.shadowBlur=0;
      const seed=this.x+this.y,cracks=CFG.BLK_STRENGTH-this.strength;
      for(let c=0;c<cracks;c++){
        const sx=this.x+(((seed*3+c*7)%10)/10)*this.w;
        const sy=this.y+(((seed*5+c*3)%8)/8)*this.h;
        ctx.beginPath();
        ctx.moveTo(sx,sy);
        ctx.lineTo(sx+(((seed+c)%5)-2)*8,sy+(((seed*2+c)%5)-1)*6);
        ctx.stroke();
      }
    }
    if(this.strength===1){
      const warn=Math.sin(now*0.012)*0.4+0.6;
      ctx.strokeStyle=`rgba(255,50,50,${warn*0.8})`;ctx.lineWidth=2;
      ctx.shadowColor="#FF1744";ctx.shadowBlur=10*warn;
      ctx.beginPath();ctx.roundRect(this.x-1,this.y-1,this.w+2,this.h+2,3);ctx.stroke();
    }
    ctx.shadowBlur=0;ctx.restore();
  }
  getFailMsg(){return this.tool.failMsg;}
  getShortMsg(){return this.tool.shortMsg;}
  getColor(){return this.tool.color;}
}

// ─── POWER-UP ────────────────────────────────────────────────────
class PowerUp{
  constructor(x,y,phase,waveIdx,forceFake=false){
    this.x=x-13;this.y=y;this.w=28;this.h=28;
    this.vy=52;this.life=0;this.maxLife=11;this.alive=true;
    // Exclude nuclear modules from drops in first 2 waves
    const excludeNuclear = waveIdx < 2;
    const mid=pickModuleForPhase(phase, excludeNuclear);
    this.mod=MODULES[mid]??MODULES.PREVENT;
    this.isFake=forceFake||(phase.behavior?.fakeDrops===true&&Math.random()<0.35);
    if(this.isFake){
      const decoys=["IDENTITY","PREVENT","CHARLOTTE","COMPLETE","OVERWATCH"];
      const decoyId=decoys[Math.floor(Math.random()*decoys.length)];
      this.decoyMod=MODULES[decoyId]??MODULES.PREVENT;
    }
  }
  update(dt){
    this.y+=this.vy*dt;this.life+=dt;
    if(this.y>canvas.height||this.life>this.maxLife)this.alive=false;
  }
  draw(ctx){
    if(!this.alive)return;
    const displayMod=this.isFake?this.decoyMod:this.mod;
    const fade=Math.min(1,1-this.life/this.maxLife*0.5);
    const pulse=0.75+Math.sin(performance.now()*0.006)*0.25;
    const now=performance.now();
    ctx.save();ctx.globalAlpha=fade*pulse;
    ctx.fillStyle="rgba(4,1,18,0.88)";
    const borderCol=this.isFake
      ?`hsl(${350+Math.sin(now*0.008)*20},90%,${50+Math.sin(now*0.012)*10}%)`
      :displayMod.color;
    ctx.strokeStyle=borderCol;ctx.lineWidth=1.6;
    ctx.shadowColor=borderCol;ctx.shadowBlur=12*pulse;
    ctx.beginPath();ctx.roundRect(this.x,this.y,this.w,this.h,4);ctx.fill();ctx.stroke();
    ctx.font="15px serif";ctx.textAlign="center";ctx.shadowBlur=0;
    ctx.fillText(displayMod.emoji,this.x+this.w/2,this.y+this.h*0.78);
    if(this.isFake){
      ctx.font="bold 7px 'Courier New'";ctx.fillStyle="rgba(255,100,100,0.7)";
      ctx.fillText("?",this.x+this.w-4,this.y+6);
    }
    ctx.restore();
  }
}

// ─── UFO ─────────────────────────────────────────────────────────
class UFO{
  constructor(w){
    this.dir=Math.random()<0.5?1:-1;
    this.x=this.dir>0?-CFG.UFO_W:w+CFG.UFO_W;
    this.y=58;this.w=CFG.UFO_W;this.h=CFG.UFO_H;
    this.alive=true;this.beepT=0;
    const types=["APT","RANSOMWARE","eCRIME","NATION-STATE","AI THREAT"];
    this.label=types[Math.floor(Math.random()*types.length)];
    this.pts=CFG.SCORE_UFO[Math.floor(Math.random()*CFG.SCORE_UFO.length)];
  }
  update(dt,audio){
    this.x+=this.dir*CFG.UFO_SPEED*dt;this.beepT+=dt;
    if(this.beepT>0.45){this.beepT=0;audio.ufoBeep();}
    if(this.x>canvas.width+CFG.UFO_W+20||this.x<-CFG.UFO_W-20)this.alive=false;
  }
  draw(ctx,img){
    if(!this.alive)return;
    const now=performance.now(),pulse=Math.sin(now*0.006)*0.4+0.6;
    ctx.save();ctx.shadowColor=CS.RED;ctx.shadowBlur=18*pulse;
    if(img){ctx.drawImage(img,this.x,this.y,this.w,this.h);}
    else{
      ctx.fillStyle=CS.RED;
      ctx.beginPath();ctx.ellipse(this.x+this.w/2,this.y+this.h*0.65,this.w/2,this.h*0.28,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=CS.ORANGE;
      ctx.beginPath();ctx.ellipse(this.x+this.w/2,this.y+this.h*0.38,this.w*0.28,this.h*0.28,0,0,Math.PI*2);ctx.fill();
    }
    ctx.font="bold 8px 'Courier New'";ctx.textAlign="center";
    ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=8;
    ctx.fillText(`⚠ ${this.label}`,this.x+this.w/2,this.y-5);
    ctx.font="8px 'Courier New'";ctx.fillStyle=CS.YELLOW;ctx.shadowBlur=0;
    ctx.fillText(`${this.pts} PTS`,this.x+this.w/2,this.y+this.h+12);
    ctx.restore();
  }
}

// ─── BOSS ────────────────────────────────────────────────────────
class Boss{
  constructor(wave,phase){
    this.w=CFG.BOSS_W;this.h=CFG.BOSS_H;
    this.x=canvas.width/2-this.w/2;this.y=38;
    this.hp=15+wave*5;this.maxHp=this.hp;
    this.spd=85+wave*12;this.dir=1;this.alive=true;
    this.rage=false;this.shootCd=0;this.glowT=0;
    this.phase=phase;this.imgIdx=Math.floor(Math.random()*CFG.IMAGE_COUNT);
    this.color=phase?.color??CS.RED;
    this.bossPhase=0;
  }
  hit(n=1){
    this.hp-=n;
    if(this.hp<=this.maxHp*0.3)this.rage=true;
    if(this.hp<=0)this.alive=false;
  }
  checkPhaseTransition(){
    if(!this.phase?.behavior?.multiPhase)return -1;
    if(this.hp<=this.maxHp*0.33&&this.bossPhase<2){this.bossPhase=2;return 2;}
    if(this.hp<=this.maxHp*0.66&&this.bossPhase<1){this.bossPhase=1;return 1;}
    return -1;
  }
  update(dt,bullets,pool){
    this.glowT+=dt;
    const speedMult=this.bossPhase===1?1.7:this.bossPhase===2?2.2:1.0;
    this.x+=this.dir*this.spd*speedMult*dt;
    if(this.x+this.w>canvas.width){this.dir=-1;this.x=canvas.width-this.w;}
    if(this.x<0){this.dir=1;this.x=0;}
    this.shootCd-=dt;
    if(this.shootCd<=0){
      const rateBase=this.rage?0.48:1.0;
      const rateMult=this.bossPhase===2?0.6:1.0;
      this.shootCd=rateBase*rateMult;
      const cx=this.bossPhase===1?Math.random()*canvas.width:this.x+this.w/2;
      const angs=this.rage?[-0.5,-0.25,0,0.25,0.5]:[-0.2,0,0.2];
      for(const a of angs){
        bullets.push(pool.acquire({
          x:cx-CFG.BLT_W/2,y:this.y+this.h,
          vx:Math.sin(a)*CFG.ATK_BLT_SPEED*1.3,
          vy:Math.cos(a)*CFG.ATK_BLT_SPEED*1.3,
          w:CFG.BLT_W,h:CFG.BLT_H,boss:true,
          corrupt:this.bossPhase===2,
        }));
      }
    }
  }
  draw(ctx,img){
    if(!this.alive)return;
    const pulse=Math.sin(this.glowT*(this.rage?9:3))*0.5+0.5;
    const stealthAlpha=this.bossPhase===1?0.4+Math.sin(this.glowT*3)*0.2:1;
    ctx.save();ctx.globalAlpha=stealthAlpha;
    ctx.shadowColor=this.rage?CS.RED_GLOW:this.color;ctx.shadowBlur=22+pulse*22;
    if(this.rage){
      ctx.globalAlpha=stealthAlpha*0.22;ctx.fillStyle=CS.RED;
      ctx.fillRect(this.x,this.y,this.w,this.h);ctx.globalAlpha=stealthAlpha;
    }
    if(img)ctx.drawImage(img,this.x,this.y,this.w,this.h);
    else{ctx.fillStyle=this.rage?CS.RED:this.color;ctx.fillRect(this.x,this.y,this.w,this.h);}
    ctx.restore();
    const bw=this.w+20,bh=8,bx=this.x-10,by=this.y-16;
    ctx.fillStyle="#222";ctx.fillRect(bx,by,bw,bh);
    const t=Math.max(0,this.hp/this.maxHp);
    const hc=t>0.66?CS.GREEN:t>0.33?CS.YELLOW:CS.RED_GLOW;
    ctx.save();ctx.fillStyle=hc;ctx.shadowColor=hc;ctx.shadowBlur=7;
    ctx.fillRect(bx,by,bw*t,bh);ctx.restore();
    const phaseLabels=["⚡ THEFT","👻 STEALTH","💀 DESTRUCTION"];
    const phaseLabel=this.phase?.behavior?.multiPhase
      ?` [${phaseLabels[this.bossPhase]}]`
      :this.rage?" [RAGE]":"";
    ctx.save();
    ctx.font=`bold ${this.rage||this.bossPhase>0?13:11}px 'Courier New'`;
    ctx.textAlign="center";
    ctx.fillStyle=this.bossPhase===1?CS.PURPLE:this.bossPhase===2?CS.RED_GLOW:this.color;
    ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=12;
    ctx.fillText(
      `${this.bossPhase===2?"💀":this.bossPhase===1?"👻":"👾"} ${this.phase?.shortName??"BOSS"}${phaseLabel}`,
      this.x+this.w/2,this.y-22);
    ctx.restore();
  }
}

// ─── HUD ─────────────────────────────────────────────────────────
class HUD{
  #s=0;#hi=0;#lives=3;#wave=1;#combo=1;#mods={};#pangeaT=0;#env="";#grace=0;
  setState(s,hi,lives,wave,combo,mods,pangeaT,env,grace){
    this.#s=s;this.#hi=hi;this.#lives=lives;this.#wave=wave;
    this.#combo=combo;this.#mods=mods;this.#pangeaT=pangeaT;
    this.#env=env;this.#grace=grace;
  }
  draw(ctx,w){
    this.#lbl(ctx,`⭐ ${this.#s.toLocaleString()}`,10,28,19,CS.ORANGE);
    this.#lbl(ctx,`🏆 ${this.#hi.toLocaleString()}`,w/2,28,13,CS.YELLOW,"center");
    const hearts="🟥".repeat(Math.max(0,this.#lives))||"💀";
    this.#lbl(ctx,hearts,w-12,28,17,CS.RED,"right");
    this.#lbl(ctx,`WAVE ${this.#wave}`,w-12,46,10,CS.RED,"right");
    if(this.#combo>1)this.#lbl(ctx,`🔥 x${this.#combo} CHAIN`,10,46,12,CS.RED_GLOW);
    if(this.#env){
      ctx.save();ctx.font="bold 8px 'Courier New'";ctx.textAlign="center";
      ctx.fillStyle="rgba(4,1,18,0.7)";ctx.fillRect(w/2-140,54,280,14);
      ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
      ctx.fillText(`DEFENDING: ${this.#env}`,w/2,64);ctx.restore();
    }
    // Grace period indicator — green countdown bar at top
    if(this.#grace>0){
      const prog=this.#grace/CFG.WAVE_GRACE_S;
      ctx.save();
      ctx.fillStyle="rgba(0,229,255,0.12)";ctx.fillRect(0,0,w,3);
      ctx.fillStyle=CS.CYAN;ctx.shadowColor=CS.CYAN;ctx.shadowBlur=6;
      ctx.fillRect(0,0,w*prog,3);
      ctx.font="bold 8px 'Courier New'";ctx.textAlign="center";
      ctx.fillStyle=CS.CYAN;ctx.fillText(`⚡ NETWORK INITIALIZING — ${this.#grace.toFixed(1)}s`,w/2,14);
      ctx.restore();
    }
    let px=10;
    Object.entries(this.#mods).forEach(([id,v])=>{
      if(v<=0)return;const m=MODULES[id];if(!m)return;
      this.#badge(ctx,`${m.emoji}${m.shortName}`,px,80,m.color);
      px+=Math.min(m.shortName.length*8+24,110);
    });
    if(this.#pangeaT>0){
      ctx.save();ctx.font="bold 9px 'Courier New'";ctx.textAlign="left";
      ctx.fillStyle=CS.TEAL;ctx.shadowColor=CS.TEAL;ctx.shadowBlur=8;
      ctx.fillText(`🌍 PANGEA ${this.#pangeaT.toFixed(1)}s`,10,94);ctx.restore();
    }
  }
  #lbl(ctx,txt,x,y,sz,col,align="left"){
    ctx.save();ctx.font=`bold ${sz}px 'Courier New',monospace`;ctx.textAlign=align;
    ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=10;ctx.fillText(txt,x,y);ctx.restore();
  }
  #badge(ctx,txt,x,y,col){
    ctx.save();ctx.font="bold 9px 'Courier New'";ctx.textAlign="left";
    ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=7;ctx.fillText(txt,x,y);ctx.restore();
  }
}

// ─── TITLE SCREEN ────────────────────────────────────────────────
class TitleScreen{
  #t=0;#blink=true;#blinkT=0;
  update(dt){
    this.#t+=dt;this.#blinkT+=dt;
    if(this.#blinkT>0.55){this.#blink=!this.#blink;this.#blinkT=0;}
  }
  draw(ctx,w,h){
    this.#grid(ctx,w,h);
    const t=this.#t,bounce=Math.sin(t*2.1)*5;
    ctx.save();ctx.font="bold 46px 'Courier New',monospace";ctx.textAlign="center";
    const grad=ctx.createLinearGradient(0,0,w,0);
    grad.addColorStop(0,CS.RED);grad.addColorStop(0.45,CS.ORANGE);
    grad.addColorStop(0.7,CS.RED);grad.addColorStop(1,CS.ORANGE);
    ctx.fillStyle=grad;ctx.shadowColor=CS.RED;
    ctx.shadowBlur=26+Math.sin(t*2.5)*8;
    ctx.fillText("FALCON ARCADE DEFENSE",w/2,h*0.16+bounce);
    ctx.font="bold 12px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText("POWERED BY  🦅  CROWDSTRIKE",w/2,h*0.25+bounce*0.5);
    ctx.restore();
    this.#threatPreview(ctx,w,h,t);
    this.#moduleStrip(ctx,w,h);
    this.#controls(ctx,w,h);
    if(this.#blink){
      ctx.save();ctx.font="bold 18px 'Courier New'";ctx.textAlign="center";
      ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=16;
      ctx.fillText("▶  PRESS  SPACE  TO  DEPLOY  ◀",w/2,h*0.83);ctx.restore();
    }
    ctx.save();ctx.font="11px 'Courier New'";ctx.textAlign="center";
    ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=8;
    ctx.fillText(`🏆  BREACH PREVENTION RECORD:  ${(+localStorage.getItem("cs_hi")||0).toLocaleString()}  PTS`,w/2,h*0.91);
    ctx.restore();
  }
  #grid(ctx,w,h){
    ctx.save();ctx.strokeStyle="rgba(224,0,60,0.055)";ctx.lineWidth=1;
    for(let x=0;x<w;x+=50){ctx.beginPath();ctx.moveTo(x,h*0.42);ctx.lineTo(w/2,h*0.9);ctx.stroke();}
    for(let y=0;y<8;y++){const fy=h*0.42+y*(h*0.48/8);ctx.beginPath();ctx.moveTo(0,fy);ctx.lineTo(w,fy);ctx.stroke();}
    ctx.restore();
  }
  #threatPreview(ctx,w,h,t){
    const n=PHASES.length,EW=110,EH=46,gap=9;
    const totalW=n*(EW+gap),speed=38;
    const offset=((t*speed)%totalW),y=h*0.34;
    ctx.save();ctx.textAlign="center";
    ctx.font="bold 9px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText("— KNOWN THREAT ACTORS —",w/2,y-8);
    ctx.beginPath();ctx.rect(0,y-2,w,EH+10);ctx.clip();
    const copies=Math.ceil(w/totalW)+2;
    for(let copy=0;copy<copies;copy++){
      PHASES.forEach((phase,i)=>{
        const x=(copy*totalW)+i*(EW+gap)-offset+(w-totalW)/2;
        if(x+EW<-10||x>w+10)return;
        const bob=Math.sin(t*1.5+i*0.8)*3;
        const isCenter=Math.abs(x+EW/2-w/2)<EW*0.8;
        ctx.save();ctx.globalAlpha=isCenter?1:0.65;
        if(isCenter){
          ctx.translate(x+EW/2,y+bob+EH/2);ctx.scale(1.06,1.06);
          ctx.translate(-(x+EW/2),-(y+bob+EH/2));
        }
        ctx.fillStyle="rgba(4,1,18,0.85)";ctx.strokeStyle=phase.color;
        ctx.lineWidth=isCenter?2:1.5;ctx.shadowColor=phase.color;
        ctx.shadowBlur=isCenter?12:6;
        ctx.beginPath();ctx.roundRect(x,y+bob,EW,EH,4);ctx.fill();ctx.stroke();
        const nl=phase.shortName.length;
        ctx.font=`bold ${nl>12?7:nl>9?8:9}px 'Courier New'`;
        ctx.fillStyle=phase.color;ctx.shadowBlur=isCenter?8:4;
        ctx.fillText(phase.shortName,x+EW/2,y+bob+15);
        ctx.font="7px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
        ctx.fillText(phase.shortNation,x+EW/2,y+bob+27);
        ctx.font="7px 'Courier New'";ctx.fillStyle=CS.LTGREY;
        const vec=phase.vector.length>18?phase.vector.slice(0,16)+"…":phase.vector;
        ctx.fillText(vec,x+EW/2,y+bob+38);
        ctx.restore();
      });
    }
    const fadeW=60;
    const fadeL=ctx.createLinearGradient(0,0,fadeW,0);
    fadeL.addColorStop(0,"rgba(4,1,12,1)");fadeL.addColorStop(1,"rgba(4,1,12,0)");
    ctx.fillStyle=fadeL;ctx.fillRect(0,y-2,fadeW,EH+10);
    const fadeR=ctx.createLinearGradient(w-fadeW,0,w,0);
    fadeR.addColorStop(0,"rgba(4,1,12,0)");fadeR.addColorStop(1,"rgba(4,1,12,1)");
    ctx.fillStyle=fadeR;ctx.fillRect(w-fadeW,y-2,fadeW,EH+10);
    ctx.restore();
  }
  #moduleStrip(ctx,w,h){
    const mods=Object.values(MODULES);
    const EW=68,EH=42,gap=8,totalW=mods.length*(EW+gap),speed=26;
    const offset=((this.#t*speed)%totalW),y=h*0.56;
    ctx.save();ctx.textAlign="center";
    ctx.font="bold 9px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText("— FALCON MODULES —",w/2,y-8);
    ctx.beginPath();ctx.rect(0,y-2,w,EH+14);ctx.clip();
    const copies=Math.ceil(w/totalW)+2;
    for(let copy=0;copy<copies;copy++){
      mods.forEach((m,i)=>{
        const x=(copy*totalW)+i*(EW+gap)-offset+(w-totalW)/2;
        if(x+EW<-10||x>w+10)return;
        const isCenter=Math.abs(x+EW/2-w/2)<EW*0.8;
        const pulse=0.7+Math.sin(performance.now()*0.002+i*0.7)*0.3;
        ctx.save();ctx.globalAlpha=isCenter?1:0.6;
        if(isCenter){
          ctx.translate(x+EW/2,y+EH/2);ctx.scale(1.08,1.08);
          ctx.translate(-(x+EW/2),-(y+EH/2));
        }
        ctx.fillStyle="rgba(4,1,18,0.82)";ctx.strokeStyle=m.color;
        ctx.lineWidth=isCenter?2:1;ctx.shadowColor=m.color;
        ctx.shadowBlur=isCenter?14:5*pulse;
        ctx.beginPath();ctx.roundRect(x,y,EW,EH,4);ctx.fill();ctx.stroke();
        ctx.font="16px serif";ctx.textAlign="center";ctx.shadowBlur=0;
        ctx.fillText(m.emoji,x+EW/2,y+22);
        ctx.font=`bold ${m.shortName.length>8?6:7}px 'Courier New'`;
        ctx.fillStyle=m.color;
        ctx.shadowColor=isCenter?m.color:"transparent";
        ctx.shadowBlur=isCenter?8:0;
        ctx.fillText(m.shortName,x+EW/2,y+34);
        if(isCenter){
          ctx.font="6px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
          const tag=m.tagline.length>22?m.tagline.slice(0,20)+"…":m.tagline;
          ctx.fillText(tag,x+EW/2,y+EH+10);
        }
        ctx.restore();
      });
    }
    const fadeW=55;
    const fadeL=ctx.createLinearGradient(0,0,fadeW,0);
    fadeL.addColorStop(0,"rgba(4,1,12,1)");fadeL.addColorStop(1,"rgba(4,1,12,0)");
    ctx.fillStyle=fadeL;ctx.fillRect(0,y-2,fadeW,EH+14);
    const fadeR=ctx.createLinearGradient(w-fadeW,0,w,0);
    fadeR.addColorStop(0,"rgba(4,1,12,0)");fadeR.addColorStop(1,"rgba(4,1,12,1)");
    ctx.fillStyle=fadeR;ctx.fillRect(w-fadeW,y-2,fadeW,EH+14);
    ctx.restore();
  }
  #controls(ctx,w,h){
    const rows=[["← →","MOVE"],["SPACE","FIRE / SKIP"],["← → + SPACE","CHOOSE MODULE"]];
    const y=h*0.71;ctx.save();ctx.textAlign="center";
    rows.forEach(([k,v],i)=>{
      const x=w/2+(i-1)*200;
      ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.YELLOW;
      ctx.shadowColor=CS.YELLOW;ctx.shadowBlur=7;ctx.fillText(`[ ${k} ]`,x,y);
      ctx.font="9px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
      ctx.fillText(v,x,y+15);
    });
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN GAME CLASS
// ═══════════════════════════════════════════════════════════════════
class Game{
  #assets    =new AssetManager();
  #audio     =new AudioEngine();
  #parts     =new Particles();
  #fx        =new ScreenFX();
  #stars     =new Starfield(canvas.width,canvas.height);
  #input     =new Input();
  #hud       =new HUD();
  #floats    =new FloatText();
  #title     =new TitleScreen();
  #notify    =new ModuleNotification();
  #overwatch =new OverWatchSystem();
  #fcSystem  =new FalconCompleteSystem();
  #charlotte =new CharlotteAI();
  #socFeed   =new SOCFeed();
  #modChoice =new ModuleChoiceScreen();
  #bltPool   =new Pool(()=>({x:0,y:0,vx:0,vy:0,w:CFG.BLT_W,h:CFG.BLT_H,boss:false,corrupt:false,fromBlock:false}),100);
  #bonusDrop =new BonusModuleDrop();

  #state     =STATE.TITLE;
  #bannerT   =0;#bannerBoss=false;
  #blinkSkip =true;#blinkT=0;

  // ── randomised phase order (set once per playthrough) ──────────
  #phaseOrder=[];
  #waveIdx   =0;

    // ─── KONAMI SETUP ──────────────────────────────────────────────
  #setupKonami(){
    window.addEventListener("keydown", e => {
      this.#konamiBuffer.push(e.key);
      if(this.#konamiBuffer.length > KONAMI_SEQ.length)
        this.#konamiBuffer.shift();
      if(
        this.#konamiBuffer.length === KONAMI_SEQ.length &&
        this.#konamiBuffer.every((k,i) => k === KONAMI_SEQ[i])
      ){
        this.#konamiBuffer = [];
        this.#activateKonami();
      }
    });
  }

  // ─── KONAMI ACTIVATION ─────────────────────────────────────────
  #activateKonami(){
    // Only fire when actually playing, and only once per wave
    if(
      this.#konamiUsed ||
      (this.#state !== STATE.PLAYING && this.#state !== STATE.BOSS)
    ) return;
    this.#konamiUsed  = true;
    this.#konamiPhase = 1;
    this.#konamiT     = 0;
  }

  // ─── KONAMI UPDATE ─────────────────────────────────────────────
  #updateKonami(dt){
    if(this.#konamiPhase === 0) return;
    this.#konamiT += dt;

    // Phase 1 — show radio message, freeze bullets (1.8 s)
    if(this.#konamiPhase === 1){
      // Clear enemy bullets immediately on entry
      if(this.#konamiT < dt * 2){
        this.#aBullets.forEach(b => this.#bltPool.release(b));
        this.#aBullets = [];
        this.#fx.flash(255,215,0,0.5);
        this.#audio.bonusModule();
      }
      if(this.#konamiT >= 1.8){ this.#konamiPhase = 2; this.#konamiT = 0; }
    }

    // Phase 2 — nuke all adversaries with staggered explosions (1.5 s)
    if(this.#konamiPhase === 2){
      if(this.#konamiT < dt * 2){
        // Boss gets nuked too
        if(this.#boss?.alive){
          this.#boss.hp = 0;
          this.#boss.alive = false;
          this.#parts.bossExplode(
            this.#boss.x + this.#boss.w/2,
            this.#boss.y + this.#boss.h/2
          );
          const bpts = CFG.SCORE_BOSS * this.#combo;
          this.#addScore(bpts,
            this.#boss.x + this.#boss.w/2, this.#boss.y,
            `💀 MARQUINHOS +${bpts}`);
        }
        // Nuke all grid enemies
        let delay = 0;
        for(let c = 0; c < CFG.COLS; c++)
          for(let r = 0; r < CFG.ROWS; r++){
            const a = this.#attackers[c]?.[r];
            if(!a?.alive) continue;
            const ac = a, rc = r, tok = this.#cloudCancelToken;
            setTimeout(() => {
              if(this.#cloudCancelToken !== tok) return;
              if(!ac.alive) return;
              ac.alive = false;
              this.#parts.bossExplode(ac.x + CFG.ATK_W/2, ac.y + CFG.ATK_H/2);
              const pts = CFG.SCORE_ROW[rc] * this.#combo * 3;
              this.#addScore(pts, ac.x + CFG.ATK_W/2, ac.y,
                `💀 NUKED +${pts}`);
              this.#audio.boom();
            }, delay);
            delay += 60;
          }
        // Nuke side enemies
        this.#sideEnemies.forEach((e,i) => {
          const ec = e, tok = this.#cloudCancelToken;
          setTimeout(() => {
            if(this.#cloudCancelToken !== tok) return;
            if(!ec.alive) return;
            ec.alive = false;
            this.#parts.bossExplode(ec.x + CFG.ATK_W/2, ec.y + CFG.ATK_H/2);
          }, i * 80);
        });
        this.#fx.shake(1.0);
        this.#fx.chroma(0.09);
        this.#fx.flash(255,215,0,0.8);
      }
      if(this.#konamiT >= 1.5){ this.#konamiPhase = 3; this.#konamiT = 0; }
    }

    // Phase 3 — show FATALITY (2.6 s)
    if(this.#konamiPhase === 3){
      if(this.#konamiT >= 2.6){ this.#konamiPhase = 4; this.#konamiT = 0; }
    }

    // Phase 4 — cooldown, then let normal end-wave logic fire (0.6 s)
    if(this.#konamiPhase === 4){
      if(this.#konamiT >= 0.6){ this.#konamiPhase = 0; }
    }
  }

  // ─── KONAMI DRAW ───────────────────────────────────────────────
  #drawKonami(w, h){
    if(this.#konamiPhase === 0) return;
    const now = performance.now();

    // ── Radio override banner (phase 1 + 2) ──────────────────────
    if(this.#konamiPhase <= 2){
      const barW = 420, barH = 30,
            bx   = (w - barW)/2, by = h - 46;
      const blink = Math.sin(now * 0.018) > 0;
      ctx.save();
      ctx.fillStyle = "rgba(4,1,18,0.94)";
      ctx.strokeStyle = CS.GOLD;
      ctx.lineWidth   = 2;
      ctx.shadowColor = CS.GOLD;
      ctx.shadowBlur  = 14;
      ctx.beginPath(); ctx.roundRect(bx, by, barW, barH, 5);
      ctx.fill(); ctx.stroke();
      if(blink){
        ctx.fillStyle = CS.GOLD; ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(bx + 13, by + 15, 5, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.font      = "bold 10px 'Courier New'";
      ctx.textAlign = "left";
      ctx.fillStyle = CS.GOLD;
      ctx.shadowColor = CS.GOLD; ctx.shadowBlur = 6;
      ctx.fillText("SOC ▶", bx + 24, by + 19);
      ctx.font      = "bold 11px 'Courier New'";
      ctx.fillStyle = CS.WHITE; ctx.shadowBlur = 0;
      ctx.fillText("Let's call Marquinhos! 🇧🇷", bx + 80, by + 19);
      ctx.restore();
    }

    // ── FATALITY overlay (phase 3) ────────────────────────────────
    if(this.#konamiPhase === 3){
      const t   = this.#konamiT;
      const dur = 2.6;
      // fade in 0.25s, hold, fade out 0.4s
      const fi  = Math.min(1, t / 0.25);
      const fo  = t > dur - 0.4 ? Math.max(0, 1 - (t-(dur-0.4))/0.4) : 1;
      const alpha = fi * fo;

      ctx.save();
      // Dark vignette
      ctx.globalAlpha = alpha * 0.72;
      ctx.fillStyle   = "rgba(4,1,12,0.88)";
      ctx.fillRect(0, 0, w, h);

      // Blood-red horizontal bars
      ctx.globalAlpha = alpha * 0.9;
      ctx.fillStyle   = CS.RED;
      ctx.fillRect(0, h*0.32, w, 6);
      ctx.fillRect(0, h*0.70, w, 6);

      // Glitch offset
      const glitch = Math.sin(now * 0.04) * 4;

      // Shadow / echo text
      ctx.globalAlpha = alpha * 0.25;
      ctx.font        = "bold 96px 'Courier New'";
      ctx.textAlign   = "center";
      ctx.fillStyle   = CS.RED;
      ctx.fillText("FATALITY!", w/2 + glitch + 5, h/2 + 5);

      // Main text — animated colour cycle
      const hue     = (now * 0.1) % 360;
      ctx.globalAlpha = alpha;
      ctx.font        = "bold 96px 'Courier New'";
      ctx.fillStyle   = `hsl(${hue},100%,62%)`;
      ctx.shadowColor = CS.RED;
      ctx.shadowBlur  = 48 + Math.sin(now * 0.008) * 20;
      ctx.fillText("FATALITY!", w/2 + glitch, h/2);

      // Sub-text
      ctx.font        = "bold 15px 'Courier New'";
      ctx.fillStyle   = CS.GOLD;
      ctx.shadowColor = CS.GOLD;
      ctx.shadowBlur  = 12;
      ctx.fillText("MARQUINHOS CALLED — ADVERSARIES ELIMINATED", w/2, h/2 + 52);

      // Score multiplier note
      ctx.font        = "bold 11px 'Courier New'";
      ctx.fillStyle   = CS.GREEN;
      ctx.shadowColor = CS.GREEN;
      ctx.shadowBlur  = 8;
      ctx.fillText("🦅  3x SCORE BONUS APPLIED TO ALL KILLS",w/2, h/2 + 72);

      ctx.restore();
    }
  }


  #score     =0;#waveScore=0;#hi=0;#lives=CFG.PLR_LIVES;
  #hitPause  =0;#lastTime=0;

  #px=0;#py=0;#canShoot=true;
  #mods={PREVENT:0,INSIGHT:0,IDENTITY:0,PANGEA:0,FEM:0,COMPLETE:0,CHARLOTTE_AIM:0,CLOUD:0};
  #pangeaT=0;
  #modulesCollected=new Set();

  #combo=1;#comboT=0;
  #attackers=[];
  #sideEnemies=[];
  #pBullets=[];#aBullets=[];
  #blocks=[];#powerUps=[];#ufo=null;#ufoTimer=0;
  #boss=null;#dir=1;
  #currentPhase=null;#deathCtx=null;

  #stagingComplete=false;
  #cloudVanishT=0;
  #alertFloodT=0;
  #hiddenNodeT=0;
  #multiLaneT=0;
  #adaptiveT=0;
  #cloudCancelToken=0;

  // ── grace period: slows enemies at wave start ──────────────────
  #waveGraceT=0;

  // ── bonus module timer ─────────────────────────────────────────
  #bonusDropTimer=0;
  #bonusDropInterval=0; // randomised each wave
  
  // ── Konami easter egg ──────────────────────────────────────────
  #konamiBuffer  = [];
  #konamiPhase   = 0;   // 0=idle 1=radio 2=nuke 3=fatality 4=cooldown
  #konamiT       = 0;
  #konamiUsed    = false; // one activation per wave


  async init(){
    this.#hi=+localStorage.getItem("cs_hi")||0;
    const manifest=[
      {key:"player",src:"space.png"},
      ...Array.from({length:CFG.IMAGE_COUNT},(_,i)=>({key:`act${i}`,src:`act${i}.png`})),
    ];
    let loadedCount=0;
    let loadingDone=false;
    const animateLoading=()=>{
      if(loadingDone)return;
      this.#drawLoading(loadedCount,manifest.length);
      requestAnimationFrame(animateLoading);
    };
    requestAnimationFrame(animateLoading);
    await this.#assets.loadAll(manifest,(done)=>{ loadedCount=done; });
    loadingDone=true;
    this.#lastTime=performance.now();
    this.#setupKonami();
    requestAnimationFrame(this.#loop);
  }

  #loop=(now)=>{
    const dt=Math.min((now-this.#lastTime)/1000,0.05);
    this.#lastTime=now;this.#update(dt);this.#render();
    requestAnimationFrame(this.#loop);
  };

  // ── Build a shuffled play order each new game ──────────────────
  // Structure: boss waves stay anchored at indices 2,4,6,8,9
  // Non-boss groups are shuffled within their cluster:
  //   group A (waves 0–1): fancy_bear, ai_syndicate  → shuffled
  //   group B (waves 3,5,7): cozy_bear, volt_typhoon, sandworm → shuffled
  // Boss waves are fixed: carbon_spider(2), scattered_spider(4),
  //   midnight_blizzard(6), blackcat(8), lazarus(9)
  #buildPhaseOrder(){
    const order=new Array(PHASES.length);
    // Fixed boss positions
    const bossIndices=[2,4,6,8,9];
    bossIndices.forEach(i=>{ order[i]=i; });
    // Shuffle group A: positions 0 and 1
    const groupA=[0,1];
    for(let i=groupA.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [groupA[i],groupA[j]]=[groupA[j],groupA[i]];
    }
    order[0]=groupA[0];order[1]=groupA[1];
    // Shuffle group B: positions 3,5,7
    const groupB=[3,5,7];
    for(let i=groupB.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [groupB[i],groupB[j]]=[groupB[j],groupB[i]];
    }
    order[3]=groupB[0];order[5]=groupB[1];order[7]=groupB[2];
    this.#phaseOrder=order;
  }

  // Returns the PHASES entry for the current wave slot
  get #phase(){ return PHASES[this.#phaseOrder[this.#waveIdx]]??PHASES[this.#waveIdx]; }

  #update(dt){
    this.#stars.update(dt);this.#parts.update(dt);
    this.#fx.update(dt);this.#floats.update(dt);this.#notify.update(dt);
    this.#blinkT+=dt;if(this.#blinkT>0.5){this.#blinkSkip=!this.#blinkSkip;this.#blinkT=0;}
    switch(this.#state){
      case STATE.TITLE:
        this.#title.update(dt);
        if(this.#input.consume(" "))this.#startGame();
        break;
      case STATE.MODULE_CHOICE:
        this.#modChoice.update(dt,this.#input);
        if(this.#modChoice.confirmed){
          const chosen=this.#modChoice.chosenModule;
          if(chosen){this.#collectMod(chosen);this.#audio.moduleUp();}
          this.#state=this.#bannerBoss?STATE.BOSS_WARNING:STATE.WAVE_BANNER;
          this.#bannerT=0;
        }
        break;
      case STATE.WAVE_BANNER:
      case STATE.BOSS_WARNING:
        this.#bannerT+=dt;
        if(this.#input.consume(" ")||this.#bannerT>CFG.WAVE_BANNER_MS/1000){
          this.#input.flushAll();
          this.#state=this.#bannerBoss?STATE.BOSS:STATE.PLAYING;
          this.#socFeed.start(this.#currentPhase?.id??"");
        }
        break;
      case STATE.PLAYING:    this.#updatePlaying(dt);break;
      case STATE.BOSS:       this.#updateBoss(dt);break;
      case STATE.OVERWATCH_SEQ:
        this.#overwatch.update(dt);
        if(!this.#overwatch.isActive){
          this.#state=this.#boss?.alive?STATE.BOSS:STATE.PLAYING;
          if(this.#countAlive()===0&&!this.#boss?.alive){
            this.#state=STATE.INCIDENT_REPORT;this.#bannerT=0;
          }
        }
        break;
      case STATE.FALCON_COMPLETE:
        this.#fcSystem.update(dt);
        if(!this.#fcSystem.isActive)this.#afterFC();
        break;
      case STATE.INCIDENT_REPORT:
        this.#bannerT+=dt;
        if(this.#input.consume(" ")||this.#bannerT>CFG.INCIDENT_REPORT_MS/1000)
          this.#nextWave();
        break;
      case STATE.GAME_OVER:
      case STATE.YOU_WIN:
        if(this.#input.consume("r")||this.#input.consume("R"))
          this.#backToTitle();
        break;
    }
  }

  #updatePlaying(dt){
    if(this.#hitPause>0){this.#hitPause-=dt;return;}
    this.#socFeed.update(dt);
    this.#handleInput(dt);
    this.#tickGrace(dt);
    this.#applyBehavior(dt);
    if(this.#pangeaT<=0){this.#moveAttackers(dt);this.#doShoot();}
    this.#movePBullets(dt);this.#moveABullets(dt);
    this.#charlotte.update(dt);
    this.#updatePowerUps(dt);
    this.#updateBonusDrop(dt);
    this.#updateSideEnemies(dt);
    this.#updateCorruptedBlocks(dt);
    this.#checkImpostorOverlap();
    this.#updateUFO(dt);
    this.#tickCombo(dt);this.#tickMods(dt);
    this.#updateKonami(dt);
    this.#blocks.forEach(b=>b.update(dt));
    this.#checkEnd();
  }

  #updateBoss(dt){
    if(this.#hitPause>0){this.#hitPause-=dt;return;}
    // Don't trigger boss-end while Konami nuke is still animating
    if(!this.#boss?.alive && this.#konamiPhase === 0){this.#endBoss();return;}
    this.#socFeed.update(dt);
    this.#handleInput(dt);
    this.#tickGrace(dt);
    if(this.#pangeaT<=0)this.#boss.update(dt,this.#aBullets,this.#bltPool);
    if(this.#boss&&this.#currentPhase?.behavior?.multiPhase){
      const newPhase=this.#boss.checkPhaseTransition();
      if(newPhase>=0)this.#onBossPhaseChange(newPhase);
    }
    this.#movePBullets(dt);this.#moveABullets(dt);
    this.#charlotte.update(dt);
    this.#updatePowerUps(dt);
    this.#updateBonusDrop(dt);
    this.#updateSideEnemies(dt);
    this.#updateCorruptedBlocks(dt);
    this.#updateUFO(dt);
    this.#tickCombo(dt);this.#tickMods(dt);
    this.#updateKonami(dt);
    this.#blocks.forEach(b=>b.update(dt));
    if(this.#lives<=0)this.#gameOver();
  }

  // ── Grace period tick: counts down, slows enemies ──────────────
  #tickGrace(dt){
    if(this.#waveGraceT>0)this.#waveGraceT=Math.max(0,this.#waveGraceT-dt);
  }

  // ── Bonus drop timer tick ──────────────────────────────────────
  #updateBonusDrop(dt){
    // Don't spawn bonus drops in the first two waves
    if(this.#waveIdx<2)return;
    if(this.#bonusDrop.alive){
      this.#bonusDrop.update(dt);
      // Collision with player
      const bd=this.#bonusDrop;
      if(this.#ov(bd.x,bd.y,bd.w,bd.h,this.#px,this.#py,CFG.PLR_W,CFG.PLR_H)){
        const mod=bd.mod;
        bd.collect();
        if(mod){
          this.#parts.bonusDrop(this.#px+CFG.PLR_W/2,this.#py);
          this.#audio.bonusModule();
          this.#fx.flash(255,215,0,0.3);
          this.#notify.push(mod,true);
          this.#collectMod(mod);
          // Bonus score reward
          const bonus=400*this.#combo;
          this.#addScore(bonus,this.#px+CFG.PLR_W/2,this.#py-20,
            `✨ ALLY ASSIST +${bonus}`);
        }
      }
    } else {
      this.#bonusDropTimer+=dt;
      if(this.#bonusDropTimer>=this.#bonusDropInterval){
        this.#bonusDropTimer=0;
        // Randomise next interval immediately
        this.#bonusDropInterval=
          CFG.BONUS_MODULE_MIN+Math.random()*(CFG.BONUS_MODULE_MAX-CFG.BONUS_MODULE_MIN);
        this.#bonusDrop.spawn(this.#currentPhase,this.#waveIdx);
        if(this.#bonusDrop.alive){
          this.#floats.spawn(canvas.width/2,canvas.height/3-20,
            "✨ ALLY ASSIST INCOMING",CS.GOLD,13);
        }
      }
    }
  }

  #onBossPhaseChange(phase){
    this.#audio.phaseTransition();this.#fx.shake(0.7);
    const labels=["⚡ THEFT PHASE","👻 STEALTH PHASE","💀 DESTRUCTION PHASE"];
    const cols=[CS.ORANGE,CS.PURPLE,CS.RED];
    this.#fx.flash(phase===2?224:phase===1?170:255,0,phase===2?60:phase===1?255:0,0.6);
    this.#floats.spawn(canvas.width/2,canvas.height/2-20,
      `⚠ LAZARUS — ${labels[phase]}`,cols[phase],18);
    this.#parts.phaseTransition(canvas.width/2,canvas.height/3);
    if(phase===2){
      this.#spawnSideWave();
      this.#floats.spawn(canvas.width/2,canvas.height/2+10,
        "WIPER ENGAGED — PROTECT YOUR BLOCKS",CS.RED_GLOW,13);
    }
    if(phase===1){
      this.#floats.spawn(canvas.width/2,canvas.height/2+10,
        "BOSS GONE STEALTH — ATTACKS FROM SHADOW",CS.PURPLE,13);
    }
  }

  #startGame(){
    this.#score=0;this.#lives=CFG.PLR_LIVES;this.#combo=1;this.#comboT=0;
    this.#waveIdx=0;this.#dir=1;
    this.#mods={PREVENT:0,INSIGHT:0,IDENTITY:0,PANGEA:0,FEM:0,COMPLETE:0,CHARLOTTE_AIM:0,CLOUD:0};
    this.#pangeaT=0;this.#deathCtx=null;
    this.#buildPhaseOrder();   // ← new: randomise order each playthrough
    this.#audio.startBGM();this.#beginWave();
  }

  #nextWave(){
    if(this.#waveIdx>=PHASES.length-1){this.#state=STATE.YOU_WIN;this.#saveHi();return;}
    this.#waveIdx=Math.min(this.#waveIdx+1,PHASES.length-1);
    this.#dir=1;this.#audio.stopBGM();this.#audio.startBGM();this.#beginWave();
  }

  #beginWave(){
    this.#cloudCancelToken++;

    const phase          = this.#phase;
    this.#currentPhase   = phase;
    this.#bannerBoss     = phase.isBoss;

    this.#pBullets       = [];
    this.#aBullets       = [];
    this.#powerUps       = [];
    this.#sideEnemies    = [];
    this.#ufo            = null;
    this.#ufoTimer       = 0;
    this.#canShoot       = true;

    this.#modulesCollected = new Set();
    this.#waveScore        = 0;
    this.#stagingComplete  = false;
    this.#cloudVanishT     = 0;
    this.#alertFloodT      = 0;
    this.#hiddenNodeT      = 0;
    this.#multiLaneT       = 0;
    this.#adaptiveT        = 0;

    this.#mods = {
      PREVENT:0,INSIGHT:0,IDENTITY:0,PANGEA:0,
      FEM:0,COMPLETE:0,CHARLOTTE_AIM:0,CLOUD:0,
    };
    this.#pangeaT = 0;

    // Grace period: full duration at wave start
    this.#waveGraceT = CFG.WAVE_GRACE_S;
    this.#konamiUsed = false;

    // Bonus drop setup
    this.#bonusDropTimer    = 0;
    this.#bonusDropInterval =
      CFG.BONUS_MODULE_MIN+Math.random()*(CFG.BONUS_MODULE_MAX-CFG.BONUS_MODULE_MIN);

    this.#px = canvas.width  / 2 - CFG.PLR_W / 2;
    this.#py = canvas.height - CFG.PLR_H - 32;

    this.#buildAttackers();
    this.#buildBlocks();

    if(phase.isBoss){
      this.#boss = new Boss(this.#waveIdx + 1, phase);
      this.#audio.bossRoar();
    } else {
      this.#boss = null;
    }

    this.#modChoice.prepare(phase, this.#waveIdx);
    this.#state = STATE.MODULE_CHOICE;
  }

  #buildAttackers(){
    this.#attackers=[];
    const sx=(canvas.width-CFG.COLS*(CFG.ATK_W+CFG.ATK_SX))/2;
    const beh=this.#currentPhase?.behavior;
    for(let c=0;c<CFG.COLS;c++){
      this.#attackers[c]=[];
      for(let r=0;r<CFG.ROWS;r++){
        const isImpostor=beh?.impostorEnemies&&Math.random()<0.18;
        const isTrusted=beh?.supplyChain&&c===0;
        const isHidden=beh?.hiddenNodes&&Math.random()<0.25;
        const decoys=["IDENTITY","PREVENT","COMPLETE","CHARLOTTE"];
        const decoyMod=MODULES[decoys[Math.floor(Math.random()*decoys.length)]];
        this.#attackers[c][r]={
          x:sx+c*(CFG.ATK_W+CFG.ATK_SX),
          y:68+r*(CFG.ATK_H+CFG.ATK_SY),
          alive:true,vanished:false,
          isHidden,isImpostor,isTrusted,revealed:false,
          decoyMod,
          imageIndex:Math.floor(Math.random()*CFG.IMAGE_COUNT),
          phase:Math.random()*Math.PI*2,
        };
      }
    }
  }

  #buildBlocks(){
    this.#blocks=[];
    const total=CFG.BLK_COLS*(CFG.BLK_W+18)-18;
    const sx=(canvas.width-total)/2;
    const beh=this.#currentPhase?.behavior;
    const corruptIdx=beh?.corruptedAsset?Math.floor(Math.random()*CFG.BLK_COLS):-1;
    for(let c=0;c<CFG.BLK_COLS;c++){
      this.#blocks.push(new Block(sx+c*(CFG.BLK_W+18),canvas.height-108,c,c===corruptIdx));
    }
  }

  #backToTitle(){
    this.#cloudCancelToken++;
    this.#audio.stopBGM();this.#socFeed.stop();this.#state=STATE.TITLE;
    this.#pBullets=[];this.#aBullets=[];this.#powerUps=[];
    this.#sideEnemies=[];this.#ufo=null;this.#boss=null;
    this.#currentPhase=null;this.#deathCtx=null;
    this.#canShoot=true;this.#input.flushAll();
  }

  #saveHi(){
    if(this.#score>this.#hi){
      this.#hi=this.#score;
      try{localStorage.setItem("cs_hi",this.#hi);}catch(_){}
    }
  }

  #gameOver(){
    this.#audio.stopBGM();this.#fx.flash(224,0,60,0.9);this.#fx.shake(1);
    this.#parts.bossExplode(canvas.width/2,canvas.height/2);
    this.#socFeed.stop();
    this.#deathCtx=getDeathContext(this.#currentPhase,this.#modulesCollected);
    this.#state=STATE.GAME_OVER;this.#saveHi();
  }

  #endBoss(){
    this.#audio.levelUp();this.#fx.startWarp(canvas.width,canvas.height);
    this.#fx.flash(224,0,60,0.65);this.#socFeed.stop();
    if(this.#waveIdx>=PHASES.length-1){this.#state=STATE.YOU_WIN;this.#saveHi();return;}
    this.#state=STATE.INCIDENT_REPORT;this.#bannerT=0;
  }

  #checkEnd(){
    // Don't end the wave while the Konami sequence is still playing out
    if(this.#konamiPhase > 0) return;
    if(this.#lives<=0){this.#gameOver();return;}

    if(this.#countAlive()===0&&this.#sideEnemies.length===0){
      this.#audio.levelUp();this.#fx.startWarp(canvas.width,canvas.height);
      this.#fx.flash(0,229,255,0.35);this.#socFeed.stop();
      this.#state=STATE.INCIDENT_REPORT;this.#bannerT=0;return;
    }
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];
        if(a?.alive&&!a.isHidden&&a.y+CFG.ATK_H>=this.#py){
          this.#lives=0;this.#gameOver();return;
        }
      }
  }

  #countAlive(){
    let n=0;
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++)
        if(this.#attackers[c]?.[r]?.alive)n++;
    return n;
  }

  #afterFC(){
    this.#state=this.#boss?.alive?STATE.BOSS:STATE.PLAYING;
    if(this.#countAlive()===0&&this.#sideEnemies.length===0&&!this.#boss?.alive){
      this.#state=STATE.INCIDENT_REPORT;this.#bannerT=0;
    }
  }

  #applyBehavior(dt){
    const beh=this.#currentPhase?.behavior;
    if(!beh)return;
    if(beh.cloudVanish){
      this.#cloudVanishT+=dt;
      if(this.#cloudVanishT>6){
        this.#cloudVanishT=0;
        for(let c=0;c<CFG.COLS;c++)
          for(let r=0;r<CFG.ROWS;r++){
            const a=this.#attackers[c]?.[r];
            if(a?.alive&&Math.random()<0.4){
              a.vanished=true;
              setTimeout(()=>{if(a)a.vanished=false;},3000+Math.random()*3000);
            }
          }
        this.#floats.spawn(canvas.width/2,canvas.height/3,
          "☁️ CLOUD PIVOT — ENEMIES VANISHING",CS.ORANGE,14);
        if(this.#mods.CLOUD<=0)
          this.#floats.spawn(canvas.width/2,canvas.height/3+18,
            "⚠ CLOUD SECURITY REQUIRED TO HIT",CS.RED,11);
      }
    }
    if(beh.stagingPhase&&!this.#stagingComplete){
      if(this.#countAlive()<CFG.COLS*CFG.ROWS*0.5){
        this.#stagingComplete=true;
        this.#floats.spawn(canvas.width/2,canvas.height/2,
          "⚠ STAGING COMPLETE — ENCRYPTION RUSH",CS.RED,18);
        this.#fx.flash(224,0,60,0.5);this.#fx.shake(0.3);this.#audio.corruptAlert();
      }
    }
    if(beh.alertFlood){
      this.#alertFloodT+=dt;
      if(this.#alertFloodT>10){
        this.#alertFloodT=0;this.#fx.chroma(0.045);this.#fx.shake(0.15);
        this.#floats.spawn(canvas.width/2,72,
          "⚠ 847 ALERTS — ANALYST CAPACITY EXCEEDED",CS.RED,12);
        this.#floats.spawn(canvas.width/2,88,
          "CHARLOTTE AI REQUIRED — MACHINE SPEED",CS.GREEN,10);
      }
    }
    if(beh.multiLane){
      this.#multiLaneT+=dt;
      if(this.#multiLaneT>14){this.#multiLaneT=0;this.#spawnSideWave();}
    }
    if(beh.hiddenNodes){
      this.#hiddenNodeT+=dt;
      if(this.#hiddenNodeT>30){
        this.#hiddenNodeT=0;let activated=0;
        for(let c=0;c<CFG.COLS;c++)
          for(let r=0;r<CFG.ROWS;r++){
            const a=this.#attackers[c]?.[r];
            if(a?.alive&&a.isHidden){
              a.isHidden=false;activated++;
              this.#parts.femReveal(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);
            }
          }
        if(activated>0){
          this.#floats.spawn(canvas.width/2,canvas.height/2,
            `⚠ ${activated} HIDDEN NODES ACTIVATED`,CS.RED_GLOW,16);
          this.#fx.flash(224,0,60,0.45);this.#fx.shake(0.4);this.#audio.corruptAlert();
        }
      }
    }
    if(beh.adaptivePatterns){
      this.#adaptiveT+=dt;
      if(this.#adaptiveT>8){
        this.#adaptiveT=0;this.#dir*=-1;
        this.#floats.spawn(canvas.width/2,120,
          "AI MUTATION — ATTACK PATTERN CHANGED",CS.GREEN,12);
      }
    }
  }

  #spawnSideWave(){
    const count=3+this.#waveIdx;
    for(let i=0;i<count;i++){
      const fromLeft=Math.random()<0.5;
      this.#sideEnemies.push({
        x:fromLeft?-CFG.ATK_W-10:canvas.width+10,
        y:120+i*44,
        vx:fromLeft?(80+this.#waveIdx*8):-(80+this.#waveIdx*8),
        vy:18,alive:true,
        imageIndex:Math.floor(Math.random()*CFG.IMAGE_COUNT),
        shootCd:1.2+Math.random()*0.8,
        phase:Math.random()*Math.PI*2,
      });
    }
    this.#floats.spawn(canvas.width/2,canvas.height/2-30,
      "⚠ MULTI-LANE STRIKE — SIMULTANEOUS VECTORS",CS.PURPLE,14);
  }

  #updateSideEnemies(dt){
    for(let i=this.#sideEnemies.length-1;i>=0;i--){
      const e=this.#sideEnemies[i];
      if(!e.alive){this.#sideEnemies.splice(i,1);continue;}
      e.x+=e.vx*dt;e.y+=e.vy*dt;
      if(e.x>canvas.width+60||e.x<-60||e.y>canvas.height+40){
        this.#sideEnemies.splice(i,1);continue;
      }
      e.shootCd-=dt;
      if(e.shootCd<=0){
        e.shootCd=1.0+Math.random()*0.8;
        const dx=(this.#px+CFG.PLR_W/2)-(e.x+CFG.ATK_W/2);
        const dy=(this.#py+CFG.PLR_H/2)-(e.y+CFG.ATK_H/2);
        const dist=Math.sqrt(dx*dx+dy*dy)||1;
        this.#aBullets.push(this.#bltPool.acquire({
          x:e.x+CFG.ATK_W/2-CFG.BLT_W/2,y:e.y+CFG.ATK_H,
          vx:(dx/dist)*CFG.ATK_BLT_SPEED*0.9,
          vy:(dy/dist)*CFG.ATK_BLT_SPEED*0.9,
          w:CFG.BLT_W,h:CFG.BLT_H,boss:false,corrupt:false,fromBlock:false,
        }));
      }
      for(let bi=this.#pBullets.length-1;bi>=0;bi--){
        const b=this.#pBullets[bi];
        if(this.#ov(b.x,b.y,b.w,b.h,e.x,e.y,CFG.ATK_W,CFG.ATK_H)){
          e.alive=false;
          this.#parts.csExplosion(e.x+CFG.ATK_W/2,e.y+CFG.ATK_H/2);
          const pts=CFG.SCORE_ROW[1]*this.#combo;
          this.#addScore(pts,e.x+CFG.ATK_W/2,e.y,`⚡ SIDE +${pts}`);
          this.#audio.boom();this.#bumpCombo();this.#fx.shake(0.07);
          this.#bltPool.release(b);this.#pBullets.splice(bi,1);this.#canShoot=true;break;
        }
      }
      if(this.#ov(e.x,e.y,CFG.ATK_W,CFG.ATK_H,this.#px,this.#py,CFG.PLR_W,CFG.PLR_H)){
        e.alive=false;this.#loseLife();
      }
    }
  }

  #updateCorruptedBlocks(dt){
    for(const bl of this.#blocks){
      if(!bl.alive||!bl.corrupted)continue;
      if(bl.updateCorrupt(dt)){
        this.#audio.corruptAlert();this.#fx.shake(0.08);
        const bx=bl.x+bl.w/2-CFG.BLT_W/2,by=bl.y+bl.h;
        const dx=(this.#px+CFG.PLR_W/2)-(bl.x+bl.w/2);
        const dy=this.#py-(bl.y+bl.h);
        const dist=Math.sqrt(dx*dx+dy*dy)||1;
        this.#aBullets.push(this.#bltPool.acquire({
          x:bx,y:by,
          vx:(dx/dist)*CFG.ATK_BLT_SPEED*0.7,
          vy:(dy/dist)*CFG.ATK_BLT_SPEED*0.7,
          w:CFG.BLT_W+2,h:CFG.BLT_H,
          boss:false,corrupt:true,fromBlock:true,
        }));
        this.#floats.spawn(bl.x+bl.w/2,bl.y-10,"⚠ CORRUPTED BLOCK FIRING",CS.RED,10);
      }
    }
  }

  #checkImpostorOverlap(){
    if(!this.#currentPhase?.behavior?.impostorEnemies)return;
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];
        if(!a?.alive||!a.isImpostor||a.revealed)continue;
        if(this.#ov(a.x,a.y,CFG.ATK_W,CFG.ATK_H,this.#px,this.#py,CFG.PLR_W,CFG.PLR_H)){
          if(this.#mods.IDENTITY>0){
            a.revealed=true;a.isImpostor=false;
            this.#floats.spawn(a.x+CFG.ATK_W/2,a.y-10,"🪪 IMPOSTOR EXPOSED",CS.YELLOW,13);
            this.#fx.flash(255,220,0,0.3);
          }else{
            a.alive=false;this.#loseLife();
            this.#floats.spawn(canvas.width/2,canvas.height/2,
              "⚠ IMPOSTOR — IDENTITY PROTECTION REQUIRED",CS.RED,13);
          }
        }
      }
  }

  #handleInput(dt){
    if(this.#input.isDown("ArrowRight"))
      this.#px=Math.min(canvas.width-CFG.PLR_W,this.#px+CFG.PLR_SPEED*dt);
    if(this.#input.isDown("ArrowLeft"))
      this.#px=Math.max(0,this.#px-CFG.PLR_SPEED*dt);
    if(this.#input.consume(" ")&&this.#canShoot)this.#fire();
  }

  #fire(){
    const cx=this.#px+CFG.PLR_W/2-CFG.BLT_W/2,by=this.#py-CFG.BLT_H;
    const angles=this.#mods.PREVENT>0?[-0.2,0,0.2]:[0];
    for(const a of angles)
      this.#pBullets.push(this.#bltPool.acquire({
        x:cx,y:by,vx:Math.sin(a)*CFG.PLR_BLT_SPEED,
        vy:-Math.cos(a)*CFG.PLR_BLT_SPEED,
        w:CFG.BLT_W,h:CFG.BLT_H,boss:false,corrupt:false,fromBlock:false,
      }));
    this.#canShoot=false;this.#audio.laser();
  }

  #moveAttackers(dt){
    const beh=this.#currentPhase?.behavior;
    const baseSpd=CFG.ATK_BLT_SPEED*0.28*(1+this.#waveIdx*0.13);
    const femFactor=this.#mods.FEM>0?0.62:1.0;
    let stageFactor=1.0;
    if(beh?.stagingPhase)
      stageFactor=this.#stagingComplete?(beh.encryptionRush?2.0:1.4):0.42;
    const stealthFactor=beh?.slowStealth?0.28:1.0;
    // Grace period: full slowdown for first CFG.WAVE_GRACE_S seconds
    const graceFactor=this.#waveGraceT>0?0.28:1.0;
    const spd=baseSpd*femFactor*stageFactor*stealthFactor*graceFactor;

    let edge=false;
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];
        if(!a?.alive||a.isHidden)continue;
        a.x+=this.#dir*spd*dt;
        if(a.x+CFG.ATK_W>canvas.width||a.x<0)edge=true;
      }
    if(edge){
      this.#dir*=-1;
      for(let c=0;c<CFG.COLS;c++)
        for(let r=0;r<CFG.ROWS;r++){
          const a=this.#attackers[c]?.[r];
          if(a?.alive&&!a.isHidden)a.y+=CFG.ATK_SY*0.38;
        }
    }

    if(beh?.credentialGhosts){
      const playerCX=this.#px+CFG.PLR_W/2;
      const step=CFG.ATK_W+Math.floor(CFG.ATK_SX*0.5);
      for(let c=0;c<CFG.COLS;c++){
        const ghost=this.#attackers[c]?.[CFG.ROWS-1];
        if(!ghost?.alive||ghost.isHidden)continue;
        const colOffset=(c-CFG.COLS/2+0.5)*step;
        const targetX=playerCX+colOffset-CFG.ATK_W/2;
        ghost.x+=(targetX-ghost.x)*0.06*graceFactor;
        ghost.x=Math.max(0,Math.min(canvas.width-CFG.ATK_W,ghost.x));
      }
    }

    if(beh?.trackPlayer&&beh.trackPlayer>0){
      const playerCX=this.#px+CFG.PLR_W/2;
      const maxR=beh.credentialGhosts?CFG.ROWS-1:CFG.ROWS;
      let sumX=0,count=0;
      for(let c=0;c<CFG.COLS;c++)
        for(let r=0;r<maxR;r++){
          const a=this.#attackers[c]?.[r];
          if(!a?.alive||a.isHidden)continue;
          sumX+=a.x+CFG.ATK_W/2;count++;
        }
      if(count>0){
        const groupCX=sumX/count;
        // Apply grace factor to tracking too — less aggressive on wave start
        const trackStrength=beh.trackPlayer*graceFactor;
        const delta=(playerCX-groupCX)*trackStrength*dt*0.3;
        for(let c=0;c<CFG.COLS;c++)
          for(let r=0;r<maxR;r++){
            const a=this.#attackers[c]?.[r];
            if(!a?.alive||a.isHidden)continue;
            a.x+=delta;
          }
      }
    }
  }

  #movePBullets(dt){
    for(let i=this.#pBullets.length-1;i>=0;i--){
      const b=this.#pBullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.y+b.h<0||b.x<-20||b.x>canvas.width+20){
        this.#bltPool.release(b);this.#pBullets.splice(i,1);this.#canShoot=true;continue;
      }
      if(this.#ufo?.alive&&
         this.#ov(b.x,b.y,b.w,b.h,this.#ufo.x,this.#ufo.y,this.#ufo.w,this.#ufo.h)){
        const pts=this.#ufo.pts*this.#combo;
        this.#addScore(pts,this.#ufo.x+this.#ufo.w/2,this.#ufo.y,`🛸 SIGNAL +${pts}`);
        this.#parts.csExplosion(this.#ufo.x+this.#ufo.w/2,this.#ufo.y+this.#ufo.h/2);
        this.#fx.shake(0.2);this.#audio.boom();this.#ufo.alive=false;
        this.#bltPool.release(b);this.#pBullets.splice(i,1);this.#canShoot=true;continue;
      }
      if(this.#boss?.alive&&
         this.#ov(b.x,b.y,b.w,b.h,this.#boss.x,this.#boss.y,this.#boss.w,this.#boss.h)){
        this.#boss.hit();this.#fx.shake(0.12);
        if(!this.#boss.alive){
          this.#parts.bossExplode(this.#boss.x+this.#boss.w/2,this.#boss.y+this.#boss.h/2);
          this.#fx.shake(0.9);this.#fx.flash(224,0,60,0.65);
          this.#fx.chroma(0.06);this.#audio.bossRoar();
          const pts=CFG.SCORE_BOSS*this.#combo;
          this.#addScore(pts,this.#boss.x+this.#boss.w/2,this.#boss.y,
            `🦅 BREACH PREVENTED +${pts}`);
        }
        this.#bltPool.release(b);this.#pBullets.splice(i,1);this.#canShoot=true;continue;
      }
      let hit=false;
      outer:
      for(let c=0;c<CFG.COLS&&!hit;c++)
        for(let r=0;r<CFG.ROWS&&!hit;r++){
          const a=this.#attackers[c]?.[r];
          if(!a?.alive||a.isHidden)continue;
          if(a.vanished&&this.#mods.CLOUD<=0)continue;
          if(this.#ov(b.x,b.y,b.w,b.h,a.x,a.y,CFG.ATK_W,CFG.ATK_H)){
            this.#killAtk(a,r);
            this.#bltPool.release(b);this.#pBullets.splice(i,1);
            this.#canShoot=true;hit=true;
          }
        }
      if(hit)continue;
      for(const bl of this.#blocks){
        if(bl.alive&&this.#ov(b.x,b.y,b.w,b.h,bl.x,bl.y,bl.w,bl.h)){
          bl.hit();
          if(!bl.alive){
            this.#floats.spawn(bl.x+bl.w/2,bl.y-8,`⚠ ${bl.getShortMsg()}`,bl.getColor(),11);
            this.#floats.spawn(bl.x+bl.w/2,bl.y-22,bl.getFailMsg().slice(0,44),CS.GREY,9);
          }
          this.#bltPool.release(b);this.#pBullets.splice(i,1);this.#canShoot=true;break;
        }
      }
    }
  }

  #killAtk(a,r){
    a.alive=false;
    const pts=CFG.SCORE_ROW[r??0]*this.#combo;
    this.#addScore(pts,a.x+CFG.ATK_W/2,a.y,
      this.#combo>1?`+${pts} 🔥x${this.#combo}`:`+${pts}`);
    this.#parts.csExplosion(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);
    this.#fx.shake(0.07);this.#audio.boom();this.#bumpCombo();
    if(this.#mods.INSIGHT>0){
      this.#floats.spawn(a.x+CFG.ATK_W/2,a.y-12,"📡 IOC LOGGED",CS.BLUE,10);
      if(this.#combo>1){this.#waveScore+=pts;this.#score+=pts;}
    }
    if(Math.random()<CFG.DROP_CHANCE&&this.#currentPhase)
      this.#powerUps.push(new PowerUp(
        a.x+CFG.ATK_W/2,a.y,this.#currentPhase,this.#waveIdx));
  }

  #moveABullets(dt){
    // During grace period, enemy bullets move at half speed
    const speedScale=this.#waveGraceT>0?0.45:1.0;
    for(let i=this.#aBullets.length-1;i>=0;i--){
      const b=this.#aBullets[i];
      b.x+=(b.vx||0)*dt*speedScale;
      b.y+=b.vy*dt*speedScale;
      if(b.y>canvas.height||b.x<-20||b.x>canvas.width+20){
        this.#bltPool.release(b);this.#aBullets.splice(i,1);continue;
      }
      let bh=false;
      if(!b.fromBlock){
        for(const bl of this.#blocks){
          if(bl.alive&&this.#ov(b.x,b.y,b.w,b.h,bl.x,bl.y,bl.w,bl.h)){
            if(this.#currentPhase?.behavior?.corruption&&!bl.corrupted){
              bl.corrupt();
              this.#parts.corruptBlock(bl.x+bl.w/2,bl.y+bl.h/2);
              this.#fx.shake(0.12);this.#audio.corruptAlert();
              this.#floats.spawn(bl.x+bl.w/2,bl.y-10,
                "⚠ BLOCK CORRUPTED — WIPER ACTIVE",CS.RED,11);
            }else{
              bl.hit();
              if(!bl.alive){
                this.#floats.spawn(bl.x+bl.w/2,bl.y-8,`⚠ ${bl.getShortMsg()}`,bl.getColor(),11);
                this.#floats.spawn(bl.x+bl.w/2,bl.y-22,bl.getFailMsg().slice(0,44),CS.GREY,9);
              }
            }
            this.#bltPool.release(b);this.#aBullets.splice(i,1);bh=true;break;
          }
        }
      }
      if(bh)continue;
      if(this.#ov(b.x,b.y,b.w,b.h,this.#px,this.#py,CFG.PLR_W,CFG.PLR_H)){
        this.#bltPool.release(b);this.#aBullets.splice(i,1);
        if(this.#mods.IDENTITY>0&&!b.corrupt){
          this.#mods.IDENTITY=0;this.#fx.flash(255,220,0,0.4);this.#audio.moduleUp();
          this.#floats.spawn(this.#px+CFG.PLR_W/2,this.#py,
            "🪪 IDENTITY — CREDENTIAL ATTACK BLOCKED",CS.YELLOW,12);
        }else{this.#loseLife();}
      }
    }
  }

  #doShoot(){
    const rate=0.18+this.#waveIdx*0.035;
    const maxB=CFG.MAX_ATK_BLTS+this.#waveIdx;
    const beh=this.#currentPhase?.behavior;
    const stageFactor=(beh?.stagingPhase&&!this.#stagingComplete)?0.3:1.0;
    // During grace period, shooting rate is dramatically reduced
    const graceFactor=this.#waveGraceT>0?0.12:1.0;
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];
        if(!a?.alive||a.vanished||a.isHidden||a.isImpostor)continue;
        if(this.#aBullets.length>=maxB)return;
        const dist=Math.abs(a.x+CFG.ATK_W/2-(this.#px+CFG.PLR_W/2));
        const prox=Math.max(0,1-dist/canvas.width);
        if(Math.random()<rate*(0.4+prox*1.6)*stageFactor*graceFactor/60){
          this.#aBullets.push(this.#bltPool.acquire({
            x:a.x+CFG.ATK_W/2-CFG.BLT_W/2,y:a.y+CFG.ATK_H,
            vx:a.isTrusted?(Math.random()-0.5)*40:0,
            vy:CFG.ATK_BLT_SPEED*(0.9+this.#waveIdx*0.08),
            w:CFG.BLT_W,h:CFG.BLT_H,boss:false,
            corrupt:beh?.corruption??false,fromBlock:false,
          }));
        }
      }
  }

  #updatePowerUps(dt){
    for(let i=this.#powerUps.length-1;i>=0;i--){
      const p=this.#powerUps[i];p.update(dt);
      if(!p.alive){this.#powerUps.splice(i,1);continue;}
      if(this.#ov(p.x,p.y,p.w,p.h,this.#px,this.#py,CFG.PLR_W,CFG.PLR_H)){
        if(p.isFake){
          if(this.#mods.IDENTITY>0){
            this.#mods.IDENTITY=0;this.#fx.flash(255,220,0,0.4);
            this.#floats.spawn(this.#px+CFG.PLR_W/2,this.#py,
              "🪪 IDENTITY — FAKE SIGNAL BLOCKED",CS.YELLOW,13);
            this.#parts.moduleCollect(this.#px+CFG.PLR_W/2,this.#py,CS.YELLOW);
            const bonus=250*this.#combo;
            this.#addScore(bonus,this.#px+CFG.PLR_W/2,this.#py-20,`🪪 FAKE EXPOSED +${bonus}`);
          }else{
            this.#fx.flash(224,0,60,0.5);this.#fx.shake(0.4);
            this.#floats.spawn(this.#px+CFG.PLR_W/2,this.#py,
              "⚠ FAKE SIGNAL — IDENTITY REQUIRED",CS.RED,13);
            this.#loseLife();
          }
        }else{this.#collectMod(p.mod);}
        this.#powerUps.splice(i,1);
      }
    }
  }

  #updateUFO(dt){
    if(this.#ufo){this.#ufo.update(dt,this.#audio);if(!this.#ufo.alive)this.#ufo=null;}
    else{
      this.#ufoTimer+=dt*1000;
      if(this.#ufoTimer>CFG.UFO_INTERVAL){this.#ufoTimer=0;this.#ufo=new UFO(canvas.width);}
    }
  }

  #bumpCombo(){this.#combo=Math.min(8,this.#combo+1);this.#comboT=CFG.COMBO_WINDOW/1000;}
  #tickCombo(dt){if(this.#combo>1){this.#comboT-=dt;if(this.#comboT<=0)this.#combo=1;}}
  #tickMods(dt){
    for(const k of["PREVENT","INSIGHT","IDENTITY","FEM","COMPLETE","CHARLOTTE_AIM","CLOUD"])
      if(this.#mods[k]>0)this.#mods[k]=Math.max(0,this.#mods[k]-dt);
    if(this.#pangeaT>0){this.#pangeaT=Math.max(0,this.#pangeaT-dt);this.#mods.PANGEA=this.#pangeaT;}
  }

  #addScore(pts,x,y,label){
    this.#score+=pts;this.#waveScore+=pts;
    const col=pts>=1000?CS.GREEN:pts>=300?CS.YELLOW:CS.ORANGE;
    this.#floats.spawn(x,y,label,col,pts>=500?17:13);
  }

  #loseLife(){
    this.#lives--;
    this.#parts.playerHit(this.#px+CFG.PLR_W/2,this.#py+CFG.PLR_H/2);
    this.#fx.shake(0.5);this.#fx.flash(224,0,60,0.6);
    this.#fx.chroma(0.04);this.#audio.playerHit();this.#combo=1;
    if(this.#lives<=0){this.#gameOver();return;}
    this.#hitPause=CFG.HIT_PAUSE_MS/1000;
    this.#px=canvas.width/2-CFG.PLR_W/2;this.#canShoot=true;
    const dc=getDeathContext(this.#currentPhase,this.#modulesCollected);
    this.#floats.spawn(canvas.width/2,canvas.height/2-24,
      `⚠ ${dc.headline.slice(0,46)}`,CS.RED_GLOW,11);
  }

  #collectMod(mod){
    this.#audio.moduleUp();
    this.#parts.moduleCollect(this.#px+CFG.PLR_W/2,this.#py,mod.color);
    this.#notify.push(mod,false);
    this.#fx.flash(parseInt(mod.color.slice(1,3),16),parseInt(mod.color.slice(3,5),16),parseInt(mod.color.slice(5,7),16),0.25);
    this.#modulesCollected.add(mod.id);
    switch(mod.id){
      case"PREVENT":
        this.#mods.PREVENT=mod.duration;
        this.#floats.spawn(this.#px+CFG.PLR_W/2,this.#py-10,"🛡️ TRIPLE SHOT — AI PREVENTION ACTIVE",CS.CYAN,12);break;
      case"INSIGHT":
        this.#mods.INSIGHT=mod.duration;
        this.#floats.spawn(this.#px+CFG.PLR_W/2,this.#py-10,"🔍 XDR — FULL VISIBILITY + 2x CORRELATED KILLS",CS.BLUE,12);break;
      case"IDENTITY":
        this.#mods.IDENTITY=mod.duration;
        this.#floats.spawn(this.#px+CFG.PLR_W/2,this.#py-10,"🪪 IDENTITY — CREDENTIAL ATTACKS BLOCKED",CS.YELLOW,12);break;
      case"CLOUD":   this.#doCloud();break;
      case"FEM":     this.#doFEM();break;
      case"CHARLOTTE":this.#doCharlotte();break;
      case"PANGEA":  this.#doPangea();break;
      case"OVERWATCH":this.#doOverwatch();break;
      case"COMPLETE":this.#doComplete();break;
    }
  }

  #doCloud(){
    this.#fx.flash(255,106,0,0.4);this.#fx.shake(0.25);this.#mods.CLOUD=20;
    this.#floats.spawn(canvas.width/2,canvas.height/2,"☁️ CLOUD SECURITY — RUNTIME PROTECTION ACTIVE",CS.ORANGE,15);
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){const a=this.#attackers[c]?.[r];if(a)a.vanished=false;}
    const token=++this.#cloudCancelToken;
    let delay=0;
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];if(!a?.alive)continue;
        const ac=a,rc=r;
        setTimeout(()=>{
          if(this.#cloudCancelToken!==token)return;
          if(!ac.alive)return;
          ac.alive=false;
          this.#parts.csExplosion(ac.x+CFG.ATK_W/2,ac.y+CFG.ATK_H/2);
          this.#addScore(CFG.SCORE_ROW[rc]*this.#combo,ac.x+CFG.ATK_W/2,ac.y,`☁️ +${CFG.SCORE_ROW[rc]*this.#combo}`);
          this.#audio.boom();
        },delay);delay+=140;
      }
    this.#aBullets.forEach(b=>this.#bltPool.release(b));this.#aBullets=[];
  }

  #doFEM(){
    this.#audio.fem();this.#fx.flash(0,255,208,0.3);this.#mods.FEM=MODULES.FEM.duration;
    this.#floats.spawn(canvas.width/2,canvas.height/2-20,"🗺️ EXPOSURE MGMT — ATTACK SURFACE MAPPED",CS.TEAL,14);
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];if(!a)continue;
        if(a.isHidden){a.isHidden=false;this.#parts.femReveal(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);}
        a.vanished=false;
        if(a.alive)this.#parts.femReveal(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);
      }
  }

  #doCharlotte(){
    this.#audio.charlotte();this.#fx.flash(57,255,20,0.35);this.#mods.CHARLOTTE_AIM=15;
    this.#floats.spawn(canvas.width/2,canvas.height/3,"🤖 CHARLOTTE AI — AUTONOMOUS THREAT ANALYSIS",CS.GREEN,14);
    this.#charlotte.activate(this.#attackers,CFG.COLS,CFG.ROWS,a=>{
      this.#parts.csExplosion(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);
      const pts=CFG.SCORE_ROW[0]*3;
      this.#addScore(pts,a.x+CFG.ATK_W/2,a.y,`🤖 AI +${pts}`);
    });
  }

  #doPangea(){
    this.#audio.pangea();this.#fx.flash(0,255,208,0.45);this.#fx.shake(0.18);
    this.#pangeaT=MODULES.PANGEA.duration;this.#mods.PANGEA=this.#pangeaT;
    this.#floats.spawn(canvas.width/2,canvas.height/2-30,"🌍 PANGEA — ADVERSARY INFRASTRUCTURE FROZEN",CS.TEAL,14);
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];
        if(a?.alive)this.#parts.pangeaFreeze(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);
      }
    this.#aBullets.forEach(b=>this.#bltPool.release(b));this.#aBullets=[];
  }

  #doOverwatch(){
    this.#audio.overwatch();this.#fx.flash(255,106,0,0.45);
    this.#state=STATE.OVERWATCH_SEQ;
    this.#overwatch.activate(this.#attackers,CFG.COLS,CFG.ROWS,a=>{
      this.#parts.overWatchKill(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);
      const pts=CFG.SCORE_ROW[0]*5;
      this.#addScore(pts,a.x+CFG.ATK_W/2,a.y,`👁️ HUNTED +${pts}`);
      this.#audio.boom();this.#fx.shake(0.16);
    });
  }

  #doComplete(){
    this.#audio.complete();this.#fx.shake(0.55);
    this.#fx.flash(224,0,60,0.65);this.#fx.chroma(0.07);
    this.#state=STATE.FALCON_COMPLETE;
    const isBossWave=!!this.#boss?.alive;
    if(isBossWave){
      const dmg=Math.ceil(this.#boss.maxHp*0.40);
      this.#boss.hp=Math.max(1,this.#boss.hp-dmg);
      if(this.#boss.hp<=this.#boss.maxHp*0.3)this.#boss.rage=true;
      this.#parts.bossExplode(this.#boss.x+this.#boss.w/2,this.#boss.y+this.#boss.h/2);
      const bpts=Math.floor(dmg*80*this.#combo);
      this.#addScore(bpts,this.#boss.x+this.#boss.w/2,this.#boss.y,
        `🦅 MDR STRIKE −${dmg}HP +${bpts}`);
      this.#fx.shake(0.9);
    }
    this.#fcSystem.activate(
      this.#attackers,CFG.COLS,CFG.ROWS,
      (a,idx)=>{
        setTimeout(()=>{
          this.#parts.completeKill(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);
          this.#audio.boom();
        },idx*50);
        const pts=CFG.SCORE_ROW[0]*this.#combo*2;
        this.#addScore(pts,a.x+CFG.ATK_W/2,a.y,`🦅 MDR +${pts}`);
      },
      isBossWave
    );
    this.#aBullets.forEach(b=>this.#bltPool.release(b));
    this.#aBullets=[];
  }

  // ─── RENDER ──────────────────────────────────────────────────────
  #render(){
    const W=canvas.width,H=canvas.height;
    ctx.fillStyle=CS.BG;ctx.fillRect(0,0,W,H);
    this.#stars.draw(ctx);
    switch(this.#state){
      case STATE.TITLE:this.#title.draw(ctx,W,H);break;
      case STATE.MODULE_CHOICE:this.#modChoice.draw(ctx,W,H,this.#currentPhase);break;
      case STATE.WAVE_BANNER:
      case STATE.BOSS_WARNING:
        this.#renderGame(W,H);this.#drawWaveBanner(ctx,W,H);break;
      case STATE.OVERWATCH_SEQ:
        this.#renderGame(W,H);this.#overwatch.draw(ctx);break;
      case STATE.FALCON_COMPLETE:
        this.#renderGame(W,H);this.#fcSystem.draw(ctx,W,H);break;
      case STATE.PLAYING:
      case STATE.BOSS:
        this.#renderGame(W,H);break;
      case STATE.INCIDENT_REPORT:
        this.#renderGame(W,H);
        drawIncidentReport(ctx,W,H,this.#currentPhase,this.#waveScore,
          this.#modulesCollected,this.#bannerT,CFG.INCIDENT_REPORT_MS/1000,this.#blinkSkip);
        break;
      case STATE.GAME_OVER:
        this.#renderGame(W,H);this.#drawGameOver(ctx,W,H);break;
      case STATE.YOU_WIN:
        this.#renderGame(W,H);this.#drawYouWin(ctx,W,H);break;
    }
    this.#fx.drawPost(ctx,W,H);
  }

  #renderGame(W,H){
    if(this.#currentPhase){
      const r=parseInt(this.#currentPhase.color.slice(1,3),16);
      const g=parseInt(this.#currentPhase.color.slice(3,5),16);
      const b=parseInt(this.#currentPhase.color.slice(5,7),16);
      ctx.fillStyle=`rgba(${r},${g},${b},0.03)`;ctx.fillRect(0,0,W,H);
    }
    this.#fx.applyShake(ctx);
    this.#blocks.forEach(b=>b.draw(ctx));
    this.#drawAttackers();
    this.#boss?.draw(ctx,this.#assets.get(`act${this.#boss.imgIdx??0}`));
    this.#drawSideEnemies();
    this.#drawPlayer();this.#drawBullets();
    this.#ufo?.draw(ctx,this.#assets.get("act0"));
    this.#powerUps.forEach(p=>p.draw(ctx));
    this.#bonusDrop.draw(ctx);
    this.#charlotte.draw(ctx);
    this.#parts.draw(ctx);this.#floats.draw(ctx);
    if(this.#fx.chromaAmt>0.005){
      ctx.save();ctx.globalAlpha=0.26;ctx.globalCompositeOperation="screen";
      ctx.drawImage(canvas,this.#fx.chromaAmt*canvas.width,0);
      ctx.globalCompositeOperation="source-over";ctx.globalAlpha=1;ctx.restore();
    }
    if(this.#pangeaT>0){
      ctx.save();
      ctx.fillStyle=`rgba(0,229,255,${0.04+Math.sin(performance.now()*0.003)*0.02})`;
      ctx.fillRect(0,0,W,H);ctx.restore();
    }
    this.#fx.restoreShake(ctx);
    this.#hud.setState(this.#score,this.#hi,this.#lives,this.#waveIdx+1,
      this.#combo,this.#mods,this.#pangeaT,this.#currentPhase?.environment??"",
      this.#waveGraceT);
    this.#hud.draw(ctx,W);
    this.#notify.draw(ctx,W);
    this.#socFeed.draw(ctx,W,H);
    this.#drawKonami(W,H);
  }

  #drawAttackers(){
    const now=performance.now();
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];if(!a?.alive)continue;
        if(a.isHidden){
          if(this.#mods.FEM>0){
            ctx.save();ctx.globalAlpha=0.28;ctx.strokeStyle=CS.TEAL;ctx.lineWidth=1.5;
            ctx.shadowColor=CS.TEAL;ctx.shadowBlur=8;
            ctx.beginPath();ctx.roundRect(a.x,a.y,CFG.ATK_W,CFG.ATK_H,3);ctx.stroke();
            ctx.font="7px 'Courier New'";ctx.textAlign="center";
            ctx.fillStyle=CS.TEAL;ctx.fillText("HIDDEN",a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2+3);
            ctx.restore();
          }
          continue;
        }
        const img=this.#assets.get(`act${a.imageIndex}`);
        const bob=Math.sin(a.phase+now*0.0014)*2.5;
        const hue=(r*50+now*0.025)%360;
        if(a.isImpostor&&!a.revealed){
          const distToPlayer=Math.abs(a.x+CFG.ATK_W/2-(this.#px+CFG.PLR_W/2));
          const showReal=distToPlayer<90||this.#mods.IDENTITY>0;
          ctx.save();
          if(!showReal){
            ctx.globalAlpha=0.9;ctx.fillStyle="rgba(4,1,18,0.85)";
            ctx.strokeStyle=a.decoyMod.color;ctx.lineWidth=1.5;
            ctx.shadowColor=a.decoyMod.color;ctx.shadowBlur=10;
            ctx.beginPath();ctx.roundRect(a.x+5,a.y+bob,CFG.ATK_W-10,CFG.ATK_H,4);
            ctx.fill();ctx.stroke();
            ctx.font="14px serif";ctx.textAlign="center";ctx.shadowBlur=0;
            ctx.fillText(a.decoyMod.emoji,a.x+CFG.ATK_W/2,a.y+bob+CFG.ATK_H*0.75);
          }else{
            ctx.globalAlpha=0.9;ctx.fillStyle="rgba(224,0,60,0.35)";
            ctx.fillRect(a.x,a.y+bob,CFG.ATK_W,CFG.ATK_H);
            ctx.shadowColor=CS.RED;ctx.shadowBlur=12;
            if(img)ctx.drawImage(img,a.x,a.y+bob,CFG.ATK_W,CFG.ATK_H);
            else{ctx.fillStyle=CS.RED;ctx.fillRect(a.x,a.y+bob,CFG.ATK_W,CFG.ATK_H);}
            ctx.font="bold 7px 'Courier New'";ctx.textAlign="center";
            ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=6;
            ctx.fillText("IMPOSTOR",a.x+CFG.ATK_W/2,a.y+bob-3);
          }
          ctx.restore();continue;
        }
        ctx.save();
        if(a.vanished)ctx.globalAlpha=0.12+Math.sin(now*0.005)*0.05;
        if(a.isTrusted){ctx.shadowColor=CS.GREEN;ctx.shadowBlur=14;}
        else{ctx.shadowColor=`hsl(${hue},100%,60%)`;ctx.shadowBlur=7+Math.sin(a.phase+now*0.002)*3;}
        if(this.#pangeaT>0){
          ctx.globalAlpha=(a.vanished?0.08:0.68);
          ctx.fillStyle="rgba(0,200,255,0.28)";ctx.fillRect(a.x,a.y+bob,CFG.ATK_W,CFG.ATK_H);
          ctx.globalAlpha=a.vanished?0.12:1;
        }
        if(img)ctx.drawImage(img,a.x,a.y+bob,CFG.ATK_W,CFG.ATK_H);
        else{ctx.fillStyle=a.isTrusted?CS.GREEN:`hsl(${hue},80%,55%)`;ctx.fillRect(a.x,a.y+bob,CFG.ATK_W,CFG.ATK_H);}
        if(this.#mods.INSIGHT>0&&!a.vanished){
          ctx.font="bold 7px 'Courier New'";ctx.textAlign="center";
          ctx.fillStyle=CS.BLUE;ctx.shadowColor=CS.BLUE;ctx.shadowBlur=5;
          ctx.fillText("⚠APT",a.x+CFG.ATK_W/2,a.y+bob-3);
        }
        if(this.#mods.FEM>0){
          ctx.font="7px 'Courier New'";ctx.textAlign="center";
          ctx.fillStyle=CS.TEAL;ctx.shadowColor=CS.TEAL;ctx.shadowBlur=4;
          ctx.fillText("EXPOSED",a.x+CFG.ATK_W/2,a.y+bob+CFG.ATK_H+10);
        }
        if(this.#currentPhase?.behavior?.stagingPhase&&!this.#stagingComplete){
          ctx.font="7px 'Courier New'";ctx.textAlign="center";
          ctx.fillStyle=CS.ORANGE;ctx.shadowBlur=0;
          ctx.fillText("STAGING",a.x+CFG.ATK_W/2,a.y+bob-3);
        }
        if(a.isTrusted){
          ctx.font="bold 7px 'Courier New'";ctx.textAlign="center";
          ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=6;
          ctx.fillText("TRUSTED",a.x+CFG.ATK_W/2,a.y+bob-3);
          if(this.#mods.INSIGHT>0||this.#mods.IDENTITY>0){
            ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;
            ctx.fillText("(COMPROMISED)",a.x+CFG.ATK_W/2,a.y+bob+CFG.ATK_H+10);
          }
        }
        if(this.#currentPhase?.behavior?.credentialGhosts&&r===CFG.ROWS-1){
          const gp=0.5+Math.sin(now*0.008)*0.3;
          ctx.globalAlpha=gp*0.6;ctx.strokeStyle=CS.YELLOW;ctx.lineWidth=1.2;
          ctx.shadowColor=CS.YELLOW;ctx.shadowBlur=8;
          ctx.beginPath();ctx.roundRect(a.x-2,a.y+bob-2,CFG.ATK_W+4,CFG.ATK_H+4,3);ctx.stroke();
          ctx.globalAlpha=1;ctx.font="bold 6px 'Courier New'";ctx.textAlign="center";
          ctx.fillStyle=CS.YELLOW;ctx.shadowColor=CS.YELLOW;ctx.shadowBlur=5;
          ctx.fillText("CREDENTIAL GHOST",a.x+CFG.ATK_W/2,a.y+bob+CFG.ATK_H+10);
        }
        ctx.restore();
      }
  }

    #drawSideEnemies(){
    const now=performance.now();
    for(const e of this.#sideEnemies){
      if(!e.alive)continue;
      const img=this.#assets.get(`act${e.imageIndex}`);
      const bob=Math.sin(e.phase+now*0.002)*2;
      ctx.save();ctx.shadowColor=CS.PURPLE;ctx.shadowBlur=12+Math.sin(now*0.005)*4;
      if(img)ctx.drawImage(img,e.x,e.y+bob,CFG.ATK_W,CFG.ATK_H);
      else{ctx.fillStyle=CS.PURPLE;ctx.fillRect(e.x,e.y+bob,CFG.ATK_W,CFG.ATK_H);}
      ctx.font="bold 7px 'Courier New'";ctx.textAlign="center";
      ctx.fillStyle=CS.PURPLE;ctx.shadowColor=CS.PURPLE;ctx.shadowBlur=6;
      ctx.fillText("SIDE VECTOR",e.x+CFG.ATK_W/2,e.y+bob-4);
      ctx.restore();
    }
  }

  #drawPlayer(){
    const img=this.#assets.get("player");
    const flicker=0.4+Math.random()*0.6;
    const tg=ctx.createRadialGradient(
      this.#px+CFG.PLR_W/2,this.#py+CFG.PLR_H+10,0,
      this.#px+CFG.PLR_W/2,this.#py+CFG.PLR_H+10,16);
    tg.addColorStop(0,`rgba(224,0,60,${flicker})`);tg.addColorStop(1,"rgba(224,0,60,0)");
    ctx.fillStyle=tg;ctx.fillRect(this.#px,this.#py,CFG.PLR_W,CFG.PLR_H+20);
    ctx.save();
    if(this.#mods.IDENTITY>0){
      const p=0.65+Math.sin(performance.now()*0.006)*0.35;
      ctx.strokeStyle=`rgba(255,220,0,${p})`;ctx.lineWidth=2;
      ctx.shadowColor=CS.YELLOW;ctx.shadowBlur=18*p;
      ctx.beginPath();
      ctx.ellipse(this.#px+CFG.PLR_W/2,this.#py+CFG.PLR_H/2,
        CFG.PLR_W*0.85,CFG.PLR_H*1.4,0,0,Math.PI*2);
      ctx.stroke();
    }
    if(this.#mods.CHARLOTTE_AIM>0){
      let nearest=null,nearDist=Infinity;
      for(let c=0;c<CFG.COLS;c++)
        for(let r=0;r<CFG.ROWS;r++){
          const a=this.#attackers[c]?.[r];
          if(!a?.alive||a.isHidden)continue;
          const d=Math.abs(a.x+CFG.ATK_W/2-(this.#px+CFG.PLR_W/2));
          if(d<nearDist){nearDist=d;nearest=a;}
        }
      if(nearest){
        ctx.save();ctx.globalAlpha=0.35;ctx.strokeStyle=CS.GREEN;ctx.lineWidth=1;
        ctx.setLineDash([4,4]);ctx.shadowColor=CS.GREEN;ctx.shadowBlur=6;
        ctx.beginPath();ctx.moveTo(this.#px+CFG.PLR_W/2,this.#py);
        ctx.lineTo(nearest.x+CFG.ATK_W/2,nearest.y+CFG.ATK_H);ctx.stroke();
        ctx.setLineDash([]);ctx.restore();
      }
    }
    // Grace period shield ring around player
    if(this.#waveGraceT>0){
      const gprog=this.#waveGraceT/CFG.WAVE_GRACE_S;
      const gpulse=0.5+Math.sin(performance.now()*0.01)*0.5;
      ctx.strokeStyle=`rgba(0,229,255,${gprog*0.7*gpulse})`;
      ctx.lineWidth=2;ctx.shadowColor=CS.CYAN;ctx.shadowBlur=14*gpulse;
      ctx.beginPath();
      ctx.arc(this.#px+CFG.PLR_W/2,this.#py+CFG.PLR_H/2,
        CFG.PLR_W*0.8+Math.sin(performance.now()*0.008)*3,0,Math.PI*2);
      ctx.stroke();
    }
    ctx.shadowColor=CS.RED;ctx.shadowBlur=14;
    if(img)ctx.drawImage(img,this.#px,this.#py,CFG.PLR_W,CFG.PLR_H);
    else{ctx.fillStyle=CS.RED;ctx.fillRect(this.#px,this.#py,CFG.PLR_W,CFG.PLR_H);}
    ctx.restore();
  }

  #drawBullets(){
    for(const b of this.#pBullets){
      ctx.save();
      const grad=ctx.createLinearGradient(b.x,b.y+b.h,b.x,b.y);
      grad.addColorStop(0,CS.RED);grad.addColorStop(1,CS.WHITE);
      ctx.fillStyle=grad;ctx.shadowColor=CS.RED;ctx.shadowBlur=10;
      ctx.fillRect(b.x,b.y,b.w,b.h);ctx.restore();
    }
    for(const b of this.#aBullets){
      ctx.save();
      const col=b.corrupt?CS.RED:b.boss?CS.YELLOW:CS.ORANGE;
      ctx.shadowColor=col;ctx.shadowBlur=b.corrupt?16:10;
      ctx.fillStyle=col;ctx.fillRect(b.x,b.y,b.w,b.h);
      if(b.corrupt){
        ctx.globalAlpha=0.35;ctx.fillStyle="rgba(224,0,60,0.5)";
        ctx.fillRect(b.x-b.w,b.y-b.h*0.5,b.w*3,b.h*2);
      }
      if(b.boss){
        ctx.globalAlpha=0.22;ctx.fillRect(b.x-b.w,b.y-b.h*0.5,b.w*3,b.h*2);
      }
      ctx.restore();
    }
  }

  #drawWaveBanner(ctx,w,h){
    const t=this.#bannerT;
    const scl=0.5+Math.min(1,t*4)*0.5;
    const a=Math.min(1,t*3)*Math.max(0,1-(t-0.6)*2.5);
    ctx.save();ctx.globalAlpha=Math.max(0,a);
    ctx.translate(w/2,h/2);ctx.scale(scl,scl);ctx.translate(-w/2,-h/2);
    ctx.textAlign="center";
    const phase=this.#currentPhase;
    if(this.#bannerBoss){
      ctx.font="bold 40px 'Courier New'";
      ctx.fillStyle=CS.RED_GLOW;ctx.shadowColor=CS.RED_GLOW;ctx.shadowBlur=34;
      ctx.fillText(`👾 ${phase?.shortName??"BOSS"} INCOMING!`,w/2,h/2-22);
      ctx.font="bold 14px 'Courier New'";ctx.fillStyle=CS.ORANGE;ctx.shadowBlur=12;
      ctx.fillText("HIGH-PRIORITY THREAT — CROWDSTRIKE RESPONDING",w/2,h/2+26);
    }else{
      ctx.font="bold 50px 'Courier New'";
      const g=ctx.createLinearGradient(0,0,w,0);
      g.addColorStop(0,CS.RED);g.addColorStop(1,CS.ORANGE);
      ctx.fillStyle=g;ctx.shadowColor=CS.RED;ctx.shadowBlur=26;
      ctx.fillText(`WAVE  ${this.#waveIdx+1}`,w/2,h/2-22);
      ctx.font="bold 14px 'Courier New'";
      ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=12;
      ctx.fillText("FALCON DEPLOYED — DEFEND THE NETWORK",w/2,h/2+26);
    }
    if(this.#blinkSkip){
      ctx.font="10px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
      ctx.fillText("[ SPACE ] CONTINUE",w/2,h/2+50);
    }
    ctx.restore();
  }

  #drawGameOver(ctx,w,h){
    const dc=this.#deathCtx;
    ctx.fillStyle="rgba(4,1,12,0.86)";ctx.fillRect(0,0,w,h);
    ctx.fillStyle=CS.RED;ctx.fillRect(0,0,w,4);ctx.fillRect(0,h-4,w,4);
    ctx.save();ctx.textAlign="center";
    ctx.font="bold 38px 'Courier New'";
    ctx.fillStyle=CS.RED_GLOW;ctx.shadowColor=CS.RED_GLOW;ctx.shadowBlur=32;
    ctx.fillText("ADVERSARY ACHIEVED PERSISTENCE",w/2,h*0.13);
    if(dc){
      const px=50,py=h*0.21,pw=w-100,ph=182;
      ctx.fillStyle="rgba(8,2,26,0.94)";ctx.strokeStyle=CS.RED;ctx.lineWidth=1.5;
      ctx.shadowColor=CS.RED;ctx.shadowBlur=12;
      ctx.beginPath();ctx.roundRect(px,py,pw,ph,6);ctx.fill();ctx.stroke();
      ctx.fillStyle=CS.RED;ctx.shadowBlur=0;
      ctx.beginPath();ctx.roundRect(px,py,pw,24,[6,6,0,0]);ctx.fill();
      ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.WHITE;
      ctx.fillText("⚠  THREAT ANALYSIS — WHAT HAPPENED",w/2,py+16);
      ctx.font="bold 13px 'Courier New'";
      ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=10;
      ctx.fillText(dc.headline,w/2,py+44);
      ctx.font="11px 'Courier New'";ctx.fillStyle=CS.LTGREY;ctx.shadowBlur=0;
      const words=dc.body.split(" ");let line="",ly=py+64;
      for(const word of words){
        const test=line+word+" ";
        if(ctx.measureText(test).width>pw-50&&line!==""){
          ctx.fillText(line,w/2,ly);line=word+" ";ly+=15;
        }else line=test;
      }
      ctx.fillText(line,w/2,ly);
      ctx.font="bold 10px 'Courier New'";
      ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=8;
      ctx.fillText(`🦅 ${dc.cta}`,w/2,py+ph-14);
    }
    ctx.font="bold 16px 'Courier New'";
    ctx.fillStyle=CS.YELLOW;ctx.shadowColor=CS.YELLOW;ctx.shadowBlur=10;
    ctx.fillText(`BREACH PREVENTION SCORE:  ${this.#score.toLocaleString()}`,w/2,h*0.74);
    if(this.#score>=this.#hi&&this.#score>0){
      ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;
      ctx.fillText("✨ NEW RECORD — ELITE ANALYST",w/2,h*0.81);
    }else{
      ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;
      ctx.fillText(`RECORD: ${this.#hi.toLocaleString()}`,w/2,h*0.81);
    }
    ctx.font="bold 13px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
    ctx.fillText("[ R ]  REDEPLOY",w/2,h*0.88);
    ctx.font="bold 10px 'Courier New'";
    ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=8;
    ctx.fillText("🦅  crowdstrike.com  |  We Stop Breaches",w/2,h*0.94);
    ctx.restore();
  }

  #drawYouWin(ctx,w,h){
    ctx.fillStyle="rgba(4,1,12,0.86)";ctx.fillRect(0,0,w,h);
    ctx.fillStyle=CS.GREEN;ctx.fillRect(0,0,w,4);ctx.fillRect(0,h-4,w,4);
    ctx.save();ctx.textAlign="center";
    ctx.font="bold 44px 'Courier New'";
    ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=32;
    ctx.fillText("🦅 BREACH PREVENTED",w/2,h*0.22);
    ctx.font="bold 14px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
    ctx.fillText("All adversaries neutralized. Network secured.",w/2,h*0.33);
    ctx.font="12px 'Courier New'";ctx.fillStyle=CS.GREY;
    ctx.fillText("Falcon delivered visibility, detection and response",w/2,h*0.41);
    ctx.fillText("across every endpoint, identity and cloud workload.",w/2,h*0.47);
    ctx.font="bold 19px 'Courier New'";
    ctx.fillStyle=CS.YELLOW;ctx.shadowColor=CS.YELLOW;ctx.shadowBlur=10;
    ctx.fillText(`BREACH PREVENTION SCORE:  ${this.#score.toLocaleString()}`,w/2,h*0.57);
    if(this.#score>=this.#hi&&this.#score>0){
      ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=12;
      ctx.fillText("✨ NEW RECORD — ELITE ANALYST",w/2,h*0.65);
    }else{
      ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;
      ctx.fillText(`RECORD: ${this.#hi.toLocaleString()}`,w/2,h*0.65);
    }
    ctx.font="bold 13px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
    ctx.fillText("[ R ]  PLAY AGAIN",w/2,h*0.77);
    ctx.font="bold 11px 'Courier New'";
    ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=8;
    ctx.fillText("🦅  crowdstrike.com  |  We Stop Breaches — Guaranteed.",w/2,h*0.87);
    ctx.restore();
  }

  #drawLoading(loaded=0,total=1){
    const W=canvas.width,H=canvas.height,now=performance.now();
    ctx.fillStyle=CS.BG;ctx.fillRect(0,0,W,H);
    this.#stars.draw(ctx);
    ctx.textAlign="center";
    const pulse=Math.sin(now*0.004);
    ctx.font="bold 30px 'Courier New'";
    ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=20+pulse*10;
    ctx.fillText("🦅  FALCON ARCADE DEFENSE",W/2,H*0.30);
    ctx.font="bold 11px 'Courier New'";
    ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=8;
    ctx.fillText("THREAT INTELLIGENCE INITIALIZING",W/2,H*0.38);
    ctx.shadowBlur=0;
    const barW=340,barH=10,bx=(W-barW)/2,by=H*0.48;
    const prog=total>0?loaded/total:0;
    ctx.fillStyle="#1a1a2e";
    ctx.beginPath();ctx.roundRect(bx,by,barW,barH,5);ctx.fill();
    if(prog>0){
      const glow=Math.sin(now*0.006)*0.3+0.7;
      ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=14*glow;
      ctx.beginPath();ctx.roundRect(bx,by,barW*prog,barH,5);ctx.fill();
      const ex=bx+barW*prog;
      ctx.fillStyle=CS.WHITE;ctx.shadowColor=CS.WHITE;ctx.shadowBlur=18;
      ctx.beginPath();ctx.roundRect(Math.max(bx,ex-3),by-2,5,barH+4,3);ctx.fill();
    }
    const shim=(Math.sin(now*0.003)*0.5+0.5)*barW;
    ctx.globalAlpha=0.06+Math.sin(now*0.005)*0.04;
    ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
    ctx.fillRect(bx,by,shim,barH);
    ctx.globalAlpha=1;
    const msgs=[
      "Loading endpoint sensors…",
      "Syncing identity telemetry…",
      "Calibrating cloud detectors…",
      "Mapping attack surface…",
      "Connecting to OverWatch…",
      "Priming Charlotte AI…",
      "Scanning adversary infrastructure…",
      "Engaging threat intelligence…",
    ];
    const blink=Math.sin(now*0.008)>0;
    ctx.font="11px 'Courier New'";
    ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=6;
    ctx.fillText(msgs[Math.floor(now/900)%msgs.length],W/2,by+28);
    ctx.font="10px 'Courier New'";
    ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText(`${loaded} / ${total} assets loaded`,W/2,by+46);
    if(blink&&loaded===total&&total>0){
      ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=8;
      ctx.fillText("✅  ALL SYSTEMS READY",W/2,by+64);
    }
    ctx.textAlign="left";
  }

  #ov(ax,ay,aw,ah,bx,by,bw,bh){
    return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
  }

} // end class Game

// ─── BOOTSTRAP ───────────────────────────────────────────────────
const game=new Game();
game.init().catch(console.error);
