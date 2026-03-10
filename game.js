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
  RED      : "#E0003C",
  ORANGE   : "#FF6A00",
  RED_GLOW : "#FF1744",
  CYAN     : "#00E5FF",
  BLUE     : "#0066FF",
  GREEN    : "#39FF14",
  YELLOW   : "#FFE600",
  WHITE    : "#FFFFFF",
  GREY     : "#A0A8B8",
  LTGREY   : "#D0D8E8",
  BG       : "#04010C",
  TEAL     : "#00FFD0",
  PURPLE   : "#AA00FF",
  PINK     : "#FF00CC",
});

// ─── GAME STATES ─────────────────────────────────────────────────
const STATE = Object.freeze({
  TITLE           : "TITLE",
  MODULE_CHOICE   : "MODULE_CHOICE",
  WAVE_BANNER     : "WAVE_BANNER",
  PLAYING         : "PLAYING",
  BOSS_WARNING    : "BOSS_WARNING",
  BOSS            : "BOSS",
  OVERWATCH_SEQ   : "OVERWATCH_SEQ",
  FALCON_COMPLETE : "FALCON_COMPLETE",
  INCIDENT_REPORT : "INCIDENT_REPORT",
  GAME_OVER       : "GAME_OVER",
  YOU_WIN         : "YOU_WIN",
});

// ─── MODULES ─────────────────────────────────────────────────────
const MODULES = Object.freeze({
  PREVENT: {
    id:"PREVENT", name:"Falcon Prevent", shortName:"PREVENT",
    tagline:"Next-Gen AV & EPP",
    desc:"AI-powered endpoint protection stops ransomware and zero-days before execution.",
    mechanic:"Triple shot + reflects first malware bullet per wave.",
    emoji:"🛡️", color:CS.CYAN, duration:12,
  },
  INSIGHT: {
    id:"INSIGHT", name:"Falcon Insight XDR", shortName:"INSIGHT XDR",
    tagline:"Extended Detection & Response",
    desc:"Full attack surface visibility. Correlates every signal into one attack story.",
    mechanic:"Reveals hidden enemies. Correlated kills give 2x combo multiplier.",
    emoji:"🔍", color:CS.BLUE, duration:10,
  },
  IDENTITY: {
    id:"IDENTITY", name:"Falcon Identity", shortName:"IDENTITY",
    tagline:"Identity Threat Detection",
    desc:"Detects credential abuse and MFA bypass the moment they occur.",
    mechanic:"Blocks one hit. Exposes impostor enemies. Disables fake signals.",
    emoji:"🪪", color:CS.YELLOW, duration:9,
  },
  CLOUD: {
    id:"CLOUD", name:"Falcon Cloud Security", shortName:"CLOUD SEC",
    tagline:"Cloud-Native Protection",
    desc:"CNAPP securing every workload, container and cloud service.",
    mechanic:"Opens cloud lane. Eliminates cloud-pivot enemies. 20s assisted containment.",
    emoji:"☁️", color:CS.ORANGE, duration:20,
  },
  FEM: {
    id:"FEM", name:"Falcon Exposure Mgmt", shortName:"EXPOSURE",
    tagline:"Attack Surface Management",
    desc:"Discovers exposed assets before adversaries exploit them.",
    mechanic:"Reveals dormant hidden nodes. Slows enemies 40%. Marks weak points.",
    emoji:"🗺️", color:CS.TEAL, duration:8,
  },
  CHARLOTTE: {
    id:"CHARLOTTE", name:"Charlotte AI", shortName:"CHARLOTTE",
    tagline:"Generative AI Security",
    desc:"AI co-pilot that neutralises the five highest-value threats autonomously.",
    mechanic:"Auto-targets 5 priority threats. Enhanced aim for 15s after.",
    emoji:"🤖", color:CS.GREEN, duration:15,
  },
  PANGEA: {
    id:"PANGEA", name:"Falcon Pangea", shortName:"PANGEA",
    tagline:"Global Threat Intelligence",
    desc:"Planet-scale intelligence. Blocks adversary infrastructure globally.",
    mechanic:"Freezes all enemies 7s. Marks priority targets. Clears active bullets.",
    emoji:"🌍", color:CS.TEAL, duration:7,
  },
  OVERWATCH: {
    id:"OVERWATCH", name:"Falcon OverWatch", shortName:"OVERWATCH",
    tagline:"Managed Threat Hunting 24/7",
    desc:"Elite hunters tracking adversaries around the clock.",
    mechanic:"Hunts 3 elite targets. Predicts next attack path. Paints hunt markers.",
    emoji:"👁️", color:CS.ORANGE, duration:0,
  },
  COMPLETE: {
    id:"COMPLETE", name:"Falcon Complete MDR", shortName:"COMPLETE",
    tagline:"Managed Detection & Response",
    desc:"Your fully-managed security team. Analysts respond in minutes.",
    mechanic:"30s assisted containment. SOC analysts neutralise threats progressively.",
    emoji:"🦅", color:CS.RED, duration:30,
  },
});

const MODULE_POOL = Object.values(MODULES);

// ─── SOC COMMS — live operational voice lines per phase ──────────
// Short, urgent, operator-style. Shown during gameplay as radio feed.
const SOC_COMMS = {
  fancy_bear: [
    "Helpdesk reset issued — CFO account.",
    "Credential spray detected. Identity systems.",
    "Impossible travel flag. Moscow to NYC, 4 minutes.",
    "Lateral movement. Finance subnet.",
    "Living-off-the-land. PowerShell abuse.",
    "OverWatch: FANCY BEAR TTP confirmed.",
  ],
  ai_syndicate: [
    "LLM-generated phishing. Zero grammar errors.",
    "Deepfake audio — executive impersonation.",
    "Novel malware variant. No signature match.",
    "AI attack velocity exceeding analyst capacity.",
    "Charlotte AI: autonomous triage engaged.",
    "Machine-speed threat. Machine-speed response needed.",
  ],
  carbon_spider: [
    "Staging phase detected. Credential harvest.",
    "Shadow copies deleted. Ransomware prep.",
    "Fileless payload. Memory only. No disk writes.",
    "Encryption staging. You have seconds.",
    "Backup systems targeted. Isolate now.",
    "OverWatch: pre-ransomware indicators confirmed.",
  ],
  cozy_bear: [
    "OAuth consent spike. Cloud pivot likely.",
    "Service account abuse. Cloud tenant.",
    "Endpoint gone dark. Reappearing in cloud lane.",
    "Token theft. No password needed.",
    "Cloud workload compromised. Runtime threat.",
    "47-day dwell time if undetected.",
  ],
  scattered_spider: [
    "Vishing call active. Helpdesk targeted.",
    "MFA reset requested. Verify identity.",
    "Impostor authenticated. Valid credentials.",
    "Social engineering in progress.",
    "Fake trusted signal detected.",
    "SCATTERED SPIDER: no malware required.",
  ],
  volt_typhoon: [
    "Stealth movement. OT boundary.",
    "Living-off-the-land. No malware signature.",
    "Pre-positioning detected. Critical infrastructure.",
    "Hidden node activated. Power grid adjacent.",
    "300-day dwell time. Patient adversary.",
    "Exposure Management: unknown asset found.",
  ],
  midnight_blizzard_boss: [
    "Supply chain alert. Vendor update suspicious.",
    "Password spray. One attempt per account.",
    "MFA token stolen. No brute force needed.",
    "NOBELIUM TTP confirmed by OverWatch.",
    "Trusted vendor compromised. Downstream risk.",
    "Complete MDR: NOBELIUM expertise engaged.",
  ],
  sandworm: [
    "Wiper malware staging. Destructive intent.",
    "OT systems targeted. Physical damage risk.",
    "MBR destruction sequence initiated.",
    "Industrial systems at risk. Isolate now.",
    "NotPetya-class payload detected.",
    "Prevent: behavioral AI — stop before first wipe.",
  ],
  blackcat_boss: [
    "BLACKCAT affiliate active. Rust payload.",
    "ESXi enumeration. All VMs at risk.",
    "Triple extortion: encrypt, publish, DDoS.",
    "Alert volume critical. Charlotte AI needed.",
    "Backup deletion confirmed. No recovery path.",
    "Multi-lane encryption. Simultaneous strike.",
  ],
  lazarus_final: [
    "Crypto treasury targeted. Nation-state.",
    "Custom implant. Never seen before.",
    "Multi-phase operation. Theft then destruction.",
    "14-month dwell time if undetected.",
    "Lazarus: espionage, theft, destruction — all three.",
    "Full platform required. This is the final test.",
  ],
};

// ─── LEGACY TOOLS ────────────────────────────────────────────────
const LEGACY_TOOLS = [
  { name:"FIREWALL",  shortMsg:"PERIMETER BREACHED",   color:"#00AAFF",
    failMsg:"Firewalls block ports — not identity abuse or encrypted C2." },
  { name:"WAF",       shortMsg:"APP LAYER BYPASSED",   color:"#AA00FF",
    failMsg:"WAFs stop known web exploits — not zero-days or supply chain." },
  { name:"SASE",      shortMsg:"EDGE COMPROMISED",     color:"#00FFD0",
    failMsg:"SASE secures the edge — not lateral movement inside the perimeter." },
  { name:"IPS",       shortMsg:"SIGNATURE EVADED",     color:"#FF6A00",
    failMsg:"IPS catches known signatures — not fileless or LOTL attacks." },
  { name:"ANTIVIRUS", shortMsg:"PAYLOAD UNKNOWN",      color:"#FFE600",
    failMsg:"Legacy AV needs signatures — AI-generated malware has none." },
  { name:"IAM",       shortMsg:"CREDENTIAL STOLEN",    color:"#FF1744",
    failMsg:"IAM manages access — it cannot detect stolen valid credentials." },
];

