// ═══════════════════════════════════════════════════════════════════
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

// ─── CROWDSTRIKE PALETTE ─────────────────────────────────────────
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
  INTEL_BRIEF     : "INTEL_BRIEF",
  WAVE_BANNER     : "WAVE_BANNER",
  PLAYING         : "PLAYING",
  BOSS_WARNING    : "BOSS_WARNING",
  BOSS            : "BOSS",
  OVERWATCH_SEQ   : "OVERWATCH_SEQ",
  FALCON_COMPLETE : "FALCON_COMPLETE",
  LEVEL_CLEAR     : "LEVEL_CLEAR",
  GAME_OVER       : "GAME_OVER",
  YOU_WIN         : "YOU_WIN",
});

// ─── MODULES ─────────────────────────────────────────────────────
// Single source of truth for all module definitions.
// To reference in a phase, use the id key.
const MODULES = Object.freeze({
  PREVENT: {
    id        : "PREVENT",
    name      : "Falcon Prevent",
    shortName : "PREVENT",
    tagline   : "Next-Gen Antivirus & EPP",
    desc      : "AI-powered endpoint protection stops ransomware, malware and zero-days before execution — no signatures needed. Your first line of defence.",
    emoji     : "🛡️",
    color     : CS.CYAN,
    duration  : 12,
  },
  INSIGHT: {
    id        : "INSIGHT",
    name      : "Falcon Insight XDR",
    shortName : "INSIGHT XDR",
    tagline   : "Extended Detection & Response",
    desc      : "Full attack surface visibility across endpoints, cloud, identity and network. Correlates every signal into one unified attack story.",
    emoji     : "🔍",
    color     : CS.BLUE,
    duration  : 10,
  },
  IDENTITY: {
    id        : "IDENTITY",
    name      : "Falcon Identity",
    shortName : "IDENTITY",
    tagline   : "Identity Threat Detection & Response",
    desc      : "Detects credential abuse, impossible travel and MFA bypass the moment they occur. Makes valid credentials an unreliable weapon for adversaries.",
    emoji     : "🪪",
    color     : CS.YELLOW,
    duration  : 9,
  },
  CLOUD: {
    id        : "CLOUD",
    name      : "Falcon Cloud Security",
    shortName : "CLOUD SEC",
    tagline   : "Cloud-Native Application Protection",
    desc      : "CNAPP securing every workload, container and cloud service. Blocks cloud pivots and runtime threats the moment they execute.",
    emoji     : "☁️",
    color     : CS.ORANGE,
    duration  : 0,
  },
  FEM: {
    id        : "FEM",
    name      : "Falcon Exposure Mgmt",
    shortName : "EXPOSURE",
    tagline   : "Attack Surface Management",
    desc      : "Discovers and prioritises every exposed asset before adversaries exploit them. Eliminates unknown attack surface in real time.",
    emoji     : "🗺️",
    color     : CS.TEAL,
    duration  : 8,
  },
  CHARLOTTE: {
    id        : "CHARLOTTE",
    name      : "Charlotte AI",
    shortName : "CHARLOTTE",
    tagline   : "Generative AI Security Co-Pilot",
    desc      : "AI co-pilot that autonomously analyses and neutralises the five highest-value threats at machine speed — countering AI attacks with AI defence.",
    emoji     : "🤖",
    color     : CS.GREEN,
    duration  : 0,
  },
  PANGEA: {
    id        : "PANGEA",
    name      : "Falcon Pangea",
    shortName : "PANGEA",
    tagline   : "Global Threat Intelligence Network",
    desc      : "1 trillion+ security events daily. Planet-scale intelligence blocks adversary infrastructure globally — freezes their entire operation cold.",
    emoji     : "🌍",
    color     : CS.TEAL,
    duration  : 7,
  },
  OVERWATCH: {
    id        : "OVERWATCH",
    name      : "Falcon OverWatch",
    shortName : "OVERWATCH",
    tagline   : "Managed Threat Hunting 24/7/365",
    desc      : "Elite human hunters proactively tracking adversaries around the clock. They find what automated tools miss — hunting the top three active threats.",
    emoji     : "👁️",
    color     : CS.ORANGE,
    duration  : 0,
  },
  COMPLETE: {
    id        : "COMPLETE",
    name      : "Falcon Complete MDR",
    shortName : "COMPLETE",
    tagline   : "Managed Detection & Response",
    desc      : "Your fully-managed security team. Expert analysts respond in minutes, contain breaches and restore operations — outcome guaranteed.",
    emoji     : "🦅",
    color     : CS.RED,
    duration  : 0,
  },
});

