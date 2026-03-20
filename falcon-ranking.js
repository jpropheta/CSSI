// ════════════════════════════════════════════════════════════════════
//  FALCON RANKING SYSTEM  v1.0
//  Self-contained leaderboard + lead capture + attract mode
//  Drop into any CrowdStrike arcade game with zero dependencies.
//
//  PUBLIC API:
//    FalconRanking.init(config)          — call once at boot
//    FalconRanking.onGameEnd(data)       — call on GAME_OVER or WIN
//    FalconRanking.startIdleWatch()      — call when TITLE screen shown
//    FalconRanking.stopIdleWatch()       — call when game starts
//    FalconRanking.exportCSV()           — download all entries as CSV
//    FalconRanking.clearAll()            — wipe leaderboard (admin)
// ════════════════════════════════════════════════════════════════════

const FalconRanking = (function () {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────────────────
  // Override any value by passing a config object to FalconRanking.init()
  const DEFAULTS = {
    gameName:       'CrowdStrike: Incident Zero',
    storageKey:     'cs_ranking_v1',
    maxEntries:     200,          // max stored entries (oldest pruned)
    idleDelay:      45,           // seconds before attract mode fires
    attractSpeed:   38,           // px/sec scroll speed in attract mode
    topN:           10,           // entries shown in leaderboard
    eventName:      'RSA Conference 2026',
    prizeTiers: [
      { rank:1,  label:'🥇 GRAND PRIZE',    color:'#ffd84d', glow:'#ffd84d', eligible:true  },
      { rank:2,  label:'🥈 RUNNER UP',       color:'#c0c8d8', glow:'#c0c8d8', eligible:true  },
      { rank:3,  label:'🥉 THIRD PLACE',     color:'#cd7f32', glow:'#cd7f32', eligible:true  },
      { rank:10, label:'🏆 FINALIST',        color:'#74ff88', glow:'#74ff88', eligible:true  },
      { rank:999,label:'⭐ PARTICIPANT',     color:'#7f8b96', glow:'#7f8b96', eligible:false },
    ],
    adminKey: 'KeyE',   // Ctrl+Shift+E  →  export CSV
    clearKey: 'KeyR',   // Ctrl+Shift+R  →  clear leaderboard (with confirm)
  };

  let CFG = { ...DEFAULTS };

  // ── STATE ────────────────────────────────────────────────────────────
  let _idleTimer    = null;
  let _attractAF    = null;
  let _matrixAF     = null;
  let _overlayEl    = null;
  let _matrixCanvas = null;
  let _matrixCtx    = null;
  let _pendingEntry = null;   // score data waiting for player info
  let _attractY     = 0;
  let _formOpen     = false;
  let _attractOpen  = false;
  let _initialized  = false;

  // ── STORAGE ──────────────────────────────────────────────────────────
  const Store = {
    load() {
      try { return JSON.parse(localStorage.getItem(CFG.storageKey)) || []; }
      catch { return []; }
    },
    save(entries) {
      try { localStorage.setItem(CFG.storageKey, JSON.stringify(entries)); }
      catch { console.warn('[FalconRanking] localStorage write failed'); }
    },
    add(entry) {
      const entries = Store.load();
      entry.id        = Date.now() + '_' + Math.random().toString(36).slice(2,7);
      entry.timestamp = new Date().toISOString();
      entries.push(entry);
      // Sort descending by score, prune to maxEntries
      entries.sort((a, b) => b.score - a.score);
      if (entries.length > CFG.maxEntries) entries.splice(CFG.maxEntries);
      Store.save(entries);
      // Return rank position (1-indexed)
      return entries.findIndex(e => e.id === entry.id) + 1;
    },
    topN(n) {
      return Store.load().slice(0, n);
    },
    clear() {
      localStorage.removeItem(CFG.storageKey);
    },
  };

  // ── CSV EXPORT ───────────────────────────────────────────────────────
  function exportCSV() {
    const entries = Store.load();
    if (!entries.length) { _toast('No entries to export yet.', '#ff7a00'); return; }

    const headers = [
      'Rank','Name','Company','Email',
      'Score','Phase Reached','Adversary','Grade',
      'Max Streak','Timestamp','Event','Prize Tier'
    ];

    const rows = entries.map((e, i) => {
      const tier = _getPrizeTier(i + 1);
      return [
        i + 1,
        _csvSafe(e.name),
        _csvSafe(e.company),
        _csvSafe(e.email),
        e.score,
        _csvSafe(e.phase),
        _csvSafe(e.adversary || ''),
        _csvSafe(e.grade || ''),
        e.maxStreak || 0,
        new Date(e.timestamp).toLocaleString(),
        _csvSafe(CFG.eventName),
        _csvSafe(tier.label),
      ];
    });

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `falcon_ranking_${CFG.eventName.replace(/\s+/g,'_')}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    _toast('📊 Exported ' + entries.length + ' entries to CSV', '#74ff88');
  }

  function _csvSafe(v) {
    const s = String(v || '').replace(/"/g, '""');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
  }

  function _getPrizeTier(rank) {
    const tiers = [...CFG.prizeTiers].reverse();
    for (const t of tiers) {
      if (rank <= t.rank) return t;
    }
    return CFG.prizeTiers[CFG.prizeTiers.length - 1];
  }

  // ── CSS INJECTION ─────────────────────────────────────────────────────
  function _injectCSS() {
    if (document.getElementById('fr-styles')) return;
    const s = document.createElement('style');
    s.id = 'fr-styles';
    s.textContent = `
      /* ── Registered custom properties for smooth animation ── */
      @property --fr-glow-size {
        syntax: '<length>';
        inherits: false;
        initial-value: 0px;
      }
      @property --fr-scan-pos {
        syntax: '<percentage>';
        inherits: false;
        initial-value: -10%;
      }

      /* ── Base overlay ── */
      #fr-overlay {
        position: fixed; inset: 0; z-index: 9999;
        display: none; align-items: center; justify-content: center;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        overflow: hidden;
      }
      #fr-overlay.fr-visible { display: flex; }

      /* ── Matrix rain canvas behind everything ── */
      #fr-matrix {
        position: absolute; inset: 0;
        opacity: 0.18;
        pointer-events: none;
      }

      /* ── Dark glass backdrop ── */
      .fr-backdrop {
        position: absolute; inset: 0;
        background: radial-gradient(ellipse at 50% 30%,
          rgba(224,0,60,0.08) 0%, rgba(2,4,8,0.94) 65%);
        backdrop-filter: blur(2px);
      }

      /* ── CRT scanlines overlay ── */
      .fr-scanlines {
        position: absolute; inset: 0;
        background: repeating-linear-gradient(
          0deg, transparent, transparent 2px,
          rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px
        );
        pointer-events: none;
        animation: fr-scan 8s linear infinite;
      }
      @keyframes fr-scan {
        0%   { --fr-scan-pos: -10%; }
        100% { --fr-scan-pos: 110%; }
      }

      /* ── Corner grid accent ── */
      .fr-grid {
        position: absolute; inset: 0;
        background-image:
          linear-gradient(rgba(224,0,60,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(224,0,60,0.04) 1px, transparent 1px);
        background-size: 48px 48px;
        pointer-events: none;
      }

      /* ── Toast ── */
      #fr-toast {
        position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
        padding: 10px 24px; border-radius: 4px;
        font: bold 12px/1 monospace; color: #fff;
        background: rgba(0,0,0,0.88); border: 1px solid currentColor;
        opacity: 0; pointer-events: none; z-index: 10001;
        transition: opacity 0.3s;
        white-space: nowrap;
      }
      #fr-toast.fr-show { opacity: 1; }

      /* ════════════════════════════════════════════
         LEAD CAPTURE FORM
         ════════════════════════════════════════════ */
      #fr-form-panel {
        position: relative; z-index: 2;
        width: min(560px, 94vw);
        background: rgba(4,8,12,0.96);
        border: 1px solid rgba(224,0,60,0.6);
        border-radius: 2px;
        padding: 0;
        box-shadow: 0 0 60px rgba(224,0,60,0.18), 0 0 120px rgba(224,0,60,0.08);
        animation: fr-panel-in 0.45s cubic-bezier(0.22,1,0.36,1) both;
        /* overflow must NOT be hidden — rank confirm card uses position:absolute inset:0 */
        overflow: visible;
      }

      @keyframes fr-panel-in {
        from { opacity:0; transform: translateY(32px) scale(0.97); }
        to   { opacity:1; transform: translateY(0)    scale(1);    }
      }

      .fr-form-header {
        background: linear-gradient(135deg, rgba(224,0,60,0.22), rgba(10,14,18,0));
        border-bottom: 1px solid rgba(224,0,60,0.3);
        padding: 22px 28px 18px;
      }
      .fr-form-header .fr-eyebrow {
        font-size: 9px; letter-spacing: 3px; color: #e0003c;
        text-transform: uppercase; margin-bottom: 6px;
      }
      .fr-form-header h2 {
        font-size: 20px; color: #f4f7fa; margin: 0 0 4px;
        line-height: 1.2;
      }
      .fr-form-header .fr-sub {
        font-size: 10px; color: #7f8b96;
      }

      /* Score badge */
      .fr-score-badge {
        display: flex; align-items: center; gap: 14px;
        padding: 14px 28px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .fr-score-num {
        font-size: 36px; font-weight: bold; color: #ffd84d;
        letter-spacing: -1px;
        text-shadow: 0 0 20px rgba(255,216,77,0.5);
        min-width: 120px;
      }
      .fr-score-meta { font-size: 10px; color: #7f8b96; line-height: 1.8; }
      .fr-score-meta strong { color: #d5dde5; }

      /* Prize tier badge */
      .fr-prize {
        display: inline-block;
        padding: 3px 10px; border-radius: 2px;
        font-size: 9px; font-weight: bold; letter-spacing: 1px;
        border: 1px solid currentColor;
        margin-top: 4px;
      }

      /* Form fields */
      .fr-fields { padding: 20px 28px; display: flex; flex-direction: column; gap: 14px; }

      .fr-field { display: flex; flex-direction: column; gap: 5px; }
      .fr-field label {
        font-size: 9px; letter-spacing: 2px; color: #7f8b96;
        text-transform: uppercase;
      }
      .fr-field input {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.10);
        border-radius: 2px; padding: 10px 12px;
        color: #f4f7fa; font: 13px monospace;
        outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        width: 100%; box-sizing: border-box;
        field-sizing: content;
      }
      .fr-field input:focus {
        border-color: rgba(224,0,60,0.7);
        box-shadow: 0 0 0 3px rgba(224,0,60,0.12);
      }
      .fr-field input.fr-error {
        border-color: rgba(255,90,60,0.8);
        box-shadow: 0 0 0 3px rgba(255,90,60,0.12);
        animation: fr-shake 0.35s ease both;
      }
      @keyframes fr-shake {
        0%,100% { transform: translateX(0);  }
        20%,60% { transform: translateX(-6px); }
        40%,80% { transform: translateX(6px); }
      }
      .fr-field .fr-hint {
        font-size: 9px; color: #ff5a4d; min-height: 12px;
        transition: opacity 0.2s;
      }

      /* Buttons */
      .fr-actions {
        padding: 0 28px 24px;
        display: flex; gap: 10px;
      }
      .fr-btn {
        flex: 1; padding: 13px 0;
        border: none; border-radius: 2px;
        font: bold 11px monospace; letter-spacing: 1px;
        cursor: pointer; transition: all 0.18s;
        text-transform: uppercase;
      }
      .fr-btn-primary {
        background: #e0003c; color: #fff;
        box-shadow: 0 0 0 0 rgba(224,0,60,0);
        transition: background 0.18s, box-shadow 0.18s, transform 0.1s;
      }
      .fr-btn-primary:hover {
        background: #ff1a52;
        box-shadow: 0 0 24px rgba(224,0,60,0.5);
        transform: translateY(-1px);
      }
      .fr-btn-primary:active { transform: translateY(0); }
      .fr-btn-secondary {
        background: rgba(255,255,255,0.04);
        color: #7f8b96; border: 1px solid rgba(255,255,255,0.08);
      }
      .fr-btn-secondary:hover {
        background: rgba(255,255,255,0.08); color: #d5dde5;
      }

      /* Consent line */
      .fr-consent {
        padding: 0 28px 20px;
        font-size: 9px; color: #555; line-height: 1.6;
        text-align: center;
      }

      /* Submit success burst overlay */
      #fr-burst-canvas {
        position: absolute; inset: 0;
        pointer-events: none; z-index: 10;
      }

      /* ════════════════════════════════════════════
         ATTRACT / IDLE MODE
         ════════════════════════════════════════════ */
      #fr-attract {
        position: relative; z-index: 2;
        width: min(780px, 96vw);
        height: min(88vh, 600px);
        display: flex; flex-direction: column;
        animation: fr-panel-in 0.6s cubic-bezier(0.22,1,0.36,1) both;
        overflow: hidden;
      }

      /* Attract header */
      .fr-attract-header {
        text-align: center; padding: 22px 0 14px; flex-shrink: 0;
        position: relative;
      }
      .fr-attract-header .fr-cs-logo {
        font-size: 11px; letter-spacing: 4px; color: #e0003c;
        text-transform: uppercase; margin-bottom: 6px;
        animation: fr-pulse-opacity 2s ease-in-out infinite;
      }
      @keyframes fr-pulse-opacity {
        0%,100% { opacity:1; }
        50%      { opacity:0.5; }
      }
      .fr-attract-header h1 {
        font-size: clamp(20px,3vw,28px); color: #fff;
        margin: 0; letter-spacing: -0.5px;
        text-shadow: 0 0 30px rgba(224,0,60,0.6);
      }
      .fr-attract-header .fr-event-name {
        font-size: 10px; color: #7f8b96; margin-top: 4px;
      }

      /* Divider */
      .fr-divider {
        height: 1px; margin: 0 20px;
        background: linear-gradient(90deg,
          transparent, rgba(224,0,60,0.6), rgba(255,216,77,0.4),
          rgba(224,0,60,0.6), transparent);
        flex-shrink: 0;
      }

      /* Scrolling leaderboard viewport */
      .fr-lb-viewport {
        flex: 1; overflow: hidden; position: relative;
        mask-image: linear-gradient(
          to bottom,
          transparent 0%, black 8%,
          black 85%, transparent 100%
        );
      }

      /* The actual scrolling list — duplicated for seamless loop */
      .fr-lb-scroll {
        display: flex; flex-direction: column; gap: 0;
        will-change: transform;
      }

      /* Individual entry row */
      .fr-entry {
        display: grid;
        grid-template-columns: 48px 1fr 140px 110px;
        align-items: center; gap: 0;
        padding: 11px 24px;
        border-bottom: 1px solid rgba(255,255,255,0.04);
        position: relative; overflow: hidden;
        transition: background 0.3s;
      }
      .fr-entry::before {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(90deg,
          var(--fr-entry-color, rgba(224,0,60,0.06)) 0%,
          transparent 40%);
        opacity: 0;
        transition: opacity 0.3s;
      }
      .fr-entry:hover::before { opacity: 1; }

      /* Rank number */
      .fr-rank {
        font-size: 18px; font-weight: bold;
        color: var(--fr-entry-color, #555);
        text-shadow: 0 0 var(--fr-glow-size, 0px) var(--fr-entry-color, transparent);
        line-height: 1;
      }
      /* Top 3 ranks get a crown glow */
      .fr-entry[data-rank="1"] .fr-rank,
      .fr-entry[data-rank="2"] .fr-rank,
      .fr-entry[data-rank="3"] .fr-rank {
        --fr-glow-size: 12px;
        animation: fr-glow-pulse 1.8s ease-in-out infinite;
      }
      @keyframes fr-glow-pulse {
        0%,100% { --fr-glow-size: 8px;  }
        50%      { --fr-glow-size: 22px; }
      }
      .fr-entry[data-rank="1"] {
        background: rgba(255,216,77,0.05);
        border-left: 3px solid #ffd84d;
      }

      /* Player info column */
      .fr-player { min-width: 0; }
      .fr-player-name {
        font-size: 13px; font-weight: bold; color: #f4f7fa;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .fr-player-company {
        font-size: 9px; color: #7f8b96; margin-top: 1px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      /* Score */
      .fr-entry-score {
        font-size: 15px; font-weight: bold; text-align: right;
        color: var(--fr-entry-color, #d5dde5);
        font-variant-numeric: tabular-nums;
      }

      /* Grade badge */
      .fr-entry-grade {
        font-size: 8px; font-weight: bold; letter-spacing: 1px;
        text-align: right; padding-right: 4px;
        color: var(--fr-entry-color, #555);
        opacity: 0.85;
      }

      /* Empty row placeholder */
      .fr-entry-empty {
        color: #2a3a4a; font-size: 11px;
      }
      .fr-entry-empty .fr-rank { color: #2a3a4a; }
      .fr-entry-empty .fr-player-name { color: #2a3a4a; }
      .fr-entry-empty .fr-entry-score { color: #2a3a4a; }

      /* Attract footer */
      .fr-attract-footer {
        flex-shrink: 0; padding: 14px 24px 20px;
        display: flex; align-items: center; justify-content: space-between;
        border-top: 1px solid rgba(255,255,255,0.05);
      }
      .fr-cta {
        font-size: 13px; font-weight: bold; color: #ffd84d;
        animation: fr-blink-cta 1.1s step-end infinite;
        letter-spacing: 1px;
      }
      @keyframes fr-blink-cta {
        0%,49% { opacity:1; }
        50%,100%{ opacity:0; }
      }
      .fr-admin-hint {
        font-size: 8px; color: #2a3a4a; letter-spacing: 1px;
      }

      /* ════════════════════════════════════════════
         LEADERBOARD COLUMN HEADERS
         ════════════════════════════════════════════ */
      .fr-lb-header {
        display: grid;
        grid-template-columns: 48px 1fr 140px 110px;
        padding: 8px 24px;
        border-bottom: 1px solid rgba(224,0,60,0.3);
        flex-shrink: 0;
      }
      .fr-lb-header span {
        font-size: 8px; letter-spacing: 2px; color: #7f8b96;
        text-transform: uppercase;
      }
      .fr-lb-header span:nth-child(3),
      .fr-lb-header span:nth-child(4) { text-align: right; }

      /* ════════════════════════════════════════════
         RANK-UP CONFIRMATION CARD
         ════════════════════════════════════════════ */
      #fr-rank-confirm {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        z-index: 5;
        background: rgba(2,4,8,0.92);
        animation: fr-panel-in 0.5s cubic-bezier(0.22,1,0.36,1) both;
        border-radius: 0;
      }
      .fr-rank-card {
        text-align: center; padding: 32px 48px;
        background: rgba(4,8,12,0.98);
        border: 1px solid var(--fr-confirm-color, #ffd84d);
        box-shadow: 0 0 60px rgba(255,216,77,0.2);
        max-width: 380px;
      }
      .fr-rank-card .fr-rank-pos {
        font-size: 64px; font-weight: bold; line-height: 1;
        color: var(--fr-confirm-color, #ffd84d);
        text-shadow: 0 0 40px var(--fr-confirm-color, #ffd84d);
        animation: fr-glow-pulse 1.5s ease-in-out infinite;
      }
      .fr-rank-card .fr-rank-label {
        font-size: 11px; letter-spacing: 2px;
        color: var(--fr-confirm-color, #ffd84d);
        margin: 8px 0 16px; text-transform: uppercase;
      }
      .fr-rank-card .fr-rank-name {
        font-size: 18px; font-weight: bold; color: #fff;
        margin-bottom: 6px;
      }
      .fr-rank-card .fr-rank-score {
        font-size: 13px; color: #7f8b96;
      }
      .fr-rank-card .fr-rank-prize {
        display: inline-block;
        margin-top: 14px; padding: 6px 16px;
        border: 1px solid var(--fr-confirm-color, #ffd84d);
        font-size: 10px; font-weight: bold; letter-spacing: 1px;
        color: var(--fr-confirm-color, #ffd84d);
        animation: fr-scale-in 0.4s 0.3s cubic-bezier(0.22,1,0.36,1) both;
      }
      .fr-rank-card .fr-rank-dismiss {
        display: block; margin-top: 22px;
        font-size: 9px; color: #444; letter-spacing: 1px;
        animation: fr-pulse-opacity 1.5s ease-in-out infinite 0.5s;
      }
      @keyframes fr-scale-in {
        from { transform: scale(0.8); opacity: 0; }
        to   { transform: scale(1);   opacity: 1; }
      }

      /* ── Responsive ── */
      @media (max-width: 500px) {
        .fr-form-header h2 { font-size: 16px; }
        .fr-score-num      { font-size: 28px; }
        .fr-entry { grid-template-columns: 38px 1fr 100px; }
        .fr-entry-grade { display: none; }
        .fr-lb-header span:last-child { display: none; }
      }
    `;
    document.head.appendChild(s);
  }

  // ── OVERLAY MOUNT ────────────────────────────────────────────────────
  function _mountOverlay() {
    if (_overlayEl) return;
    const el = document.createElement('div');
    el.id = 'fr-overlay';
    el.innerHTML = `
      <canvas id="fr-matrix"></canvas>
      <div class="fr-backdrop"></div>
      <div class="fr-grid"></div>
      <div class="fr-scanlines"></div>
    `;
    document.body.appendChild(el);
    _overlayEl = el;

    // Toast element (outside overlay so it survives panel switches)
    const toast = document.createElement('div');
    toast.id = 'fr-toast';
    document.body.appendChild(toast);

    // Admin keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.shiftKey && e.code === CFG.adminKey) exportCSV();
      if (e.ctrlKey && e.shiftKey && e.code === CFG.clearKey) {
        if (confirm('[FalconRanking] Clear ALL leaderboard entries? This cannot be undone.')) {
          Store.clear(); _toast('Leaderboard cleared.','#ff5a4d');
        }
      }
    });
  }

  function _showOverlay()  { _overlayEl.classList.add('fr-visible');    _startMatrix(); }
  function _hideOverlay()  { _overlayEl.classList.remove('fr-visible'); _stopMatrix();  }
  function _clearContent() {
    // Remove any previously injected panels
    ['fr-form-panel','fr-attract','fr-burst-canvas'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
  }

  // ── MATRIX RAIN ──────────────────────────────────────────────────────
  function _startMatrix() {
    _matrixCanvas = document.getElementById('fr-matrix');
    if (!_matrixCanvas) return;
    _matrixCanvas.width  = window.innerWidth;
    _matrixCanvas.height = window.innerHeight;
    _matrixCtx = _matrixCanvas.getContext('2d');

    const cols   = Math.floor(_matrixCanvas.width / 16);
    const drops  = Array(cols).fill(1);
    const chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&<>{}[]FALCON';

    function step() {
      _matrixCtx.fillStyle = 'rgba(2,4,8,0.14)';
      _matrixCtx.fillRect(0, 0, _matrixCanvas.width, _matrixCanvas.height);
      for (let i = 0; i < drops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        const bright = Math.random() > 0.92;
        _matrixCtx.fillStyle = bright ? '#ffffff' : (Math.random()>0.5?'#e0003c':'#42d9ff');
        _matrixCtx.font = `${bright?'bold ':''}13px monospace`;
        _matrixCtx.fillText(ch, i * 16, drops[i] * 16);
        if (drops[i] * 16 > _matrixCanvas.height && Math.random() > 0.975)
          drops[i] = 0;
        drops[i]++;
      }
      _matrixAF = requestAnimationFrame(step);
    }
    _stopMatrix();
    step();
  }

  function _stopMatrix() {
    if (_matrixAF) { cancelAnimationFrame(_matrixAF); _matrixAF = null; }
    if (_matrixCtx && _matrixCanvas)
      _matrixCtx.clearRect(0, 0, _matrixCanvas.width, _matrixCanvas.height);
  }

  // ── PARTICLE BURST (form submit celebration) ──────────────────────────
  function _burstParticles(panel) {
    let canvas = document.getElementById('fr-burst-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'fr-burst-canvas';
      panel.appendChild(canvas);
    }
    canvas.width  = panel.offsetWidth;
    canvas.height = panel.offsetHeight;
    const ctx = canvas.getContext('2d');
    const cx  = canvas.width / 2, cy = canvas.height * 0.35;
    const particles = Array.from({ length: 80 }, () => {
      const a = Math.random() * Math.PI * 2;
      const s = 60 + Math.random() * 140;
      return {
        x: cx, y: cy, vx: Math.cos(a)*s, vy: Math.sin(a)*s,
        life: 0.6 + Math.random()*0.5, max: 1,
        col: ['#ffd84d','#e0003c','#74ff88','#42d9ff','#fff'][Math.floor(Math.random()*5)],
        sz: 2 + Math.random() * 4,
      };
    });
    let last = 0;
    function step(ts) {
      const dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 180 * dt; p.life -= dt;
        if (p.life <= 0) continue; alive = true;
        ctx.globalAlpha = p.life / p.max;
        ctx.fillStyle   = p.col;
        ctx.fillRect(p.x - p.sz/2, p.y - p.sz/2, p.sz, p.sz);
      }
      ctx.globalAlpha = 1;
      if (alive) requestAnimationFrame(step);
      else canvas.remove();
    }
    requestAnimationFrame(step);
  }

  // ── TOAST ────────────────────────────────────────────────────────────
  let _toastTimer = null;
  function _toast(msg, color = '#74ff88') {
    const el = document.getElementById('fr-toast');
    if (!el) return;
    el.textContent = msg;
    el.style.borderColor = color;
    el.style.color = color;
    el.classList.add('fr-show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => el.classList.remove('fr-show'), 2800);
  }

  // ── SCORE COUNTER ANIMATION ───────────────────────────────────────────
  function _animateCounter(el, target, duration = 1200) {
    const start = performance.now();
    function step(now) {
      const p = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ── LEAD CAPTURE FORM ────────────────────────────────────────────────
  function showForm(data) {
    if (_formOpen) return;
    _formOpen = true;
    _clearContent();
    _showOverlay();

    const entries  = Store.load();
    const tempRank = entries.filter(e => e.score >= data.score).length + 1;
    const tier     = _getPrizeTier(tempRank);

    const panel = document.createElement('div');
    panel.id = 'fr-form-panel';
    panel.innerHTML = `
      <div class="fr-form-header">
        <div class="fr-eyebrow">◈ ${_esc(CFG.gameName)}  ·  ${_esc(CFG.eventName)}</div>
        <h2>Enter the leaderboard</h2>
        <div class="fr-sub">Your score has been recorded. Register to claim your rank.</div>
      </div>
      <div class="fr-score-badge">
        <div class="fr-score-num" id="fr-score-display">0</div>
        <div class="fr-score-meta">
          <div><strong>Phase:</strong> ${_esc(data.phase||'Unknown')}</div>
          <div><strong>Adversary:</strong> ${_esc(data.adversary||'—')}</div>
          <div><strong>Grade:</strong> ${_esc(data.grade||'—')}</div>
          <div><strong>Projected rank:</strong> #${tempRank}</div>
          <span class="fr-prize" style="color:${tier.color};border-color:${tier.color}">
            ${_esc(tier.label)}
          </span>
        </div>
      </div>
      <div class="fr-fields">
        <div class="fr-field">
          <label>Agent Name *</label>
          <input id="fr-name" type="text" placeholder="Your full name"
                 autocomplete="name" maxlength="60"/>
          <span class="fr-hint" id="fr-name-hint"></span>
        </div>
        <div class="fr-field">
          <label>Company *</label>
          <input id="fr-company" type="text" placeholder="Your organisation"
                 autocomplete="organization" maxlength="80"/>
          <span class="fr-hint" id="fr-company-hint"></span>
        </div>
        <div class="fr-field">
          <label>Work Email *</label>
          <input id="fr-email" type="email" placeholder="name@company.com"
                 autocomplete="email" maxlength="100"/>
          <span class="fr-hint" id="fr-email-hint"></span>
        </div>
      </div>
      <div class="fr-actions">
        <button class="fr-btn fr-btn-primary" id="fr-submit">
          SUBMIT &amp; CLAIM RANK
        </button>
        <button class="fr-btn fr-btn-secondary" id="fr-skip">
          Skip
        </button>
      </div>
      <div class="fr-consent">
        By submitting you agree CrowdStrike may contact you regarding
        this event and relevant security products. Prize eligibility
        requires valid work email.
      </div>
    `;
    _overlayEl.appendChild(panel);

    // Animate score counter
    const scoreEl = document.getElementById('fr-score-display');
    setTimeout(() => _animateCounter(scoreEl, data.score, 1400), 200);

    // Focus first field
    setTimeout(() => document.getElementById('fr-name')?.focus(), 450);

    // Submit
    document.getElementById('fr-submit').addEventListener('click', () => {
      const name    = document.getElementById('fr-name').value.trim();
      const company = document.getElementById('fr-company').value.trim();
      const email   = document.getElementById('fr-email').value.trim();
      let ok = true;

      if (!name)    { _fieldError('fr-name',    'fr-name-hint',    'Name is required');    ok=false; }
      if (!company) { _fieldError('fr-company', 'fr-company-hint', 'Company is required'); ok=false; }
      if (!email || !_validEmail(email)) {
        _fieldError('fr-email', 'fr-email-hint', 'Valid work email required'); ok=false;
      }
      if (!ok) return;

      // Save entry
      const entry = {
        name, company, email,
        score:     data.score,
        phase:     data.phase     || '',
        adversary: data.adversary || '',
        grade:     data.grade     || '',
        maxStreak: data.maxStreak || 0,
        lives:     data.lives     || 0,
        gameId:    CFG.gameName,
        event:     CFG.eventName,
      };
      const finalRank = Store.add(entry);

      // Particle celebration
      _burstParticles(panel);

      // Disable inputs
      panel.querySelectorAll('input,button').forEach(el => el.disabled = true);

      // Show rank confirmation card after a short delay
      setTimeout(() => _showRankConfirm(panel, finalRank, name, data.score), 700);
    });

    // Skip
    document.getElementById('fr-skip').addEventListener('click', () => {
      _closeForm();
    });
  }

  function _fieldError(inputId, hintId, msg) {
    const inp  = document.getElementById(inputId);
    const hint = document.getElementById(hintId);
    if (inp)  { inp.classList.add('fr-error'); setTimeout(()=>inp.classList.remove('fr-error'),500); }
    if (hint) hint.textContent = msg;
  }

  function _validEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
  }

  function _showRankConfirm(panel, rank, name, score) {
    const tier = _getPrizeTier(rank);
    const div  = document.createElement('div');
    div.id = 'fr-rank-confirm';
    div.style.setProperty('--fr-confirm-color', tier.color);
    div.innerHTML = `
      <div class="fr-rank-card">
        <div class="fr-rank-pos">#${rank}</div>
        <div class="fr-rank-label">Your Rank</div>
        <div class="fr-rank-name">${_esc(name)}</div>
        <div class="fr-rank-score">${score.toLocaleString()} pts</div>
        <div class="fr-rank-prize">${_esc(tier.label)}</div>
        <span class="fr-rank-dismiss">Press any key or tap to continue</span>
      </div>
    `;
    panel.appendChild(div);

    const dismiss = () => { _closeForm(); div.removeEventListener('click',dismiss); };
    div.addEventListener('click', dismiss);
    const kd = () => { _closeForm(); document.removeEventListener('keydown',kd); };
    document.addEventListener('keydown', kd);
  }

  function _closeForm() {
    _formOpen = false;
    _clearContent();
    _hideOverlay();
    if (CFG.onFormClose) CFG.onFormClose();
  }

  // ── ATTRACT / IDLE MODE ───────────────────────────────────────────────
  function showAttract() {
    if (_formOpen || _attractOpen) return;
    _attractOpen = true;
    _clearContent();
    _showOverlay();

    const top     = Store.topN(CFG.topN);
    const isEmpty = top.length === 0;

    const attract = document.createElement('div');
    attract.id = 'fr-attract';
    attract.innerHTML = `
      <div class="fr-attract-header">
        <div class="fr-cs-logo">◈ CrowdStrike</div>
        <h1>${_esc(CFG.gameName)}</h1>
        <div class="fr-event-name">${_esc(CFG.eventName)}
          ${isEmpty ? ' — Be the first on the board!' : '— Top Agents'}
        </div>
      </div>
      <div class="fr-divider"></div>
      <div class="fr-lb-header">
        <span>Rank</span>
        <span>Agent</span>
        <span style="text-align:right">Score</span>
        <span style="text-align:right">Grade</span>
      </div>
      <div class="fr-lb-viewport" id="fr-lb-viewport">
        <div class="fr-lb-scroll" id="fr-lb-scroll">
          ${_renderEntries(top)}
          ${_renderEntries(top)}
        </div>
      </div>
      <div class="fr-divider"></div>
      <div class="fr-attract-footer">
        <span class="fr-cta">▶ PRESS ANY KEY TO PLAY</span>
        <span class="fr-admin-hint">Ctrl+Shift+E export  ·  Ctrl+Shift+R clear</span>
      </div>
    `;
    _overlayEl.appendChild(attract);

    // Start scroll animation
    _attractY = 0;
    const scrollEl    = document.getElementById('fr-lb-scroll');
    const viewportEl  = document.getElementById('fr-lb-viewport');
    let lastT = 0;
    const half = scrollEl.scrollHeight / 2;

    function scrollStep(ts) {
      const dt = Math.min(0.05, (ts - lastT) / 1000 || 0.016);
      lastT = ts;
      if (!isEmpty) {
        _attractY += CFG.attractSpeed * dt;
        if (_attractY >= half) _attractY = 0;
        scrollEl.style.transform = `translateY(${-_attractY}px)`;
      }
      _attractAF = requestAnimationFrame(scrollStep);
    }
    _attractAF = requestAnimationFrame(scrollStep);

    // Dismiss on any key or click
    const dismiss = () => _closeAttract();
    const kd = (e) => {
      // Don't dismiss on modifier keys alone
      if (['Control','Shift','Alt','Meta'].includes(e.key)) return;
      _closeAttract();
      document.removeEventListener('keydown', kd);
    };
    document.addEventListener('keydown', kd);
    attract.addEventListener('click', dismiss);
  }

  function _renderEntries(entries) {
    if (!entries.length) {
      // 10 ghost placeholder rows
      return Array.from({length:10},(_,i)=>`
        <div class="fr-entry fr-entry-empty" data-rank="${i+1}"
             style="--fr-entry-color:#1a2a3a">
          <div class="fr-rank">${i+1}</div>
          <div class="fr-player">
            <div class="fr-player-name">———</div>
            <div class="fr-player-company">Be the first</div>
          </div>
          <div class="fr-entry-score">—</div>
          <div class="fr-entry-grade">—</div>
        </div>
      `).join('');
    }
    return entries.map((e, i) => {
      const rank = i + 1;
      const tier = _getPrizeTier(rank);
      return `
        <div class="fr-entry" data-rank="${rank}"
             style="--fr-entry-color:${tier.color}">
          <div class="fr-rank">${rank}</div>
          <div class="fr-player">
            <div class="fr-player-name">${_esc(e.name)}</div>
            <div class="fr-player-company">${_esc(e.company)}</div>
          </div>
          <div class="fr-entry-score">${Number(e.score).toLocaleString()}</div>
          <div class="fr-entry-grade">${_esc(e.grade||'—')}</div>
        </div>
      `;
    }).join('');
  }

  function _closeAttract() {
    _attractOpen = false;
    if (_attractAF) { cancelAnimationFrame(_attractAF); _attractAF = null; }
    _clearContent();
    _hideOverlay();
    if (CFG.onAttractClose) CFG.onAttractClose();
  }

  // ── IDLE DETECTION ────────────────────────────────────────────────────
  let _idleKeyListener = null;

  function startIdleWatch() {
    stopIdleWatch();
    _idleTimer = setTimeout(() => {
      if (!_formOpen && !_attractOpen) showAttract();
    }, CFG.idleDelay * 1000);
    // Reset the countdown whenever the user presses any key —
    // attract fires only after TRUE inactivity, not just X seconds from init.
    _idleKeyListener = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag==='INPUT'||tag==='TEXTAREA') return; // typing in form = not idle
      if (_idleTimer) startIdleWatch(); // restart the countdown
    };
    document.addEventListener('keydown', _idleKeyListener);
  }

  function stopIdleWatch() {
    if (_idleTimer){ clearTimeout(_idleTimer); _idleTimer=null; }
    if (_idleKeyListener){
      document.removeEventListener('keydown', _idleKeyListener);
      _idleKeyListener=null;
    }
  }


  // ── HELPERS ───────────────────────────────────────────────────────────
  function _esc(str) {
    return String(str||'')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── PUBLIC API ────────────────────────────────────────────────────────
  return {
    /**
     * Call once at game boot.
     * config: partial override of DEFAULTS (all optional)
     * config.onFormClose  — callback fired when form is dismissed
     * config.onAttractClose — callback fired when attract screen dismissed
     */
    init(config = {}) {
      if (_initialized) return;
      CFG = { ...DEFAULTS, ...config };
      _injectCSS();
      _mountOverlay();
      _initialized = true;
    },

    /**
     * Call when the game ends (GAME_OVER or WIN state).
     * data = { score, phase, adversary, grade, maxStreak, lives }
     */
    onGameEnd(data) {
      stopIdleWatch();
      showForm(data);
    },

    /**
     * Call once when the TITLE screen becomes active.
     * Starts a countdown — if no key pressed within idleDelay seconds,
     * attract mode fires automatically.
     */
    startIdleWatch,
    stopIdleWatch,

    /** Show the attract/leaderboard screen immediately (e.g. admin button). */
    showAttract,

    /** Download all entries as a CSV file. */
    exportCSV,

    /** Clear the leaderboard (shows confirmation dialog). */
    clearAll() {
      if (confirm('[FalconRanking] Clear all entries?')) {
        Store.clear(); _toast('Leaderboard cleared.','#ff5a4d');
      }
    },

    /** Returns all stored entries sorted by score. */
    getEntries() { return Store.load(); },
  };
})();