// ─── PHASES ──────────────────────────────────────────────────────
// ★ ADD A NEW PHASE BY ADDING ONE OBJECT HERE — NOTHING ELSE CHANGES ★
const PHASES = [
  {
    id:"fancy_bear", waveNum:1, isBoss:false, color:CS.ORANGE,
    name:"FANCY BEAR", shortName:"FANCY BEAR",
    aka:"APT28 / Sofacy / Forest Blizzard",
    nation:"🇷🇺 Russia — GRU", shortNation:"🇷🇺 Russia — GRU",
    threat:"CRITICAL", vector:"Credential Theft & Spear-Phishing",

    // What is under attack this wave
    environment:"HELPDESK / IDENTITY SYSTEMS",
    environmentDesc:"Employee credentials and identity infrastructure are the target.",
    objective:"Stop credential theft before lateral movement begins.",

    // Short threat card (replaces long brief)
    threatCard:"FANCY BEAR is harvesting credentials via spear-phishing. They will authenticate as your employees. Stop them before they reach finance systems.",

    // Full lore (available on SPACE hold)
    desc:"Russian GRU military intelligence. Targets governments and defence contractors using stolen credentials and weaponised documents.",
    attackDesc:"FANCY BEAR harvests credentials via spear-phishing, then authenticates as legitimate users — making them nearly invisible to traditional tools.",
    falconFix:"Falcon Identity establishes behavioural baselines for every account. Impossible travel and atypical access patterns trigger immediate alerts.",

    keyModules:["IDENTITY","INSIGHT","OVERWATCH","PREVENT"],
    moduleNarrative:{
      IDENTITY :"Detects stolen credentials the moment they're used — even if the password is correct.",
      INSIGHT  :"Correlates login anomalies with endpoint signals to expose the full attack chain.",
      OVERWATCH:"Elite hunters find the lateral movement FANCY BEAR performs after initial access.",
      PREVENT  :"Blocks weaponised documents and first-stage malware droppers before execution.",
    },

    // Behavior hooks — what makes this wave mechanically unique
    behavior:{
      // Credential ghost: one enemy per column mimics player X position
      credentialGhosts: true,
      // Enemies move toward player X axis more aggressively
      trackPlayer: 0.3,
      // Special event: fake "trusted" signal drops that are actually traps
      fakeDrops: false,
      // Stealth: enemies partially invisible
      stealth: false,
      // Staging: wave has two phases — staging then attack
      stagingPhase: false,
      // Cloud lane: enemies can disappear and reappear from side
      cloudLane: false,
      // Corruption: damages blocks over time
      corruption: false,
    },

    drops:{IDENTITY:0.32,INSIGHT:0.22,OVERWATCH:0.16,PREVENT:0.18,FEM:0.08,CHARLOTTE:0.04},

    deathMessages:{
      IDENTITY:{
        headline:"NO IDENTITY PROTECTION — CREDENTIAL ATTACK SUCCEEDED",
        body:"This environment was not running Falcon Identity Protection. FANCY BEAR authenticated freely using stolen credentials — no behavioural baseline existed to flag the impossible travel or atypical login patterns.",
        cta:"Falcon Identity: behavioural baselines that make stolen credentials detectable. crowdstrike.com/falcon-identity",
      },
      OVERWATCH:{
        headline:"NO THREAT HUNTING — FANCY BEAR OPERATED UNCONTESTED",
        body:"FANCY BEAR's living-off-the-land techniques blended into legitimate admin activity. Without OverWatch elite hunters proactively searching for these patterns, the adversary had unlimited dwell time.",
        cta:"Falcon OverWatch: expert hunters finding what automated tools miss. crowdstrike.com/overwatch",
      },
    },

    // Post-wave incident report
    incidentReport:{
      title:"IDENTITY INTRUSION ATTEMPT",
      stopped:"Credential theft campaign disrupted before lateral movement.",
      keyLesson:"Valid credentials are not proof of legitimate access — behaviour is.",
      moduleHighlight:"IDENTITY",
    },
  },

  {
    id:"ai_syndicate", waveNum:2, isBoss:false, color:CS.GREEN,
    name:"AI SYNDICATE", shortName:"AI SYNDICATE",
    aka:"AI-Augmented eCrime / Gen-AI Threat Actors",
    nation:"🌐 Global AI eCrime", shortNation:"🌐 AI eCrime",
    threat:"CRITICAL", vector:"AI Phishing · Deepfakes · LLM Malware",

    environment:"AI PIPELINE / FINANCE WORKFLOW",
    environmentDesc:"Finance systems and AI infrastructure are under AI-augmented attack.",
    objective:"Counter machine-speed attacks with machine-speed defence.",

    threatCard:"AI SYNDICATE is deploying LLM-generated malware at machine speed. Deepfake audio is impersonating your CFO. No signatures exist for these threats. Charlotte AI is your best counter.",

    desc:"A new class of threat actor weaponising generative AI at unprecedented scale. AI-generated spear-phishing, deepfake voice calls, LLM-crafted malware that rewrites itself.",
    attackDesc:"LLM-generated phishing campaigns targeting thousands simultaneously. Deepfake audio authorises fraudulent transfers. AI-generated malware variants evade signature detection automatically.",
    falconFix:"Charlotte AI fights AI with AI — autonomous threat analysis at machine speed. Falcon Prevent's behavioural AI detects LLM-generated variants regardless of signature.",

    keyModules:["CHARLOTTE","PREVENT","IDENTITY","OVERWATCH"],
    moduleNarrative:{
      CHARLOTTE:"Counters AI-generated attacks with AI-powered autonomous detection — speed vs speed.",
      PREVENT  :"Behavioural AI blocks LLM-crafted malware variants that signature tools have never seen.",
      IDENTITY :"Flags deepfake impersonation attempts and anomalous authorisation requests.",
      OVERWATCH:"Human hunters recognise AI attack patterns that automated tools misclassify.",
    },

    behavior:{
      credentialGhosts:false,
      trackPlayer:0.2,
      fakeDrops:true,       // AI SYNDICATE drops fake power-ups that are traps
      adaptivePatterns:true, // enemies change movement pattern mid-wave
      stealth:false,
      stagingPhase:false,
      cloudLane:false,
      corruption:false,
    },

    drops:{CHARLOTTE:0.30,PREVENT:0.22,IDENTITY:0.18,OVERWATCH:0.16,INSIGHT:0.10,FEM:0.04},

    deathMessages:{
      CHARLOTTE:{
        headline:"NO AI DEFENCE — AI ATTACK OPERATED UNOPPOSED",
        body:"AI SYNDICATE deployed LLM-generated malware faster than any human analyst could respond. Without Charlotte AI countering at machine speed, each new variant was a fresh unknown threat.",
        cta:"Charlotte AI: fight AI attacks with AI defence. crowdstrike.com/charlotte-ai",
      },
      PREVENT:{
        headline:"LEGACY AV DEPLOYED — LLM MALWARE BYPASSED SIGNATURES",
        body:"AI SYNDICATE generated fresh malware variants specifically to evade known signatures. Zero signatures matched. Falcon Prevent's AI-native behavioural engine detects malicious intent, not signatures.",
        cta:"Falcon Prevent stops threats that have never been seen before. crowdstrike.com/falcon-prevent",
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
    id:"carbon_spider", waveNum:3, isBoss:true, color:CS.RED,
    name:"CARBON SPIDER", shortName:"CARBON SPIDER",
    aka:"FIN7 / Sangria Tempest",
    nation:"🌐 eCrime Syndicate", shortNation:"🌐 eCrime",
    threat:"HIGH", vector:"Ransomware-as-a-Service · POS Malware",

    environment:"RETAIL ENDPOINTS / POS NETWORK",
    environmentDesc:"Point-of-sale systems and retail endpoints are being staged for ransomware.",
    objective:"Stop the staging phase before encryption begins. Every second counts.",

    threatCard:"CARBON SPIDER is staging ransomware across your retail network. They are harvesting credentials, deleting backups and mapping file shares. Stop the staging — or face encryption.",

    desc:"Prolific eCrime group deploying ransomware across retail and hospitality. Known for fileless techniques that bypass legacy AV entirely.",
    attackDesc:"CARBON SPIDER stages ransomware in memory using living-off-the-land binaries. No files written to disk. Traditional AV sees nothing. Encryption begins after staging is complete.",
    falconFix:"Falcon Prevent's memory scanning stops in-memory ransomware before encryption. Falcon Complete MDR analysts respond within 60 seconds. OverWatch detects pre-ransomware staging.",

    keyModules:["PREVENT","COMPLETE","OVERWATCH","INSIGHT"],
    moduleNarrative:{
      PREVENT  :"Memory scanning and behavioural AI detect fileless ransomware before first encryption.",
      COMPLETE :"MDR analysts contain the incident before ransomware reaches critical systems.",
      OVERWATCH:"Hunters detect pre-ransomware staging — lateral movement and privilege escalation.",
      INSIGHT  :"XDR correlates the full ransomware kill chain across every endpoint.",
    },

    behavior:{
      credentialGhosts:false,
      trackPlayer:0.4,
      fakeDrops:false,
      stagingPhase:true,    // wave has staging phase first — enemies move slow, then speed up
      encryptionRush:true,  // if staging nodes survive, attack speed doubles
      stealth:false,
      cloudLane:false,
      corruption:false,
    },

    drops:{PREVENT:0.28,COMPLETE:0.20,OVERWATCH:0.18,INSIGHT:0.14,PANGEA:0.10,FEM:0.06,CHARLOTTE:0.04},

    deathMessages:{
      PREVENT:{
        headline:"LEGACY ANTIVIRUS INSTALLED — FILELESS RANSOMWARE EXECUTED FREELY",
        body:"CARBON SPIDER's fileless ransomware ran entirely in memory. No files, no signatures, no AV alert. Falcon Prevent's memory scanning and behavioural AI would have terminated execution before a single file was encrypted.",
        cta:"Falcon Prevent: AI-native EPP that stops ransomware before encryption begins. crowdstrike.com/falcon-prevent",
      },
      COMPLETE:{
        headline:"NO MANAGED RESPONSE — RANSOMWARE SPREAD UNCONTESTED",
        body:"The ransomware alert fired at 2:17am. With no team actively monitoring, the first human saw it at 6:44am. CARBON SPIDER had already encrypted 400 endpoints. Falcon Complete MDR analysts respond in 60 seconds.",
        cta:"Falcon Complete MDR: expert analysts monitoring and responding 24/7. crowdstrike.com/falcon-complete",
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
    id:"cozy_bear", waveNum:4, isBoss:false, color:CS.ORANGE,
    name:"COZY BEAR", shortName:"COZY BEAR",
    aka:"APT29 / Midnight Blizzard",
    nation:"🇷🇺 Russia — SVR", shortNation:"🇷🇺 Russia — SVR",
    threat:"CRITICAL", vector:"Cloud Infrastructure · OAuth Abuse",

    environment:"CLOUD TENANT / CONTAINER ESTATE",
    environmentDesc:"Cloud workloads and OAuth infrastructure are being pivoted through.",
    objective:"Detect cloud-native movement. Endpoint tools are blind here.",

    threatCard:"COZY BEAR has stolen OAuth tokens and is pivoting through your cloud tenant. They are invisible to endpoint tools. Cloud Security and XDR are your only visibility.",

    desc:"Russian SVR foreign intelligence. Compromises cloud environments and identity providers to establish persistent, deeply-hidden footholds.",
    attackDesc:"COZY BEAR abuses OAuth tokens to pivot through cloud workloads entirely within trusted infrastructure — invisible to endpoint-only tools.",
    falconFix:"Falcon Cloud Security delivers runtime protection across every workload. Falcon Insight XDR correlates cloud telemetry with endpoint signals to expose the full OAuth abuse chain.",

    keyModules:["CLOUD","INSIGHT","OVERWATCH","IDENTITY"],
    moduleNarrative:{
      CLOUD    :"Runtime protection across every cloud workload — blocks OAuth token abuse.",
      INSIGHT  :"Correlates cloud API calls with endpoint signals to expose the full attack chain.",
      OVERWATCH:"Hunters proactively search for COZY BEAR's cloud-native TTPs.",
      IDENTITY :"Detects OAuth token theft and service account abuse before persistence is established.",
    },

    behavior:{
      credentialGhosts:false,
      trackPlayer:0.25,
      fakeDrops:false,
      stagingPhase:false,
      cloudLane:true,       // enemies disappear from grid, reappear from cloud lane (sides)
      cloudVanish:true,     // enemies periodically go invisible then reappear
      stealth:false,
      corruption:false,
    },

    drops:{CLOUD:0.30,INSIGHT:0.22,OVERWATCH:0.18,IDENTITY:0.14,FEM:0.08,PANGEA:0.06,CHARLOTTE:0.02},

    deathMessages:{
      CLOUD:{
        headline:"NO CLOUD SECURITY — ENTIRE CLOUD ESTATE UNMONITORED",
        body:"COZY BEAR identified the unmonitored cloud environment and pivoted entirely into cloud infrastructure — beyond the reach of every endpoint tool deployed. They operated in the cloud for 47 days.",
        cta:"Falcon Cloud Security: CNAPP protection for every cloud workload. crowdstrike.com/cloud-security",
      },
      INSIGHT:{
        headline:"SILOED TOOLS — CLOUD-TO-ENDPOINT PIVOT INVISIBLE",
        body:"COZY BEAR's pivot from cloud OAuth abuse to endpoint access generated signals in both systems — but no technology correlated them. Each appeared as a low-priority isolated anomaly.",
        cta:"Falcon Insight XDR: unified detection across every domain. crowdstrike.com/falcon-insight",
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
    id:"scattered_spider", waveNum:5, isBoss:true, color:CS.BLUE,
    name:"SCATTERED SPIDER", shortName:"SCATTERED SPIDER",
    aka:"UNC3944 / Muddled Libra",
    nation:"🌐 Western eCrime", shortNation:"🌐 eCrime",
    threat:"CRITICAL", vector:"Social Engineering · MFA Bypass",

    environment:"EXECUTIVE COMMS / IDENTITY PROVIDER",
    environmentDesc:"Your identity provider and executive accounts are under social engineering attack.",
    objective:"Identify the impostor. Not every friendly signal is real.",

    threatCard:"SCATTERED SPIDER is calling your helpdesk right now. They will reset MFA and authenticate as a trusted employee. Some signals in this wave are fake. Trust nothing without verification.",

    desc:"Native-English-speaking threat actors who social-engineer IT help desks and bypass MFA through vishing. No malware required.",
    attackDesc:"SCATTERED SPIDER calls your helpdesk posing as an employee, resets MFA, obtains valid credentials and operates entirely as a trusted user.",
    falconFix:"Falcon Identity detects MFA reset anomalies and impossible travel. Falcon Complete MDR analysts respond in under 60 seconds.",

    keyModules:["IDENTITY","COMPLETE","OVERWATCH","INSIGHT"],
    moduleNarrative:{
      IDENTITY :"Detects MFA reset anomalies and impossible travel — the moment a socially-engineered account activates.",
      COMPLETE :"MDR analysts receive alerts in under 60 seconds and contain the intrusion before persistence.",
      OVERWATCH:"Elite hunters recognise SCATTERED SPIDER's post-access behaviour patterns.",
      INSIGHT  :"XDR correlates the vishing-to-access-to-persistence chain across identity, endpoint and cloud.",
    },

    behavior:{
      credentialGhosts:false,
      trackPlayer:0.35,
      fakeDrops:true,       // fake friendly power-ups that damage player
      impostorEnemies:true, // some enemies look like power-ups until close
      socialEngineering:true,
      stealth:false,
      cloudLane:false,
      corruption:false,
    },

    drops:{IDENTITY:0.30,COMPLETE:0.22,OVERWATCH:0.20,INSIGHT:0.14,PREVENT:0.08,PANGEA:0.06},

    deathMessages:{
      IDENTITY:{
        headline:"NO IDENTITY PROTECTION — MFA BYPASS WENT UNDETECTED",
        body:"SCATTERED SPIDER called the helpdesk, socially engineered an MFA reset and authenticated using valid credentials. Without Falcon Identity's behavioural analytics, the login appeared legitimate.",
        cta:"Falcon Identity: behavioural analytics that make valid credentials an unreliable weapon. crowdstrike.com/falcon-identity",
      },
      COMPLETE:{
        headline:"NO MANAGED RESPONSE — SCATTERED SPIDER PERSISTED FOR 4 HOURS",
        body:"SCATTERED SPIDER struck at 11pm on a Friday. Four uncontested hours to exfiltrate data and deploy ransomware before a human reviewed a single alert. Falcon Complete MDR analysts are active 24/7/365.",
        cta:"Falcon Complete MDR: your security team never sleeps. crowdstrike.com/falcon-complete",
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
    id:"volt_typhoon", waveNum:6, isBoss:false, color:CS.TEAL,
    name:"VOLT TYPHOON", shortName:"VOLT TYPHOON",
    aka:"Bronze Silhouette / Vanguard Panda",
    nation:"🇨🇳 China — PLA", shortNation:"🇨🇳 China — PLA",
    threat:"CRITICAL", vector:"Living-off-the-Land · Critical Infrastructure",

    environment:"OT NETWORK / CRITICAL INFRASTRUCTURE",
    environmentDesc:"Operational technology and critical infrastructure are being pre-positioned against.",
    objective:"Find the hidden threats. VOLT TYPHOON moves slowly and silently.",

    threatCard:"VOLT TYPHOON is pre-positioning inside your OT network. No malware. No noise. Only built-in tools. They are nearly invisible. Use Exposure Management to find what they are targeting.",

    desc:"Chinese state-sponsored group pre-positioning inside US critical infrastructure. Not here to steal data — here to cause disruption on command.",
    attackDesc:"VOLT TYPHOON uses exclusively built-in Windows tools. No malware, no custom code. They blend into legitimate network administration traffic completely.",
    falconFix:"Falcon Exposure Management discovers every asset VOLT TYPHOON could target. Falcon Insight XDR baselines administrative tool usage, flagging living-off-the-land abuse.",

    keyModules:["FEM","INSIGHT","OVERWATCH","PREVENT"],
    moduleNarrative:{
      FEM      :"Maps every exposed OT asset VOLT TYPHOON could exploit before they find it.",
      INSIGHT  :"Detects living-off-the-land abuse by baselining legitimate admin tool usage.",
      OVERWATCH:"Hunters identify slow pre-positioning activity that spans months.",
      PREVENT  :"Behavioural AI detects misuse of legitimate binaries even without malware.",
    },

    behavior:{
      credentialGhosts:false,
      trackPlayer:0.1,
      fakeDrops:false,
      stealth:true,         // enemies are semi-transparent, hard to see
      slowStealth:true,     // enemies move very slowly but create hidden damage nodes
      hiddenNodes:true,     // dormant enemies that activate if not found
      cloudLane:false,
      corruption:false,
    },

    drops:{FEM:0.30,INSIGHT:0.24,OVERWATCH:0.20,PREVENT:0.14,PANGEA:0.08,CHARLOTTE:0.04},

    deathMessages:{
      FEM:{
        headline:"NO EXPOSURE MANAGEMENT — VOLT TYPHOON FOUND ASSETS YOU DIDN'T KNOW EXISTED",
        body:"VOLT TYPHOON's reconnaissance identified 23 internet-exposed legacy systems the security team had no record of. Falcon Exposure Management continuously discovers and prioritises every exposed asset.",
        cta:"Falcon Exposure Management: know your attack surface before adversaries do. crowdstrike.com/exposure-management",
      },
      OVERWATCH:{
        headline:"NO THREAT HUNTERS — VOLT TYPHOON PRE-POSITIONED FOR 300 DAYS",
        body:"VOLT TYPHOON's operational tempo is deliberately slow — weeks between actions. Their strategy relies on automated tools looking for anomalies in short timeframes. OverWatch hunters analyse patterns across months.",
        cta:"Falcon OverWatch: threat hunting that operates on adversary timelines. crowdstrike.com/overwatch",
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
    id:"midnight_blizzard_boss", waveNum:7, isBoss:true, color:CS.BLUE,
    name:"MIDNIGHT BLIZZARD", shortName:"MIDNIGHT BLIZZARD",
    aka:"APT29 / NOBELIUM — Elite Tier",
    nation:"🇷🇺 Russia — SVR Tier-1", shortNation:"🇷🇺 Russia — SVR",
    threat:"CRITICAL", vector:"Supply Chain · MFA Bypass · Vendor Abuse",

    environment:"SOFTWARE SUPPLY CHAIN",
    environmentDesc:"A trusted software vendor has been compromised. Every downstream customer is at risk.",
    objective:"Detect the supply chain compromise before it propagates to downstream systems.",

    threatCard:"MIDNIGHT BLIZZARD has compromised a trusted vendor. A malicious update is being pushed to your systems right now. One trusted asset in this wave is corrupted. Identify it.",

    desc:"The elite SVR operational arm responsible for SolarWinds, the Microsoft corporate email breach and multiple US federal agency compromises.",
    attackDesc:"MIDNIGHT BLIZZARD compromises trusted software vendors and pushes malicious updates to thousands of downstream customers simultaneously.",
    falconFix:"Falcon Complete MDR provides managed expertise to detect supply chain compromises. Falcon Identity catches low-velocity password spray and MFA token theft.",

    keyModules:["COMPLETE","IDENTITY","OVERWATCH","INSIGHT","PANGEA"],
    moduleNarrative:{
      COMPLETE :"MDR analysts with NOBELIUM-specific expertise respond to supply chain indicators.",
      IDENTITY :"Detects low-velocity password spray and MFA token theft.",
      OVERWATCH:"Elite hunters track NOBELIUM TTPs globally across the CrowdStrike customer base.",
      INSIGHT  :"XDR correlates supply chain telemetry with endpoint and identity signals.",
      PANGEA   :"Planet-scale intelligence identifies MIDNIGHT BLIZZARD infrastructure before first contact.",
    },

    behavior:{
      credentialGhosts:false,
      trackPlayer:0.3,
      fakeDrops:false,
      supplyChain:true,     // one enemy per row is "trusted" — shoots friendly-looking bullets
      corruptedAsset:true,  // one block becomes corrupted and fires at player
      stealth:false,
      cloudLane:false,
      corruption:false,
    },

    drops:{COMPLETE:0.26,IDENTITY:0.22,OVERWATCH:0.20,INSIGHT:0.14,PANGEA:0.12,FEM:0.06},

    deathMessages:{
      COMPLETE:{
        headline:"NO MDR CAPABILITY — SUPPLY CHAIN COMPROMISE PROPAGATED",
        body:"A trusted software vendor was compromised and pushed a malicious update. Without Falcon Complete MDR, there was no team with the expertise to recognise the supply chain indicators. MIDNIGHT BLIZZARD had been present for 90 days.",
        cta:"Falcon Complete MDR: managed expertise that detects supply chain compromises. crowdstrike.com/falcon-complete",
      },
      IDENTITY:{
        headline:"LOW-VELOCITY PASSWORD SPRAY UNDETECTED — MFA TOKEN STOLEN",
        body:"MIDNIGHT BLIZZARD attempted one login per account per day — deliberately staying below lockout thresholds. Over six weeks they identified valid credentials. Standard MFA was then bypassed through token theft.",
        cta:"Falcon Identity detects low-velocity credential attacks and MFA token theft. crowdstrike.com/falcon-identity",
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
    id:"sandworm", waveNum:8, isBoss:false, color:CS.RED,
    name:"SANDWORM", shortName:"SANDWORM",
    aka:"Voodoo Bear / IRIDIUM / Unit 74455",
    nation:"🇷🇺 Russia — GRU Unit 74455", shortNation:"🇷🇺 Russia — GRU",
    threat:"CRITICAL", vector:"Destructive Malware · OT/ICS · Wiper",

    environment:"INDUSTRIAL SYSTEMS / OT NETWORK",
    environmentDesc:"Industrial control systems are being targeted for physical destruction.",
    objective:"Stop the wiper before it reaches OT systems. Destruction is irreversible.",

    threatCard:"SANDWORM is deploying wiper malware. Their objective is not data theft — it is destruction. If the wiper reaches OT systems, physical damage follows. Stop it now.",

    desc:"The most destructive cyber threat actor ever documented. Caused the first confirmed power outage via cyberattack. Deployed NotPetya — $10B in damage.",
    attackDesc:"SANDWORM deploys wiper malware designed to permanently destroy data and render systems unrecoverable. Targets OT and ICS systems to cause physical damage.",
    falconFix:"Falcon Prevent's behavioural AI detects wiper malware execution before destruction begins. Falcon Exposure Management identifies every OT asset boundary.",

    keyModules:["PREVENT","FEM","COMPLETE","OVERWATCH"],
    moduleNarrative:{
      PREVENT  :"Behavioural AI detects wiper malware execution patterns before a single file is destroyed.",
      FEM      :"Discovers every OT and ICS boundary SANDWORM could target.",
      COMPLETE :"Immediate containment to isolate affected systems before wiper propagates.",
      OVERWATCH:"Hunters identify SANDWORM's pre-destruction staging before detonation.",
    },

    behavior:{
      credentialGhosts:false,
      trackPlayer:0.4,
      fakeDrops:false,
      stagingPhase:false,
      corruption:true,      // SANDWORM bullets corrupt blocks — turn them against player
      wiperMode:true,       // if enough enemies reach bottom, blocks start degrading
      stealth:false,
      cloudLane:false,
    },

    drops:{PREVENT:0.28,FEM:0.22,COMPLETE:0.20,OVERWATCH:0.18,INSIGHT:0.08,PANGEA:0.04},

    deathMessages:{
      PREVENT:{
        headline:"NO BEHAVIOURAL AI — WIPER EXECUTED AND DESTROYED 40,000 ENDPOINTS",
        body:"SANDWORM's wiper malware had never been seen before — no signature existed. Legacy tools were completely blind. Falcon Prevent's behavioural AI detects the behaviour: mass file overwrite, MBR destruction, VSS deletion.",
        cta:"Falcon Prevent: behavioural AI that stops destructive malware before the first file is wiped. crowdstrike.com/falcon-prevent",
      },
      FEM:{
        headline:"UNKNOWN OT ASSETS TARGETED — NO VISIBILITY INTO INDUSTRIAL SYSTEMS",
        body:"SANDWORM's reconnaissance identified 14 OT and ICS systems the security team had no record of. Falcon Exposure Management would have discovered and prioritised these assets weeks before SANDWORM did.",
        cta:"Falcon Exposure Management: discover your OT attack surface before adversaries weaponise it. crowdstrike.com/exposure-management",
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
    id:"blackcat_boss", waveNum:9, isBoss:true, color:CS.PURPLE,
    name:"ALPHV BLACKCAT", shortName:"BLACKCAT",
    aka:"ALPHV / Noberus — RaaS Operator",
    nation:"🌐 RaaS Operator", shortNation:"🌐 RaaS",
    threat:"HIGH", vector:"Ransomware-as-a-Service · Triple Extortion",

    environment:"HYBRID ESTATE / ESXi INFRASTRUCTURE",
    environmentDesc:"Windows endpoints, Linux servers and VMware ESXi are being encrypted simultaneously.",
    objective:"Contain the multi-lane encryption before it reaches ESXi. All VMs are at risk.",

    threatCard:"BLACKCAT affiliates are striking simultaneously across endpoints, servers and ESXi. Triple extortion: encrypt, publish, DDoS. Alert volume will overwhelm your team. Charlotte AI is essential.",

    desc:"The most technically sophisticated RaaS operation ever observed. Written in Rust for cross-platform capability. Triple extortion model.",
    attackDesc:"BLACKCAT affiliates deploy ransomware across the entire estate simultaneously — endpoints, servers and VMware infrastructure in one coordinated strike.",
    falconFix:"Falcon Prevent detects BLACKCAT's Rust-based payload through behavioural analysis. Falcon Complete MDR responds to initial access broker activity weeks before encryption.",

    keyModules:["PREVENT","COMPLETE","CHARLOTTE","OVERWATCH","INSIGHT"],
    moduleNarrative:{
      PREVENT  :"Behavioural AI detects BLACKCAT's Rust payload — language is irrelevant to behavioural detection.",
      COMPLETE :"MDR analysts detect and evict initial access broker activity weeks before ransomware deploys.",
      CHARLOTTE:"Autonomous AI neutralises the high-velocity multi-vector activity that overwhelms human teams.",
      OVERWATCH:"Hunters identify pre-ransomware staging — credential harvesting, ESXi enumeration, backup destruction.",
      INSIGHT  :"XDR correlates the full BLACKCAT kill chain across every domain.",
    },

    behavior:{
      credentialGhosts:false,
      trackPlayer:0.45,
      fakeDrops:false,
      stagingPhase:false,
      multiLane:true,       // enemies attack from multiple directions simultaneously
      esxiRow:true,         // bottom row represents ESXi — if reached, all blocks destroyed
      alertFlood:true,      // periodic screen noise to simulate alert fatigue
      stealth:false,
      cloudLane:false,
      corruption:false,
    },

    drops:{PREVENT:0.24,COMPLETE:0.22,CHARLOTTE:0.18,OVERWATCH:0.16,INSIGHT:0.12,PANGEA:0.08},

    deathMessages:{
      PREVENT:{
        headline:"RUST-BASED PAYLOAD BYPASSED LEGACY EDR",
        body:"BLACKCAT's ransomware is written in Rust — a language most legacy EDR tools have poor visibility into. The payload was compiled fresh for this campaign. Zero signatures matched. Falcon Prevent's behavioural AI detected the malicious pattern at process launch.",
        cta:"Falcon Prevent: behavioural detection that is language and compiler agnostic. crowdstrike.com/falcon-prevent",
      },
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
    id:"lazarus_final", waveNum:10, isBoss:true, color:CS.PURPLE,
    name:"LAZARUS GROUP", shortName:"LAZARUS",
    aka:"Hidden Cobra / Zinc / Diamond Sleet",
    nation:"🇰🇵 N. Korea — RGB Bureau 121", shortNation:"🇰🇵 N. Korea",
    threat:"CRITICAL", vector:"Financial Theft · Crypto Heist · Destructive",

    environment:"CRYPTO TREASURY / PRIVILEGED SYSTEMS",
    environmentDesc:"Cryptocurrency treasury and privileged access systems are the final target.",
    objective:"This is the final test. LAZARUS uses every technique. The full platform is required.",

    threatCard:"LAZARUS GROUP is executing a multi-phase operation: theft, stealth, then destruction. They have custom tooling built for this environment. No single module is enough. Deploy everything.",

    desc:"North Korea's premier cyber unit. Responsible for stealing over $3 billion in cryptocurrency. Combines nation-state sophistication with financially-motivated eCrime.",
    attackDesc:"LAZARUS conducts multi-year financial operations with custom tooling built specifically for each target. When discovered, they deploy destructive malware to cover tracks.",
    falconFix:"The full Falcon platform is required. Prevent stops custom malware. Identity detects credential abuse. Complete MDR provides expert-led response. Charlotte processes the telemetry volume. OverWatch has tracked LAZARUS for a decade.",

    keyModules:["COMPLETE","PREVENT","IDENTITY","CHARLOTTE","OVERWATCH","PANGEA"],
    moduleNarrative:{
      COMPLETE :"Expert-led MDR response is essential to fully evict a nation-state actor.",
      PREVENT  :"Behavioural AI stops LAZARUS custom malware regardless of how bespoke the tooling.",
      IDENTITY :"Detects credential abuse and privileged account reconnaissance during financial targeting.",
      CHARLOTTE:"Autonomous AI processes the massive telemetry volume LAZARUS operations generate.",
      OVERWATCH:"A decade of LAZARUS hunting experience — OverWatch knows their infrastructure and timing.",
      PANGEA   :"Global intelligence identifies LAZARUS cryptocurrency mixing infrastructure before first contact.",
    },

    behavior:{
      credentialGhosts:false,
      trackPlayer:0.5,
      fakeDrops:false,
      stagingPhase:false,
      multiPhase:true,      // boss has 3 phases: theft, stealth, destruction
      multiLane:true,
      stealth:false,
      cloudLane:false,
      corruption:true,
    },

    drops:{COMPLETE:0.22,PREVENT:0.18,IDENTITY:0.16,CHARLOTTE:0.14,OVERWATCH:0.14,PANGEA:0.10,INSIGHT:0.06},

    deathMessages:{
      COMPLETE:{
        headline:"NATION-STATE ACTOR NOT FULLY EVICTED — LAZARUS RE-ESTABLISHED ACCESS",
        body:"This organization attempted to respond using internal resources. The team removed the initial implant — but LAZARUS had already established four additional persistence mechanisms. Without MDR expertise in nation-state eviction, remediation was incomplete.",
        cta:"Falcon Complete MDR: complete nation-state eviction, not just incident containment. crowdstrike.com/falcon-complete",
      },
      CHARLOTTE:{
        headline:"ANALYST TEAM UNABLE TO PROCESS LAZARUS TELEMETRY VOLUME",
        body:"A LAZARUS operation spanning 14 months generated over 2.4 million security events. The security team investigated fewer than 3% of them. LAZARUS deliberately generates noise to bury meaningful signals. Charlotte AI processes every event at machine speed.",
        cta:"Charlotte AI: machine-speed analysis that finds LAZARUS signals in a sea of noise. crowdstrike.com/charlotte-ai",
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

// ─── PHASE MODULE DROP SYSTEM ────────────────────────────────────
function pickModuleForPhase(phase){
  const base={...phase.drops};
  if(!base.PREVENT)   base.PREVENT   =0.10;
  if(!base.OVERWATCH) base.OVERWATCH =0.10;
  const ids=Object.keys(base);
  const weights=Object.values(base);
  const total=weights.reduce((a,b)=>a+b,0);
  let rand=Math.random()*total;
  for(let i=0;i<ids.length;i++){rand-=weights[i];if(rand<=0)return ids[i];}
  return ids[ids.length-1];
}

// ─── DEATH CONTEXT ───────────────────────────────────────────────
function getDeathContext(phase,modulesCollected){
  if(!phase)return{
    headline:"UNPROTECTED ENVIRONMENT — NO FALCON DEPLOYED",
    body:"This system was not running CrowdStrike Falcon. Without unified endpoint, identity and cloud protection, adversaries operate without resistance. This breach was entirely preventable.",
    cta:"crowdstrike.com — See how Falcon stops breaches before they start.",
  };
  const missing=phase.keyModules.filter(m=>!modulesCollected.has(m));
  for(const mod of missing){
    const msg=phase.deathMessages?.[mod];
    if(msg)return msg;
  }
  return{
    headline:`NO CROWDSTRIKE DEPLOYED — ${phase.name} OPERATED WITHOUT RESISTANCE`,
    body:`This environment was not running the Falcon modules recommended for ${phase.name}. ${phase.attackDesc} Organizations with the full Falcon platform stop this attack before it progresses past initial access.`,
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
  WAVE_BANNER_MS:2800,
  THREAT_CARD_MS:6000,   // short threat card — skippable
  LEVEL_CLEAR_MS:3500,
  BOSS_WARN_MS:2800,
  MODULE_CHOICE_MS:20000, // 20s to choose module — auto-picks if timeout
  INCIDENT_REPORT_MS:6000,
  DROP_CHANCE:0.22,
  IMAGE_COUNT:15,
  SOC_COMMS_INTERVAL:7000, // ms between SOC radio lines
});

// ─── ASSET MANAGER ───────────────────────────────────────────────
class AssetManager{
  #cache=new Map();
  loadImage(key,src){
    return new Promise(res=>{
      const img=new Image();
      let settled=false;
      const t=setTimeout(()=>{
        if(!settled){settled=true;console.warn(`Timeout:${src}`);res(null);}
      },12000);
      img.onload=()=>{
        clearTimeout(t);
        this.#cache.set(key,img);
        if(!settled){settled=true;res(img);}
      };
      img.onerror=()=>{
        clearTimeout(t);
        if(!settled){settled=true;console.warn(`Missing:${src}`);res(null);}
      };
      img.src=src;
    });
  }
  async loadAll(manifest){await Promise.all(manifest.map(m=>this.loadImage(m.key,m.src)));}
  get(key){return this.#cache.get(key)??null;}
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
  socComm(){this.#tone({type:"sine",f0:660,f1:440,dur:0.08,gain:0.08});}
  startBGM(){
    if(this.#bgm)return;this.#bgm=true;this.#resume();
    const ac=this.#ac;
    const bass=[55,55,65,55,49,49,55,49];
    const mel=[220,262,220,196,175,196,220,175];
    const step=60/148;let beat=0;
    const tick=()=>{
      if(!this.#bgm)return;
      const now=ac.currentTime;
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
    };
    tick();
  }
  stopBGM(){this.#bgm=false;}
}

// ─── SOC COMMS FEED ──────────────────────────────────────────────
// Live radio-style operational messages shown during gameplay.
class SOCFeed{
  #lines=[];#current=null;#t=0;#showT=5.5;#idx=0;#active=false;

  start(phaseId){
    this.#lines=SOC_COMMS[phaseId]??[];
    this.#idx=0;this.#t=0;this.#active=true;
    this.#next();
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
  const alpha=fadeIn*fadeOut;
  if(alpha<0.01)return;
  ctx.save();
  ctx.globalAlpha=alpha;
  const barW=380,barH=28,bx=(w-barW)/2,by=h-42;
  ctx.fillStyle="rgba(4,1,18,0.88)";
  ctx.strokeStyle=CS.GREEN;ctx.lineWidth=1;
  ctx.shadowColor=CS.GREEN;ctx.shadowBlur=8;
  ctx.beginPath();ctx.roundRect(bx,by,barW,barH,4);
  ctx.fill();ctx.stroke();
  const blink=Math.sin(performance.now()*0.015)>0;
  if(blink){
    ctx.fillStyle=CS.GREEN;ctx.shadowBlur=0;
    ctx.beginPath();ctx.arc(bx+12,by+14,4,0,Math.PI*2);ctx.fill();
  }
  ctx.font="bold 10px 'Courier New'";ctx.textAlign="left";
  ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=6;
  ctx.fillText("SOC ▶",bx+22,by+18);
  const maxMsgW=barW-82;
  ctx.font="10px 'Courier New'";
  let msg=this.#current;
  while(msg.length>0&&ctx.measureText(msg).width>maxMsgW)msg=msg.slice(0,-1);
  if(msg.length<this.#current.length)msg=msg.slice(0,-1)+"…";
  ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
  ctx.fillText(msg,bx+72,by+18);
  ctx.restore();
  }
}

// ─── MODULE CHOICE SCREEN ────────────────────────────────────────
// Player chooses one primary module before each wave.
class ModuleChoiceScreen{
  #choices=[];#selected=0;#t=0;#confirmed=false;

  prepare(phase){
    // Offer 3 choices weighted toward phase key modules
    const pool=[...phase.keyModules];
    // Add one wildcard from full module list
    const wild=MODULE_POOL.find(m=>!pool.includes(m.id));
    if(wild)pool.push(wild.id);
    // Pick 3
    this.#choices=pool.slice(0,3).map(id=>MODULES[id]).filter(Boolean);
    this.#selected=Math.floor(this.#choices.length/2);this.#t=0;this.#confirmed=false;
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

    // Environment context
    ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText(`DEFENDING: ${phase.environment}`,w/2,28);

    // Threat card
    ctx.font="bold 13px 'Courier New'";
    ctx.fillStyle=phase.color;ctx.shadowColor=phase.color;ctx.shadowBlur=12;
    ctx.fillText(`⚠ ${phase.name} — THREAT ACTIVE`,w/2,52);

    ctx.font="12px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
    // Word wrap threat card
    const words=phase.threatCard.split(" ");let line="",ly=74;
    for(const word of words){
      const test=line+word+" ";
      if(ctx.measureText(test).width>w*0.62&&line!==""){
        ctx.fillText(line,w/2,ly);line=word+" ";ly+=16;
      }else line=test;
    }
    ctx.fillText(line,w/2,ly);

    // Instruction
    ctx.font="bold 12px 'Courier New'";
    ctx.fillStyle=CS.YELLOW;ctx.shadowColor=CS.YELLOW;ctx.shadowBlur=8;
    ctx.fillText("CHOOSE YOUR PRIMARY MODULE",w/2,ly+30);
    ctx.font="10px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText("← → to select   SPACE to deploy",w/2,ly+46);

    // Module cards
    const CW=180,CH=175,gap=20;
    const totalCW=this.#choices.length*(CW+gap)-gap;
    const cx0=(w-totalCW)/2;
    const cy=ly+62;

    this.#choices.forEach((m,i)=>{
      const x=cx0+i*(CW+gap);
      const isSelected=i===this.#selected;
      const pulse=0.7+Math.sin(performance.now()*0.003+i)*0.3;

      ctx.save();
      if(isSelected){
        ctx.translate(x+CW/2,cy+CH/2);
        ctx.scale(1.05,1.05);
        ctx.translate(-(x+CW/2),-(cy+CH/2));
      }

      ctx.fillStyle=isSelected?"rgba(8,2,26,0.98)":"rgba(4,1,18,0.75)";
      ctx.strokeStyle=m.color;
      ctx.lineWidth=isSelected?2.5:1.2;
      ctx.shadowColor=m.color;
      ctx.shadowBlur=isSelected?20:6*pulse;
      ctx.beginPath();ctx.roundRect(x,cy,CW,CH,6);ctx.fill();ctx.stroke();

      // Selected indicator
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

      // Mechanic description
      ctx.font="8px 'Courier New'";ctx.fillStyle=CS.LTGREY;
      const mwords=m.mechanic.split(" ");let ml="",mly=cy+(isSelected?104:94);
      for(const mw of mwords){
        const mt=ml+mw+" ";
        if(ctx.measureText(mt).width>CW-16&&ml!==""){
          ctx.fillText(ml,x+CW/2,mly);ml=mw+" ";mly+=12;
        }else ml=mt;
      }
      ctx.fillText(ml,x+CW/2,mly);

      // Phase narrative
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

    // Countdown bar
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
  const fi=Math.min(1,t/0.4);
  const fo=t>totalT-0.5?Math.max(0,1-(t-(totalT-0.5))/0.5):1;
  ctx.save();ctx.globalAlpha=fi*fo;
  ctx.fillStyle="rgba(4,1,12,0.94)";ctx.fillRect(0,0,w,h);
  ctx.fillStyle=CS.GREEN;ctx.fillRect(0,0,w,4);ctx.fillRect(0,h-4,w,4);

  ctx.textAlign="center";
  ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
  ctx.fillText("🦅  CROWDSTRIKE INCIDENT REPORT",w/2,22);

  ctx.font="bold 32px 'Courier New'";
  ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=22;
  ctx.fillText(`✅ ${phase.incidentReport.title}`,w/2,58);

  // Three columns
  const cols=[
    {label:"WHAT HAPPENED",    val:phase.incidentReport.stopped,    col:CS.ORANGE},
    {label:"KEY LESSON",       val:phase.incidentReport.keyLesson,  col:CS.CYAN},
    {label:"MODULE THAT WON",  val:MODULES[phase.incidentReport.moduleHighlight]?.name??"—", col:CS.GREEN},
  ];
  const CW=210,gap=12,cy=80;
  const totalCW=cols.length*(CW+gap)-gap;
  const cx0=(w-totalCW)/2;

  cols.forEach((c,i)=>{
    const x=cx0+i*(CW+gap);
    ctx.fillStyle="rgba(8,2,26,0.9)";
    ctx.strokeStyle=c.col;ctx.lineWidth=1.2;
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

  // Modules collected this wave
  const collected=[...modulesCollected].map(id=>MODULES[id]).filter(Boolean);
  if(collected.length){
    ctx.textAlign="center";
    ctx.font="bold 9px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText("MODULES DEPLOYED THIS WAVE:",w/2,cy+128);
    let mx=w/2-(collected.length*44)/2;
    collected.forEach(m=>{
      ctx.font="16px serif";ctx.fillText(m.emoji,mx+16,cy+148);
      ctx.font="bold 7px 'Courier New'";ctx.fillStyle=m.color;
      ctx.fillText(m.shortName,mx+16,cy+160);
      mx+=44;
    });
  }

  // Score
  ctx.font="bold 16px 'Courier New'";
  ctx.fillStyle=CS.YELLOW;ctx.shadowColor=CS.YELLOW;ctx.shadowBlur=10;
  ctx.fillText(`WAVE SCORE: ${score.toLocaleString()}`,w/2,cy+182);

  // Analyst rank
  const rank=score>5000?"ELITE ANALYST":score>2500?"SENIOR ANALYST":score>1000?"ANALYST":"JUNIOR ANALYST";
  ctx.font="bold 12px 'Courier New'";
  ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=8;
  ctx.fillText(`RANK: ${rank}`,w/2,cy+200);

  // Countdown + skip
  const prog=Math.max(0,1-t/totalT);
  const barW=260,bx=(w-barW)/2,by=h-46;
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
        x,y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,
        life:0,maxLife:(opts.life??0.4)+Math.random()*(opts.lifeVar??0.3),
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
  overWatchKill(x,y){this.burst(x,y,35,[[255,106,0],[255,200,0],[224,0,60],[255,255,255]],{maxSpd:250,life:0.7,size:3,sizeVar:3});}
  completeKill(x,y){this.burst(x,y,40,[[224,0,60],[255,106,0],[255,255,255],[255,220,0]],{maxSpd:280,life:0.8,size:3,sizeVar:4});}
  pangeaFreeze(x,y){this.burst(x,y,15,[[0,229,255],[0,150,255],[200,240,255]],{maxSpd:80,life:0.6,size:3});}
  femReveal(x,y){this.burst(x,y,18,[[0,255,208],[0,200,180],[255,255,255]],{maxSpd:100,life:0.5,size:2});}

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
  spawn(x,y,text,color=CS.YELLOW,size=18){this.#list.push({x,y,vy:-58,life:0,maxLife:1.3,text,color,size});}
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
        ctx.beginPath();ctx.moveTo(p.x-p.vx*0.03,p.y-p.vy*0.03);ctx.lineTo(p.x,p.y);ctx.stroke();
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
    this.#hexes=Array.from({length:24},()=>({x:Math.random()*w,y:Math.random()*h,phase:Math.random()*Math.PI*2,r:2+Math.random()*4}));
  }
  #make(n,w,h,spd,sz,col){return{spd,sz,col,w,h,stars:Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*h}))};}
  update(dt){
    for(const l of this.#layers)
      for(const s of l.stars){s.y+=l.spd*dt*60;if(s.y>l.h){s.y=0;s.x=Math.random()*l.w;}}
  }
  draw(ctx){
    for(const l of this.#layers){ctx.fillStyle=l.col;for(const s of l.stars)ctx.fillRect(s.x,s.y,l.sz,l.sz);}
    const now=performance.now()*0.001;
    for(const h of this.#hexes){
      const a=0.05+Math.sin(h.phase+now)*0.04;
      ctx.save();ctx.strokeStyle=`rgba(224,0,60,${a})`;ctx.lineWidth=1;
      ctx.beginPath();
      for(let i=0;i<6;i++){const ang=i*Math.PI/3;i===0?ctx.moveTo(h.x+h.r*Math.cos(ang),h.y+h.r*Math.sin(ang)):ctx.lineTo(h.x+h.r*Math.cos(ang),h.y+h.r*Math.sin(ang));}
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
      if([" ","ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key))e.preventDefault();
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
  push(mod){this.#queue.push(mod);}
  update(dt){
    if(this.#current){this.#t+=dt;if(this.#t>ModuleNotification.SHOW){this.#current=null;this.#t=0;}}
    if(!this.#current&&this.#queue.length){this.#current=this.#queue.shift();this.#t=0;}
  }
  draw(ctx,w){
    if(!this.#current)return;
    const mod=this.#current,dur=ModuleNotification.SHOW,t=this.#t;
    const CW=290,CH=112,cy=96;
    let sx;
    const si=0.22,so=dur-0.28;
    if(t<si)sx=w+(1-t/si)*(CW+20);
    else if(t>so)sx=w-CW+((t-so)/0.28)*(CW+20);
    else sx=w-CW-8;
    ctx.save();
    ctx.shadowColor=mod.color;ctx.shadowBlur=16;
    ctx.fillStyle="rgba(4,1,18,0.96)";ctx.strokeStyle=mod.color;ctx.lineWidth=1.6;
    ctx.beginPath();ctx.roundRect(sx,cy,CW,CH,6);ctx.fill();ctx.stroke();
    ctx.shadowBlur=0;ctx.fillStyle=mod.color;
    ctx.beginPath();ctx.roundRect(sx,cy,CW,24,[6,6,0,0]);ctx.fill();
    ctx.font="bold 9px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.textAlign="left";
    ctx.fillText("🦅 MODULE ACTIVATED",sx+8,cy+16);
    ctx.font="bold 12px 'Courier New'";ctx.fillStyle=mod.color;ctx.shadowColor=mod.color;ctx.shadowBlur=7;
    ctx.fillText(`${mod.emoji}  ${mod.name}`,sx+8,cy+44);
    ctx.font="10px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText(mod.tagline,sx+8,cy+58);
    ctx.font="8px 'Courier New'";ctx.fillStyle=CS.WHITE;
    const words=mod.mechanic.split(" ");let line="",ly=cy+72;
    for(const word of words){const test=line+word+" ";if(ctx.measureText(test).width>CW-14&&line!==""){ctx.fillText(line,sx+8,ly);line=word+" ";ly+=11;}else line=test;}
    ctx.fillText(line,sx+8,ly);
    ctx.textAlign="left";ctx.shadowBlur=0;ctx.restore();
  }
}

// ─── OVERWATCH SYSTEM ────────────────────────────────────────────
class OverWatchSystem{
  #active=false;#phase=0;#t=0;#targets=[];#onKill=null;
  activate(attackers,cols,rows,onKill){
    this.#active=true;this.#phase=0;this.#t=0;this.#onKill=onKill;
    const alive=[];
    for(let r=rows-1;r>=0;r--)for(let c=0;c<cols;c++){const a=attackers[c]?.[r];if(a?.alive)alive.push(a);if(alive.length>=3)break;}
    this.#targets=alive.map(a=>({a,locked:false,fired:false}));
  }
  get isActive(){return this.#active;}
  update(dt){
    if(!this.#active)return;this.#t+=dt;
    if(this.#phase===0&&this.#t>1.0){this.#phase=1;this.#t=0;}
    if(this.#phase===1&&this.#t>1.4){this.#phase=2;this.#t=0;}
    if(this.#phase===2){
      this.#targets.forEach((tg,i)=>{if(!tg.fired&&this.#t>i*0.4+0.1){tg.fired=true;if(tg.a.alive){tg.a.alive=false;this.#onKill?.(tg.a);}}});
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
      ctx.fillText(this.#phase===0?"👁️  FALCON OVERWATCH — SCANNING THREAT LANDSCAPE…":this.#phase===1?"👁️  FALCON OVERWATCH — HIGH-VALUE TARGETS ACQUIRED":"👁️  FALCON OVERWATCH — NEUTRALIZATION IN PROGRESS",canvas.width/2,32);
      ctx.restore();
    }
    for(const tg of this.#targets){
      if(!tg.a.alive&&tg.fired)continue;
      const x=tg.a.x+CFG.ATK_W/2,y=tg.a.y+CFG.ATK_H/2;
      const pulse=Math.sin(now*0.008)*0.4+0.6;
      const r=this.#phase===1?20:26+Math.sin(now*0.01)*4;
      ctx.save();ctx.strokeStyle=CS.ORANGE;ctx.lineWidth=2;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=12*pulse;ctx.globalAlpha=0.9;
      const rot=now*0.003*(this.#phase===1?2:1);
      ctx.translate(x,y);ctx.rotate(rot);
      ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
      [0,Math.PI/2,Math.PI,Math.PI*3/2].forEach(a=>{ctx.beginPath();ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);ctx.lineTo(Math.cos(a)*(r+8),Math.sin(a)*(r+8));ctx.stroke();});
      ctx.rotate(-rot);ctx.globalAlpha=0.35;
      ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(r,0);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(0,r);ctx.stroke();
      if(this.#phase>=1){ctx.globalAlpha=1;ctx.font="bold 8px 'Courier New'";ctx.textAlign="center";ctx.fillStyle=CS.ORANGE;ctx.shadowBlur=6;ctx.fillText("LOCKED",0,r+16);}
      ctx.restore();
    }
    if(this.#phase===2){
      for(const tg of this.#targets){
        if(!tg.fired)continue;
        const x=tg.a.x+CFG.ATK_W/2,y=tg.a.y+CFG.ATK_H/2;
        const age=this.#t-this.#targets.indexOf(tg)*0.4;
        if(age<0||age>0.4)continue;
        const prog=1-age/0.4;
        ctx.save();ctx.globalAlpha=prog*0.9;ctx.strokeStyle=CS.ORANGE;ctx.lineWidth=3*prog;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=22;
        ctx.beginPath();ctx.moveTo(canvas.width/2,0);ctx.lineTo(x,y);ctx.stroke();ctx.restore();
      }
    }
    if(this.#phase===3){
      const a=Math.max(0,1-this.#t/0.9);
      ctx.save();ctx.globalAlpha=a;ctx.textAlign="center";ctx.font="bold 17px 'Courier New'";
      ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=20;
      ctx.fillText("✅  THREATS ELIMINATED — OVERWATCH STANDS DOWN",canvas.width/2,canvas.height/2-30);ctx.restore();
    }
  }
}

// ─── FALCON COMPLETE SYSTEM ──────────────────────────────────────
class FalconCompleteSystem{
  #active=false;#phase=0;#t=0;#tagged=[];#onKill=null;#killIdx=0;#total=0;
  activate(attackers,cols,rows,onKill){
    this.#active=true;this.#phase=0;this.#t=0;this.#onKill=onKill;this.#killIdx=0;
    this.#tagged=[];
    for(let c=0;c<cols;c++)for(let r=0;r<rows;r++){const a=attackers[c]?.[r];if(a?.alive)this.#tagged.push(a);}
    this.#total=this.#tagged.length;
  }
  get isActive(){return this.#active;}
  update(dt){
    if(!this.#active)return;this.#t+=dt;
    if(this.#phase===0&&this.#t>1.6){this.#phase=1;this.#t=0;}
    if(this.#phase===1){
      const kps=Math.max(8,this.#total/1.8);const exp=Math.floor(this.#t*kps);
      while(this.#killIdx<exp&&this.#killIdx<this.#tagged.length){const a=this.#tagged[this.#killIdx];if(a.alive){a.alive=false;this.#onKill?.(a,this.#killIdx);}this.#killIdx++;}
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
      ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;ctx.fillText("INCOMING TRANSMISSION — CROWDSTRIKE SOC OPS",w/2,h*0.26);
      ctx.font="bold 38px 'Courier New'";ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=32;ctx.fillText("🦅 FALCON COMPLETE",w/2,h*0.40);
      ctx.font="bold 15px 'Courier New'";ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=12;ctx.fillText("MANAGED DETECTION & RESPONSE — ACTIVATED",w/2,h*0.50);
      ctx.font="12px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;ctx.fillText("Our SOC team has assumed control of the incident.",w/2,h*0.59);
      const bW=300,bH=8,bx=(w-bW)/2,by=h*0.70;const prog=Math.min(1,this.#t/1.5);
      ctx.fillStyle="#1a1a2e";ctx.fillRect(bx,by,bW,bH);ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=10;ctx.fillRect(bx,by,bW*prog,bH);
      ctx.font="9px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;ctx.fillText(`DEPLOYING… ${Math.round(prog*100)}%`,w/2,by+22);ctx.restore();
    }
    if(this.#phase===1){
      ctx.save();ctx.textAlign="center";
      ctx.font="bold 24px 'Courier New'";ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=20;ctx.fillText("🦅 FALCON COMPLETE — ACTIVE",w/2,h*0.20);
      ctx.font="12px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;ctx.fillText("SOC ANALYSTS NEUTRALIZING ACTIVE THREATS",w/2,h*0.29);
      ctx.font="bold 17px 'Courier New'";ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=10;ctx.fillText(`CONTAINED: ${this.#killIdx} / ${this.#total}`,w/2,h*0.38);ctx.restore();
    }
    if(this.#phase===2){
      const fi=Math.min(1,this.#t/0.4);ctx.save();ctx.globalAlpha=fi;ctx.textAlign="center";
      ctx.font="bold 38px 'Courier New'";ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=26;ctx.fillText("✅ BREACH CONTAINED",w/2,h*0.32);
      ctx.font="13px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;ctx.fillText("CrowdStrike Falcon Complete neutralized all active threats.",w/2,h*0.44);
      ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=10;ctx.fillText("🦅  crowdstrike.com  |  We Stop Breaches — Guaranteed.",w/2,h*0.60);ctx.restore();
    }
  }
}

// ─── CHARLOTTE AI ────────────────────────────────────────────────
class CharlotteAI{
  #active=false;#t=0;#targets=[];#killIdx=0;#onKill=null;
  activate(attackers,cols,rows,onKill){
    this.#active=true;this.#t=0;this.#killIdx=0;this.#onKill=onKill;
    const alive=[];
    for(let c=0;c<cols;c++)for(let r=0;r<rows;r++){const a=attackers[c]?.[r];if(a?.alive)alive.push(a);}
    alive.sort((a,b)=>b.y-a.y);this.#targets=alive.slice(0,5);
  }
  get isActive(){return this.#active;}
  update(dt){
    if(!this.#active)return;this.#t+=dt;
    const exp=Math.floor(this.#t/0.18);
    while(this.#killIdx<exp&&this.#killIdx<this.#targets.length){const a=this.#targets[this.#killIdx];if(a.alive){a.alive=false;this.#onKill?.(a);}this.#killIdx++;}
    if(this.#killIdx>=this.#targets.length&&this.#t>0.3)this.#active=false;
  }
  draw(ctx){
    if(!this.#active)return;
    for(let i=0;i<this.#killIdx;i++){
      const a=this.#targets[i];const x=a.x+CFG.ATK_W/2,y=a.y+CFG.ATK_H/2;
      const age=this.#t-i*0.18;if(age>0.35)continue;const prog=1-age/0.35;
      ctx.save();ctx.globalAlpha=prog*0.9;ctx.strokeStyle=CS.GREEN;ctx.lineWidth=2;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=16;
      ctx.beginPath();ctx.moveTo(canvas.width/2,canvas.height/2);ctx.lineTo(x,y);ctx.stroke();
      ctx.font="bold 8px 'Courier New'";ctx.textAlign="center";ctx.fillStyle=CS.GREEN;ctx.fillText("AI NEUTRALIZED",x,y-12);ctx.restore();
    }
  }
}

// ─── LEGACY TOOL BLOCKS ──────────────────────────────────────────
class Block{
  constructor(x,y,toolIndex){
    this.x=x;this.y=y;this.w=CFG.BLK_W;this.h=CFG.BLK_H;
    this.strength=CFG.BLK_STRENGTH;
    this.tool=LEGACY_TOOLS[toolIndex%LEGACY_TOOLS.length];
    this.flashT=0;this.particles=[];
  }
  hit(){
    this.strength=Math.max(0,this.strength-1);
    this.flashT=0.18;
    if(this.strength===0)this.#spawnDebris();
  }
  #spawnDebris(){
    for(let i=0;i<12;i++){
      const ang=Math.random()*Math.PI*2,spd=20+Math.random()*60;
      this.particles.push({x:this.x+this.w/2,y:this.y+this.h/2,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,life:0,maxLife:0.6+Math.random()*0.4,size:1+Math.random()*3});
    }
  }
  get alive(){return this.strength>0;}
  update(dt){
    if(this.flashT>0)this.flashT=Math.max(0,this.flashT-dt);
    for(let i=this.particles.length-1;i>=0;i--){
      const p=this.particles[i];p.life+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=40*dt;
      if(p.life>p.maxLife)this.particles.splice(i,1);
    }
  }
  draw(ctx){
    for(const p of this.particles){
      const t=1-p.life/p.maxLife;ctx.globalAlpha=t*0.8;ctx.fillStyle=this.tool.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*t,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    if(!this.alive)return;
    const t=this.strength/CFG.BLK_STRENGTH;const now=performance.now();
    ctx.save();
    if(this.flashT>0)ctx.globalAlpha=0.5+this.flashT*2;
    ctx.fillStyle=`rgba(4,1,18,${0.7+t*0.2})`;
    ctx.strokeStyle=this.tool.color;ctx.lineWidth=1.5;
    ctx.shadowColor=this.tool.color;ctx.shadowBlur=6+Math.sin(now*0.003+this.x)*3;
    ctx.beginPath();ctx.roundRect(this.x,this.y,this.w,this.h,3);ctx.fill();ctx.stroke();
    ctx.fillStyle=this.tool.color;ctx.globalAlpha=(0.2+t*0.3);ctx.shadowBlur=0;
    ctx.fillRect(this.x+1,this.y+this.h-3,(this.w-2)*t,2);ctx.globalAlpha=1;
    const nl=this.tool.name.length;
    ctx.font=`bold ${nl>7?7:nl>5?8:9}px 'Courier New'`;ctx.textAlign="center";
    ctx.fillStyle=this.tool.color;ctx.shadowColor=this.tool.color;ctx.shadowBlur=t>0.5?8:4;
    ctx.fillText(this.tool.name,this.x+this.w/2,this.y+this.h*0.65);
    if(this.strength<CFG.BLK_STRENGTH){
      ctx.globalAlpha=(1-t)*0.65;ctx.strokeStyle=`rgba(255,255,255,${(1-t)*0.5})`;ctx.lineWidth=0.8;ctx.shadowBlur=0;
      const seed=this.x+this.y;const cracks=CFG.BLK_STRENGTH-this.strength;
      for(let c=0;c<cracks;c++){
        const sx=this.x+(((seed*3+c*7)%10)/10)*this.w;const sy=this.y+(((seed*5+c*3)%8)/8)*this.h;
        ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+(((seed+c)%5)-2)*8,sy+(((seed*2+c)%5)-1)*6);ctx.stroke();
      }
      ctx.globalAlpha=1;
    }
    if(this.strength===1){
      const warn=Math.sin(now*0.012)*0.4+0.6;
      ctx.strokeStyle=`rgba(255,50,50,${warn*0.8})`;ctx.lineWidth=2;ctx.shadowColor="#FF1744";ctx.shadowBlur=10*warn;
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
  constructor(x,y,phase){
    this.x=x-13;this.y=y;this.w=28;this.h=28;
    this.vy=52;this.life=0;this.maxLife=11;this.alive=true;
    const mid=pickModuleForPhase(phase);
    this.mod=MODULES[mid]??MODULES.PREVENT;
  }
  update(dt){this.y+=this.vy*dt;this.life+=dt;if(this.y>canvas.height||this.life>this.maxLife)this.alive=false;}
  draw(ctx){
    if(!this.alive)return;
    const fade=Math.min(1,1-this.life/this.maxLife*0.5);
    const pulse=0.75+Math.sin(performance.now()*0.006)*0.25;
    ctx.save();ctx.globalAlpha=fade*pulse;
    ctx.fillStyle="rgba(4,1,18,0.88)";ctx.strokeStyle=this.mod.color;ctx.lineWidth=1.6;
    ctx.shadowColor=this.mod.color;ctx.shadowBlur=12*pulse;
    ctx.beginPath();ctx.roundRect(this.x,this.y,this.w,this.h,4);ctx.fill();ctx.stroke();
    ctx.font="15px serif";ctx.textAlign="center";ctx.shadowBlur=0;
    ctx.fillText(this.mod.emoji,this.x+this.w/2,this.y+this.h*0.78);
    ctx.restore();
  }
}

// ─── UFO ─────────────────────────────────────────────────────────
class UFO{
  constructor(w){
    this.dir=Math.random()<0.5?1:-1;this.x=this.dir>0?-CFG.UFO_W:w+CFG.UFO_W;
    this.y=58;this.w=CFG.UFO_W;this.h=CFG.UFO_H;this.alive=true;this.beepT=0;
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
    const now=performance.now();const pulse=Math.sin(now*0.006)*0.4+0.6;
    ctx.save();ctx.shadowColor=CS.RED;ctx.shadowBlur=18*pulse;
    if(img){ctx.drawImage(img,this.x,this.y,this.w,this.h);}
    else{
      ctx.fillStyle=CS.RED;ctx.beginPath();ctx.ellipse(this.x+this.w/2,this.y+this.h*0.65,this.w/2,this.h*0.28,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=CS.ORANGE;ctx.beginPath();ctx.ellipse(this.x+this.w/2,this.y+this.h*0.38,this.w*0.28,this.h*0.28,0,0,Math.PI*2);ctx.fill();
    }
    ctx.font="bold 8px 'Courier New'";ctx.textAlign="center";ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=8;
    ctx.fillText(`⚠ ${this.label}`,this.x+this.w/2,this.y-5);
    ctx.font="8px 'Courier New'";ctx.fillStyle=CS.YELLOW;ctx.shadowBlur=0;
    ctx.fillText(`${this.pts} PTS`,this.x+this.w/2,this.y+this.h+12);ctx.restore();
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
  }
  hit(n=1){this.hp-=n;if(this.hp<=this.maxHp*0.3)this.rage=true;if(this.hp<=0)this.alive=false;}
  update(dt,bullets,pool){
    this.glowT+=dt;this.x+=this.dir*this.spd*dt;
    if(this.x+this.w>canvas.width){this.dir=-1;this.x=canvas.width-this.w;}
    if(this.x<0){this.dir=1;this.x=0;}
    this.shootCd-=dt;
    if(this.shootCd<=0){
      this.shootCd=this.rage?0.48:1.0;
      const cx=this.x+this.w/2;
      const angs=this.rage?[-0.5,-0.25,0,0.25,0.5]:[-0.2,0,0.2];
      for(const a of angs)bullets.push(pool.acquire({x:cx-CFG.BLT_W/2,y:this.y+this.h,vx:Math.sin(a)*CFG.ATK_BLT_SPEED*1.3,vy:Math.cos(a)*CFG.ATK_BLT_SPEED*1.3,w:CFG.BLT_W,h:CFG.BLT_H,boss:true}));
    }
  }
  draw(ctx,img){
    if(!this.alive)return;
    const pulse=Math.sin(this.glowT*(this.rage?9:3))*0.5+0.5;
    ctx.save();ctx.shadowColor=this.rage?CS.RED_GLOW:this.color;ctx.shadowBlur=22+pulse*22;
    if(this.rage){ctx.globalAlpha=0.22;ctx.fillStyle=CS.RED;ctx.fillRect(this.x,this.y,this.w,this.h);ctx.globalAlpha=1;}
    if(img)ctx.drawImage(img,this.x,this.y,this.w,this.h);
    else{ctx.fillStyle=this.rage?CS.RED:this.color;ctx.fillRect(this.x,this.y,this.w,this.h);}
    ctx.restore();
    const bw=this.w+20,bh=8,bx=this.x-10,by=this.y-16;
    ctx.fillStyle="#222";ctx.fillRect(bx,by,bw,bh);
    const t=Math.max(0,this.hp/this.maxHp);const hc=t>0.5?CS.GREEN:t>0.25?CS.YELLOW:CS.RED_GLOW;
    ctx.save();ctx.fillStyle=hc;ctx.shadowColor=hc;ctx.shadowBlur=7;ctx.fillRect(bx,by,bw*t,bh);ctx.restore();
    ctx.save();ctx.font=`bold ${this.rage?13:11}px 'Courier New'`;ctx.textAlign="center";
    ctx.fillStyle=this.rage?CS.RED_GLOW:this.color;ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=12;
    ctx.fillText(`${this.rage?"🔴":"👾"} ${this.phase?.shortName??"BOSS"}${this.rage?" [RAGE]":""}`,this.x+this.w/2,this.y-22);ctx.restore();
  }
}

// ─── HUD ─────────────────────────────────────────────────────────
class HUD{
  #s=0;#hi=0;#lives=3;#wave=1;#combo=1;#mods={};#pangeaT=0;#env="";

  setState(s,hi,lives,wave,combo,mods,pangeaT,env){
    this.#s=s;this.#hi=hi;this.#lives=lives;this.#wave=wave;
    this.#combo=combo;this.#mods=mods;this.#pangeaT=pangeaT;this.#env=env;
  }
  draw(ctx,w){
    this.#lbl(ctx,`⭐ ${this.#s.toLocaleString()}`,10,28,19,CS.ORANGE);
    this.#lbl(ctx,`🏆 ${this.#hi.toLocaleString()}`,w/2,28,13,CS.YELLOW,"center");
    const hearts="🟥".repeat(Math.max(0,this.#lives))||"💀";
    this.#lbl(ctx,hearts,w-12,28,17,CS.RED,"right");
    this.#lbl(ctx,`WAVE ${this.#wave}`,w-12,46,10,CS.RED,"right");
    if(this.#combo>1)this.#lbl(ctx,`🔥 x${this.#combo} CHAIN`,10,46,12,CS.RED_GLOW);

    // Environment strip
    if(this.#env){
      ctx.save();ctx.font="bold 8px 'Courier New'";ctx.textAlign="center";
      ctx.fillStyle="rgba(4,1,18,0.7)";ctx.fillRect(w/2-140,54,280,14);
      ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
      ctx.fillText(`DEFENDING: ${this.#env}`,w/2,64);ctx.restore();
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
  update(dt){this.#t+=dt;this.#blinkT+=dt;if(this.#blinkT>0.55){this.#blink=!this.#blink;this.#blinkT=0;}}
  draw(ctx,w,h){
    this.#grid(ctx,w,h);
    const t=this.#t,bounce=Math.sin(t*2.1)*5;
    ctx.save();ctx.font="bold 46px 'Courier New',monospace";ctx.textAlign="center";
    const grad=ctx.createLinearGradient(0,0,w,0);
    grad.addColorStop(0,CS.RED);grad.addColorStop(0.45,CS.ORANGE);grad.addColorStop(0.7,CS.RED);grad.addColorStop(1,CS.ORANGE);
    ctx.fillStyle=grad;ctx.shadowColor=CS.RED;ctx.shadowBlur=26+Math.sin(t*2.5)*8;
    ctx.fillText("FALCON ARCADE DEFENSE",w/2,h*0.16+bounce);
    ctx.font="bold 12px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText("POWERED BY  🦅  CROWDSTRIKE",w/2,h*0.25+bounce*0.5);ctx.restore();
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
    ctx.fillText(`🏆  BREACH PREVENTION RECORD:  ${(+localStorage.getItem("cs_hi")||0).toLocaleString()}  PTS`,w/2,h*0.91);ctx.restore();
  }
  #grid(ctx,w,h){
    ctx.save();ctx.strokeStyle="rgba(224,0,60,0.055)";ctx.lineWidth=1;
    for(let x=0;x<w;x+=50){ctx.beginPath();ctx.moveTo(x,h*0.42);ctx.lineTo(w/2,h*0.9);ctx.stroke();}
    for(let y=0;y<8;y++){const fy=h*0.42+y*(h*0.48/8);ctx.beginPath();ctx.moveTo(0,fy);ctx.lineTo(w,fy);ctx.stroke();}
    ctx.restore();
  }
  #threatPreview(ctx,w,h,t){
    const n=PHASES.length,EW=110,EH=46,gap=9;
    const totalW=n*(EW+gap);const speed=38;
    const offset=((t*speed)%totalW);const y=h*0.34;
    ctx.save();ctx.textAlign="center";ctx.font="bold 9px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
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
        if(isCenter){ctx.translate(x+EW/2,y+bob+EH/2);ctx.scale(1.06,1.06);ctx.translate(-(x+EW/2),-(y+bob+EH/2));}
        ctx.fillStyle="rgba(4,1,18,0.85)";ctx.strokeStyle=phase.color;ctx.lineWidth=isCenter?2:1.5;
        ctx.shadowColor=phase.color;ctx.shadowBlur=isCenter?12:6;
        ctx.beginPath();ctx.roundRect(x,y+bob,EW,EH,4);ctx.fill();ctx.stroke();
        const nl=phase.shortName.length;
        ctx.font=`bold ${nl>12?7:nl>9?8:9}px 'Courier New'`;ctx.fillStyle=phase.color;ctx.shadowBlur=isCenter?8:4;
        ctx.fillText(phase.shortName,x+EW/2,y+bob+15);
        ctx.font="7px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;ctx.fillText(phase.shortNation,x+EW/2,y+bob+27);
        ctx.font="7px 'Courier New'";ctx.fillStyle=CS.LTGREY;
        const vec=phase.vector.length>18?phase.vector.slice(0,16)+"…":phase.vector;ctx.fillText(vec,x+EW/2,y+bob+38);
        ctx.restore();
      });
    }
    const fadeW=60;
    const fadeL=ctx.createLinearGradient(0,0,fadeW,0);fadeL.addColorStop(0,"rgba(4,1,12,1)");fadeL.addColorStop(1,"rgba(4,1,12,0)");
    ctx.fillStyle=fadeL;ctx.fillRect(0,y-2,fadeW,EH+10);
    const fadeR=ctx.createLinearGradient(w-fadeW,0,w,0);fadeR.addColorStop(0,"rgba(4,1,12,0)");fadeR.addColorStop(1,"rgba(4,1,12,1)");
    ctx.fillStyle=fadeR;ctx.fillRect(w-fadeW,y-2,fadeW,EH+10);
    ctx.restore();
  }
  #moduleStrip(ctx,w,h){
    const mods=Object.values(MODULES);const EW=68,EH=42,gap=8;
    const totalW=mods.length*(EW+gap);const speed=26;
    const offset=((this.#t*speed)%totalW);const y=h*0.56;
    ctx.save();ctx.textAlign="center";ctx.font="bold 9px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
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
        if(isCenter){ctx.translate(x+EW/2,y+EH/2);ctx.scale(1.08,1.08);ctx.translate(-(x+EW/2),-(y+EH/2));}
        ctx.fillStyle="rgba(4,1,18,0.82)";ctx.strokeStyle=m.color;ctx.lineWidth=isCenter?2:1;
        ctx.shadowColor=m.color;ctx.shadowBlur=isCenter?14:5*pulse;
        ctx.beginPath();ctx.roundRect(x,y,EW,EH,4);ctx.fill();ctx.stroke();
        ctx.font="16px serif";ctx.textAlign="center";ctx.shadowBlur=0;ctx.fillText(m.emoji,x+EW/2,y+22);
        ctx.font=`bold ${m.shortName.length>8?6:7}px 'Courier New'`;ctx.fillStyle=m.color;
        ctx.shadowColor=isCenter?m.color:"transparent";ctx.shadowBlur=isCenter?8:0;
        ctx.fillText(m.shortName,x+EW/2,y+34);
        if(isCenter){ctx.font="6px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;const tag=m.tagline.length>22?m.tagline.slice(0,20)+"…":m.tagline;ctx.fillText(tag,x+EW/2,y+EH+10);}
        ctx.restore();
      });
    }
    const fadeW=55;
    const fadeL=ctx.createLinearGradient(0,0,fadeW,0);fadeL.addColorStop(0,"rgba(4,1,12,1)");fadeL.addColorStop(1,"rgba(4,1,12,0)");
    ctx.fillStyle=fadeL;ctx.fillRect(0,y-2,fadeW,EH+14);
    const fadeR=ctx.createLinearGradient(w-fadeW,0,w,0);fadeR.addColorStop(0,"rgba(4,1,12,0)");fadeR.addColorStop(1,"rgba(4,1,12,1)");
    ctx.fillStyle=fadeR;ctx.fillRect(w-fadeW,y-2,fadeW,EH+14);
    ctx.restore();
  }
  #controls(ctx,w,h){
    const rows=[["← →","MOVE"],["SPACE","FIRE / SKIP"],["← → + SPACE","CHOOSE MODULE"]];
    const y=h*0.71;ctx.save();ctx.textAlign="center";
    rows.forEach(([k,v],i)=>{
      const x=w/2+(i-1)*200;
      ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.YELLOW;ctx.shadowColor=CS.YELLOW;ctx.shadowBlur=7;ctx.fillText(`[ ${k} ]`,x,y);
      ctx.font="9px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;ctx.fillText(v,x,y+15);
    });
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════════════
//  🦅  MAIN GAME
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
  #bltPool   =new Pool(()=>({x:0,y:0,vx:0,vy:0,w:CFG.BLT_W,h:CFG.BLT_H,boss:false}),100);

  #state     =STATE.TITLE;
  #bannerT   =0;#bannerBoss=false;
  #blinkSkip =true;#blinkT=0;
  #waveIdx   =0;
  #score     =0;#waveScore=0;#hi=0;#lives=CFG.PLR_LIVES;
  #hitPause  =0;#lastTime=0;

  #px=0;#py=0;#canShoot=true;
  #mods={PREVENT:0,INSIGHT:0,IDENTITY:0,PANGEA:0,FEM:0,COMPLETE:0,CHARLOTTE_AIM:0,CLOUD:0};
  #pangeaT=0;
  #modulesCollected=new Set();

  #combo=1;#comboT=0;
  #attackers=[];#pBullets=[];#aBullets=[];
  #blocks=[];#powerUps=[];#ufo=null;#ufoTimer=0;
  #boss=null;#dir=1;
  #currentPhase=null;#deathCtx=null;

  // Behavior state
  #stagingComplete=false;
  #cloudVanishT=0;
  #alertFloodT=0;

  #waveSpd(i){return 1+i*0.25;}
  #waveRate(i){return 0.18+i*0.035;}

  async init(){
    this.#hi=+localStorage.getItem("cs_hi")||0;
    const manifest=[
      {key:"player",src:"space.png"},
      ...Array.from({length:CFG.IMAGE_COUNT},(_,i)=>({key:`act${i}`,src:`act${i}.png`})),
    ];
    this.#drawLoading();
    await this.#assets.loadAll(manifest);
    this.#lastTime=performance.now();
    requestAnimationFrame(this.#loop);
  }

  #loop=(now)=>{
    const dt=Math.min((now-this.#lastTime)/1000,0.05);
    this.#lastTime=now;this.#update(dt);this.#render();
    requestAnimationFrame(this.#loop);
  };

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

      case STATE.PLAYING:     this.#updatePlaying(dt);break;
      case STATE.BOSS:        this.#updateBoss(dt);break;

      case STATE.OVERWATCH_SEQ:
        this.#overwatch.update(dt);
        if(!this.#overwatch.isActive){
          this.#state=this.#boss?.alive?STATE.BOSS:STATE.PLAYING;
          if(this.#countAlive()===0&&!this.#boss?.alive){this.#state=STATE.INCIDENT_REPORT;this.#bannerT=0;}
        }
        break;

      case STATE.FALCON_COMPLETE:
        this.#fcSystem.update(dt);
        if(!this.#fcSystem.isActive)this.#afterFC();
        break;

      case STATE.INCIDENT_REPORT:
        this.#bannerT+=dt;
        if(this.#input.consume(" ")||this.#bannerT>CFG.INCIDENT_REPORT_MS/1000)this.#nextWave();
        break;

      case STATE.GAME_OVER:
      case STATE.YOU_WIN:
        if(this.#input.consume("r")||this.#input.consume("R"))this.#backToTitle();
        break;
    }
  }

  #updatePlaying(dt){
    if(this.#hitPause>0){this.#hitPause-=dt;return;}
    this.#socFeed.update(dt);
    this.#handleInput(dt);
    this.#applyBehavior(dt);
    if(this.#pangeaT<=0){this.#moveAttackers(dt);this.#doShoot();}
    this.#movePBullets(dt);this.#moveABullets(dt);
    this.#charlotte.update(dt);
    this.#updatePowerUps(dt);this.#updateUFO(dt);
    this.#tickCombo(dt);this.#tickMods(dt);
    this.#blocks.forEach(b=>b.update(dt));
    this.#checkEnd();
  }

  #updateBoss(dt){
    if(this.#hitPause>0){this.#hitPause-=dt;return;}
    if(!this.#boss?.alive){this.#endBoss();return;}
    this.#socFeed.update(dt);
    this.#handleInput(dt);
    if(this.#pangeaT<=0)this.#boss.update(dt,this.#aBullets,this.#bltPool);
    this.#movePBullets(dt);this.#moveABullets(dt);
    this.#charlotte.update(dt);
    this.#updatePowerUps(dt);this.#updateUFO(dt);
    this.#tickCombo(dt);this.#tickMods(dt);
    this.#blocks.forEach(b=>b.update(dt));
    if(this.#lives<=0)this.#gameOver();
  }

  // ── PER-PHASE BEHAVIOR HOOKS ────────────────────────────────
  #applyBehavior(dt){
    const beh=this.#currentPhase?.behavior;
    if(!beh)return;

    // COZY BEAR: cloud vanish — enemies periodically go invisible
    if(beh.cloudVanish){
      this.#cloudVanishT+=dt;
      if(this.#cloudVanishT>8){
        this.#cloudVanishT=0;
        for(let c=0;c<CFG.COLS;c++)
          for(let r=0;r<CFG.ROWS;r++){
            const a=this.#attackers[c]?.[r];
            if(a?.alive&&Math.random()<0.3){a.vanished=true;setTimeout(()=>{if(a)a.vanished=false;},2000+Math.random()*2000);}
          }
        this.#floats.spawn(canvas.width/2,canvas.height/3,"☁️ CLOUD PIVOT — ENEMIES VANISHING",CS.ORANGE,14);
      }
    }

    // CARBON SPIDER: staging phase — enemies slow, then speed up
    if(beh.stagingPhase&&!this.#stagingComplete){
      const alive=this.#countAlive();
      const total=CFG.COLS*CFG.ROWS;
      if(alive<total*0.5&&!this.#stagingComplete){
        this.#stagingComplete=true;
        this.#floats.spawn(canvas.width/2,canvas.height/2,"⚠ STAGING COMPLETE — ENCRYPTION PHASE",CS.RED,18);
        this.#fx.flash(224,0,60,0.5);this.#fx.shake(0.3);
      }
    }

    // SANDWORM: corruption — bullets corrupt blocks
    if(beh.corruption){
      // Handled in bullet collision
    }

    // BLACKCAT: alert flood — periodic screen noise
    if(beh.alertFlood){
      this.#alertFloodT+=dt;
      if(this.#alertFloodT>12){
        this.#alertFloodT=0;
        this.#fx.chroma(0.03);
        this.#floats.spawn(canvas.width/2,80,"⚠ ALERT FLOOD — 847 EVENTS IN 4 MINUTES",CS.RED,12);
      }
    }
  }

  #handleInput(dt){
    if(this.#input.isDown("ArrowRight"))this.#px=Math.min(canvas.width-CFG.PLR_W,this.#px+CFG.PLR_SPEED*dt);
    if(this.#input.isDown("ArrowLeft"))this.#px=Math.max(0,this.#px-CFG.PLR_SPEED*dt);
    if(this.#input.consume(" ")&&this.#canShoot)this.#fire();
  }

  #fire(){
    const cx=this.#px+CFG.PLR_W/2-CFG.BLT_W/2,by=this.#py-CFG.BLT_H;
    const angles=this.#mods.PREVENT>0?[-0.2,0,0.2]:[0];
    for(const a of angles)
      this.#pBullets.push(this.#bltPool.acquire({x:cx,y:by,vx:Math.sin(a)*CFG.PLR_BLT_SPEED,vy:-Math.cos(a)*CFG.PLR_BLT_SPEED,w:CFG.BLT_W,h:CFG.BLT_H,boss:false}));
    this.#canShoot=false;this.#audio.laser();
  }

  #moveAttackers(dt){
    const spd=CFG.ATK_BLT_SPEED*0.52*this.#waveSpd(this.#waveIdx);
    const ff=this.#mods.FEM>0?0.62:1.0;
    // Staging phase: slow movement
    const stagingFactor=(this.#currentPhase?.behavior?.stagingPhase&&!this.#stagingComplete)?0.45:1.0;
    let edge=false;
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];if(!a?.alive)continue;
        a.x+=this.#dir*spd*ff*stagingFactor*dt;
        if(a.x+CFG.ATK_W>canvas.width||a.x<0)edge=true;
      }
    if(edge){
      this.#dir*=-1;
      for(let c=0;c<CFG.COLS;c++)
        for(let r=0;r<CFG.ROWS;r++)
          if(this.#attackers[c]?.[r]?.alive)this.#attackers[c][r].y+=CFG.ATK_SY*0.65;
    }
  }

  #movePBullets(dt){
    for(let i=this.#pBullets.length-1;i>=0;i--){
      const b=this.#pBullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.y+b.h<0||b.x<-20||b.x>canvas.width+20){
        this.#bltPool.release(b);this.#pBullets.splice(i,1);this.#canShoot=true;continue;
      }
      if(this.#ufo?.alive&&this.#ov(b.x,b.y,b.w,b.h,this.#ufo.x,this.#ufo.y,this.#ufo.w,this.#ufo.h)){
        const pts=this.#ufo.pts*this.#combo;
        this.#addScore(pts,this.#ufo.x+this.#ufo.w/2,this.#ufo.y,`🛸 SIGNAL +${pts}`);
        this.#parts.csExplosion(this.#ufo.x+this.#ufo.w/2,this.#ufo.y+this.#ufo.h/2);
        this.#fx.shake(0.2);this.#audio.boom();this.#ufo.alive=false;
        this.#bltPool.release(b);this.#pBullets.splice(i,1);this.#canShoot=true;continue;
      }
      if(this.#boss?.alive&&this.#ov(b.x,b.y,b.w,b.h,this.#boss.x,this.#boss.y,this.#boss.w,this.#boss.h)){
        this.#boss.hit();this.#fx.shake(0.12);
        if(!this.#boss.alive){
          this.#parts.bossExplode(this.#boss.x+this.#boss.w/2,this.#boss.y+this.#boss.h/2);
          this.#fx.shake(0.9);this.#fx.flash(224,0,60,0.65);this.#fx.chroma(0.06);this.#audio.bossRoar();
          const pts=CFG.SCORE_BOSS*this.#combo;
          this.#addScore(pts,this.#boss.x+this.#boss.w/2,this.#boss.y,`🦅 BREACH PREVENTED +${pts}`);
        }
        this.#bltPool.release(b);this.#pBullets.splice(i,1);this.#canShoot=true;continue;
      }
      let hit=false;
      outer:
      for(let c=0;c<CFG.COLS&&!hit;c++)
        for(let r=0;r<CFG.ROWS&&!hit;r++){
          const a=this.#attackers[c]?.[r];
          if(!a?.alive||a.vanished)continue;
          if(this.#ov(b.x,b.y,b.w,b.h,a.x,a.y,CFG.ATK_W,CFG.ATK_H)){
            this.#killAtk(a,r);this.#bltPool.release(b);this.#pBullets.splice(i,1);this.#canShoot=true;hit=true;
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
    this.#addScore(pts,a.x+CFG.ATK_W/2,a.y,this.#combo>1?`+${pts} 🔥x${this.#combo}`:`+${pts}`);
    this.#parts.csExplosion(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);
    this.#fx.shake(0.07);this.#audio.boom();this.#bumpCombo();
    if(this.#mods.INSIGHT>0){
      this.#floats.spawn(a.x+CFG.ATK_W/2,a.y-12,"📡 IOC LOGGED",CS.BLUE,10);
      // INSIGHT: correlated kills give 2x bonus
      if(this.#combo>1){const bonus=pts;this.#waveScore+=bonus;this.#score+=bonus;}
    }
    if(Math.random()<CFG.DROP_CHANCE&&this.#currentPhase)
      this.#powerUps.push(new PowerUp(a.x+CFG.ATK_W/2-13,a.y,this.#currentPhase));
  }

  #moveABullets(dt){
    for(let i=this.#aBullets.length-1;i>=0;i--){
      const b=this.#aBullets[i];b.x+=(b.vx||0)*dt;b.y+=b.vy*dt;
      if(b.y>canvas.height||b.x<-20||b.x>canvas.width+20){this.#bltPool.release(b);this.#aBullets.splice(i,1);continue;}
      let bh=false;
      for(const bl of this.#blocks){
        if(bl.alive&&this.#ov(b.x,b.y,b.w,b.h,bl.x,bl.y,bl.w,bl.h)){
          bl.hit();
          if(!bl.alive){
            this.#floats.spawn(bl.x+bl.w/2,bl.y-8,`⚠ ${bl.getShortMsg()}`,bl.getColor(),11);
            this.#floats.spawn(bl.x+bl.w/2,bl.y-22,bl.getFailMsg().slice(0,44),CS.GREY,9);
          }
          this.#bltPool.release(b);this.#aBullets.splice(i,1);bh=true;break;
        }
      }
      if(bh)continue;
      if(this.#ov(b.x,b.y,b.w,b.h,this.#px,this.#py,CFG.PLR_W,CFG.PLR_H)){
        this.#bltPool.release(b);this.#aBullets.splice(i,1);
        if(this.#mods.IDENTITY>0){
          this.#mods.IDENTITY=0;this.#fx.flash(255,220,0,0.4);this.#audio.moduleUp();
          this.#floats.spawn(this.#px+CFG.PLR_W/2,this.#py,"🪪 IDENTITY — CREDENTIAL ATTACK BLOCKED",CS.YELLOW,12);
          this.#floats.spawn(this.#px+CFG.PLR_W/2,this.#py+16,"ANOMALOUS AUTHENTICATION INTERCEPTED",CS.YELLOW,10);
        }else{this.#loseLife();}
      }
    }
  }

  #doShoot(){
    const rate=this.#waveRate(this.#waveIdx);
    const maxB=CFG.MAX_ATK_BLTS+this.#waveIdx;
    // Staging phase: reduced fire rate
    const stagingFactor=(this.#currentPhase?.behavior?.stagingPhase&&!this.#stagingComplete)?0.3:1.0;
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];if(!a?.alive||a.vanished)continue;
        if(this.#aBullets.length>=maxB)return;
        const dist=Math.abs(a.x+CFG.ATK_W/2-(this.#px+CFG.PLR_W/2));
        const prox=Math.max(0,1-dist/canvas.width);
        if(Math.random()<rate*(0.4+prox*1.6)*stagingFactor/60)
          this.#aBullets.push(this.#bltPool.acquire({x:a.x+CFG.ATK_W/2-CFG.BLT_W/2,y:a.y+CFG.ATK_H,vx:0,vy:CFG.ATK_BLT_SPEED*(0.9+this.#waveIdx*0.08),w:CFG.BLT_W,h:CFG.BLT_H,boss:false}));
      }
  }

  #updatePowerUps(dt){
    for(let i=this.#powerUps.length-1;i>=0;i--){
      const p=this.#powerUps[i];p.update(dt);
      if(!p.alive){this.#powerUps.splice(i,1);continue;}
      if(this.#ov(p.x,p.y,p.w,p.h,this.#px,this.#py,CFG.PLR_W,CFG.PLR_H)){
        this.#collectMod(p.mod);this.#powerUps.splice(i,1);
      }
    }
  }

  #collectMod(mod){
    this.#audio.moduleUp();
    this.#parts.moduleCollect(this.#px+CFG.PLR_W/2,this.#py,mod.color);
    this.#notify.push(mod);
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
    this.#fx.flash(255,106,0,0.4);this.#fx.shake(0.25);
    this.#mods.CLOUD=20; // 20s assisted containment
    this.#floats.spawn(canvas.width/2,canvas.height/2,"☁️ CLOUD SECURITY — 20s RUNTIME CONTAINMENT",CS.ORANGE,15);
    // Progressive elimination over 20s — not instant wipe
    let delay=0;let count=0;
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];if(!a?.alive)continue;
        count++;const ac=a,rc=r;
        setTimeout(()=>{
          if(!ac.alive)return;ac.alive=false;
          this.#parts.csExplosion(ac.x+CFG.ATK_W/2,ac.y+CFG.ATK_H/2);
          this.#addScore(CFG.SCORE_ROW[rc]*this.#combo,ac.x+CFG.ATK_W/2,ac.y,`☁️ +${CFG.SCORE_ROW[rc]*this.#combo}`);
          this.#audio.boom();
        },delay);delay+=120; // slower, more deliberate
      }
    this.#aBullets.forEach(b=>this.#bltPool.release(b));this.#aBullets=[];
  }

  #doFEM(){
    this.#audio.fem();this.#fx.flash(0,255,208,0.3);
    this.#mods.FEM=MODULES.FEM.duration;
    this.#floats.spawn(canvas.width/2,canvas.height/2-20,"🗺️ EXPOSURE MGMT — ATTACK SURFACE REDUCED 40%",CS.TEAL,14);
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){const a=this.#attackers[c]?.[r];if(a?.alive)this.#parts.femReveal(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);}
    // Reveal vanished enemies
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){const a=this.#attackers[c]?.[r];if(a)a.vanished=false;}
  }

  #doCharlotte(){
    this.#audio.charlotte();this.#fx.flash(57,255,20,0.35);
    this.#mods.CHARLOTTE_AIM=15; // 15s enhanced aim
    this.#floats.spawn(canvas.width/2,canvas.height/3,"🤖 CHARLOTTE AI — AUTONOMOUS THREAT ANALYSIS",CS.GREEN,14);
    this.#charlotte.activate(this.#attackers,CFG.COLS,CFG.ROWS,a=>{
      this.#parts.csExplosion(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);
      const pts=CFG.SCORE_ROW[0]*3;this.#addScore(pts,a.x+CFG.ATK_W/2,a.y,`🤖 AI +${pts}`);
    });
  }

  #doPangea(){
    this.#audio.pangea();this.#fx.flash(0,255,208,0.45);this.#fx.shake(0.18);
    this.#pangeaT=MODULES.PANGEA.duration;this.#mods.PANGEA=this.#pangeaT;
    this.#floats.spawn(canvas.width/2,canvas.height/2-30,"🌍 PANGEA — ADVERSARY INFRASTRUCTURE FROZEN",CS.TEAL,14);
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){const a=this.#attackers[c]?.[r];if(a?.alive)this.#parts.pangeaFreeze(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);}
    // Clear active bullets
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
    this.#audio.complete();this.#fx.shake(0.55);this.#fx.flash(224,0,60,0.65);this.#fx.chroma(0.07);
    this.#state=STATE.FALCON_COMPLETE;
    this.#fcSystem.activate(this.#attackers,CFG.COLS,CFG.ROWS,(a,idx)=>{
      setTimeout(()=>{this.#parts.completeKill(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);this.#audio.boom();},idx*50);
      const pts=CFG.SCORE_ROW[0]*this.#combo*2;
      this.#addScore(pts,a.x+CFG.ATK_W/2,a.y,`🦅 MDR +${pts}`);
    });
    this.#aBullets.forEach(b=>this.#bltPool.release(b));this.#aBullets=[];
  }

  #afterFC(){
    this.#state=this.#boss?.alive?STATE.BOSS:STATE.PLAYING;
    if(this.#countAlive()===0&&!this.#boss?.alive){this.#state=STATE.INCIDENT_REPORT;this.#bannerT=0;}
  }

  #updateUFO(dt){
    if(this.#ufo){this.#ufo.update(dt,this.#audio);if(!this.#ufo.alive)this.#ufo=null;}
    else{this.#ufoTimer+=dt*1000;if(this.#ufoTimer>CFG.UFO_INTERVAL){this.#ufoTimer=0;this.#ufo=new UFO(canvas.width);}}
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
    this.#fx.shake(0.5);this.#fx.flash(224,0,60,0.6);this.#fx.chroma(0.04);
    this.#audio.playerHit();this.#combo=1;
    if(this.#lives<=0){this.#gameOver();return;}
    this.#hitPause=CFG.HIT_PAUSE_MS/1000;
    this.#px=canvas.width/2-CFG.PLR_W/2;
    const dc=getDeathContext(this.#currentPhase,this.#modulesCollected);
    this.#floats.spawn(canvas.width/2,canvas.height/2-24,`⚠ ${dc.headline.slice(0,46)}`,CS.RED_GLOW,11);
  }

  #checkEnd(){
    if(this.#lives<=0){this.#gameOver();return;}
    if(this.#countAlive()===0){
      this.#audio.levelUp();this.#fx.startWarp(canvas.width,canvas.height);this.#fx.flash(0,229,255,0.35);
      this.#socFeed.stop();
      this.#state=STATE.INCIDENT_REPORT;this.#bannerT=0;
    }
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];
        if(a?.alive&&a.y+CFG.ATK_H>=this.#py){this.#lives=0;this.#gameOver();return;}
      }
  }

  #countAlive(){
    let n=0;
    for(let c=0;c<CFG.COLS;c++)for(let r=0;r<CFG.ROWS;r++)if(this.#attackers[c]?.[r]?.alive)n++;
    return n;
  }

  #endBoss(){
    this.#audio.levelUp();this.#fx.startWarp(canvas.width,canvas.height);this.#fx.flash(224,0,60,0.65);
    this.#socFeed.stop();
    if(this.#waveIdx>=PHASES.length-1){this.#state=STATE.YOU_WIN;this.#saveHi();return;}
    this.#state=STATE.INCIDENT_REPORT;this.#bannerT=0;
  }

  #gameOver(){
    this.#audio.stopBGM();this.#fx.flash(224,0,60,0.9);this.#fx.shake(1);
    this.#parts.bossExplode(canvas.width/2,canvas.height/2);
    this.#socFeed.stop();
    this.#deathCtx=getDeathContext(this.#currentPhase,this.#modulesCollected);
    this.#state=STATE.GAME_OVER;this.#saveHi();
  }

  #saveHi(){
    if(this.#score>this.#hi){this.#hi=this.#score;try{localStorage.setItem("cs_hi",this.#hi);}catch(_){}}
  }

  #startGame(){
    this.#score=0;this.#lives=CFG.PLR_LIVES;this.#combo=1;this.#comboT=0;
    this.#waveIdx=0;this.#dir=1;
    this.#mods={PREVENT:0,INSIGHT:0,IDENTITY:0,PANGEA:0,FEM:0,COMPLETE:0,CHARLOTTE_AIM:0,CLOUD:0};
    this.#pangeaT=0;this.#deathCtx=null;
    this.#audio.startBGM();this.#beginWave();
  }

  #nextWave(){
    if(this.#waveIdx>=PHASES.length-1){this.#state=STATE.YOU_WIN;this.#saveHi();return;}
    this.#waveIdx=Math.min(this.#waveIdx+1,PHASES.length-1);
    this.#dir=1;this.#audio.stopBGM();this.#audio.startBGM();this.#beginWave();
  }

  #beginWave(){
    this.#pBullets=[];this.#aBullets=[];this.#powerUps=[];
    this.#ufo=null;this.#ufoTimer=0;this.#canShoot=true;
    this.#modulesCollected=new Set();this.#waveScore=0;
    this.#stagingComplete=false;this.#cloudVanishT=0;this.#alertFloodT=0;
    this.#px=canvas.width/2-CFG.PLR_W/2;this.#py=canvas.height-CFG.PLR_H-32;
    this.#buildAttackers();this.#buildBlocks();

    const phase=PHASES[this.#waveIdx];
    this.#currentPhase=phase;this.#bannerBoss=phase.isBoss;
    if(phase.isBoss){this.#boss=new Boss(this.#waveIdx+1,phase);this.#audio.bossRoar();}
    else this.#boss=null;

    // Show module choice screen before each wave
    this.#modChoice.prepare(phase);
    this.#state=STATE.MODULE_CHOICE;
  }

    #backToTitle(){
      this.#audio.stopBGM();this.#socFeed.stop();this.#state=STATE.TITLE;
      this.#pBullets=[];this.#aBullets=[];this.#powerUps=[];
      this.#ufo=null;this.#boss=null;this.#currentPhase=null;this.#deathCtx=null;
      this.#canShoot=true; // ← ADD THIS
      this.#input.flushAll();
    }

  #buildAttackers(){
    this.#attackers=[];
    const sx=(canvas.width-CFG.COLS*(CFG.ATK_W+CFG.ATK_SX))/2;
    for(let c=0;c<CFG.COLS;c++){
      this.#attackers[c]=[];
      for(let r=0;r<CFG.ROWS;r++){
        this.#attackers[c][r]={
          x:sx+c*(CFG.ATK_W+CFG.ATK_SX),y:68+r*(CFG.ATK_H+CFG.ATK_SY),
          alive:true,vanished:false,
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
    for(let c=0;c<CFG.BLK_COLS;c++)
      this.#blocks.push(new Block(sx+c*(CFG.BLK_W+18),canvas.height-108,c));
  }

  // ── RENDER ──────────────────────────────────────────────────────
  #render(){
    const W=canvas.width,H=canvas.height;
    ctx.fillStyle=CS.BG;ctx.fillRect(0,0,W,H);
    this.#stars.draw(ctx);

    switch(this.#state){
      case STATE.TITLE:this.#title.draw(ctx,W,H);break;

      case STATE.MODULE_CHOICE:
        this.#modChoice.draw(ctx,W,H,this.#currentPhase);break;

      case STATE.WAVE_BANNER:
      case STATE.BOSS_WARNING:
        this.#renderGame(W,H);
        this.#drawWaveBanner(ctx,W,H);break;

      case STATE.OVERWATCH_SEQ:
        this.#renderGame(W,H);this.#overwatch.draw(ctx);break;

      case STATE.FALCON_COMPLETE:
        this.#renderGame(W,H);this.#fcSystem.draw(ctx,W,H);break;

      case STATE.PLAYING:case STATE.BOSS:
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
    // Environment background tint
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
    this.#drawPlayer();this.#drawBullets();
    this.#ufo?.draw(ctx,this.#assets.get("act0"));
    this.#powerUps.forEach(p=>p.draw(ctx));
    this.#charlotte.draw(ctx);
    this.#parts.draw(ctx);this.#floats.draw(ctx);

    if(this.#fx.chromaAmt>0.005){
      const sh=this.#fx.chromaAmt*canvas.width;
      ctx.save();ctx.globalAlpha=0.26;ctx.globalCompositeOperation="screen";
      ctx.drawImage(canvas,sh,0);ctx.globalCompositeOperation="source-over";ctx.globalAlpha=1;ctx.restore();
    }
    if(this.#pangeaT>0){
      ctx.save();ctx.fillStyle=`rgba(0,229,255,${0.04+Math.sin(performance.now()*0.003)*0.02})`;ctx.fillRect(0,0,W,H);ctx.restore();
    }
    this.#fx.restoreShake(ctx);

    this.#hud.setState(this.#score,this.#hi,this.#lives,this.#waveIdx+1,
      this.#combo,this.#mods,this.#pangeaT,this.#currentPhase?.environment??"");
    this.#hud.draw(ctx,W);
    this.#notify.draw(ctx,W);
    this.#socFeed.draw(ctx,W,H);
  }

  #drawAttackers(){
    const now=performance.now();
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];if(!a?.alive)continue;
        const img=this.#assets.get(`act${a.imageIndex}`);
        const bob=Math.sin(a.phase+now*0.0014)*2.5;
        const hue=(r*50+now*0.025)%360;
        const isVanished=a.vanished;

        ctx.save();
        if(isVanished)ctx.globalAlpha=0.15+Math.sin(now*0.005)*0.1;
        ctx.shadowColor=`hsl(${hue},100%,60%)`;ctx.shadowBlur=7+Math.sin(a.phase+now*0.002)*3;
        if(this.#pangeaT>0){ctx.globalAlpha=(isVanished?0.1:0.68);ctx.fillStyle="rgba(0,200,255,0.28)";ctx.fillRect(a.x,a.y+bob,CFG.ATK_W,CFG.ATK_H);ctx.globalAlpha=isVanished?0.15:1;}
        if(img)ctx.drawImage(img,a.x,a.y+bob,CFG.ATK_W,CFG.ATK_H);
        else{ctx.fillStyle=`hsl(${hue},80%,55%)`;ctx.fillRect(a.x,a.y+bob,CFG.ATK_W,CFG.ATK_H);}
        if(this.#mods.INSIGHT>0&&!isVanished){
          ctx.font="bold 7px 'Courier New'";ctx.textAlign="center";ctx.fillStyle=CS.BLUE;ctx.shadowColor=CS.BLUE;ctx.shadowBlur=5;
          ctx.fillText("⚠APT",a.x+CFG.ATK_W/2,a.y+bob-3);
        }
        if(this.#mods.FEM>0){
          ctx.font="7px 'Courier New'";ctx.textAlign="center";ctx.fillStyle=CS.TEAL;ctx.shadowColor=CS.TEAL;ctx.shadowBlur=4;
          ctx.fillText("EXPOSED",a.x+CFG.ATK_W/2,a.y+bob+CFG.ATK_H+10);
        }
        // Staging phase: show staging indicator
        if(this.#currentPhase?.behavior?.stagingPhase&&!this.#stagingComplete){
          ctx.font="7px 'Courier New'";ctx.textAlign="center";ctx.fillStyle=CS.ORANGE;ctx.shadowBlur=0;
          ctx.fillText("STAGING",a.x+CFG.ATK_W/2,a.y+bob-3);
        }
        ctx.restore();
      }
  }

  #drawPlayer(){
    const img=this.#assets.get("player");
    const flicker=0.4+Math.random()*0.6;
    const tg=ctx.createRadialGradient(this.#px+CFG.PLR_W/2,this.#py+CFG.PLR_H+10,0,this.#px+CFG.PLR_W/2,this.#py+CFG.PLR_H+10,16);
    tg.addColorStop(0,`rgba(224,0,60,${flicker})`);tg.addColorStop(1,"rgba(224,0,60,0)");
    ctx.fillStyle=tg;ctx.fillRect(this.#px,this.#py,CFG.PLR_W,CFG.PLR_H+20);
    ctx.save();
    if(this.#mods.IDENTITY>0){
      const p=0.65+Math.sin(performance.now()*0.006)*0.35;
      ctx.strokeStyle=`rgba(255,220,0,${p})`;ctx.lineWidth=2;ctx.shadowColor=CS.YELLOW;ctx.shadowBlur=18*p;
      ctx.beginPath();ctx.ellipse(this.#px+CFG.PLR_W/2,this.#py+CFG.PLR_H/2,CFG.PLR_W*0.85,CFG.PLR_H*1.4,0,0,Math.PI*2);ctx.stroke();
    }
    // Charlotte AI aim assist — targeting line to nearest enemy
    if(this.#mods.CHARLOTTE_AIM>0){
      let nearest=null,nearDist=Infinity;
      for(let c=0;c<CFG.COLS;c++)for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];if(!a?.alive)continue;
        const d=Math.abs(a.x+CFG.ATK_W/2-(this.#px+CFG.PLR_W/2));
        if(d<nearDist){nearDist=d;nearest=a;}
      }
      if(nearest){
        ctx.save();ctx.globalAlpha=0.35;ctx.strokeStyle=CS.GREEN;ctx.lineWidth=1;ctx.setLineDash([4,4]);
        ctx.shadowColor=CS.GREEN;ctx.shadowBlur=6;
        ctx.beginPath();ctx.moveTo(this.#px+CFG.PLR_W/2,this.#py);ctx.lineTo(nearest.x+CFG.ATK_W/2,nearest.y+CFG.ATK_H);ctx.stroke();
        ctx.setLineDash([]);ctx.restore();
      }
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
      ctx.fillStyle=grad;ctx.shadowColor=CS.RED;ctx.shadowBlur=10;ctx.fillRect(b.x,b.y,b.w,b.h);ctx.restore();
    }
    for(const b of this.#aBullets){
      ctx.save();const col=b.boss?CS.YELLOW:CS.ORANGE;
      ctx.shadowColor=col;ctx.shadowBlur=10;ctx.fillStyle=col;ctx.fillRect(b.x,b.y,b.w,b.h);
      if(b.boss){ctx.globalAlpha=0.22;ctx.fillRect(b.x-b.w,b.y-b.h*0.5,b.w*3,b.h*2);}
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
      ctx.font="bold 40px 'Courier New'";ctx.fillStyle=CS.RED_GLOW;ctx.shadowColor=CS.RED_GLOW;ctx.shadowBlur=34;
      ctx.fillText(`👾 ${phase?.shortName??"BOSS"} INCOMING!`,w/2,h/2-22);
      ctx.font="bold 14px 'Courier New'";ctx.fillStyle=CS.ORANGE;ctx.shadowBlur=12;
      ctx.fillText("HIGH-PRIORITY THREAT — CROWDSTRIKE RESPONDING",w/2,h/2+26);
    }else{
      ctx.font="bold 50px 'Courier New'";
      const g=ctx.createLinearGradient(0,0,w,0);g.addColorStop(0,CS.RED);g.addColorStop(1,CS.ORANGE);
      ctx.fillStyle=g;ctx.shadowColor=CS.RED;ctx.shadowBlur=26;
      ctx.fillText(`WAVE  ${this.#waveIdx+1}`,w/2,h/2-22);
      ctx.font="bold 14px 'Courier New'";ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=12;
      ctx.fillText("FALCON DEPLOYED — DEFEND THE NETWORK",w/2,h/2+26);
    }
    if(this.#blinkSkip){ctx.font="10px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;ctx.fillText("[ SPACE ] CONTINUE",w/2,h/2+50);}
    ctx.restore();
  }

  #drawGameOver(ctx,w,h){
    const dc=this.#deathCtx;
    ctx.fillStyle="rgba(4,1,12,0.86)";ctx.fillRect(0,0,w,h);
    ctx.fillStyle=CS.RED;ctx.fillRect(0,0,w,4);ctx.fillRect(0,h-4,w,4);
    ctx.save();ctx.textAlign="center";
    ctx.font="bold 38px 'Courier New'";ctx.fillStyle=CS.RED_GLOW;ctx.shadowColor=CS.RED_GLOW;ctx.shadowBlur=32;
    ctx.fillText("ADVERSARY ACHIEVED PERSISTENCE",w/2,h*0.13);
    if(dc){
      const px=50,py=h*0.21,pw=w-100,ph=182;
      ctx.fillStyle="rgba(8,2,26,0.94)";ctx.strokeStyle=CS.RED;ctx.lineWidth=1.5;ctx.shadowColor=CS.RED;ctx.shadowBlur=12;
      ctx.beginPath();ctx.roundRect(px,py,pw,ph,6);ctx.fill();ctx.stroke();
      ctx.fillStyle=CS.RED;ctx.shadowBlur=0;ctx.beginPath();ctx.roundRect(px,py,pw,24,[6,6,0,0]);ctx.fill();
      ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.fillText("⚠  THREAT ANALYSIS — WHAT HAPPENED",w/2,py+16);
      ctx.font="bold 13px 'Courier New'";ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=10;ctx.fillText(dc.headline,w/2,py+44);
      ctx.font="11px 'Courier New'";ctx.fillStyle=CS.LTGREY;ctx.shadowBlur=0;
      const words=dc.body.split(" ");let line="",ly=py+64;
      for(const word of words){const test=line+word+" ";if(ctx.measureText(test).width>pw-50&&line!==""){ctx.fillText(line,w/2,ly);line=word+" ";ly+=15;}else line=test;}
      ctx.fillText(line,w/2,ly);
      ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=8;ctx.fillText(`🦅 ${dc.cta}`,w/2,py+ph-14);
    }
    ctx.font="bold 16px 'Courier New'";ctx.fillStyle=CS.YELLOW;ctx.shadowColor=CS.YELLOW;ctx.shadowBlur=10;
    ctx.fillText(`BREACH PREVENTION SCORE:  ${this.#score.toLocaleString()}`,w/2,h*0.74);
    if(this.#score>=this.#hi&&this.#score>0){ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.fillText("✨ NEW RECORD — ELITE ANALYST",w/2,h*0.81);}
    else{ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;ctx.fillText(`RECORD: ${this.#hi.toLocaleString()}`,w/2,h*0.81);}
    ctx.font="bold 13px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;ctx.fillText("[ R ]  REDEPLOY",w/2,h*0.88);
    ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=8;ctx.fillText("🦅  crowdstrike.com  |  We Stop Breaches",w/2,h*0.94);
    ctx.restore();
  }

  #drawYouWin(ctx,w,h){
    ctx.fillStyle="rgba(4,1,12,0.86)";ctx.fillRect(0,0,w,h);
    ctx.fillStyle=CS.GREEN;ctx.fillRect(0,0,w,4);ctx.fillRect(0,h-4,w,4);
    ctx.save();ctx.textAlign="center";
    ctx.font="bold 44px 'Courier New'";ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=32;ctx.fillText("🦅 BREACH PREVENTED",w/2,h*0.22);
    ctx.font="bold 14px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;ctx.fillText("All adversaries neutralized. Network secured.",w/2,h*0.33);
    ctx.font="12px 'Courier New'";ctx.fillStyle=CS.GREY;
    ctx.fillText("Falcon delivered visibility, detection and response",w/2,h*0.41);
    ctx.fillText("across every endpoint, identity and cloud workload.",w/2,h*0.47);
    ctx.font="bold 19px 'Courier New'";ctx.fillStyle=CS.YELLOW;ctx.shadowColor=CS.YELLOW;ctx.shadowBlur=10;
    ctx.fillText(`BREACH PREVENTION SCORE:  ${this.#score.toLocaleString()}`,w/2,h*0.57);
    if(this.#score>=this.#hi&&this.#score>0){ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=12;ctx.fillText("✨ NEW RECORD — ELITE ANALYST",w/2,h*0.65);}
    else{ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;ctx.fillText(`RECORD: ${this.#hi.toLocaleString()}`,w/2,h*0.65);}
    ctx.font="bold 13px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;ctx.fillText("[ R ]  PLAY AGAIN",w/2,h*0.77);
    ctx.font="bold 11px 'Courier New'";ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=8;ctx.fillText("🦅  crowdstrike.com  |  We Stop Breaches — Guaranteed.",w/2,h*0.87);
    ctx.restore();
  }

  #drawLoading(){
    ctx.fillStyle=CS.BG;ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.font="bold 24px 'Courier New'";ctx.textAlign="center";
    ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=20;
    ctx.fillText("🦅  FALCON ARCADE INITIALIZING…",canvas.width/2,canvas.height/2);
    ctx.font="11px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText("Loading threat intelligence data…",canvas.width/2,canvas.height/2+32);
    ctx.textAlign="left";
  }

  #ov(ax,ay,aw,ah,bx,by,bw,bh){return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;}

} // ← end class Game

// ─── BOOTSTRAP ───────────────────────────────────────────────────
const game=new Game();
game.init().catch(console.error);