// ─── PHASES ──────────────────────────────────────────────────────
// ★ THIS IS THE ONLY PLACE YOU NEED TO EDIT TO ADD A NEW PHASE ★
//
// drops: relative weights for module drops THIS phase.
//        PREVENT and OVERWATCH are auto-injected into every phase.
//        Higher number = more likely to fall from the sky.
//        The system normalises automatically — they don't need to sum to 1.
//
// keyModules: shown in the Intel Brief as "recommended for this adversary".
//
// moduleNarrative: per-module explanation shown in Intel Brief panel —
//   WHY does this module help against THIS specific adversary?
//
// deathMessages: shown on game-over per missing module id.
//
const PHASES = [
  // ── PHASE 1 ──────────────────────────────────────────────────
  {
    id         : "fancy_bear",
    waveNum    : 1,
    isBoss     : false,
    color      : CS.ORANGE,

    // Actor card
    name       : "FANCY BEAR",
    shortName  : "FANCY BEAR",
    aka        : "APT28 / Sofacy / Forest Blizzard",
    nation     : "🇷🇺 Russia — GRU (Unit 26165)",
    shortNation: "🇷🇺 Russia — GRU",
    threat     : "CRITICAL",
    vector     : "Credential Theft & Spear-Phishing",

    // Briefing panels
    desc       : "Russian GRU military intelligence. Targets governments, NATO allies and defence contractors using stolen credentials and weaponised documents. One of the most active nation-state APTs in the world.",
    attackDesc : "FANCY BEAR harvests credentials via precision spear-phishing campaigns and forged login portals. Once inside, they authenticate as legitimate employees — making them nearly invisible to traditional endpoint tools.",
    falconFix  : "Falcon Identity establishes behavioural baselines for every account. When FANCY BEAR authenticates with stolen credentials, impossible travel, unusual hours and atypical access patterns trigger immediate alerts. OverWatch hunters proactively look for the subtle lateral movement that follows.",

    // Modules recommended for this adversary (shown in brief)
    keyModules : ["IDENTITY","INSIGHT","OVERWATCH","PREVENT"],

    // Per-module narrative shown in brief drop section
    moduleNarrative: {
      IDENTITY  : "Detects stolen credentials the moment they're used — even if the password is correct.",
      INSIGHT   : "Correlates login anomalies with endpoint signals to expose the full attack chain.",
      OVERWATCH : "Elite hunters find the lateral movement FANCY BEAR performs after initial access.",
      PREVENT   : "Blocks weaponised documents and first-stage malware droppers before execution.",
    },

    // Module drop weights for this phase (PREVENT + OVERWATCH auto-added)
    drops: {
      IDENTITY  : 0.32,
      INSIGHT   : 0.22,
      OVERWATCH : 0.16,
      PREVENT   : 0.18,
      FEM       : 0.08,
      CHARLOTTE : 0.04,
    },

    // Death messages per missing key module
    deathMessages: {
      IDENTITY  : {
        headline : "FANCY BEAR MOVED LATERALLY WITH VALID CREDENTIALS",
        body     : "Without Falcon Identity, there was no behavioural baseline to flag the anomalous authentication. FANCY BEAR operated as a trusted employee for weeks — a technique that bypasses every signature-based tool.",
        cta      : "Falcon Identity detects impossible travel, credential stuffing and anomalous session behaviour in real time.",
      },
      INSIGHT   : {
        headline : "FANCY BEAR COMPLETED THE ATTACK CHAIN UNDETECTED",
        body     : "Endpoint alerts existed, but no tool correlated them into a story. FANCY BEAR's multi-stage campaign — phishing, credential theft, lateral movement — looked like isolated noise without XDR.",
        cta      : "Falcon Insight XDR unifies endpoint, identity and network signals into a single attack narrative.",
      },
      OVERWATCH : {
        headline : "FANCY BEAR ESTABLISHED PERSISTENCE — NO HUMAN HUNTER INTERVENED",
        body     : "Automated detection caught pieces, but FANCY BEAR's living-off-the-land techniques blend into normal admin activity. Expert threat hunters know exactly what patterns to look for.",
        cta      : "Falcon OverWatch hunts proactively — finding adversary tradecraft that automated systems miss.",
      },
    },
  },

  // ── PHASE 2 — AI ATTACKS (NEW) ───────────────────────────────
  {
    id         : "ai_syndicate",
    waveNum    : 2,
    isBoss     : false,
    color      : CS.GREEN,

    name       : "AI SYNDICATE",
    shortName  : "AI SYNDICATE",
    aka        : "AI-Augmented eCrime / Gen-AI Threat Actors",
    nation     : "🌐 Global — AI-Powered eCrime",
    shortNation: "🌐 AI eCrime",
    threat     : "CRITICAL",
    vector     : "AI Phishing · Deepfakes · LLM-Crafted Malware",

    desc       : "A new class of threat actor weaponising generative AI to conduct attacks at unprecedented scale and sophistication. AI-generated spear-phishing emails with zero grammatical errors. Deepfake voice calls impersonating executives. LLM-crafted malware that rewrites itself to evade detection.",
    attackDesc : "AI SYNDICATE deploys LLM-generated phishing campaigns targeting thousands of employees simultaneously, with personalised lures sourced from public social media. Deepfake audio authorises fraudulent wire transfers. AI-generated malware variants evade signature detection automatically.",
    falconFix  : "Charlotte AI fights AI with AI — autonomous threat analysis at machine speed. Falcon Prevent's behavioural AI detects LLM-generated malware variants regardless of signature. Falcon Identity flags executive impersonation attempts and anomalous wire-authorisation patterns.",

    keyModules : ["CHARLOTTE","PREVENT","IDENTITY","OVERWATCH"],

    moduleNarrative: {
      CHARLOTTE : "Counters AI-generated attacks with AI-powered autonomous detection — speed vs speed.",
      PREVENT   : "Behavioural AI blocks LLM-crafted malware variants that signature tools have never seen.",
      IDENTITY  : "Flags deepfake impersonation attempts and anomalous authorisation requests in real time.",
      OVERWATCH : "Human hunters recognise AI attack patterns and social engineering TTPs that automated tools miss.",
    },

    drops: {
      CHARLOTTE : 0.30,
      PREVENT   : 0.22,
      IDENTITY  : 0.18,
      OVERWATCH : 0.16,
      INSIGHT   : 0.10,
      FEM       : 0.04,
    },

    deathMessages: {
      CHARLOTTE : {
        headline : "AI SYNDICATE'S LLM MALWARE BYPASSED YOUR DEFENCES",
        body     : "AI-generated malware variants mutate faster than any signature database. Without Charlotte AI countering at machine speed, each new variant was a fresh unknown threat. Humans cannot respond fast enough to AI-generated attack velocity.",
        cta      : "Charlotte AI analyses and neutralises AI-generated threats autonomously — matching attack speed with defence speed.",
      },
      PREVENT   : {
        headline : "LLM-CRAFTED MALWARE EXECUTED UNDETECTED",
        body     : "AI SYNDICATE's malware was generated fresh for this campaign — no signature existed. Traditional AV was blind. Only AI-native behavioural analysis can detect code that's never been seen before.",
        cta      : "Falcon Prevent's AI engine detects malicious behaviour, not signatures — stopping novel AI-generated threats.",
      },
      IDENTITY  : {
        headline : "DEEPFAKE EXECUTIVE AUTHORISED A FRAUDULENT TRANSFER",
        body     : "An AI-generated voice call impersonating your CFO authorised a $2.3M wire transfer. Without identity behavioural analytics, the request appeared legitimate — same voice, same patterns, valid credentials.",
        cta      : "Falcon Identity detects anomalous authorisation requests and executive impersonation patterns instantly.",
      },
    },
  },

  // ── PHASE 3 — CARBON SPIDER (BOSS) ───────────────────────────
  {
    id         : "carbon_spider",
    waveNum    : 3,
    isBoss     : true,
    color      : CS.RED,

    name       : "CARBON SPIDER",
    shortName  : "CARBON SPIDER",
    aka        : "FIN7 / Sangria Tempest / Carbon Spider",
    nation     : "🌐 eCrime Syndicate — Eastern Europe",
    shortNation: "🌐 eCrime Syndicate",
    threat     : "HIGH",
    vector     : "Ransomware-as-a-Service · POS Malware",

    desc       : "Prolific financially-motivated eCrime group operating since 2013. Deploys ransomware across retail, hospitality and financial sectors. Known for continuously evolving TTPs — including custom tooling, insider recruitment and supply-chain compromise — specifically designed to bypass legacy security.",
    attackDesc : "CARBON SPIDER stages ransomware payloads entirely in memory using living-off-the-land binaries — PowerShell, WMI, PsExec. No files written to disk. Traditional signature AV sees nothing. By the time an alert fires, encryption is already complete across hundreds of endpoints.",
    falconFix  : "Falcon Prevent's memory scanning and behavioural AI stops in-memory ransomware before a single file is encrypted. Falcon Complete MDR analysts respond within minutes — containing the blast radius before it spreads. OverWatch hunts for the staging activity that precedes every ransomware deployment.",

    keyModules : ["PREVENT","COMPLETE","OVERWATCH","INSIGHT"],

    moduleNarrative: {
      PREVENT   : "Memory scanning and behavioural AI detect fileless ransomware before the first file is encrypted.",
      COMPLETE  : "MDR analysts contain the incident and begin remediation before ransomware reaches critical systems.",
      OVERWATCH : "Hunters detect the pre-ransomware staging — lateral movement and privilege escalation — before detonation.",
      INSIGHT   : "XDR correlates the full ransomware kill chain across every endpoint in the environment.",
    },

    drops: {
      PREVENT   : 0.28,
      COMPLETE  : 0.20,
      OVERWATCH : 0.18,
      INSIGHT   : 0.14,
      PANGEA    : 0.10,
      FEM       : 0.06,
      CHARLOTTE : 0.04,
    },

    deathMessages: {
      PREVENT   : {
        headline : "CARBON SPIDER ENCRYPTED YOUR ENVIRONMENT",
        body     : "Fileless ransomware executed entirely in memory — no files, no signatures, no AV alert. CARBON SPIDER specifically crafts payloads to evade legacy endpoint tools. By the time any alert fired, encryption was complete.",
        cta      : "Falcon Prevent's AI engine detects in-memory ransomware behaviour before a single file is encrypted.",
      },
      COMPLETE  : {
        headline : "RANSOMWARE SPREAD UNCHECKED — NO MANAGED RESPONSE",
        body     : "The encryption started on a single endpoint at 2am and spread to 400 systems in 11 minutes. Without a managed response team already watching, there was no one to contain the blast radius in time.",
        cta      : "Falcon Complete MDR analysts respond in minutes — isolating affected systems before ransomware propagates.",
      },
      OVERWATCH : {
        headline : "STAGING ACTIVITY WENT UNDETECTED FOR THREE DAYS",
        body     : "CARBON SPIDER spent 72 hours staging their attack — harvesting credentials, mapping the network, disabling backups. The activity blended into normal admin traffic. Expert hunters would have seen it.",
        cta      : "Falcon OverWatch detects pre-ransomware indicators: privilege escalation, backup deletion, lateral credential movement.",
      },
    },
  },

  // ── PHASE 4 — COZY BEAR ──────────────────────────────────────
  {
    id         : "cozy_bear",
    waveNum    : 4,
    isBoss     : false,
    color      : CS.ORANGE,

    name       : "COZY BEAR",
    shortName  : "COZY BEAR",
    aka        : "APT29 / Midnight Blizzard / The Dukes",
    nation     : "🇷🇺 Russia — SVR (Foreign Intelligence)",
    shortNation: "🇷🇺 Russia — SVR",
    threat     : "CRITICAL",
    vector     : "Cloud Infrastructure · OAuth Abuse · Supply Chain",

    desc       : "Russian SVR foreign intelligence service — among the most sophisticated nation-state actors operating today. Targets cloud environments, identity providers and software supply chains to establish persistent, deeply-hidden footholds that can survive complete endpoint remediation.",
    attackDesc : "COZY BEAR abuses OAuth tokens and service account credentials to pivot through cloud workloads entirely within trusted infrastructure. They operate as legitimate cloud services — invisible to endpoint-only tools. Once inside a cloud provider, they access every tenant downstream.",
    falconFix  : "Falcon Cloud Security delivers runtime protection across every workload, container and cloud API. Falcon Insight XDR correlates cloud telemetry with endpoint and identity signals to expose the full OAuth abuse chain. OverWatch hunters proactively look for the cloud-native TTPs that COZY BEAR relies on.",

    keyModules : ["CLOUD","INSIGHT","OVERWATCH","IDENTITY"],

    moduleNarrative: {
      CLOUD     : "Runtime protection across every cloud workload — blocks OAuth token abuse and lateral cloud movement.",
      INSIGHT   : "Correlates cloud API calls with endpoint and identity signals to expose the full attack chain.",
      OVERWATCH : "Hunters proactively search for COZY BEAR's cloud-native TTPs — techniques designed to hide in legitimate traffic.",
      IDENTITY  : "Detects OAuth token theft and service account abuse before COZY BEAR can establish persistence.",
    },

    drops: {
      CLOUD     : 0.30,
      INSIGHT   : 0.22,
      OVERWATCH : 0.18,
      IDENTITY  : 0.14,
      FEM       : 0.08,
      PANGEA    : 0.06,
      CHARLOTTE : 0.02,
    },

    deathMessages: {
      CLOUD     : {
        headline : "COZY BEAR PIVOTED THROUGH AN UNPROTECTED CLOUD WORKLOAD",
        body     : "Your cloud environment had no runtime protection. COZY BEAR moved through unmonitored workloads using stolen OAuth tokens — completely invisible to endpoint-only security. Cloud-native threats require cloud-native defence.",
        cta      : "Falcon Cloud Security delivers CNAPP protection across every workload, container and serverless function.",
      },
      INSIGHT   : {
        headline : "CLOUD-TO-ENDPOINT PIVOT WENT UNDETECTED",
        body     : "COZY BEAR's OAuth abuse was visible in cloud logs. The subsequent endpoint movement generated alerts. But without XDR connecting these signals, they appeared as separate, unrelated incidents.",
        cta      : "Falcon Insight XDR unifies cloud, identity and endpoint signals — making cross-domain attacks impossible to hide.",
      },
      OVERWATCH : {
        headline : "COZY BEAR ESTABLISHED A PERSISTENT CLOUD FOOTHOLD",
        body     : "They operated inside your cloud tenant for 47 days, exfiltrating data incrementally. COZY BEAR's cloud TTPs are designed to mimic legitimate DevOps activity — only expert hunters recognise the patterns.",
        cta      : "Falcon OverWatch hunts for cloud-native adversary tradecraft that automated tools classify as normal activity.",
      },
    },
  },

  // ── PHASE 5 — SCATTERED SPIDER (BOSS) ────────────────────────
  {
    id         : "scattered_spider",
    waveNum    : 5,
    isBoss     : true,
    color      : CS.BLUE,

    name       : "SCATTERED SPIDER",
    shortName  : "SCATTERED SPIDER",
    aka        : "UNC3944 / Muddled Libra / Octo Tempest",
    nation     : "🌐 Western eCrime — Native English Speakers",
    shortNation: "🌐 Western eCrime",
    threat     : "CRITICAL",
    vector     : "Social Engineering · MFA Bypass · Vishing",

    desc       : "Native-English-speaking threat actors who social-engineer IT help desks, conduct SIM swapping and bypass MFA through vishing — posing as legitimate employees. Responsible for breaches at MGM Resorts, Caesars Entertainment and dozens of Fortune 500 companies.",
    attackDesc : "SCATTERED SPIDER calls your IT helpdesk as a convincing employee, resets MFA, obtains valid credentials and operates entirely as a trusted user — no malware required. They then deploy ransomware or exfiltrate data while fully authenticated.",
    falconFix  : "Falcon Identity detects MFA fatigue attacks, impossible travel and anomalous session behaviour the moment a socially-engineered account is used. Falcon Complete MDR analysts receive the alert in under 60 seconds and begin containment before SCATTERED SPIDER can establish persistence.",

    keyModules : ["IDENTITY","COMPLETE","OVERWATCH","INSIGHT"],

    moduleNarrative: {
      IDENTITY  : "Detects MFA reset anomalies and impossible travel — the moment a socially-engineered account is activated.",
      COMPLETE  : "MDR analysts receive alerts in under 60 seconds and contain the intrusion before persistence is established.",
      OVERWATCH : "Elite hunters recognise SCATTERED SPIDER's post-access behaviour — the unique patterns that follow a successful vishing attack.",
      INSIGHT   : "XDR correlates the vishing-to-access-to-persistence chain across identity, endpoint and cloud.",
    },

    drops: {
      IDENTITY  : 0.30,
      COMPLETE  : 0.22,
      OVERWATCH : 0.20,
      INSIGHT   : 0.14,
      PREVENT   : 0.08,
      PANGEA    : 0.06,
    },

    deathMessages: {
      IDENTITY  : {
        headline : "SCATTERED SPIDER BYPASSED MFA AND OPERATED AS A TRUSTED USER",
        body     : "They called your helpdesk, convinced an agent they were a locked-out employee, reset MFA and authenticated. Without behavioural identity analytics, there was no way to distinguish the impostor from a real employee.",
        cta      : "Falcon Identity detects MFA fatigue, impossible travel and anomalous session initiation — valid credentials become unreliable weapons.",
      },
      COMPLETE  : {
        headline : "SCATTERED SPIDER DEPLOYED RANSOMWARE BEFORE RESPONSE",
        body     : "They moved from initial access to ransomware deployment in under 4 hours. By the time an internal alert was investigated, the attacker had already exfiltrated data and began encryption. Response time was the deciding factor.",
        cta      : "Falcon Complete MDR analysts respond in minutes — containing and remediating before the attack progresses.",
      },
      OVERWATCH : {
        headline : "POST-ACCESS ACTIVITY WAS INDISTINGUISHABLE FROM NORMAL ADMIN WORK",
        body     : "SCATTERED SPIDER is meticulous. Their post-access reconnaissance and staging looks like routine IT administration. Automated tools found nothing unusual. Expert hunters who know their specific playbook would have identified the intrusion within an hour.",
        cta      : "Falcon OverWatch elite hunters know SCATTERED SPIDER's post-vishing playbook and hunt for it proactively.",
      },
    },
  },
];

// ─── PHASE MODULE DROP SYSTEM ────────────────────────────────────
// Normalises phase drop weights, auto-injects PREVENT + OVERWATCH.
// Returns a module id based on weighted random selection.
function pickModuleForPhase(phase) {
  const base = { ...phase.drops };
  // Guarantee PREVENT and OVERWATCH appear in every phase
  if (!base.PREVENT)   base.PREVENT   = 0.12;
  if (!base.OVERWATCH) base.OVERWATCH = 0.12;

  const ids    = Object.keys(base);
  const weights= Object.values(base);
  const total  = weights.reduce((a,b)=>a+b, 0);
  let   rand   = Math.random() * total;
  for (let i=0; i<ids.length; i++) {
    rand -= weights[i];
    if (rand<=0) return ids[i];
  }
  return ids[ids.length-1];
}

// ─── DEATH CONTEXT ───────────────────────────────────────────────

function getDeathContext(phase, modulesCollected) {
  if (!phase) return {
    headline : "UNPROTECTED ENVIRONMENT — NO FALCON DEPLOYED",
    body     : "This system was not running CrowdStrike Falcon. Without unified endpoint, identity and cloud protection, adversaries operate without resistance. This breach was entirely preventable.",
    cta      : "crowdstrike.com — See how Falcon stops breaches before they start.",
  };

  const missing = phase.keyModules.filter(m => !modulesCollected.has(m));

  const messages = {
    "FANCY BEAR": {
      IDENTITY: {
        headline : "NO IDENTITY PROTECTION DEPLOYED — CREDENTIAL ATTACK SUCCEEDED",
        body     : "This environment was not running Falcon Identity Protection. FANCY BEAR harvested credentials from an unmonitored system and authenticated freely — no behavioral baseline existed to flag the impossible travel, unusual access hours or atypical login patterns. In a protected environment, this attack would have been stopped at first authentication.",
        cta      : "Falcon Identity Protection establishes behavioral baselines for every identity. crowdstrike.com/falcon-identity",
      },
      INSIGHT: {
        headline : "NO XDR VISIBILITY — ATTACK CHAIN WENT UNDETECTED",
        body     : "This environment lacked Falcon Insight XDR. Individual endpoint signals existed in silos — no technology correlated them into a unified attack story. FANCY BEAR's multi-stage campaign appeared as disconnected, low-priority noise. Organizations running Falcon XDR see the complete attack narrative in real time.",
        cta      : "Falcon Insight XDR connects every signal across endpoint, identity and cloud. crowdstrike.com/falcon-insight",
      },
      OVERWATCH: {
        headline : "NO MANAGED THREAT HUNTING — ADVERSARY OPERATED UNCONTESTED",
        body     : "This organization did not have Falcon OverWatch. FANCY BEAR's living-off-the-land techniques blended seamlessly into legitimate admin activity — precisely why they use them. OverWatch elite hunters proactively search for exactly these patterns 24/7. Without human expertise in the loop, the adversary had unlimited dwell time.",
        cta      : "Falcon OverWatch: expert hunters finding what automated tools miss, around the clock. crowdstrike.com/overwatch",
      },
    },

    "AI SYNDICATE": {
      CHARLOTTE: {
        headline : "NO AI DEFENCE — AI ATTACK OPERATED AT MACHINE SPEED UNOPPOSED",
        body     : "This environment had no AI-powered defence layer. AI SYNDICATE deployed LLM-generated malware variants faster than any human analyst could respond — thousands of novel samples per hour, each slightly different. Organizations without Charlotte AI face an asymmetric battle: human defenders against machine-speed attackers. Charlotte AI counters at the same velocity.",
        cta      : "Charlotte AI: fight AI attacks with AI defence. crowdstrike.com/charlotte-ai",
      },
      PREVENT: {
        headline : "LEGACY AV DEPLOYED — LLM-GENERATED MALWARE BYPASSED SIGNATURES",
        body     : "This system was running a legacy, signature-based antivirus product — not Falcon Prevent. AI SYNDICATE generated fresh malware variants specifically to evade known signatures. Zero signatures matched. Zero alerts fired. Falcon Prevent's AI-native behavioral engine detects malicious intent, not signatures — making novel AI-generated threats irrelevant.",
        cta      : "Falcon Prevent stops threats that have never been seen before. crowdstrike.com/falcon-prevent",
      },
      IDENTITY: {
        headline : "NO IDENTITY ANALYTICS — DEEPFAKE IMPERSONATION WENT UNDETECTED",
        body     : "This organization had no identity behavioral analytics deployed. When AI SYNDICATE conducted a deepfake voice call impersonating the CFO, the fraudulent wire authorisation looked indistinguishable from a legitimate request. Falcon Identity would have flagged the anomalous authorisation pattern, unusual request timing and session inconsistencies before approval.",
        cta      : "Falcon Identity detects executive impersonation and anomalous authorisation requests in real time. crowdstrike.com/falcon-identity",
      },
    },

    "CARBON SPIDER": {
      PREVENT: {
        headline : "LEGACY ANTIVIRUS INSTALLED — FILELESS RANSOMWARE EXECUTED FREELY",
        body     : "This endpoint was protected by a legacy signature-based antivirus product — not Falcon Prevent. CARBON SPIDER's fileless ransomware ran entirely in memory using legitimate Windows processes. No files were written to disk. No signatures matched. The legacy tool was completely blind. Falcon Prevent's memory scanning and behavioral AI would have terminated the execution chain before a single file was encrypted.",
        cta      : "Falcon Prevent: AI-native EPP that stops ransomware before encryption begins. crowdstrike.com/falcon-prevent",
      },
      COMPLETE: {
        headline : "NO MANAGED RESPONSE — RANSOMWARE SPREAD FOR 11 MINUTES UNCONTESTED",
        body     : "This organization had no managed detection and response capability. The ransomware alert fired at 2:17am — but with no team actively monitoring, the first human saw it at 6:44am. CARBON SPIDER had already encrypted 400 endpoints and exfiltrated 2.3TB of data. Falcon Complete MDR analysts would have received the alert within 60 seconds and begun containment immediately.",
        cta      : "Falcon Complete MDR: expert analysts monitoring and responding 24/7. crowdstrike.com/falcon-complete",
      },
      OVERWATCH: {
        headline : "NO THREAT HUNTING — 72-HOUR STAGING PHASE WENT UNNOTICED",
        body     : "This environment had no proactive threat hunting capability. CARBON SPIDER spent three days inside the network before deploying ransomware — harvesting credentials, mapping file shares, disabling shadow copies and testing encryption on isolated endpoints. All of this activity looked like routine admin work to automated tools. OverWatch hunters know exactly what pre-ransomware staging looks like and would have raised the alarm on day one.",
        cta      : "Falcon OverWatch detects pre-ransomware indicators before detonation. crowdstrike.com/overwatch",
      },
    },

    "COZY BEAR": {
      CLOUD: {
        headline : "NO CLOUD SECURITY DEPLOYED — ENTIRE CLOUD ESTATE UNMONITORED",
        body     : "This organization had endpoint protection but no cloud security tooling. COZY BEAR identified the unmonitored cloud environment within hours of initial access and pivoted entirely into cloud infrastructure — beyond the reach of every endpoint tool deployed. They operated in the cloud for 47 days. Falcon Cloud Security provides runtime protection across every workload, container and cloud API — closing this visibility gap entirely.",
        cta      : "Falcon Cloud Security: CNAPP protection for every cloud workload. crowdstrike.com/cloud-security",
      },
      INSIGHT: {
        headline : "SILOED SECURITY TOOLS — CLOUD-TO-ENDPOINT PIVOT INVISIBLE",
        body     : "This organization operated endpoint and cloud security tools independently, with no unified detection layer. COZY BEAR's pivot from cloud OAuth abuse to endpoint access generated signals in both systems — but no technology correlated them. Each appeared as a low-priority, isolated anomaly. Falcon Insight XDR would have stitched these signals together and surfaced the full attack chain within minutes.",
        cta      : "Falcon Insight XDR: unified detection across every domain. crowdstrike.com/falcon-insight",
      },
      OVERWATCH: {
        headline : "NO THREAT HUNTERS — COZY BEAR OPERATED INSIDE FOR 47 DAYS",
        body     : "This organization relied entirely on automated detection — and COZY BEAR knows exactly how to evade it. Their cloud TTPs are specifically engineered to mimic legitimate DevOps and service account activity. Automated tools classified every action as normal. OverWatch hunters who proactively search for COZY BEAR's specific playbook would have identified the intrusion on day three.",
        cta      : "Falcon OverWatch hunts for cloud-native adversary tradecraft. crowdstrike.com/overwatch",
      },
    },

    "SCATTERED SPIDER": {
      IDENTITY: {
        headline : "NO IDENTITY PROTECTION — MFA BYPASS WENT UNDETECTED",
        body     : "This organization had multi-factor authentication enabled but no identity behavioral analytics. SCATTERED SPIDER called the helpdesk, socially engineered an MFA reset and authenticated using valid credentials from an unusual location, at an unusual time, on an unrecognised device. Every signal indicated compromise — but without Falcon Identity to analyze these behavioral patterns, the login appeared legitimate. The first alert came from the victim's bank.",
        cta      : "Falcon Identity: behavioral analytics that make valid credentials an unreliable weapon. crowdstrike.com/falcon-identity",
      },
      COMPLETE: {
        headline : "NO MANAGED RESPONSE — SCATTERED SPIDER PERSISTED FOR 4 HOURS UNCONTESTED",
        body     : "This organization's security team worked business hours. SCATTERED SPIDER struck at 11pm on a Friday. They had four uncontested hours to conduct reconnaissance, escalate privileges, exfiltrate customer data and deploy ransomware — all before a human reviewed a single alert. Falcon Complete MDR analysts are active 24/7/365. The response would have begun within 60 seconds of the anomalous authentication.",
        cta      : "Falcon Complete MDR: your security team never sleeps. crowdstrike.com/falcon-complete",
      },
      OVERWATCH: {
        headline : "NO THREAT HUNTERS — POST-VISHING ACTIVITY CLASSIFIED AS NORMAL",
        body     : "After gaining access, SCATTERED SPIDER performed methodical reconnaissance that automated tools classified as routine IT administration — password vault access, Active Directory enumeration, cloud console exploration. OverWatch hunters know SCATTERED SPIDER's post-vishing playbook intimately. They would have flagged the behavioral sequence within the first hour and initiated containment before any data left the environment.",
        cta      : "Falcon OverWatch: elite hunters who know adversary playbooks by heart. crowdstrike.com/overwatch",
      },
    },
  };

  const actorMsgs = messages[phase.name];
  if (actorMsgs) {
    for (const mod of missing) {
      if (actorMsgs[mod]) return actorMsgs[mod];
    }
  }

  return {
    headline : `NO CROWDSTRIKE DEPLOYED — ${phase.name} OPERATED WITHOUT RESISTANCE`,
    body     : `This environment was not running the Falcon modules recommended for ${phase.name}. ${phase.attackDesc} Organizations with the full Falcon platform deployed stop this attack before it progresses past initial access.`,
    cta      : `Recommended for ${phase.name}: ${phase.keyModules.map(m => MODULES[m]?.name ?? m).join(" + ")}`,
  };
}


// ─── CFG ─────────────────────────────────────────────────────────
const CFG = Object.freeze({
  COLS: 8, ROWS: 3,
  ATK_W: 38, ATK_H: 28, ATK_SX: 26, ATK_SY: 26,
  PLR_W: 46, PLR_H: 24, PLR_SPEED: 230, PLR_LIVES: 3,
  BLT_W: 3, BLT_H: 12,
  PLR_BLT_SPEED: 470,
  ATK_BLT_SPEED: 185,
  MAX_ATK_BLTS: 5,
  BLK_W: 48, BLK_H: 16, BLK_COLS: 6, BLK_STRENGTH: 4,
  UFO_W: 58, UFO_H: 24, UFO_SPEED: 115, UFO_INTERVAL: 15000,
  BOSS_W: 110, BOSS_H: 60,
  SCORE_ROW: [80, 150, 220],
  SCORE_UFO: [200, 350, 500],
  SCORE_BOSS: 3000,
  COMBO_WINDOW: 3000,
  HIT_PAUSE_MS: 700,
  WAVE_BANNER_MS: 3200,   // 3.2s — skippable
  INTEL_BRIEF_MS: 22000,  // 22s — skippable
  LEVEL_CLEAR_MS: 3500,   // 3.5s — skippable
  BOSS_WARN_MS: 3200,     // 3.2s — skippable
  DROP_CHANCE: 0.27,      // 27% drop rate
  IMAGE_COUNT: 15,
});

// ─── ASSET MANAGER ───────────────────────────────────────────────
class AssetManager {
  #cache=new Map();
  loadImage(key,src){
    return new Promise(res=>{
      const img=new Image();
      img.onload =()=>{this.#cache.set(key,img);res(img);};
      img.onerror=()=>{console.warn(`Missing: ${src}`);res(null);};
      img.src=src;
    });
  }
  async loadAll(manifest){
    await Promise.all(manifest.map(m=>this.loadImage(m.key,m.src)));
  }
  get(key){return this.#cache.get(key)??null;}
}

// ─── POOL ────────────────────────────────────────────────────────
class Pool{
  #free=[];#factory;
  constructor(factory,n=40){
    this.#factory=factory;
    for(let i=0;i<n;i++)this.#free.push(factory());
  }
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
      if(filt){const fl=ac.createBiquadFilter();fl.type="lowpass";
        fl.frequency.value=filt;osc.connect(fl);fl.connect(g);}
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
  moduleUp(){
    [0,100,200,310].forEach((d,i)=>
      this.#tone({type:"sine",f0:330+i*165,dur:0.16,gain:0.2,delay:d}));
  }
  pangea(){
    this.#tone({type:"sine",f0:200,f1:60,dur:1.2,gain:0.3,filt:500});
    this.#tone({type:"square",f0:100,f1:30,dur:1.0,gain:0.2,delay:60});
  }
  overwatch(){
    this.#tone({type:"sawtooth",f0:55,f1:220,dur:0.9,gain:0.4,filt:800});
    this.#tone({type:"square",f0:110,f1:440,dur:0.7,gain:0.25,delay:200});
  }
  complete(){
    [0,80,180,320,500].forEach((d,i)=>
      this.#tone({type:"sawtooth",f0:80*Math.pow(1.4,i),f1:30,
        dur:0.7,gain:0.35,filt:700,delay:d}));
  }
  charlotte(){
    this.#tone({type:"sine",f0:880,f1:1760,dur:0.25,gain:0.18});
    this.#tone({type:"sine",f0:440,f1:1320,dur:0.2,gain:0.12,delay:30});
  }
  ufoBeep(){this.#tone({type:"sine",f0:720,f1:360,dur:0.07,gain:0.12});}
  levelUp(){
    [0,120,240,400].forEach((d,i)=>
      this.#tone({type:"square",f0:220*Math.pow(1.5,i),dur:0.18,gain:0.18,delay:d}));
  }
  bossRoar(){
    this.#tone({type:"sawtooth",f0:55,f1:18,dur:1.1,gain:0.5,filt:300});
    this.#tone({type:"square",f0:80,f1:25,dur:0.9,gain:0.3,det:30,delay:80});
  }
  fem(){
    this.#tone({type:"sine",f0:440,f1:880,dur:0.3,gain:0.2});
    this.#tone({type:"triangle",f0:330,f1:660,dur:0.25,gain:0.15,delay:60});
  }
  startBGM(){
    if(this.#bgm)return;
    this.#bgm=true;this.#resume();
    const ac=this.#ac;
    const bass=[55,55,65,55,49,49,55,49];
    const mel =[220,262,220,196,175,196,220,175];
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
  playerHit(x,y){
    this.burst(x,y,32,[[0,200,255],[0,120,255],[200,240,255],[255,255,255]],{maxSpd:220,life:0.6});
  }
  bossExplode(x,y){
    for(let i=0;i<7;i++)
      setTimeout(()=>{
        const ox=(Math.random()-0.5)*90,oy=(Math.random()-0.5)*45;
        this.csExplosion(x+ox,y+oy);
      },i*110);
  }
  moduleCollect(x,y,col){
    const r=parseInt(col.slice(1,3),16);
    const g=parseInt(col.slice(3,5),16);
    const b=parseInt(col.slice(5,7),16);
    this.burst(x,y,22,[[r,g,b],[255,255,255]],{maxSpd:130,life:0.5});
  }
  overWatchKill(x,y){
    this.burst(x,y,35,[[255,106,0],[255,200,0],[224,0,60],[255,255,255]],
      {maxSpd:250,life:0.7,size:3,sizeVar:3});
  }
  completeKill(x,y){
    this.burst(x,y,40,[[224,0,60],[255,106,0],[255,255,255],[255,220,0]],
      {maxSpd:280,life:0.8,size:3,sizeVar:4});
  }
  pangeaFreeze(x,y){
    this.burst(x,y,15,[[0,229,255],[0,150,255],[200,240,255]],{maxSpd:80,life:0.6,size:3});
  }
  femReveal(x,y){
    this.burst(x,y,18,[[0,255,208],[0,200,180],[255,255,255]],{maxSpd:100,life:0.5,size:2});
  }

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
    this.#ox=(Math.random()*2-1)*s*15;
    this.#oy=(Math.random()*2-1)*s*15;
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
    vig.addColorStop(0,"rgba(0,0,0,0)");
    vig.addColorStop(1,"rgba(4,1,12,0.72)");
    ctx.fillStyle=vig;ctx.fillRect(0,0,w,h);
    if(this.#warp.length){
      ctx.save();
      for(const p of this.#warp){
        const t=1-p.life/p.maxLife;
        ctx.globalAlpha=t*0.85;ctx.strokeStyle=CS.WHITE;ctx.lineWidth=1.5;
        ctx.beginPath();
        ctx.moveTo(p.x-p.vx*0.03,p.y-p.vy*0.03);ctx.lineTo(p.x,p.y);ctx.stroke();
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
    return{spd,sz,col,w,h,
      stars:Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*h}))};
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
      ctx.save();
      ctx.strokeStyle=`rgba(224,0,60,${a})`;ctx.lineWidth=1;
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
  consume(k){
    const had=this.#pressed.has(k)||this.#down.has(k);
    this.#pressed.delete(k);return had;
  }
  flushAll(){this.#pressed.clear();this.#down.clear();}
}

// ─── MODULE NOTIFICATION CARD ────────────────────────────────────
class ModuleNotification{
  #queue=[];#current=null;#t=0;
  static SHOW=3.5;
  push(mod){this.#queue.push(mod);}
  update(dt){
    if(this.#current){
      this.#t+=dt;
      if(this.#t>ModuleNotification.SHOW){this.#current=null;this.#t=0;}
    }
    if(!this.#current&&this.#queue.length){this.#current=this.#queue.shift();this.#t=0;}
  }
  draw(ctx,w){
    if(!this.#current)return;
    const mod=this.#current,dur=ModuleNotification.SHOW,t=this.#t;
    const CW=300,CH=118,cy=98;
    let sx;
    const si=0.25,so=dur-0.32;
    if(t<si)sx=w+(1-t/si)*(CW+20);
    else if(t>so)sx=w-CW+((t-so)/0.32)*(CW+20);
    else sx=w-CW-10;

    ctx.save();
    ctx.shadowColor=mod.color;ctx.shadowBlur=18;
    ctx.fillStyle="rgba(4,1,18,0.96)";
    ctx.strokeStyle=mod.color;ctx.lineWidth=1.8;
    ctx.beginPath();ctx.roundRect(sx,cy,CW,CH,6);ctx.fill();ctx.stroke();
    ctx.shadowBlur=0;
    ctx.fillStyle=mod.color;
    ctx.beginPath();ctx.roundRect(sx,cy,CW,26,[6,6,0,0]);ctx.fill();
    ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.textAlign="left";
    ctx.fillText("🦅 MODULE ACTIVATED",sx+10,cy+17);
    ctx.font="bold 13px 'Courier New'";
    ctx.fillStyle=mod.color;ctx.shadowColor=mod.color;ctx.shadowBlur=8;
    ctx.fillText(`${mod.emoji}  ${mod.name}`,sx+10,cy+46);
    ctx.font="11px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText(mod.tagline,sx+10,cy+62);
    ctx.font="9px 'Courier New'";ctx.fillStyle=CS.WHITE;
    const words=mod.desc.split(" ");let line="",ly=cy+78;
    for(const word of words){
      const test=line+word+" ";
      if(ctx.measureText(test).width>CW-16&&line!==""){
        ctx.fillText(line,sx+10,ly);line=word+" ";ly+=12;
      }else line=test;
    }
    ctx.fillText(line,sx+10,ly);
    ctx.textAlign="left";ctx.shadowBlur=0;ctx.restore();
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
    if(!this.#active)return;
    this.#t+=dt;
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
      ctx.save();
      ctx.fillStyle="rgba(0,0,0,0.55)";ctx.fillRect(0,0,canvas.width,52);
      ctx.font="bold 15px 'Courier New'";ctx.textAlign="center";
      ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=16;
      ctx.fillText(
        this.#phase===0?"👁️  FALCON OVERWATCH — SCANNING THREAT LANDSCAPE…"
        :this.#phase===1?"👁️  FALCON OVERWATCH — HIGH-VALUE TARGETS ACQUIRED"
        :"👁️  FALCON OVERWATCH — THREAT NEUTRALIZATION IN PROGRESS",
        canvas.width/2,32);
      ctx.restore();
    }
    for(const tg of this.#targets){
      if(!tg.a.alive&&tg.fired)continue;
      const x=tg.a.x+CFG.ATK_W/2,y=tg.a.y+CFG.ATK_H/2;
      const pulse=Math.sin(now*0.008)*0.4+0.6;
      const r=this.#phase===1?20:26+Math.sin(now*0.01)*4;
      ctx.save();
      ctx.strokeStyle=CS.ORANGE;ctx.lineWidth=2;
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
      ctx.rotate(-rot);
      ctx.globalAlpha=0.35;
      ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(r,0);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(0,r);ctx.stroke();
      if(this.#phase>=1){
        ctx.globalAlpha=1;
        ctx.font="bold 8px 'Courier New'";ctx.textAlign="center";
        ctx.fillStyle=CS.ORANGE;ctx.shadowBlur=6;
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
        ctx.save();
        ctx.globalAlpha=prog*0.9;
        ctx.strokeStyle=CS.ORANGE;ctx.lineWidth=3*prog;
        ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=22;
        ctx.beginPath();ctx.moveTo(canvas.width/2,0);ctx.lineTo(x,y);ctx.stroke();
        ctx.restore();
      }
    }
    if(this.#phase===3){
      const a=Math.max(0,1-this.#t/0.9);
      ctx.save();ctx.globalAlpha=a;ctx.textAlign="center";
      ctx.font="bold 18px 'Courier New'";
      ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=20;
      ctx.fillText("✅  THREATS ELIMINATED — OVERWATCH STANDS DOWN",canvas.width/2,canvas.height/2-30);
      ctx.restore();
    }
  }
}

// ─── FALCON COMPLETE SYSTEM ──────────────────────────────────────
class FalconCompleteSystem{
  #active=false;#phase=0;#t=0;
  #tagged=[];#onKill=null;#killIdx=0;#total=0;

  activate(attackers,cols,rows,onKill){
    this.#active=true;this.#phase=0;this.#t=0;
    this.#onKill=onKill;this.#killIdx=0;
    this.#tagged=[];
    for(let c=0;c<cols;c++)
      for(let r=0;r<rows;r++){
        const a=attackers[c]?.[r];
        if(a?.alive)this.#tagged.push(a);
      }
    this.#total=this.#tagged.length;
  }
  get isActive(){return this.#active;}

  update(dt){
    if(!this.#active)return;
    this.#t+=dt;
    if(this.#phase===0&&this.#t>1.7){this.#phase=1;this.#t=0;}
    if(this.#phase===1){
      const kps=Math.max(8,this.#total/1.8);
      const exp=Math.floor(this.#t*kps);
      while(this.#killIdx<exp&&this.#killIdx<this.#tagged.length){
        const a=this.#tagged[this.#killIdx];
        if(a.alive){a.alive=false;this.#onKill?.(a,this.#killIdx);}
        this.#killIdx++;
      }
      if(this.#killIdx>=this.#tagged.length&&this.#t>0.5){this.#phase=2;this.#t=0;}
    }
    if(this.#phase===2&&this.#t>3.2)this.#active=false;
  }

  draw(ctx,w,h){
    if(!this.#active)return;
    const oa=this.#phase===0?Math.min(0.88,this.#t/0.5)*0.88:0.88;
    ctx.fillStyle=`rgba(4,1,12,${oa})`;ctx.fillRect(0,0,w,h);
    ctx.fillStyle=CS.RED;ctx.fillRect(0,0,w,3);ctx.fillRect(0,h-3,w,3);
    if(this.#phase===0){
      ctx.save();ctx.textAlign="center";
      ctx.font="bold 11px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
      ctx.fillText("INCOMING TRANSMISSION — CROWDSTRIKE SOC OPS",w/2,h*0.26);
      ctx.font="bold 40px 'Courier New'";
      ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=34;
      ctx.fillText("🦅 FALCON COMPLETE",w/2,h*0.40);
      ctx.font="bold 16px 'Courier New'";
      ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=12;
      ctx.fillText("MANAGED DETECTION & RESPONSE — ACTIVATED",w/2,h*0.50);
      ctx.font="13px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
      ctx.fillText("Our SOC team has assumed control of the incident.",w/2,h*0.59);
      ctx.fillText("Full containment and remediation in progress…",w/2,h*0.67);
      const bW=320,bH=10,bx=(w-bW)/2,by=h*0.75;
      const prog=Math.min(1,this.#t/1.6);
      ctx.fillStyle="#1a1a2e";ctx.fillRect(bx,by,bW,bH);
      ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=10;
      ctx.fillRect(bx,by,bW*prog,bH);
      ctx.font="10px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
      ctx.fillText(`DEPLOYING INCIDENT RESPONSE… ${Math.round(prog*100)}%`,w/2,by+24);
      ctx.restore();
    }
    if(this.#phase===1){
      ctx.save();ctx.textAlign="center";
      ctx.font="bold 26px 'Courier New'";
      ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=22;
      ctx.fillText("🦅 FALCON COMPLETE — ACTIVE",w/2,h*0.18);
      ctx.font="13px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
      ctx.fillText("SOC ANALYSTS NEUTRALIZING ALL ACTIVE THREATS",w/2,h*0.27);
      ctx.font="bold 18px 'Courier New'";
      ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=10;
      ctx.fillText(`THREATS CONTAINED:  ${this.#killIdx} / ${this.#total}`,w/2,h*0.36);
      ctx.restore();
    }
    if(this.#phase===2){
      const fi=Math.min(1,this.#t/0.4);
      ctx.save();ctx.globalAlpha=fi;ctx.textAlign="center";
      ctx.font="bold 40px 'Courier New'";
      ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=28;
      ctx.fillText("✅ BREACH CONTAINED",w/2,h*0.30);
      ctx.font="bold 15px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
      ctx.fillText("CrowdStrike Falcon Complete neutralized all active threats.",w/2,h*0.42);
      ctx.font="13px 'Courier New'";ctx.fillStyle=CS.GREY;
      ctx.fillText("Incident contained. Forensics complete. Environment clean.",w/2,h*0.51);
      ctx.font="bold 11px 'Courier New'";
      ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=10;
      ctx.fillText("🦅  crowdstrike.com  |  We Stop Breaches — Guaranteed.",w/2,h*0.65);
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
    if(!this.#active)return;
    this.#t+=dt;
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
      const age=this.#t-i*0.18;
      if(age>0.35)continue;
      const prog=1-age/0.35;
      ctx.save();ctx.globalAlpha=prog*0.9;
      ctx.strokeStyle=CS.GREEN;ctx.lineWidth=2;
      ctx.shadowColor=CS.GREEN;ctx.shadowBlur=16;
      ctx.beginPath();ctx.moveTo(canvas.width/2,canvas.height/2);
      ctx.lineTo(x,y);ctx.stroke();
      ctx.font="bold 8px 'Courier New'";ctx.textAlign="center";
      ctx.fillStyle=CS.GREEN;ctx.fillText("AI NEUTRALIZED",x,y-12);
      ctx.restore();
    }
  }
}

// ─── BLOCK ───────────────────────────────────────────────────────
class Block{
  constructor(x,y){
    this.x=x;this.y=y;this.w=CFG.BLK_W;this.h=CFG.BLK_H;
    this.strength=CFG.BLK_STRENGTH;
  }
  hit(){this.strength=Math.max(0,this.strength-1);}
  get alive(){return this.strength>0;}
  draw(ctx){
    if(!this.alive)return;
    const t=this.strength/CFG.BLK_STRENGTH;
    ctx.save();
    ctx.fillStyle=`hsla(${190+t*40},90%,${40+t*20}%,${0.35+t*0.5})`;
    ctx.shadowColor=`hsla(${190+t*40},90%,65%,0.9)`;ctx.shadowBlur=7;
    ctx.fillRect(this.x,this.y,this.w,this.h);
    ctx.strokeStyle=`rgba(0,200,255,${t*0.25})`;ctx.lineWidth=0.5;
    for(let i=8;i<this.w;i+=8){
      ctx.beginPath();ctx.moveTo(this.x+i,this.y);
      ctx.lineTo(this.x+i,this.y+this.h);ctx.stroke();
    }
    ctx.restore();
  }
}

// ─── POWER-UP ────────────────────────────────────────────────────
class PowerUp{
  constructor(x,y,phase){
    this.x=x-13;this.y=y;this.w=28;this.h=28;
    this.vy=52;this.life=0;this.maxLife=11;this.alive=true;
    const mid=pickModuleForPhase(phase);
    this.mod=MODULES[mid]??MODULES.PREVENT;
  }
  update(dt){
    this.y+=this.vy*dt;this.life+=dt;
    if(this.y>canvas.height||this.life>this.maxLife)this.alive=false;
  }
  draw(ctx){
    if(!this.alive)return;
    const fade=Math.min(1,1-this.life/this.maxLife*0.5);
    const pulse=0.75+Math.sin(performance.now()*0.006)*0.25;
    ctx.save();ctx.globalAlpha=fade*pulse;
    ctx.fillStyle="rgba(4,1,18,0.88)";
    ctx.strokeStyle=this.mod.color;ctx.lineWidth=1.6;
    ctx.shadowColor=this.mod.color;ctx.shadowBlur=12*pulse;
    ctx.beginPath();ctx.roundRect(this.x,this.y,this.w,this.h,4);
    ctx.fill();ctx.stroke();
    ctx.font="15px serif";ctx.textAlign="center";ctx.shadowBlur=0;
    ctx.fillText(this.mod.emoji,this.x+this.w/2,this.y+this.h*0.78);
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
    this.x+=this.dir*CFG.UFO_SPEED*dt;
    this.beepT+=dt;
    if(this.beepT>0.45){this.beepT=0;audio.ufoBeep();}
    if(this.x>canvas.width+CFG.UFO_W+20||this.x<-CFG.UFO_W-20)this.alive=false;
  }
  draw(ctx,img){
    if(!this.alive)return;
    const now=performance.now();
    const pulse=Math.sin(now*0.006)*0.4+0.6;
    ctx.save();ctx.shadowColor=CS.RED;ctx.shadowBlur=18*pulse;
    if(img){
      ctx.drawImage(img,this.x,this.y,this.w,this.h);
    }else{
      ctx.fillStyle=CS.RED;
      ctx.beginPath();
      ctx.ellipse(this.x+this.w/2,this.y+this.h*0.65,this.w/2,this.h*0.28,0,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle=CS.ORANGE;
      ctx.beginPath();
      ctx.ellipse(this.x+this.w/2,this.y+this.h*0.38,this.w*0.28,this.h*0.28,0,0,Math.PI*2);
      ctx.fill();
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
  }
  hit(n=1){
    this.hp-=n;
    if(this.hp<=this.maxHp*0.3)this.rage=true;
    if(this.hp<=0)this.alive=false;
  }
  update(dt,bullets,pool){
    this.glowT+=dt;
    this.x+=this.dir*this.spd*dt;
    if(this.x+this.w>canvas.width){this.dir=-1;this.x=canvas.width-this.w;}
    if(this.x<0){this.dir=1;this.x=0;}
    this.shootCd-=dt;
    if(this.shootCd<=0){
      this.shootCd=this.rage?0.48:1.0;
      const cx=this.x+this.w/2;
      const angs=this.rage?[-0.5,-0.25,0,0.25,0.5]:[-0.2,0,0.2];
      for(const a of angs)
        bullets.push(pool.acquire({
          x:cx-CFG.BLT_W/2,y:this.y+this.h,
          vx:Math.sin(a)*CFG.ATK_BLT_SPEED*1.3,
          vy:Math.cos(a)*CFG.ATK_BLT_SPEED*1.3,
          w:CFG.BLT_W,h:CFG.BLT_H,boss:true,
        }));
    }
  }
  draw(ctx,img){
    if(!this.alive)return;
    const pulse=Math.sin(this.glowT*(this.rage?9:3))*0.5+0.5;
    ctx.save();
    ctx.shadowColor=this.rage?CS.RED_GLOW:this.color;
    ctx.shadowBlur=22+pulse*22;
    if(this.rage){
      ctx.globalAlpha=0.22;ctx.fillStyle=CS.RED;
      ctx.fillRect(this.x,this.y,this.w,this.h);ctx.globalAlpha=1;
    }
    if(img)ctx.drawImage(img,this.x,this.y,this.w,this.h);
    else{ctx.fillStyle=this.rage?CS.RED:this.color;ctx.fillRect(this.x,this.y,this.w,this.h);}
    ctx.restore();
    const bw=this.w+20,bh=8,bx=this.x-10,by=this.y-16;
    ctx.fillStyle="#222";ctx.fillRect(bx,by,bw,bh);
    const t=Math.max(0,this.hp/this.maxHp);
    const hc=t>0.5?CS.GREEN:t>0.25?CS.YELLOW:CS.RED_GLOW;
    ctx.save();ctx.fillStyle=hc;ctx.shadowColor=hc;ctx.shadowBlur=7;
    ctx.fillRect(bx,by,bw*t,bh);ctx.restore();
    ctx.save();
    ctx.font=`bold ${this.rage?13:11}px 'Courier New'`;ctx.textAlign="center";
    ctx.fillStyle=this.rage?CS.RED_GLOW:this.color;
    ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=12;
    ctx.fillText(
      `${this.rage?"🔴":"👾"} ${this.phase?.shortName??"BOSS"}${this.rage?" [RAGE]":""}`,
      this.x+this.w/2,this.y-22);
    ctx.restore();
  }
}

// ─── INTEL BRIEF RENDERER ────────────────────────────────────────
// Draws the full-screen adversary briefing with 3 panels +
// module recommendation strip + countdown + skip hint.
function renderIntelBrief(ctx,w,h,phase,t,totalT,skipBlink){
  const fadeIn =Math.min(1,t/0.4);
  const fadeOut=t>totalT-0.5?Math.max(0,1-(t-(totalT-0.5))/0.5):1;
  const alpha  =fadeIn*fadeOut;

  ctx.save();ctx.globalAlpha=alpha;
  ctx.fillStyle="rgba(4,1,12,0.95)";ctx.fillRect(0,0,w,h);
  ctx.fillStyle=phase.color;ctx.fillRect(0,0,w,4);
  ctx.fillStyle=phase.color;ctx.fillRect(0,h-4,w,4);

  ctx.textAlign="center";

  // Top label
  ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
  ctx.fillText("🦅  CROWDSTRIKE ADVERSARY INTELLIGENCE BRIEFING",w/2,20);

  // Threat level badge
  ctx.fillStyle=phase.color;
  ctx.beginPath();ctx.roundRect(w/2-48,28,96,20,3);ctx.fill();
  ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.WHITE;
  ctx.fillText(`⚠ ${phase.threat} THREAT`,w/2,42);

  // Actor name
  ctx.font="bold 36px 'Courier New'";
  ctx.fillStyle=phase.color;ctx.shadowColor=phase.color;ctx.shadowBlur=22;
  ctx.fillText(phase.name,w/2,78);

  // AKA + nation
  ctx.font="bold 11px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
  ctx.fillText(`${phase.aka}  ·  ${phase.nation}`,w/2,96);

  // Three info panels
  const PW=228,PH=134,PG=11;
  const totalPW=3*(PW+PG)-PG;
  const px0=(w-totalPW)/2,pY=108;

  const panels=[
    {title:"🎯 THREAT ACTOR",  col:phase.color, body:phase.desc},
    {title:"⚡ ATTACK METHOD", col:CS.YELLOW,   body:phase.attackDesc},
    {title:"🦅 FALCON RESPONSE",col:CS.GREEN,   body:phase.falconFix},
  ];

  panels.forEach((p,i)=>{
    const px=px0+i*(PW+PG);
    ctx.fillStyle="rgba(8,2,26,0.92)";
    ctx.strokeStyle=p.col;ctx.lineWidth=1.4;
    ctx.shadowColor=p.col;ctx.shadowBlur=9;
    ctx.beginPath();ctx.roundRect(px,pY,PW,PH,5);ctx.fill();ctx.stroke();
    ctx.fillStyle=p.col;ctx.shadowBlur=0;
    ctx.beginPath();ctx.roundRect(px,pY,PW,22,[5,5,0,0]);ctx.fill();
    ctx.font="bold 9px 'Courier New'";ctx.textAlign="left";
    ctx.fillStyle=CS.WHITE;ctx.fillText(p.title,px+8,pY+15);
    ctx.font="10px 'Courier New'";ctx.fillStyle=CS.LTGREY;
    const words=p.body.split(" ");let line="",ly=pY+35;
    for(const word of words){
      const test=line+word+" ";
      if(ctx.measureText(test).width>PW-14&&line!==""){
        if(ly<pY+PH-6)ctx.fillText(line,px+8,ly);
        line=word+" ";ly+=13;
      }else line=test;
    }
    if(ly<pY+PH-6)ctx.fillText(line,px+8,ly);
  });

  // Module recommendation strip
  const recY=pY+PH+14;
  ctx.textAlign="center";
  ctx.font="bold 9px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
  ctx.fillText("🛡️  DEPLOY THESE MODULES TO COUNTER THIS ADVERSARY:",w/2,recY+10);

  const modW=96,modGap=10;
  const mods=phase.keyModules.map(id=>MODULES[id]).filter(Boolean);
  const totalMW=mods.length*(modW+modGap)-modGap;
  let mx=(w-totalMW)/2;
  mods.forEach(m=>{
    const pulse=0.7+Math.sin(performance.now()*0.002+mx)*0.3;
    ctx.fillStyle="rgba(8,2,26,0.92)";
    ctx.strokeStyle=m.color;ctx.lineWidth=1.3;
    ctx.shadowColor=m.color;ctx.shadowBlur=7*pulse;
    ctx.beginPath();ctx.roundRect(mx,recY+16,modW,42,4);ctx.fill();ctx.stroke();
    ctx.font="bold 14px serif";ctx.textAlign="center";ctx.shadowBlur=0;
    ctx.fillText(m.emoji,mx+modW/2,recY+34);
    ctx.font="bold 7px 'Courier New'";ctx.fillStyle=m.color;
    ctx.fillText(m.shortName,mx+modW/2,recY+48);
    // Narrative tooltip
    const narr=phase.moduleNarrative?.[m.id];
    if(narr){
      ctx.font="7px 'Courier New'";ctx.fillStyle=CS.GREY;
      const maxW=modW-8;const nwords=narr.split(" ");
      let nl="",ny=recY+58;
      for(const nw of nwords){
        const nt=nl+nw+" ";
        if(ctx.measureText(nt).width>maxW&&nl!==""){nl=nw+" ";}
        else nl=nt;
      }
    }
    mx+=modW+modGap;
  });

  // Countdown bar
  const barW=340,barH=7;
  const bx=(w-barW)/2,by=h-54;
  const prog=Math.max(0,1-t/totalT);
  ctx.fillStyle="#1a1a2e";ctx.fillRect(bx,by,barW,barH);
  ctx.fillStyle=phase.color;ctx.shadowColor=phase.color;ctx.shadowBlur=8;
  ctx.fillRect(bx,by,barW*prog,barH);
  ctx.font="10px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
  ctx.fillText(
    `INTEL EXPIRES IN ${Math.max(0,totalT-t).toFixed(1)}s  —  ADVERSARY OPERATIONS UNDERWAY`,
    w/2,by+20);

  // Skip hint blink
  if(skipBlink){
    ctx.font="bold 12px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
    ctx.fillText("[ SPACE ]  SKIP BRIEFING",w/2,h-18);
  }

  ctx.textAlign="left";ctx.restore();
}

// ─── WAVE BANNER RENDERER ────────────────────────────────────────
function renderWaveBanner(ctx,w,h,waveNum,t,isBoss,phase,skipBlink){
  const scl=0.5+Math.min(1,t*4)*0.5;
  const a  =Math.min(1,t*3)*Math.max(0,1-(t-0.6)*2.5);
  ctx.save();
  ctx.globalAlpha=Math.max(0,a);
  ctx.translate(w/2,h/2);ctx.scale(scl,scl);ctx.translate(-w/2,-h/2);
  ctx.textAlign="center";
  if(isBoss){
    ctx.font="bold 42px 'Courier New'";
    ctx.fillStyle=CS.RED_GLOW;ctx.shadowColor=CS.RED_GLOW;ctx.shadowBlur=36;
    ctx.fillText(`👾 ${phase?.shortName??"BOSS"} INCOMING!`,w/2,h/2-22);
    ctx.font="bold 15px 'Courier New'";
    ctx.fillStyle=CS.ORANGE;ctx.shadowBlur=12;
    ctx.fillText("HIGH-PRIORITY THREAT — CROWDSTRIKE RESPONDING",w/2,h/2+26);
  }else{
    ctx.font="bold 52px 'Courier New'";
    const g=ctx.createLinearGradient(0,0,w,0);
    g.addColorStop(0,CS.RED);g.addColorStop(1,CS.ORANGE);
    ctx.fillStyle=g;ctx.shadowColor=CS.RED;ctx.shadowBlur=28;
    ctx.fillText(`WAVE  ${waveNum}`,w/2,h/2-22);
    ctx.font="bold 15px 'Courier New'";
    ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=12;
    ctx.fillText("FALCON DEPLOYED — DEFEND THE NETWORK",w/2,h/2+26);
  }
  if(skipBlink){
    ctx.font="10px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText("[ SPACE ] CONTINUE",w/2,h/2+52);
  }
  ctx.restore();
}

// ─── HUD ─────────────────────────────────────────────────────────
class HUD{
  #s=0;#hi=0;#lives=3;#wave=1;#combo=1;#mods={};#pangeaT=0;

  setState(s,hi,lives,wave,combo,mods,pangeaT){
    this.#s=s;this.#hi=hi;this.#lives=lives;
    this.#wave=wave;this.#combo=combo;this.#mods=mods;this.#pangeaT=pangeaT;
  }
  draw(ctx,w){
    this.#lbl(ctx,`⭐ ${this.#s.toLocaleString()}`,10,28,19,CS.ORANGE);
    this.#lbl(ctx,`🏆 ${this.#hi.toLocaleString()}`,w/2,28,14,CS.YELLOW,"center");
    const hearts="🟥".repeat(Math.max(0,this.#lives))||"💀";
    this.#lbl(ctx,hearts,w-12,28,17,CS.RED,"right");
    this.#lbl(ctx,`WAVE ${this.#wave}`,w-12,48,11,CS.RED,"right");
    if(this.#combo>1)
      this.#lbl(ctx,`🔥 x${this.#combo} CHAIN`,10,48,13,CS.RED_GLOW);
    let px=10;
    Object.entries(this.#mods).forEach(([id,v])=>{
      if(v<=0)return;
      const m=MODULES[id];if(!m)return;
      this.#badge(ctx,`${m.emoji}${m.shortName}`,px,66,m.color);
      px+=Math.min(m.shortName.length*8+24,110);
    });
    if(this.#pangeaT>0){
      ctx.save();ctx.font="bold 10px 'Courier New'";ctx.textAlign="left";
      ctx.fillStyle=CS.TEAL;ctx.shadowColor=CS.TEAL;ctx.shadowBlur=8;
      ctx.fillText(`🌍 PANGEA FREEZE ${this.#pangeaT.toFixed(1)}s`,10,82);
      ctx.restore();
    }
  }
  #lbl(ctx,txt,x,y,sz,col,align="left"){
    ctx.save();ctx.font=`bold ${sz}px 'Courier New',monospace`;
    ctx.textAlign=align;ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=10;
    ctx.fillText(txt,x,y);ctx.restore();
  }
  #badge(ctx,txt,x,y,col){
    ctx.save();ctx.font="bold 10px 'Courier New'";ctx.textAlign="left";
    ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=7;
    ctx.fillText(txt,x,y);ctx.restore();
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
    ctx.save();
    ctx.font="bold 48px 'Courier New',monospace";ctx.textAlign="center";
    const grad=ctx.createLinearGradient(0,0,w,0);
    grad.addColorStop(0,CS.RED);grad.addColorStop(0.45,CS.ORANGE);
    grad.addColorStop(0.7,CS.RED);grad.addColorStop(1,CS.ORANGE);
    ctx.fillStyle=grad;ctx.shadowColor=CS.RED;
    ctx.shadowBlur=26+Math.sin(t*2.5)*8;
    ctx.fillText("FALCON ARCADE DEFENSE",w/2,h*0.17+bounce);
    ctx.font="bold 13px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText("POWERED BY  🦅  CROWDSTRIKE",w/2,h*0.26+bounce*0.5);
    ctx.restore();
    this.#threatPreview(ctx,w,h,t);
    this.#moduleStrip(ctx,w,h);
    this.#controls(ctx,w,h);
    if(this.#blink){
      ctx.save();ctx.font="bold 19px 'Courier New'";ctx.textAlign="center";
      ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=16;
      ctx.fillText("▶  PRESS  SPACE  TO  DEPLOY  ◀",w/2,h*0.83);ctx.restore();
    }
    ctx.save();ctx.font="12px 'Courier New'";ctx.textAlign="center";
    ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=8;
    ctx.fillText(
      `🏆  BREACH PREVENTION RECORD:  ${(+localStorage.getItem("cs_hi")||0).toLocaleString()}  PTS`,
      w/2,h*0.91);ctx.restore();
  }
  #grid(ctx,w,h){
    ctx.save();ctx.strokeStyle="rgba(224,0,60,0.055)";ctx.lineWidth=1;
    for(let x=0;x<w;x+=50){
      ctx.beginPath();ctx.moveTo(x,h*0.42);ctx.lineTo(w/2,h*0.9);ctx.stroke();
    }
    for(let y=0;y<8;y++){
      const fy=h*0.42+y*(h*0.48/8);
      ctx.beginPath();ctx.moveTo(0,fy);ctx.lineTo(w,fy);ctx.stroke();
    }
    ctx.restore();
  }
  #threatPreview(ctx,w,h,t){
    const n=PHASES.length,EW=110,EH=46,gap=9;
    const totW=n*(EW+gap)-gap,sx=(w-totW)/2,y=h*0.35;
    ctx.save();ctx.textAlign="center";
    ctx.font="bold 9px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText("— KNOWN THREAT ACTORS —",w/2,y-8);
    PHASES.forEach((phase,i)=>{
      const x=sx+i*(EW+gap),bob=Math.sin(t*1.5+i*0.8)*3;
      ctx.fillStyle="rgba(4,1,18,0.85)";
      ctx.strokeStyle=phase.color;ctx.lineWidth=1.5;
      ctx.shadowColor=phase.color;ctx.shadowBlur=7;
      ctx.beginPath();ctx.roundRect(x,y+bob,EW,EH,4);ctx.fill();ctx.stroke();
      const nl=phase.shortName.length;
      ctx.font=`bold ${nl>12?7:nl>9?8:9}px 'Courier New'`;
      ctx.fillStyle=phase.color;ctx.shadowBlur=5;
      ctx.fillText(phase.shortName,x+EW/2,y+bob+15);
      ctx.font="7px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
      ctx.fillText(phase.shortNation,x+EW/2,y+bob+27);
      ctx.font="7px 'Courier New'";ctx.fillStyle=CS.LTGREY;
      const vec=phase.vector.length>18?phase.vector.slice(0,16)+"…":phase.vector;
      ctx.fillText(vec,x+EW/2,y+bob+38);
    });
    ctx.restore();
  }
  #moduleStrip(ctx,w,h){
    const mods=Object.values(MODULES);
    const EW=62,EH=40,gap=7;
    const totW=mods.length*(EW+gap)-gap,sx=(w-totW)/2,y=h*0.56;
    ctx.save();
    mods.forEach((m,i)=>{
      const x=sx+i*(EW+gap);
      const pulse=0.7+Math.sin(performance.now()*0.002+i*0.7)*0.3;
      ctx.fillStyle="rgba(4,1,18,0.78)";
      ctx.strokeStyle=m.color;ctx.lineWidth=1;
      ctx.shadowColor=m.color;ctx.shadowBlur=6*pulse;
      ctx.beginPath();ctx.roundRect(x,y,EW,EH,3);ctx.fill();ctx.stroke();
      ctx.font="15px serif";ctx.textAlign="center";ctx.shadowBlur=0;
      ctx.fillText(m.emoji,x+EW/2,y+22);
      ctx.font="bold 6px 'Courier New'";ctx.fillStyle=m.color;
      const label=m.shortName.length>9?m.shortName.slice(0,9):m.shortName;
      ctx.fillText(label,x+EW/2,y+34);
    });
    ctx.restore();
  }
  #controls(ctx,w,h){
    const rows=[["← →","MOVE"],["SPACE","FIRE / SKIP"],["MODULES","AUTO-COLLECT"]];
    const y=h*0.71;
    ctx.save();ctx.textAlign="center";
    rows.forEach(([k,v],i)=>{
      const x=w/2+(i-1)*200;
      ctx.font="bold 11px 'Courier New'";
      ctx.fillStyle=CS.YELLOW;ctx.shadowColor=CS.YELLOW;ctx.shadowBlur=7;
      ctx.fillText(`[ ${k} ]`,x,y);
      ctx.font="10px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
      ctx.fillText(v,x,y+16);
    });
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════════════
//  🦅  MAIN GAME
// ═══════════════════════════════════════════════════════════════════
class Game{
  #assets   =new AssetManager();
  #audio    =new AudioEngine();
  #parts    =new Particles();
  #fx       =new ScreenFX();
  #stars    =new Starfield(canvas.width,canvas.height);
  #input    =new Input();
  #hud      =new HUD();
  #floats   =new FloatText();
  #title    =new TitleScreen();
  #notify   =new ModuleNotification();
  #overwatch=new OverWatchSystem();
  #fcSystem =new FalconCompleteSystem();
  #charlotte=new CharlotteAI();
  #bltPool  =new Pool(()=>({x:0,y:0,vx:0,vy:0,w:CFG.BLT_W,h:CFG.BLT_H,boss:false}),100);

  #state     =STATE.TITLE;
  #bannerT   =0;
  #bannerBoss=false;
  #briefT    =0;
  #blinkSkip =true;#blinkT=0;
  #waveIdx   =0;   // index into PHASES array
  #score     =0;#hi=0;#lives=CFG.PLR_LIVES;
  #hitPause  =0;#lastTime=0;

  #px=0;#py=0;#canShoot=true;
  #mods={PREVENT:0,INSIGHT:0,IDENTITY:0,PANGEA:0,FEM:0};
  #pangeaT=0;
  #modulesCollected=new Set();

  #combo=1;#comboT=0;
  #attackers=[];#pBullets=[];#aBullets=[];
  #blocks=[];#powerUps=[];#ufo=null;#ufoTimer=0;
  #boss=null;#dir=1;
  #currentPhase=null;#deathCtx=null;

  #waveSpd(i){return 1+i*0.28;}
  #waveRate(i){return 0.20+i*0.04;}

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
    this.#lastTime=now;
    this.#update(dt);
    this.#render();
    requestAnimationFrame(this.#loop);
  };

  #update(dt){
    this.#stars.update(dt);this.#parts.update(dt);
    this.#fx.update(dt);this.#floats.update(dt);this.#notify.update(dt);
    this.#blinkT+=dt;
    if(this.#blinkT>0.5){this.#blinkSkip=!this.#blinkSkip;this.#blinkT=0;}

    switch(this.#state){
      case STATE.TITLE:
        this.#title.update(dt);
        if(this.#input.consume(" "))this.#startGame();
        break;

      case STATE.INTEL_BRIEF:
        this.#briefT+=dt;
        if(this.#input.consume(" ")||this.#briefT>CFG.INTEL_BRIEF_MS/1000){
          this.#input.flushAll();
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
        }
        break;

      case STATE.PLAYING:     this.#updatePlaying(dt);break;
      case STATE.BOSS:        this.#updateBoss(dt);break;

      case STATE.OVERWATCH_SEQ:
        this.#overwatch.update(dt);
        if(!this.#overwatch.isActive){
          this.#state=this.#boss?.alive?STATE.BOSS:STATE.PLAYING;
          if(this.#countAlive()===0&&!this.#boss?.alive){
            this.#state=STATE.LEVEL_CLEAR;this.#bannerT=0;
          }
        }
        break;

      case STATE.FALCON_COMPLETE:
        this.#fcSystem.update(dt);
        if(!this.#fcSystem.isActive)this.#afterFC();
        break;

      case STATE.LEVEL_CLEAR:
        this.#bannerT+=dt;
        if(this.#input.consume(" ")||this.#bannerT>CFG.LEVEL_CLEAR_MS/1000)
          this.#nextWave();
        break;

      case STATE.GAME_OVER:
      case STATE.YOU_WIN:
        if(this.#input.consume("r")||this.#input.consume("R"))this.#backToTitle();
        break;
    }
  }

  #updatePlaying(dt){
    if(this.#hitPause>0){this.#hitPause-=dt;return;}
    this.#handleInput(dt);
    if(this.#pangeaT<=0){this.#moveAttackers(dt);this.#doShoot();}
    else this.#pangeaT=Math.max(0,this.#pangeaT-dt);
    this.#movePBullets(dt);this.#moveABullets(dt);
    this.#charlotte.update(dt);
    this.#updatePowerUps(dt);this.#updateUFO(dt);
    this.#tickCombo(dt);this.#tickMods(dt);
    this.#checkEnd();
  }

  #updateBoss(dt){
    if(this.#hitPause>0){this.#hitPause-=dt;return;}
    if(!this.#boss?.alive){this.#endBoss();return;}
    this.#handleInput(dt);
    if(this.#pangeaT<=0)this.#boss.update(dt,this.#aBullets,this.#bltPool);
    else this.#pangeaT=Math.max(0,this.#pangeaT-dt);
    this.#movePBullets(dt);this.#moveABullets(dt);
    this.#charlotte.update(dt);
    this.#updatePowerUps(dt);this.#updateUFO(dt);
    this.#tickCombo(dt);this.#tickMods(dt);
    if(this.#lives<=0)this.#gameOver();
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
        x:cx,y:by,
        vx:Math.sin(a)*CFG.PLR_BLT_SPEED,
        vy:-Math.cos(a)*CFG.PLR_BLT_SPEED,
        w:CFG.BLT_W,h:CFG.BLT_H,boss:false,
      }));
    this.#canShoot=false;this.#audio.laser();
  }

  #moveAttackers(dt){
    const spd=CFG.ATK_BLT_SPEED*0.52*this.#waveSpd(this.#waveIdx);
    const ff=this.#mods.FEM>0?0.62:1.0;
    let edge=false;
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];if(!a?.alive)continue;
        a.x+=this.#dir*spd*ff*dt;
        if(a.x+CFG.ATK_W>canvas.width||a.x<0)edge=true;
      }
    if(edge){
      this.#dir*=-1;
      for(let c=0;c<CFG.COLS;c++)
        for(let r=0;r<CFG.ROWS;r++)
          if(this.#attackers[c]?.[r]?.alive)
            this.#attackers[c][r].y+=CFG.ATK_SY*0.65;
    }
  }

  #movePBullets(dt){
    for(let i=this.#pBullets.length-1;i>=0;i--){
      const b=this.#pBullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.y+b.h<0||b.x<-20||b.x>canvas.width+20){
        this.#bltPool.release(b);this.#pBullets.splice(i,1);
        this.#canShoot=true;continue;
      }
      // vs UFO
      if(this.#ufo?.alive&&
          this.#ov(b.x,b.y,b.w,b.h,this.#ufo.x,this.#ufo.y,this.#ufo.w,this.#ufo.h)){
        const pts=this.#ufo.pts*this.#combo;
        this.#addScore(pts,this.#ufo.x+this.#ufo.w/2,this.#ufo.y,`🛸 SIGNAL +${pts}`);
        this.#parts.csExplosion(this.#ufo.x+this.#ufo.w/2,this.#ufo.y+this.#ufo.h/2);
        this.#fx.shake(0.2);this.#audio.boom();this.#ufo.alive=false;
        this.#bltPool.release(b);this.#pBullets.splice(i,1);
        this.#canShoot=true;continue;
      }
      // vs boss
      if(this.#boss?.alive&&
          this.#ov(b.x,b.y,b.w,b.h,this.#boss.x,this.#boss.y,this.#boss.w,this.#boss.h)){
        this.#boss.hit();this.#fx.shake(0.12);
        if(!this.#boss.alive){
          this.#parts.bossExplode(this.#boss.x+this.#boss.w/2,this.#boss.y+this.#boss.h/2);
          this.#fx.shake(0.9);this.#fx.flash(224,0,60,0.65);this.#fx.chroma(0.06);
          this.#audio.bossRoar();
          const pts=CFG.SCORE_BOSS*this.#combo;
          this.#addScore(pts,this.#boss.x+this.#boss.w/2,this.#boss.y,
            `🦅 BREACH PREVENTED +${pts}`);
        }
        this.#bltPool.release(b);this.#pBullets.splice(i,1);
        this.#canShoot=true;continue;
      }
      // vs attackers
      let hit=false;
      outer:
      for(let c=0;c<CFG.COLS&&!hit;c++)
        for(let r=0;r<CFG.ROWS&&!hit;r++){
          const a=this.#attackers[c]?.[r];if(!a?.alive)continue;
          if(this.#ov(b.x,b.y,b.w,b.h,a.x,a.y,CFG.ATK_W,CFG.ATK_H)){
            this.#killAtk(a,r);
            this.#bltPool.release(b);this.#pBullets.splice(i,1);
            this.#canShoot=true;hit=true;
          }
        }
      if(hit)continue;
      // vs blocks
      for(const bl of this.#blocks){
        if(bl.alive&&this.#ov(b.x,b.y,b.w,b.h,bl.x,bl.y,bl.w,bl.h)){
          bl.hit();this.#bltPool.release(b);this.#pBullets.splice(i,1);
          this.#canShoot=true;break;
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
    if(this.#mods.INSIGHT>0)
      this.#floats.spawn(a.x+CFG.ATK_W/2,a.y-12,"📡 IOC LOGGED",CS.BLUE,10);
    if(Math.random()<CFG.DROP_CHANCE&&this.#currentPhase)
      this.#powerUps.push(new PowerUp(a.x+CFG.ATK_W/2-13,a.y,this.#currentPhase));
  }

  #moveABullets(dt){
    for(let i=this.#aBullets.length-1;i>=0;i--){
      const b=this.#aBullets[i];b.x+=(b.vx||0)*dt;b.y+=b.vy*dt;
      if(b.y>canvas.height||b.x<-20||b.x>canvas.width+20){
        this.#bltPool.release(b);this.#aBullets.splice(i,1);continue;
      }
      let bh=false;
      for(const bl of this.#blocks){
        if(bl.alive&&this.#ov(b.x,b.y,b.w,b.h,bl.x,bl.y,bl.w,bl.h)){
          bl.hit();this.#bltPool.release(b);this.#aBullets.splice(i,1);bh=true;break;
        }
      }
      if(bh)continue;
      if(this.#ov(b.x,b.y,b.w,b.h,this.#px,this.#py,CFG.PLR_W,CFG.PLR_H)){
        this.#bltPool.release(b);this.#aBullets.splice(i,1);
        if(this.#mods.IDENTITY>0){
          this.#mods.IDENTITY=0;
          this.#fx.flash(255,220,0,0.4);this.#audio.moduleUp();
          this.#floats.spawn(this.#px+CFG.PLR_W/2,this.#py,
            "🪪 IDENTITY — CREDENTIAL ATTACK BLOCKED",CS.YELLOW,12);
          this.#floats.spawn(this.#px+CFG.PLR_W/2,this.#py+16,
            "ANOMALOUS AUTHENTICATION INTERCEPTED",CS.YELLOW,10);
        }else{this.#loseLife();}
      }
    }
  }

  #doShoot(){
    const rate=this.#waveRate(this.#waveIdx);
    const maxB=CFG.MAX_ATK_BLTS+this.#waveIdx;
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];if(!a?.alive)continue;
        if(this.#aBullets.length>=maxB)return;
        const dist=Math.abs(a.x+CFG.ATK_W/2-(this.#px+CFG.PLR_W/2));
        const prox=Math.max(0,1-dist/canvas.width);
        if(Math.random()<rate*(0.4+prox*1.6)/60)
          this.#aBullets.push(this.#bltPool.acquire({
            x:a.x+CFG.ATK_W/2-CFG.BLT_W/2,y:a.y+CFG.ATK_H,
            vx:0,vy:CFG.ATK_BLT_SPEED*(0.9+this.#waveIdx*0.1),
            w:CFG.BLT_W,h:CFG.BLT_H,boss:false,
          }));
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
    this.#fx.flash(
      parseInt(mod.color.slice(1,3),16),
      parseInt(mod.color.slice(3,5),16),
      parseInt(mod.color.slice(5,7),16),0.28);
    this.#modulesCollected.add(mod.id);

    switch(mod.id){
      case"PREVENT":
        this.#mods.PREVENT=mod.duration;
        this.#floats.spawn(this.#px+CFG.PLR_W/2,this.#py-10,
          "🛡️ TRIPLE SHOT — AI PREVENTION ACTIVE",CS.CYAN,13);
        break;
      case"INSIGHT":
        this.#mods.INSIGHT=mod.duration;
        this.#floats.spawn(this.#px+CFG.PLR_W/2,this.#py-10,
          "🔍 XDR — FULL ATTACK SURFACE VISIBLE",CS.BLUE,13);
        break;
      case"IDENTITY":
        this.#mods.IDENTITY=mod.duration;
        this.#floats.spawn(this.#px+CFG.PLR_W/2,this.#py-10,
          "🪪 IDENTITY — CREDENTIAL ATTACKS BLOCKED",CS.YELLOW,13);
        break;
      case"CLOUD":   this.#doCloud();break;
      case"FEM":     this.#doFEM();break;
      case"CHARLOTTE":this.#doCharlotte();break;
      case"PANGEA":  this.#doPangea();break;
      case"OVERWATCH":this.#doOverwatch();break;
      case"COMPLETE":this.#doComplete();break;
    }
  }

  #doCloud(){
    this.#fx.flash(255,106,0,0.45);this.#fx.shake(0.3);
    this.#floats.spawn(canvas.width/2,canvas.height/2,
      "☁️ CLOUD SECURITY — RUNTIME ELIMINATION",CS.ORANGE,16);
    let delay=0;
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];if(!a?.alive)continue;
        const ac=a,rc=r;
        setTimeout(()=>{
          if(!ac.alive)return;
          ac.alive=false;
          this.#parts.csExplosion(ac.x+CFG.ATK_W/2,ac.y+CFG.ATK_H/2);
          this.#addScore(CFG.SCORE_ROW[rc]*this.#combo,
            ac.x+CFG.ATK_W/2,ac.y,`☁️ +${CFG.SCORE_ROW[rc]*this.#combo}`);
          this.#audio.boom();
        },delay);delay+=55;
      }
    this.#aBullets.forEach(b=>this.#bltPool.release(b));this.#aBullets=[];
  }

  #doFEM(){
    this.#audio.fem();this.#fx.flash(0,255,208,0.35);
    this.#mods.FEM=MODULES.FEM.duration;
    this.#floats.spawn(canvas.width/2,canvas.height/2-20,
      "🗺️ EXPOSURE MGMT — ATTACK SURFACE REDUCED",CS.TEAL,15);
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];
        if(a?.alive)this.#parts.femReveal(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);
      }
  }

  #doCharlotte(){
    this.#audio.charlotte();this.#fx.flash(57,255,20,0.4);
    this.#floats.spawn(canvas.width/2,canvas.height/3,
      "🤖 CHARLOTTE AI — AUTONOMOUS NEUTRALIZATION",CS.GREEN,15);
    this.#charlotte.activate(this.#attackers,CFG.COLS,CFG.ROWS,a=>{
      this.#parts.csExplosion(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);
      const pts=CFG.SCORE_ROW[0]*3;
      this.#addScore(pts,a.x+CFG.ATK_W/2,a.y,`🤖 AI +${pts}`);
    });
  }

  #doPangea(){
    this.#audio.pangea();this.#fx.flash(0,255,208,0.5);this.#fx.shake(0.2);
    this.#pangeaT=MODULES.PANGEA.duration;this.#mods.PANGEA=this.#pangeaT;
    this.#floats.spawn(canvas.width/2,canvas.height/2-30,
      "🌍 PANGEA — ADVERSARY INFRASTRUCTURE FROZEN",CS.TEAL,15);
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];
        if(a?.alive)this.#parts.pangeaFreeze(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);
      }
  }

  #doOverwatch(){
    this.#audio.overwatch();this.#fx.flash(255,106,0,0.5);
    this.#state=STATE.OVERWATCH_SEQ;
    this.#overwatch.activate(this.#attackers,CFG.COLS,CFG.ROWS,a=>{
      this.#parts.overWatchKill(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);
      const pts=CFG.SCORE_ROW[0]*5;
      this.#addScore(pts,a.x+CFG.ATK_W/2,a.y,`👁️ HUNTED +${pts}`);
      this.#audio.boom();this.#fx.shake(0.18);
    });
  }

  #doComplete(){
    this.#audio.complete();
    this.#fx.shake(0.6);this.#fx.flash(224,0,60,0.7);this.#fx.chroma(0.08);
    this.#state=STATE.FALCON_COMPLETE;
    this.#fcSystem.activate(this.#attackers,CFG.COLS,CFG.ROWS,(a,idx)=>{
      setTimeout(()=>{
        this.#parts.completeKill(a.x+CFG.ATK_W/2,a.y+CFG.ATK_H/2);
        this.#audio.boom();
      },idx*40);
      const pts=CFG.SCORE_ROW[0]*this.#combo*2;
      this.#addScore(pts,a.x+CFG.ATK_W/2,a.y,`🦅 MDR +${pts}`);
    });
    this.#aBullets.forEach(b=>this.#bltPool.release(b));this.#aBullets=[];
  }

  #afterFC(){
    this.#state=this.#boss?.alive?STATE.BOSS:STATE.PLAYING;
    if(this.#countAlive()===0&&!this.#boss?.alive){
      this.#state=STATE.LEVEL_CLEAR;this.#bannerT=0;
    }
  }

  #updateUFO(dt){
    if(this.#ufo){
      this.#ufo.update(dt,this.#audio);if(!this.#ufo.alive)this.#ufo=null;
    }else{
      this.#ufoTimer+=dt*1000;
      if(this.#ufoTimer>CFG.UFO_INTERVAL){
        this.#ufoTimer=0;this.#ufo=new UFO(canvas.width);
      }
    }
  }

  #bumpCombo(){this.#combo=Math.min(8,this.#combo+1);this.#comboT=CFG.COMBO_WINDOW/1000;}
  #tickCombo(dt){if(this.#combo>1){this.#comboT-=dt;if(this.#comboT<=0)this.#combo=1;}}
  #tickMods(dt){
    for(const k of["PREVENT","INSIGHT","IDENTITY","FEM"])
      if(this.#mods[k]>0)this.#mods[k]=Math.max(0,this.#mods[k]-dt);
    if(this.#pangeaT>0){
      this.#pangeaT=Math.max(0,this.#pangeaT-dt);
      this.#mods.PANGEA=this.#pangeaT;
    }
  }

  #addScore(pts,x,y,label){
    this.#score+=pts;
    const col=pts>=1000?CS.GREEN:pts>=300?CS.YELLOW:CS.ORANGE;
    this.#floats.spawn(x,y,label,col,pts>=500?18:13);
  }

  #loseLife(){
    this.#lives--;
    this.#parts.playerHit(this.#px+CFG.PLR_W/2,this.#py+CFG.PLR_H/2);
    this.#fx.shake(0.55);this.#fx.flash(224,0,60,0.65);
    this.#fx.chroma(0.05);this.#audio.playerHit();this.#combo=1;
    if(this.#lives<=0){this.#gameOver();return;}
    this.#hitPause=CFG.HIT_PAUSE_MS/1000;
    this.#px=canvas.width/2-CFG.PLR_W/2;
    const dc=getDeathContext(this.#currentPhase,this.#modulesCollected);
    this.#floats.spawn(canvas.width/2,canvas.height/2-24,
      `⚠ ${dc.headline.slice(0,48)}`,CS.RED_GLOW,12);
  }

  #checkEnd(){
    if(this.#lives<=0){this.#gameOver();return;}
    if(this.#countAlive()===0){
      this.#audio.levelUp();this.#fx.startWarp(canvas.width,canvas.height);
      this.#fx.flash(0,229,255,0.4);
      this.#floats.spawn(canvas.width/2,canvas.height/2,
        "🛡️ BREACH PREVENTED — NETWORK SECURED",CS.GREEN,18);
      this.#state=STATE.LEVEL_CLEAR;this.#bannerT=0;
    }
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];
        if(a?.alive&&a.y+CFG.ATK_H>=this.#py){this.#lives=0;this.#gameOver();return;}
      }
  }

  #countAlive(){
    let n=0;
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++)
        if(this.#attackers[c]?.[r]?.alive)n++;
    return n;
  }

  #endBoss(){
    this.#audio.levelUp();this.#fx.startWarp(canvas.width,canvas.height);
    this.#fx.flash(224,0,60,0.7);
    if(this.#waveIdx>=PHASES.length-1){
      this.#state=STATE.YOU_WIN;this.#saveHi();return;
    }
    this.#state=STATE.LEVEL_CLEAR;this.#bannerT=0;
  }

  #gameOver(){
    this.#audio.stopBGM();this.#fx.flash(224,0,60,0.9);this.#fx.shake(1);
    this.#parts.bossExplode(canvas.width/2,canvas.height/2);
    this.#deathCtx=getDeathContext(this.#currentPhase,this.#modulesCollected);
    this.#state=STATE.GAME_OVER;this.#saveHi();
  }

  #saveHi(){
    if(this.#score>this.#hi){
      this.#hi=this.#score;
      try{localStorage.setItem("cs_hi",this.#hi);}catch(_){}
    }
  }

  #startGame(){
    this.#score=0;this.#lives=CFG.PLR_LIVES;
    this.#combo=1;this.#comboT=0;this.#waveIdx=0;this.#dir=1;
    this.#mods={PREVENT:0,INSIGHT:0,IDENTITY:0,PANGEA:0,FEM:0};
    this.#pangeaT=0;this.#deathCtx=null;
    this.#audio.startBGM();this.#beginWave();
  }

  #nextWave(){
    this.#waveIdx=Math.min(this.#waveIdx+1,PHASES.length-1);
    this.#dir=1;this.#audio.stopBGM();this.#audio.startBGM();
    this.#beginWave();
  }

  #beginWave(){
    this.#pBullets=[];this.#aBullets=[];
    this.#powerUps=[];this.#ufo=null;this.#ufoTimer=0;
    this.#canShoot=true;this.#modulesCollected=new Set();
    this.#px=canvas.width/2-CFG.PLR_W/2;
    this.#py=canvas.height-CFG.PLR_H-32;
    this.#buildAttackers();this.#buildBlocks();

    const phase=PHASES[this.#waveIdx];
    this.#currentPhase=phase;
    this.#bannerBoss=phase.isBoss;
    if(phase.isBoss){
      this.#boss=new Boss(this.#waveIdx+1,phase);
      this.#audio.bossRoar();
    }else{this.#boss=null;}
    this.#briefT=0;this.#state=STATE.INTEL_BRIEF;
  }

  #backToTitle(){
    this.#audio.stopBGM();this.#state=STATE.TITLE;
    this.#pBullets=[];this.#aBullets=[];
    this.#powerUps=[];this.#ufo=null;this.#boss=null;
    this.#currentPhase=null;this.#deathCtx=null;
    this.#input.flushAll();
  }

  #buildAttackers(){
    this.#attackers=[];
    const sx=(canvas.width-CFG.COLS*(CFG.ATK_W+CFG.ATK_SX))/2;
    for(let c=0;c<CFG.COLS;c++){
      this.#attackers[c]=[];
      for(let r=0;r<CFG.ROWS;r++){
        this.#attackers[c][r]={
          x:sx+c*(CFG.ATK_W+CFG.ATK_SX),
          y:68+r*(CFG.ATK_H+CFG.ATK_SY),
          alive:true,
          imageIndex:Math.floor(Math.random()*CFG.IMAGE_COUNT),
          phase:Math.random()*Math.PI*2,
        };
      }
    }
  }

  #buildBlocks(){
    this.#blocks=[];
    const total=CFG.BLK_COLS*(CFG.BLK_W+20)-20;
    const sx=(canvas.width-total)/2;
    for(let c=0;c<CFG.BLK_COLS;c++)
      this.#blocks.push(new Block(sx+c*(CFG.BLK_W+20),canvas.height-108));
  }

  // ── RENDER ──────────────────────────────────────────────────────
  #render(){
    const W=canvas.width,H=canvas.height;
    ctx.fillStyle=CS.BG;ctx.fillRect(0,0,W,H);
    this.#stars.draw(ctx);

    switch(this.#state){
      case STATE.TITLE:
        this.#title.draw(ctx,W,H);break;

      case STATE.INTEL_BRIEF:
        this.#renderGame(W,H);
        renderIntelBrief(ctx,W,H,
          PHASES[this.#waveIdx],this.#briefT,
          CFG.INTEL_BRIEF_MS/1000,this.#blinkSkip);
        break;

      case STATE.WAVE_BANNER:
      case STATE.BOSS_WARNING:
        this.#renderGame(W,H);
        renderWaveBanner(ctx,W,H,
          this.#waveIdx+1,this.#bannerT,
          this.#bannerBoss,PHASES[this.#waveIdx],this.#blinkSkip);
        break;

      case STATE.OVERWATCH_SEQ:
        this.#renderGame(W,H);this.#overwatch.draw(ctx);break;

      case STATE.FALCON_COMPLETE:
        this.#renderGame(W,H);this.#fcSystem.draw(ctx,W,H);break;

      case STATE.PLAYING:case STATE.BOSS:case STATE.LEVEL_CLEAR:
        this.#renderGame(W,H);
        if(this.#state===STATE.LEVEL_CLEAR)this.#drawLevelClear(ctx,W,H);
        break;

      case STATE.GAME_OVER:
        this.#renderGame(W,H);this.#drawGameOver(ctx,W,H);break;

      case STATE.YOU_WIN:
        this.#renderGame(W,H);this.#drawYouWin(ctx,W,H);break;
    }
    this.#fx.drawPost(ctx,W,H);
  }

  #renderGame(W,H){
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
      ctx.save();ctx.globalAlpha=0.28;
      ctx.globalCompositeOperation="screen";
      ctx.drawImage(canvas,sh,0);
      ctx.globalCompositeOperation="source-over";ctx.globalAlpha=1;ctx.restore();
    }
    if(this.#pangeaT>0){
      ctx.save();
      ctx.fillStyle=`rgba(0,229,255,${0.04+Math.sin(performance.now()*0.003)*0.025})`;
      ctx.fillRect(0,0,W,H);ctx.restore();
    }
    this.#fx.restoreShake(ctx);
    this.#hud.setState(this.#score,this.#hi,this.#lives,
      this.#waveIdx+1,this.#combo,this.#mods,this.#pangeaT);
    this.#hud.draw(ctx,W);
    this.#notify.draw(ctx,W);
  }

  #drawAttackers(){
    const now=performance.now();
    for(let c=0;c<CFG.COLS;c++)
      for(let r=0;r<CFG.ROWS;r++){
        const a=this.#attackers[c]?.[r];if(!a?.alive)continue;
        const img=this.#assets.get(`act${a.imageIndex}`);
        const bob=Math.sin(a.phase+now*0.0014)*2.5;
        const hue=(r*50+now*0.025)%360;
        ctx.save();
        ctx.shadowColor=`hsl(${hue},100%,60%)`;
        ctx.shadowBlur=7+Math.sin(a.phase+now*0.002)*3;
        if(this.#pangeaT>0){
          ctx.globalAlpha=0.68;ctx.fillStyle="rgba(0,200,255,0.28)";
          ctx.fillRect(a.x,a.y+bob,CFG.ATK_W,CFG.ATK_H);ctx.globalAlpha=1;
        }
        if(img)ctx.drawImage(img,a.x,a.y+bob,CFG.ATK_W,CFG.ATK_H);
        else{
          ctx.fillStyle=`hsl(${hue},80%,55%)`;
          ctx.fillRect(a.x,a.y+bob,CFG.ATK_W,CFG.ATK_H);
        }
        if(this.#mods.INSIGHT>0){
          ctx.font="bold 7px 'Courier New'";ctx.textAlign="center";
          ctx.fillStyle=CS.BLUE;ctx.shadowColor=CS.BLUE;ctx.shadowBlur=5;
          ctx.fillText("⚠APT",a.x+CFG.ATK_W/2,a.y+bob-3);
        }
        if(this.#mods.FEM>0){
          ctx.font="7px 'Courier New'";ctx.textAlign="center";
          ctx.fillStyle=CS.TEAL;ctx.shadowColor=CS.TEAL;ctx.shadowBlur=4;
          ctx.fillText("EXPOSED",a.x+CFG.ATK_W/2,a.y+bob+CFG.ATK_H+10);
        }
        ctx.restore();
      }
  }

  #drawPlayer(){
    const img=this.#assets.get("player");
    const flicker=0.4+Math.random()*0.6;
    const tg=ctx.createRadialGradient(
      this.#px+CFG.PLR_W/2,this.#py+CFG.PLR_H+10,0,
      this.#px+CFG.PLR_W/2,this.#py+CFG.PLR_H+10,16);
    tg.addColorStop(0,`rgba(224,0,60,${flicker})`);
    tg.addColorStop(1,"rgba(224,0,60,0)");
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
    ctx.shadowColor=CS.RED;ctx.shadowBlur=14;
    if(img)ctx.drawImage(img,this.#px,this.#py,CFG.PLR_W,CFG.PLR_H);
    else{
      ctx.fillStyle=CS.RED;ctx.fillRect(this.#px,this.#py,CFG.PLR_W,CFG.PLR_H);
      ctx.font="18px serif";ctx.textAlign="center";
      ctx.fillText("🚀",this.#px+CFG.PLR_W/2,this.#py+CFG.PLR_H*0.78);
    }
    ctx.restore();
    // NO label under the ship — removed per request
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
      const col=b.boss?CS.YELLOW:CS.ORANGE;
      ctx.shadowColor=col;ctx.shadowBlur=10;ctx.fillStyle=col;
      ctx.fillRect(b.x,b.y,b.w,b.h);
      if(b.boss){ctx.globalAlpha=0.25;ctx.fillRect(b.x-b.w,b.y-b.h*0.5,b.w*3,b.h*2);}
      ctx.restore();
    }
  }

  #drawLevelClear(ctx,w,h){
    const t=this.#bannerT;
    const fi=Math.min(1,t/0.4);
    const fo=t>CFG.LEVEL_CLEAR_MS/1000-0.5
      ?Math.max(0,1-(t-(CFG.LEVEL_CLEAR_MS/1000-0.5))/0.5):1;
    ctx.save();ctx.globalAlpha=fi*fo*0.92;
    ctx.fillStyle="rgba(4,1,12,0.75)";ctx.fillRect(0,0,w,h);
    ctx.textAlign="center";
    ctx.font="bold 42px 'Courier New'";
    ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=28;
    ctx.fillText("🛡️ BREACH PREVENTED",w/2,h*0.38);
    ctx.font="bold 15px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
    ctx.fillText("Network secured. Adversary operations disrupted.",w/2,h*0.50);
    ctx.font="bold 11px 'Courier New'";ctx.fillStyle=CS.GREY;
    ctx.fillText("[ SPACE ] ADVANCE TO NEXT THREAT",w/2,h*0.62);
    ctx.restore();
  }

  #drawGameOver(ctx,w,h){
    const dc=this.#deathCtx;
    ctx.fillStyle="rgba(4,1,12,0.84)";ctx.fillRect(0,0,w,h);
    ctx.fillStyle=CS.RED;ctx.fillRect(0,0,w,4);ctx.fillRect(0,h-4,w,4);
    ctx.save();ctx.textAlign="center";
    ctx.font="bold 40px 'Courier New'";
    ctx.fillStyle=CS.RED_GLOW;ctx.shadowColor=CS.RED_GLOW;ctx.shadowBlur=34;
    ctx.fillText("ADVERSARY ACHIEVED PERSISTENCE",w/2,h*0.14);
    if(dc){
      const px=55,py=h*0.22,pw=w-110,ph=178;
      ctx.fillStyle="rgba(8,2,26,0.94)";
      ctx.strokeStyle=CS.RED;ctx.lineWidth=1.5;
      ctx.shadowColor=CS.RED;ctx.shadowBlur=12;
      ctx.beginPath();ctx.roundRect(px,py,pw,ph,6);ctx.fill();ctx.stroke();
      ctx.fillStyle=CS.RED;ctx.shadowBlur=0;
      ctx.beginPath();ctx.roundRect(px,py,pw,24,[6,6,0,0]);ctx.fill();
      ctx.font="bold 10px 'Courier New'";ctx.fillStyle=CS.WHITE;
      ctx.fillText("⚠  THREAT ANALYSIS — WHAT HAPPENED THIS ENGAGEMENT",w/2,py+16);
      ctx.font="bold 14px 'Courier New'";
      ctx.fillStyle=CS.ORANGE;ctx.shadowColor=CS.ORANGE;ctx.shadowBlur=10;
      ctx.fillText(dc.headline,w/2,py+46);
      ctx.font="11px 'Courier New'";ctx.fillStyle=CS.LTGREY;ctx.shadowBlur=0;
      const words=dc.body.split(" ");let line="",ly=py+66;
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
    ctx.font="bold 17px 'Courier New'";
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
    ctx.fillStyle="rgba(4,1,12,0.84)";ctx.fillRect(0,0,w,h);
    ctx.fillStyle=CS.GREEN;ctx.fillRect(0,0,w,4);ctx.fillRect(0,h-4,w,4);
    ctx.save();ctx.textAlign="center";
    ctx.font="bold 46px 'Courier New'";
    ctx.fillStyle=CS.GREEN;ctx.shadowColor=CS.GREEN;ctx.shadowBlur=34;
    ctx.fillText("🦅 BREACH PREVENTED",w/2,h*0.22);
    ctx.font="bold 15px 'Courier New'";ctx.fillStyle=CS.WHITE;ctx.shadowBlur=0;
    ctx.fillText("All adversaries neutralized. Galaxy secured.",w/2,h*0.33);
    ctx.font="13px 'Courier New'";ctx.fillStyle=CS.GREY;
    ctx.fillText("Falcon delivered visibility, detection and response",w/2,h*0.41);
    ctx.fillText("across every endpoint, identity and cloud workload.",w/2,h*0.47);
    ctx.font="bold 20px 'Courier New'";
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

  #drawLoading(){
    ctx.fillStyle=CS.BG;ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.font="bold 26px 'Courier New'";ctx.textAlign="center";
    ctx.fillStyle=CS.RED;ctx.shadowColor=CS.RED;ctx.shadowBlur=22;
    ctx.fillText("🦅  FALCON ARCADE INITIALIZING…",canvas.width/2,canvas.height/2);
    ctx.font="12px 'Courier New'";ctx.fillStyle=CS.GREY;ctx.shadowBlur=0;
    ctx.fillText("Loading threat intelligence data…",canvas.width/2,canvas.height/2+34);
    ctx.textAlign="left";
  }

  #ov(ax,ay,aw,ah,bx,by,bw,bh){
    return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
  }

} // ← end class Game

// ─── BOOTSTRAP ───────────────────────────────────────────────────
const game=new Game();
game.init().catch(console.error);
