// ═══════════════════════════════════════════════════════════════════
//  🚀  SPACE INVADERS — ARCADE ULTRA V2  |  CrowdStrike 2026
// ═══════════════════════════════════════════════════════════════════
"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx    = canvas.getContext("2d", { alpha: false });
canvas.width  = 800;
canvas.height = 600;

// Make canvas crisp on HiDPI
const DPR = window.devicePixelRatio || 1;
canvas.style.width  = canvas.width  + "px";
canvas.style.height = canvas.height + "px";

// ─── PALETTE ─────────────────────────────────────────────────────────
const PAL = Object.freeze({
  BG       : "#03000F",
  NEON_CYAN: "#00FFFF",
  NEON_PINK: "#FF00CC",
  NEON_YEL : "#FFE600",
  NEON_ORG : "#FF6A00",
  NEON_GRN : "#39FF14",
  NEON_RED : "#FF1744",
  WHITE    : "#FFFFFF",
  DIM      : "rgba(0,0,0,0.55)",
});

// ─── GAME STATES ─────────────────────────────────────────────────────
const STATE = Object.freeze({
  TITLE        : "TITLE",
  WAVE_BANNER  : "WAVE_BANNER",
  PLAYING      : "PLAYING",
  BOSS_WARNING : "BOSS_WARNING",
  BOSS         : "BOSS",
  LEVEL_CLEAR  : "LEVEL_CLEAR",
  GAME_OVER    : "GAME_OVER",
  YOU_WIN      : "YOU_WIN",
});

// ─── CONFIG ──────────────────────────────────────────────────────────
const CFG = Object.freeze({
  // Grid
  COLS: 8, ROWS: 3,
  ATK_W: 38, ATK_H: 28,
  ATK_SX: 28, ATK_SY: 26,

  // Player
  PLR_W: 44, PLR_H: 22,
  PLR_SPEED: 230,
  PLR_START_LIVES: 3,

  // Bullets
  BLT_W: 3, BLT_H: 12,
  PLR_BLT_SPEED: 460,
  ATK_BLT_SPEED: 190,
  MAX_ATK_BLTS : 5,

  // Blocks
  BLK_W: 48, BLK_H: 16,
  BLK_COLS: 6, BLK_STRENGTH: 4,

  // UFO
  UFO_W: 52, UFO_H: 22,
  UFO_SPEED: 110,
  UFO_INTERVAL: 18000,   // ms between spawns

  // Boss
  BOSS_W: 100, BOSS_H: 56,
  BOSS_SPEED_BASE: 90,
  BOSS_HP_BASE: 15,

  // Timing
  COMBO_WINDOW: 2800,    // ms to keep combo alive
  HIT_PAUSE_MS: 600,
  WAVE_BANNER_MS: 2200,
  LEVEL_CLEAR_MS: 2600,
  BOSS_WARN_MS  : 2400,

  // Scoring
  SCORE_ROW     : [50, 100, 150],   // by attacker row
  SCORE_UFO     : [100,150,200,250,300],
  SCORE_BOSS    : 2000,
  POWERUP_CHANCE: 0.14,             // 14% drop rate
  IMAGE_COUNT   : 15,
  TOTAL_WAVES   : 5,
});

// ─── ASSET MANAGER ───────────────────────────────────────────────────
class AssetManager {
  #cache = new Map();

  loadImage(key, src) {
    return new Promise((res, rej) => {
      const img  = new Image();
      img.onload  = () => { this.#cache.set(key, img); res(img); };
      img.onerror = () => { console.warn(`Missing: ${src}`); res(null); };
      img.src     = src;
    });
  }

  async loadAll(manifest) {
    await Promise.all(manifest.map(m => this.loadImage(m.key, m.src)));
  }

  get(key) { return this.#cache.get(key) ?? null; }
}

// ─── OBJECT POOL ─────────────────────────────────────────────────────
class Pool {
  #free = []; #factory;
  constructor(factory, n = 40) {
    this.#factory = factory;
    for (let i = 0; i < n; i++) this.#free.push(factory());
  }
  acquire(props) {
    return Object.assign(this.#free.pop() ?? this.#factory(), props);
  }
  release(o) { this.#free.push(o); }
}

// ─── AUDIO ENGINE ────────────────────────────────────────────────────
class AudioEngine {
  #ac; #bgmNodes = []; #bgmRunning = false;

  constructor() {
    this.#ac = new (window.AudioContext || window.webkitAudioContext)();
  }

  #resume() { if (this.#ac.state !== "running") this.#ac.resume(); }

  #tone({ type = "square", f0, f1, dur, gain = 0.25, filt = null, detune = 0 }) {
    this.#resume();
    const ac = this.#ac;
    const osc = ac.createOscillator();
    const g   = ac.createGain();
    osc.type  = type;
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(f0, ac.currentTime);
    if (f1) osc.frequency.exponentialRampToValueAtTime(f1, ac.currentTime + dur);

    g.gain.setValueAtTime(0, ac.currentTime);
    g.gain.linearRampToValueAtTime(gain, ac.currentTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);

    if (filt) {
      const fl = ac.createBiquadFilter();
      fl.type  = "lowpass"; fl.frequency.value = filt;
      osc.connect(fl); fl.connect(g);
    } else { osc.connect(g); }

    g.connect(ac.destination);
    osc.start(); osc.stop(ac.currentTime + dur);
  }

  laser()      { this.#tone({ type:"sawtooth", f0:900, f1:200, dur:0.13, gain:0.22 }); }

  explosion()  {
    this.#tone({ type:"square",  f0:280, f1:30, dur:0.45, gain:0.35, filt:600 });
    setTimeout(() => this.#tone({ type:"sawtooth", f0:140, f1:20, dur:0.3, gain:0.2 }), 80);
  }

  playerHit()  {
    this.#tone({ type:"triangle", f0:500, f1:80, dur:0.55, gain:0.3 });
    this.#tone({ type:"sawtooth", f0:300, f1:60, dur:0.4,  gain:0.15, detune:10 });
  }

  powerUp()    {
    [0,100,200].forEach((d,i) =>
      setTimeout(() =>
        this.#tone({ type:"sine", f0:440+i*220, dur:0.15, gain:0.25 }), d));
  }

  nukeBlast()  {
    [0,60,140,250].forEach((d) =>
      setTimeout(() =>
        this.#tone({ type:"square", f0:80, f1:20, dur:0.6, gain:0.4, filt:400 }), d));
  }

  ufoBeep()    { this.#tone({ type:"sine", f0:660, f1:330, dur:0.08, gain:0.15 }); }

  levelUp()    {
    [0,120,240,380].forEach((d,i) =>
      setTimeout(() =>
        this.#tone({ type:"square", f0:220*Math.pow(1.5,i), dur:0.18, gain:0.2 }), d));
  }

  bossRoar()   {
    this.#tone({ type:"sawtooth", f0:60, f1:20, dur:1.0, gain:0.5, filt:300 });
    this.#tone({ type:"square",   f0:80, f1:30, dur:0.8, gain:0.3, detune:25 });
  }

  // Chiptune sequencer BGM
  startBGM() {
    if (this.#bgmRunning) return;
    this.#bgmRunning = true;
    this.#resume();
    const ac    = this.#ac;
    const notes = [110,138,165,138,110,82,110,82]; // minor riff
    const bpm   = 140;
    const step  = 60 / bpm;
    let beat    = 0;

    const tick = () => {
      if (!this.#bgmRunning) return;
      const freq = notes[beat % notes.length];
      const osc  = ac.createOscillator();
      const g    = ac.createGain();
      const now  = ac.currentTime;
      osc.type   = "square";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.06, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + step * 0.6);
      osc.connect(g); g.connect(ac.destination);
      osc.start(); osc.stop(now + step * 0.6);
      beat++;
      setTimeout(tick, step * 1000);
    };
    tick();
  }

  stopBGM() { this.#bgmRunning = false; }
}

// ─── PARTICLE SYSTEM ─────────────────────────────────────────────────
class Particles {
  #list = [];
  #pool = new Pool(() =>
    ({ x:0,y:0,vx:0,vy:0,life:0,maxLife:1,r:255,g:255,b:255,size:3,trail:false,alpha:1 })
  , 300);

  burst(x, y, n = 22, palette, opts = {}) {
    for (let i = 0; i < n; i++) {
      const ang   = Math.random() * Math.PI * 2;
      const spd   = (opts.minSpd ?? 40) + Math.random() * (opts.maxSpd ?? 180);
      const col   = palette[Math.floor(Math.random() * palette.length)];
      this.#list.push(this.#pool.acquire({
        x, y,
        vx      : Math.cos(ang) * spd,
        vy      : Math.sin(ang) * spd,
        life    : 0,
        maxLife : (opts.life ?? 0.4) + Math.random() * (opts.lifeVar ?? 0.3),
        r: col[0], g: col[1], b: col[2],
        size    : (opts.size ?? 2) + Math.random() * (opts.sizeVar ?? 3),
        trail   : opts.trail ?? false,
      }));
    }
  }

  explosion(x, y) {
    this.burst(x, y, 30,
      [[255,120,0],[255,200,0],[255,50,0],[255,255,200]], { maxSpd:200, life:0.5 });
    this.burst(x, y, 12,
      [[255,255,255]], { minSpd:80, maxSpd:120, size:1, sizeVar:1, life:0.2 });
  }

  playerExplosion(x, y) {
    this.burst(x, y, 35,
      [[0,180,255],[0,120,255],[200,240,255],[255,255,255]], { maxSpd:220, life:0.6 });
  }

  bossExplosion(x, y) {
    for (let i = 0; i < 6; i++)
      setTimeout(() => {
        const ox = (Math.random()-0.5)*80, oy = (Math.random()-0.5)*40;
        this.explosion(x+ox, y+oy);
      }, i*100);
  }

  powerUpPop(x, y, type) {
    const cols = {
      SHIELD : [[0,200,255],[0,150,255],[200,230,255]],
      TRIPLE : [[255,220,0],[255,180,0],[255,255,100]],
      NUKE   : [[255,50,50],[255,0,0],[255,200,0]],
    };
    this.burst(x, y, 20, cols[type] ?? cols.SHIELD,
      { maxSpd:140, life:0.5, trail:true });
  }

  update(dt) {
    for (let i = this.#list.length - 1; i >= 0; i--) {
      const p = this.#list[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.#pool.release(p); this.#list.splice(i,1); continue;
      }
      p.x  += p.vx * dt;
      p.y  += p.vy * dt;
      p.vy += 90 * dt;
      p.vx *= 0.98;
    }
  }

  draw(ctx) {
    for (const p of this.#list) {
      const t = 1 - p.life / p.maxLife;
      ctx.globalAlpha = t * 0.9;
      ctx.fillStyle   = `rgb(${p.r},${p.g},${p.b})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.size * t), 0, Math.PI*2);
      ctx.fill();
      if (p.trail) {
        ctx.globalAlpha = t * 0.35;
        ctx.fillRect(p.x - 1, p.y, 2, p.size * 3 * t);
      }
    }
    ctx.globalAlpha = 1;
  }
}

// ─── FLOATING TEXT ───────────────────────────────────────────────────
class FloatingText {
  #list = [];

  spawn(x, y, text, color = "#FFE600", size = 20) {
    this.#list.push({ x, y, vy:-55, life:0, maxLife:1.1, text, color, size });
  }

  update(dt) {
    for (let i = this.#list.length - 1; i >= 0; i--) {
      const f = this.#list[i];
      f.life += dt; f.y += f.vy * dt; f.vy += 20 * dt;
      if (f.life > f.maxLife) this.#list.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const f of this.#list) {
      const t = 1 - f.life / f.maxLife;
      ctx.globalAlpha  = Math.min(1, t * 1.8);
      ctx.font         = `bold ${f.size}px 'Courier New', monospace`;
      ctx.textAlign    = "center";
      ctx.fillStyle    = f.color;
      ctx.shadowColor  = f.color;
      ctx.shadowBlur   = 10;
      ctx.fillText(f.text, f.x, f.y);
      ctx.shadowBlur   = 0;
    }
    ctx.globalAlpha = 1; ctx.textAlign = "left";
  }
}

// ─── SCREEN FX ───────────────────────────────────────────────────────
class ScreenFX {
  #shake   = { trauma:0, ox:0, oy:0 };
  #flash   = { alpha:0, r:255, g:255, b:255 };
  #chroma  = 0;
  #scanOff = 0;
  #warpPts = [];  // star-warp particles

  shake(amount) { this.#shake.trauma = Math.min(1, this.#shake.trauma + amount); }
  flash(r=255, g=255, b=255, a=0.7) { Object.assign(this.#flash,{r,g,b,alpha:a}); }
  chroma(v=0.02) { this.#chroma = v; }

  startWarp(w, h) {
    this.#warpPts = Array.from({length:80}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      vx:(Math.random()-0.5)*800, vy:(Math.random()-0.5)*800,
      life:0, maxLife:0.6+Math.random()*0.4
    }));
  }

  update(dt) {
    this.#shake.trauma = Math.max(0, this.#shake.trauma - dt*2.2);
    const s = this.#shake.trauma**2;
    this.#shake.ox = (Math.random()*2-1)*s*14;
    this.#shake.oy = (Math.random()*2-1)*s*14;
    this.#flash.alpha = Math.max(0, this.#flash.alpha - dt*3);
    this.#chroma      = Math.max(0, this.#chroma - dt*0.15);
    this.#scanOff     = (this.#scanOff + dt*40) % 4;
    for (let i=this.#warpPts.length-1; i>=0; i--) {
      const p = this.#warpPts[i];
      p.life += dt; p.x += p.vx*dt; p.y += p.vy*dt;
      if (p.life>p.maxLife) this.#warpPts.splice(i,1);
    }
  }

  applyShake(ctx)   { ctx.save(); ctx.translate(this.#shake.ox, this.#shake.oy); }
  restoreShake(ctx) { ctx.restore(); }

  drawPostFX(ctx, w, h) {
    // Screen flash
    if (this.#flash.alpha > 0.01) {
      ctx.globalAlpha = this.#flash.alpha;
      ctx.fillStyle   = `rgb(${this.#flash.r},${this.#flash.g},${this.#flash.b})`;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }

    // CRT scanlines
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    for (let y = (this.#scanOff|0); y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }

    // Vignette
    const vig = ctx.createRadialGradient(w/2,h/2,h*0.3, w/2,h/2,h*0.85);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,30,0.65)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    // Star warp
    if (this.#warpPts.length > 0) {
      for (const p of this.#warpPts) {
        const t = 1 - p.life/p.maxLife;
        ctx.globalAlpha = t*0.9;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx*0.03, p.y - p.vy*0.03);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  get chromaAmount() { return this.#chroma; }
}

// ─── STARFIELD ───────────────────────────────────────────────────────
class Starfield {
  #layers;
  constructor(w, h) {
    this.#layers = [
      this.#make(100, w, h, 0.4, 1, "rgba(255,255,255,0.35)"),
      this.#make( 55, w, h, 1.1, 1.5,"rgba(255,255,255,0.55)"),
      this.#make( 20, w, h, 2.8, 2,  "rgba(180,220,255,0.8)"),
    ];
  }
  #make(n, w, h, spd, sz, col) {
    return { spd, sz, col, w, h,
      stars: Array.from({length:n}, () =>
        ({ x:Math.random()*w, y:Math.random()*h })) };
  }
  update(dt) {
    for (const l of this.#layers)
      for (const s of l.stars) {
        s.y += l.spd * dt * 60;
        if (s.y > l.h) { s.y=0; s.x=Math.random()*l.w; }
      }
  }
  draw(ctx) {
    for (const l of this.#layers) {
      ctx.fillStyle = l.col;
      for (const s of l.stars) ctx.fillRect(s.x, s.y, l.sz, l.sz);
    }
  }
}

// ─── INPUT ───────────────────────────────────────────────────────────
class Input {
  #down = new Set(); #pressed = new Set();
  constructor() {
    window.addEventListener("keydown", e => {
      if (!this.#down.has(e.key)) this.#pressed.add(e.key);
      this.#down.add(e.key);
      if ([" ","ArrowLeft","ArrowRight","ArrowUp","ArrowDown"]
          .includes(e.key)) e.preventDefault();
    });
    window.addEventListener("keyup", e => this.#down.delete(e.key));
  }
  isDown(k)    { return this.#down.has(k); }
  consume(k)   {
    const had = this.#pressed.has(k) || this.#down.has(k);
    this.#pressed.delete(k);
    return had;
  }
  flushPressed() { this.#pressed.clear(); }
}

// ─── HUD ─────────────────────────────────────────────────────────────
class HUD {
  #score = 0; #hi = 0; #lives = 3; #wave = 1;
  #combo = 1; #shield = false; #triple = false; #gun = false;

  setState(score, hi, lives, wave, combo, shield, triple) {
    this.#score  = score;  this.#hi    = hi;
    this.#lives  = lives;  this.#wave  = wave;
    this.#combo  = combo;  this.#shield = shield;
    this.#triple = triple;
  }

  draw(ctx, w, _h) {
    this.#neon(ctx);

    // Score
    this.#label(ctx, `⭐ ${this.#score.toLocaleString()}`,
      10, 28, 20, PAL.NEON_YEL);

    // Hi-score
    this.#label(ctx, `🏆 ${this.#hi.toLocaleString()}`,
      w/2, 28, 16, PAL.NEON_CYAN, "center");

    // Lives
    const hearts = "❤️".repeat(Math.max(0,this.#lives)) || "💀";
    this.#label(ctx, hearts, w-12, 28, 18, PAL.NEON_PINK, "right");

    // Wave badge
    const wc = `WAVE ${this.#wave}`;
    ctx.save();
    ctx.font      = "bold 13px 'Courier New'";
    ctx.textAlign = "right";
    ctx.fillStyle = PAL.NEON_GRN;
    ctx.shadowColor= PAL.NEON_GRN; ctx.shadowBlur = 8;
    ctx.fillText(wc, w-12, 50);
    ctx.restore();

    // Combo badge
    if (this.#combo > 1) {
      const grad = ctx.createLinearGradient(10,50,90,50);
      grad.addColorStop(0, PAL.NEON_ORG);
      grad.addColorStop(1, PAL.NEON_PINK);
      this.#label(ctx, `🔥 x${this.#combo} COMBO`, 10, 52, 15, grad);
    }

    // Power-up indicators
    let px = 10;
    if (this.#shield) {
      this.#badge(ctx, "🛡️ SHIELD", px, 68, PAL.NEON_CYAN);
      px += 100;
    }
    if (this.#triple) {
      this.#badge(ctx, "🔱 TRIPLE", px, 68, PAL.NEON_YEL);
    }

    ctx.shadowBlur = 0;
  }

  #neon(ctx) {
    ctx.font      = "bold 18px 'Courier New', monospace";
    ctx.textAlign = "left";
  }

  #label(ctx, txt, x, y, sz, col, align = "left") {
    ctx.save();
    ctx.font      = `bold ${sz}px 'Courier New', monospace`;
    ctx.textAlign = align;
    if (typeof col === "string") {
      ctx.fillStyle  = col;
      ctx.shadowColor= col;
    } else {
      ctx.fillStyle  = col;
    }
    ctx.shadowBlur = 12;
    ctx.fillText(txt, x, y);
    ctx.restore();
  }

  #badge(ctx, txt, x, y, col) {
    ctx.save();
    ctx.font        = "bold 12px 'Courier New'";
    ctx.textAlign   = "left";
    ctx.fillStyle   = col;
    ctx.shadowColor = col; ctx.shadowBlur = 8;
    ctx.fillText(txt, x, y);
    ctx.restore();
  }
}

// ─── BLOCK ───────────────────────────────────────────────────────────
class Block {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = CFG.BLK_W; this.h = CFG.BLK_H;
    this.strength = CFG.BLK_STRENGTH;
  }
  hit()    { this.strength = Math.max(0, this.strength-1); }
  get alive() { return this.strength > 0; }

  draw(ctx) {
    if (!this.alive) return;
    const t  = this.strength / CFG.BLK_STRENGTH;
    const hue= 170 + (1-t)*60;
    ctx.save();
    ctx.fillStyle  = `hsla(${hue},100%,55%,${0.35+t*0.5})`;
    ctx.shadowColor= `hsla(${hue},100%,70%,0.9)`;
    ctx.shadowBlur = 6;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    // Grid lines
    ctx.strokeStyle = `hsla(${hue},100%,80%,${t*0.5})`;
    ctx.lineWidth   = 0.5;
    for (let i=8; i<this.w; i+=8) {
      ctx.beginPath();
      ctx.moveTo(this.x+i, this.y);
      ctx.lineTo(this.x+i, this.y+this.h);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ─── POWER-UP ────────────────────────────────────────────────────────
const PU_TYPES = ["SHIELD","TRIPLE","NUKE"];
const PU_EMOJI = { SHIELD:"🛡️", TRIPLE:"🔱", NUKE:"💣" };
const PU_COLOR = { SHIELD:PAL.NEON_CYAN, TRIPLE:PAL.NEON_YEL, NUKE:PAL.NEON_RED };

class PowerUp {
  constructor(x, y) {
    this.x    = x; this.y = y;
    this.w    = 24; this.h = 24;
    this.vy   = 55;
    this.type = PU_TYPES[Math.floor(Math.random()*PU_TYPES.length)];
    this.life = 0; this.maxLife = 8; // disappears after 8s
    this.alive= true;
  }

  update(dt) {
    this.y    += this.vy * dt;
    this.life += dt;
    if (this.y > canvas.height || this.life > this.maxLife) this.alive = false;
  }

  draw(ctx) {
    if (!this.alive) return;
    const pulse = 0.7 + Math.sin(performance.now()*0.005)*0.3;
    ctx.save();
    ctx.globalAlpha  = Math.min(1, pulse*(1 - this.life/this.maxLife*0.6));
    ctx.font         = "18px serif";
    ctx.textAlign    = "center";
    ctx.shadowColor  = PU_COLOR[this.type];
    ctx.shadowBlur   = 14*pulse;
    ctx.fillText(PU_EMOJI[this.type], this.x + this.w/2, this.y + this.h);
    ctx.restore();
  }
}

// ─── UFO ─────────────────────────────────────────────────────────────
class UFO {
  constructor(w) {
    this.dir   = Math.random() < 0.5 ? 1 : -1;
    this.x     = this.dir > 0 ? -CFG.UFO_W : w + CFG.UFO_W;
    this.y     = 55;
    this.w     = CFG.UFO_W; this.h = CFG.UFO_H;
    this.alive = true;
    this.beepT = 0;
    this.img   = null;
  }

  update(dt, audio) {
    this.x += this.dir * CFG.UFO_SPEED * dt;
    this.beepT += dt;
    if (this.beepT > 0.5) { this.beepT=0; audio.ufoBeep(); }
    if (this.x > canvas.width + CFG.UFO_W + 20 || this.x < -CFG.UFO_W - 20)
      this.alive = false;
  }

  draw(ctx, img) {
    if (!this.alive) return;
    const pulse = Math.sin(performance.now()*0.006)*0.4+0.6;
    ctx.save();
    ctx.shadowColor = PAL.NEON_PINK;
    ctx.shadowBlur  = 16*pulse;
    if (img) {
      ctx.drawImage(img, this.x, this.y, this.w, this.h);
    } else {
      // Fallback: draw geometric UFO
      ctx.fillStyle = PAL.NEON_PINK;
      ctx.beginPath();
      ctx.ellipse(this.x+this.w/2, this.y+this.h*0.6, this.w/2, this.h*0.3, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = PAL.NEON_CYAN;
      ctx.beginPath();
      ctx.ellipse(this.x+this.w/2, this.y+this.h*0.4, this.w*0.3, this.h*0.3, 0, 0, Math.PI*2);
      ctx.fill();
    }
    // Label
    ctx.font      = "bold 10px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillStyle = PAL.NEON_YEL;
    ctx.fillText("? ? ?", this.x+this.w/2, this.y-4);
    ctx.restore();
  }
}

// ─── BOSS ─────────────────────────────────────────────────────────────
class Boss {
  constructor(wave) {
    this.w    = CFG.BOSS_W;
    this.h    = CFG.BOSS_H;
    this.x    = canvas.width/2 - this.w/2;
    this.y    = 40;
    this.hp   = CFG.BOSS_HP_BASE + wave*5;
    this.maxHp= this.hp;
    this.spd  = CFG.BOSS_SPEED_BASE + wave*10;
    this.dir  = 1;
    this.alive= true;
    this.rage = false;
    this.shootCd = 0;
    this.phase= 0;
    this.imgIdx = Math.floor(Math.random()*CFG.IMAGE_COUNT);
    this.glowT= 0;
  }

  hit(n=1) {
    this.hp -= n;
    if (this.hp <= this.maxHp*0.3) this.rage = true;
    if (this.hp <= 0) { this.alive = false; }
  }

  update(dt, bullets, pool) {
    this.glowT += dt;
    this.x += this.dir * this.spd * dt;
    if (this.x + this.w > canvas.width) { this.dir=-1; this.x=canvas.width-this.w; }
    if (this.x < 0) { this.dir=1; this.x=0; }

    this.shootCd -= dt;
    if (this.shootCd <= 0) {
      const rate = this.rage ? 0.55 : 1.1;
      this.shootCd = rate;
      this.#shoot(bullets, pool);
    }
  }

  #shoot(bullets, pool) {
    const cx = this.x + this.w/2;
    const angles = this.rage
      ? [-0.5, -0.25, 0, 0.25, 0.5]    // rage: 5-spread
      : [-0.25, 0, 0.25];               // normal: 3-spread
    for (const a of angles) {
      bullets.push(pool.acquire({
        x: cx - CFG.BLT_W/2,
        y: this.y + this.h,
        vx: Math.sin(a) * CFG.ATK_BLT_SPEED * 1.2,
        vy: Math.cos(a) * CFG.ATK_BLT_SPEED * 1.2,
        w: CFG.BLT_W, h: CFG.BLT_H,
        boss: true,
      }));
    }
  }

  draw(ctx, img) {
    if (!this.alive) return;
    const pulse = Math.sin(this.glowT * (this.rage ? 8 : 3)) * 0.5 + 0.5;
    const glow  = this.rage ? PAL.NEON_RED : PAL.NEON_PINK;

    ctx.save();
    ctx.shadowColor = glow;
    ctx.shadowBlur  = 20 + pulse*20;

    if (this.rage) {
      // Tint red in rage
      ctx.globalAlpha = 0.25;
      ctx.fillStyle   = PAL.NEON_RED;
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.globalAlpha = 1;
    }

    if (img) {
      ctx.drawImage(img, this.x, this.y, this.w, this.h);
    } else {
      ctx.fillStyle = this.rage ? PAL.NEON_RED : PAL.NEON_PINK;
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
    ctx.restore();

    // Health bar
    const barW = this.w + 20, barH = 8;
    const bx   = this.x - 10, by = this.y - 16;
    ctx.fillStyle = "#333";
    ctx.fillRect(bx, by, barW, barH);
    const t     = Math.max(0, this.hp/this.maxHp);
    const hcol  = t > 0.5 ? PAL.NEON_GRN : t > 0.25 ? PAL.NEON_YEL : PAL.NEON_RED;
    ctx.save();
    ctx.shadowColor = hcol; ctx.shadowBlur = 6;
    ctx.fillStyle   = hcol;
    ctx.fillRect(bx, by, barW * t, barH);
    ctx.restore();

    // BOSS label
    ctx.save();
    ctx.font      = `bold ${this.rage?"14":"12"}px 'Courier New'`;
    ctx.textAlign = "center";
    ctx.fillStyle = this.rage ? PAL.NEON_RED : PAL.NEON_PINK;
    ctx.shadowColor= ctx.fillStyle; ctx.shadowBlur = 10;
    ctx.fillText(this.rage ? "👹 ENRAGED BOSS" : "👾 BOSS", this.x+this.w/2, this.y-22);
    ctx.restore();
  }
}

// ─── TITLE SCREEN ────────────────────────────────────────────────────
class TitleScreen {
  #t = 0; #blink = true; #blinkT = 0;

  update(dt) {
    this.#t      += dt;
    this.#blinkT += dt;
    if (this.#blinkT > 0.55) { this.#blink = !this.#blink; this.#blinkT = 0; }
  }

  draw(ctx, w, h, stars) {
    ctx.fillStyle = PAL.BG;
    ctx.fillRect(0, 0, w, h);
    stars.draw(ctx);

    const t = this.#t;

    // Retro grid ground effect
    ctx.save();
    ctx.strokeStyle = "rgba(0,255,255,0.07)";
    ctx.lineWidth   = 1;
    for (let x=0; x<w; x+=40) {
      ctx.beginPath(); ctx.moveTo(x,h*0.5); ctx.lineTo(w/2,h*0.82); ctx.stroke();
    }
    for (let y=0; y<10; y++) {
      const fy = h*0.5 + y*(h*0.32/10);
      ctx.beginPath(); ctx.moveTo(0,fy); ctx.lineTo(w,fy); ctx.stroke();
    }
    ctx.restore();

    // Main title — neon bounce
    const bounce = Math.sin(t*2)*5;
    ctx.save();
    ctx.font      = "bold 62px 'Courier New', monospace";
    ctx.textAlign = "center";

    // Rainbow gradient title
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0,   PAL.NEON_CYAN);
    grad.addColorStop(0.33,PAL.NEON_PINK);
    grad.addColorStop(0.66,PAL.NEON_YEL);
    grad.addColorStop(1,   PAL.NEON_GRN);
    ctx.fillStyle  = grad;
    ctx.shadowColor= PAL.NEON_CYAN;
    ctx.shadowBlur = 30 + Math.sin(t*3)*10;
    ctx.fillText("SPACE INVADERS", w/2, h*0.28 + bounce);

    ctx.font      = "bold 20px 'Courier New'";
    ctx.fillStyle = PAL.NEON_PINK;
    ctx.shadowColor=PAL.NEON_PINK; ctx.shadowBlur=14;
    ctx.fillText("★ ARCADE ULTRA V2 ★", w/2, h*0.38 + bounce*0.5);
    ctx.restore();

    // Demo attacker row
    this.#drawDemoRow(ctx, w, h, t);

    // Controls
    const cy = h*0.63;
    [
      ["← →", "MOVE"],
      ["SPACE", "SHOOT"],
      ["R", "RESTART"],
    ].forEach(([key, act], i) => {
      const x = w/2 + (i-1)*200;
      ctx.save();
      ctx.textAlign = "center";
      ctx.font      = "bold 13px 'Courier New'";
      ctx.fillStyle = PAL.NEON_YEL;
      ctx.shadowColor=PAL.NEON_YEL; ctx.shadowBlur=8;
      ctx.fillText(`[ ${key} ]`, x, cy);
      ctx.fillStyle = PAL.WHITE;
      ctx.shadowBlur= 0;
      ctx.fillText(act, x, cy+20);
      ctx.restore();
    });

    // INSERT COIN blink
    if (this.#blink) {
      ctx.save();
      ctx.font      = "bold 22px 'Courier New'";
      ctx.textAlign = "center";
      ctx.fillStyle = PAL.NEON_GRN;
      ctx.shadowColor=PAL.NEON_GRN; ctx.shadowBlur=16;
      ctx.fillText("▶  PRESS  SPACE  TO  START  ◀", w/2, h*0.78);
      ctx.restore();
    }

    // High score strip
    ctx.save();
    ctx.font      = "14px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillStyle = PAL.NEON_CYAN;
    ctx.shadowColor=PAL.NEON_CYAN; ctx.shadowBlur=8;
    ctx.fillText(`HI-SCORE  ${(+localStorage.getItem("si_hi")||0).toLocaleString()}`,
      w/2, h*0.87);
    ctx.restore();
  }

  #drawDemoRow(ctx, w, h, t) {
    const n = 8, ew = 32, eh = 22, y = h*0.48;
    for (let i=0; i<n; i++) {
      const x = (w/2 - n*(ew+12)/2) + i*(ew+12)
               + Math.sin(t*1.2+i*0.4)*6;
      const hue = (i*45 + t*60) % 360;
      ctx.save();
      ctx.fillStyle  = `hsl(${hue},100%,60%)`;
      ctx.shadowColor= `hsl(${hue},100%,70%)`;
      ctx.shadowBlur = 12;
      ctx.fillRect(x, y + Math.sin(t*2+i)*4, ew, eh);
      ctx.font      = "10px serif";
      ctx.textAlign = "center";
      ctx.fillText("👾", x+ew/2, y + Math.sin(t*2+i)*4 + eh*0.75);
      ctx.restore();
    }
  }
}

// ─── WAVE BANNER ─────────────────────────────────────────────────────
function drawWaveBanner(ctx, w, h, wave, t, isBoss) {
  ctx.save();
  const a   = Math.min(1, t*3) * Math.max(0, 1-(t-0.5)*2);
  const scl = 0.6 + Math.min(1,t*4)*0.5;
  ctx.globalAlpha = Math.max(0, a);
  ctx.translate(w/2, h/2);
  ctx.scale(scl, scl);
  ctx.translate(-w/2, -h/2);

  ctx.font      = `bold 56px 'Courier New'`;
  ctx.textAlign = "center";

  if (isBoss) {
    ctx.fillStyle  = PAL.NEON_RED;
    ctx.shadowColor= PAL.NEON_RED; ctx.shadowBlur = 40;
    ctx.fillText("👹 BOSS INCOMING!", w/2, h/2 - 20);
    ctx.font      = "bold 22px 'Courier New'";
    ctx.fillStyle = PAL.NEON_YEL;
    ctx.fillText("PREPARE YOURSELF...", w/2, h/2 + 30);
  } else {
    const grad = ctx.createLinearGradient(0,0,w,0);
    grad.addColorStop(0, PAL.NEON_CYAN);
    grad.addColorStop(1, PAL.NEON_PINK);
    ctx.fillStyle  = grad;
    ctx.shadowColor= PAL.NEON_CYAN; ctx.shadowBlur = 30;
    ctx.fillText(`WAVE  ${wave}`, w/2, h/2 - 20);
    ctx.font      = "bold 20px 'Courier New'";
    ctx.fillStyle = PAL.NEON_GRN;
    ctx.shadowColor=PAL.NEON_GRN; ctx.shadowBlur=12;
    ctx.fillText("GET READY!", w/2, h/2 + 28);
  }
  ctx.restore();
}

// ─── GAME OVER / WIN ─────────────────────────────────────────────────
function drawEndScreen(ctx, w, h, score, hi, isWin) {
  // Dim overlay
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0,0,w,h);

  ctx.save();
  ctx.textAlign = "center";

  if (isWin) {
    const grad = ctx.createLinearGradient(0,0,w,0);
    grad.addColorStop(0, PAL.NEON_YEL); grad.addColorStop(1, PAL.NEON_GRN);
    ctx.font      = "bold 58px 'Courier New'";
    ctx.fillStyle = grad;
    ctx.shadowColor=PAL.NEON_GRN; ctx.shadowBlur=40;
    ctx.fillText("🏆 YOU WIN!", w/2, h*0.35);
    ctx.font      = "bold 22px 'Courier New'";
    ctx.fillStyle = PAL.NEON_CYAN;
    ctx.fillText("GALAXY DEFENDED!", w/2, h*0.47);
  } else {
    ctx.font      = "bold 58px 'Courier New'";
    ctx.fillStyle = PAL.NEON_RED;
    ctx.shadowColor=PAL.NEON_RED; ctx.shadowBlur=40;
    ctx.fillText("💀 GAME  OVER", w/2, h*0.35);
    ctx.font      = "bold 22px 'Courier New'";
    ctx.fillStyle = PAL.NEON_PINK;
    ctx.fillText("EARTH HAS FALLEN", w/2, h*0.47);
  }

  ctx.font      = "bold 20px 'Courier New'";
  ctx.fillStyle = PAL.NEON_YEL;
  ctx.shadowColor=PAL.NEON_YEL; ctx.shadowBlur=10;
  ctx.fillText(`SCORE  ${score.toLocaleString()}`, w/2, h*0.58);

  if (score >= hi && score > 0) {
    ctx.fillStyle  = PAL.NEON_GRN;
    ctx.shadowColor= PAL.NEON_GRN;
    ctx.fillText("✨ NEW HIGH SCORE! ✨", w/2, h*0.67);
  } else {
    ctx.fillStyle  = PAL.NEON_CYAN;
    ctx.shadowColor= PAL.NEON_CYAN;
    ctx.fillText(`HI  ${hi.toLocaleString()}`, w/2, h*0.67);
  }

  ctx.font      = "bold 18px 'Courier New'";
  ctx.fillStyle = PAL.WHITE;
  ctx.shadowBlur= 0;
  ctx.fillText("[ R ] PLAY AGAIN", w/2, h*0.80);
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════
//  🎮  MAIN GAME
// ═══════════════════════════════════════════════════════════════════
class Game {
  // Subsystems
  #assets  = new AssetManager();
  #audio   = new AudioEngine();
  #parts   = new Particles();
  #fx      = new ScreenFX();
  #stars   = new Starfield(canvas.width, canvas.height);
  #input   = new Input();
  #hud     = new HUD();
  #floats  = new FloatingText();
  #title   = new TitleScreen();
  #bltPool = new Pool(() =>
    ({ x:0,y:0,vx:0,vy:0,w:CFG.BLT_W,h:CFG.BLT_H,boss:false }), 80);

  // Game state
  #state       = STATE.TITLE;
  #bannerT     = 0;
  #bannerBoss  = false;
  #wave        = 1;
  #score       = 0;
  #hi          = 0;
  #lives       = CFG.PLR_START_LIVES;
  #hitPause    = 0;
  #lastTime    = 0;

  // Player
  #px = 0; #py = 0;
  #shield      = false;  #shieldT    = 0;
  #triple      = false;  #tripleT    = 0;
  #canShoot    = true;

  // Combo
  #combo       = 1; #comboT = 0;

  // Entities
  #attackers   = [];
  #pBullets    = [];
  #aBullets    = [];
  #blocks      = [];
  #powerUps    = [];
  #ufo         = null;
  #ufoTimer    = 0;
  #boss        = null;

  // Wave difficulty multipliers
  #waveSpeed(w)    { return 1 + (w-1)*0.28; }
  #waveFireRate(w) { return CFG.ATTACKER_FIRE_RATE * (1 + (w-1)*0.22); }

  // ── INIT ──────────────────────────────────────────────────────
  async init() {
    this.#hi = +localStorage.getItem("si_hi") || 0;

    const manifest = [
      { key:"player", src:"space.png" },
      ...Array.from({length:CFG.IMAGE_COUNT},(_,i)=>({ key:`act${i}`,src:`act${i}.png`})),
    ];
    this.#drawLoading();
    await this.#assets.loadAll(manifest);

    this.#lastTime = performance.now();
    requestAnimationFrame(this.#loop);
  }

  // ── LOOP ──────────────────────────────────────────────────────
  #loop = (now) => {
    const dt = Math.min((now - this.#lastTime)/1000, 0.05);
    this.#lastTime = now;
    this.#update(dt);
    this.#render();
    requestAnimationFrame(this.#loop);
  };

  // ── UPDATE ────────────────────────────────────────────────────
  #update(dt) {
    this.#stars.update(dt);
    this.#parts.update(dt);
    this.#fx.update(dt);
    this.#floats.update(dt);

    switch (this.#state) {
      case STATE.TITLE:
        this.#title.update(dt);
        if (this.#input.consume(" ")) this.#startGame();
        break;

      case STATE.WAVE_BANNER:
      case STATE.BOSS_WARNING:
        this.#bannerT += dt;
        if (this.#bannerT > (this.#bannerBoss
            ? CFG.BOSS_WARN_MS : CFG.WAVE_BANNER_MS)/1000) {
          this.#state = this.#bannerBoss ? STATE.BOSS : STATE.PLAYING;
        }
        break;

      case STATE.PLAYING:
        this.#updatePlaying(dt);
        break;

      case STATE.BOSS:
        this.#updateBoss(dt);
        break;

      case STATE.LEVEL_CLEAR:
        this.#bannerT += dt;
        if (this.#bannerT > CFG.LEVEL_CLEAR_MS/1000) this.#nextWave();
        break;

      case STATE.GAME_OVER:
      case STATE.YOU_WIN:
        if (this.#input.consume("r") || this.#input.consume("R"))
          this.#backToTitle();
        break;
    }
  }

  #updatePlaying(dt) {
    if (this.#hitPause > 0) { this.#hitPause -= dt; return; }

    this.#handleInput(dt);
    this.#moveAttackers(dt);
    this.#movePlayerBullets(dt);
    this.#moveAttackerBullets(dt);
    this.#doAttackerShoot();
    this.#updatePowerUps(dt);
    this.#updateUFO(dt);
    this.#tickCombo(dt);
    this.#checkPlayingEnd();
  }

  #updateBoss(dt) {
    if (this.#hitPause > 0) { this.#hitPause -= dt; return; }
    if (!this.#boss?.alive) {
      this.#endBoss(); return;
    }

    this.#handleInput(dt);
    this.#boss.update(dt, this.#aBullets, this.#bltPool);
    this.#movePlayerBullets(dt);
    this.#moveBossBullets(dt);
    this.#updateUFO(dt);
    this.#tickCombo(dt);

    if (this.#lives <= 0) this.#gameOver();
  }

  // ── INPUT ─────────────────────────────────────────────────────
  #handleInput(dt) {
    if (this.#input.isDown("ArrowRight"))
      this.#px = Math.min(canvas.width - CFG.PLR_W, this.#px + CFG.PLR_SPEED*dt);
    if (this.#input.isDown("ArrowLeft"))
      this.#px = Math.max(0, this.#px - CFG.PLR_SPEED*dt);

    if (this.#input.consume(" ") && this.#canShoot) this.#shoot();
  }

  #shoot() {
    const cx = this.#px + CFG.PLR_W/2 - CFG.BLT_W/2;
    const by = this.#py - CFG.BLT_H;

    const angles = this.#triple ? [-0.22, 0, 0.22] : [0];
    for (const a of angles) {
      this.#pBullets.push(this.#bltPool.acquire({
        x: cx, y: by,
        vx: Math.sin(a)*CFG.PLR_BLT_SPEED,
        vy: -Math.cos(a)*CFG.PLR_BLT_SPEED,
        w: CFG.BLT_W, h: CFG.BLT_H, boss:false,
      }));
    }
    this.#canShoot = false;
    this.#audio.laser();
  }

  // ── ATTACKER MOVEMENT ─────────────────────────────────────────
  #moveAttackers(dt) {
    const spd = CFG.ATK_BLT_SPEED * 0.55 * this.#waveSpeed(this.#wave);
    let edge   = false;

    for (let c=0; c<CFG.COLS; c++)
      for (let r=0; r<CFG.ROWS; r++) {
        const a = this.#attackers[c]?.[r];
        if (!a?.alive) continue;
        a.x += this.#dir * spd * dt;
        if (a.x + CFG.ATK_W > canvas.width || a.x < 0) edge = true;
      }

    if (edge) {
      this.#dir *= -1;
      for (let c=0; c<CFG.COLS; c++)
        for (let r=0; r<CFG.ROWS; r++)
          if (this.#attackers[c]?.[r]?.alive)
            this.#attackers[c][r].y += CFG.ATK_SY * 0.7;
    }
  }

  #dir = 1;

  // ── PLAYER BULLETS ────────────────────────────────────────────
  #movePlayerBullets(dt) {
    for (let i=this.#pBullets.length-1; i>=0; i--) {
      const b = this.#pBullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (b.y + b.h < 0 || b.x < -10 || b.x > canvas.width+10) {
        this.#bltPool.release(b); this.#pBullets.splice(i,1);
        this.#canShoot = true; continue;
      }

      // vs UFO
      if (this.#ufo?.alive &&
          this.#overlap(b.x,b.y,b.w,b.h, this.#ufo.x,this.#ufo.y,this.#ufo.w,this.#ufo.h)) {
        const pts = CFG.SCORE_UFO[Math.floor(Math.random()*CFG.SCORE_UFO.length)];
        this.#addScore(pts, b.x+b.w/2, b.y, `🛸 ${pts}`);
        this.#parts.explosion(this.#ufo.x+this.#ufo.w/2, this.#ufo.y+this.#ufo.h/2);
        this.#fx.shake(0.2); this.#audio.explosion();
        this.#ufo.alive = false;
        this.#bltPool.release(b); this.#pBullets.splice(i,1);
        this.#canShoot = true; continue;
      }

      // vs boss
      if (this.#boss?.alive &&
          this.#overlap(b.x,b.y,b.w,b.h,
            this.#boss.x,this.#boss.y,this.#boss.w,this.#boss.h)) {
        this.#boss.hit();
        this.#bltPool.release(b); this.#pBullets.splice(i,1);
        this.#canShoot = true;
        this.#fx.shake(0.12);
        if (!this.#boss.alive) {
          this.#parts.bossExplosion(
            this.#boss.x+this.#boss.w/2,
            this.#boss.y+this.#boss.h/2);
          this.#fx.shake(0.9);
          this.#fx.flash(255,100,0,0.6);
          this.#fx.chroma(0.06);
          this.#audio.bossRoar();
          this.#addScore(CFG.SCORE_BOSS,
            this.#boss.x+this.#boss.w/2,
            this.#boss.y, `👹 ${CFG.SCORE_BOSS}`);
        }
        continue;
      }

      // vs attackers
      let hit = false;
      outer:
      for (let c=0; c<CFG.COLS && !hit; c++)
        for (let r=0; r<CFG.ROWS && !hit; r++) {
          const a = this.#attackers[c]?.[r];
          if (!a?.alive) continue;
          if (this.#overlap(b.x,b.y,b.w,b.h, a.x,a.y,CFG.ATK_W,CFG.ATK_H)) {
            a.alive = false;
            const pts = CFG.SCORE_ROW[r] * this.#combo;
            this.#addScore(pts, a.x+CFG.ATK_W/2, a.y,
              `+${pts}${this.#combo>1?" 🔥x"+this.#combo:""}`);
            this.#parts.explosion(a.x+CFG.ATK_W/2, a.y+CFG.ATK_H/2);
            this.#fx.shake(0.08); this.#audio.explosion();
            this.#bumpCombo();

            // Power-up drop
            if (Math.random() < CFG.POWERUP_CHANCE)
              this.#powerUps.push(new PowerUp(a.x+CFG.ATK_W/2-12, a.y));

            this.#bltPool.release(b); this.#pBullets.splice(i,1);
            this.#canShoot = true; hit = true;
          }
        }

      if (hit) continue;

      // vs blocks
      for (const bl of this.#blocks) {
        if (bl.alive && this.#overlap(b.x,b.y,b.w,b.h,bl.x,bl.y,bl.w,bl.h)) {
          bl.hit();
          this.#bltPool.release(b); this.#pBullets.splice(i,1);
          this.#canShoot = true; break;
        }
      }
    }
  }

  // ── ATTACKER BULLETS ──────────────────────────────────────────
  #moveAttackerBullets(dt) {
    for (let i=this.#aBullets.length-1; i>=0; i--) {
      const b = this.#aBullets[i];
      b.x += (b.vx||0)*dt; b.y += b.vy*dt;

      if (b.y > canvas.height || b.x<-20 || b.x>canvas.width+20) {
        this.#bltPool.release(b); this.#aBullets.splice(i,1); continue;
      }

      // vs blocks
      let blockHit = false;
      for (const bl of this.#blocks) {
        if (bl.alive && this.#overlap(b.x,b.y,b.w,b.h,bl.x,bl.y,bl.w,bl.h)) {
          bl.hit();
          this.#bltPool.release(b); this.#aBullets.splice(i,1);
          blockHit = true; break;
        }
      }
      if (blockHit) continue;

      // vs player
      if (this.#overlap(b.x,b.y,b.w,b.h,
          this.#px,this.#py,CFG.PLR_W,CFG.PLR_H)) {
        this.#bltPool.release(b); this.#aBullets.splice(i,1);
        if (this.#shield) {
          this.#shield = false; this.#shieldT = 0;
          this.#fx.flash(0,180,255,0.4); this.#audio.powerUp();
          this.#floats.spawn(this.#px+CFG.PLR_W/2, this.#py, "🛡️ BLOCKED!", PAL.NEON_CYAN, 18);
        } else {
          this.#loseLife();
        }
      }
    }
  }

  // Boss bullet movement (same as attacker but uses vx)
  #moveBossBullets(dt) { this.#moveAttackerBullets(dt); }

  // ── ATTACKER SHOOTING ─────────────────────────────────────────
  #doAttackerShoot() {
    const rate    = this.#waveFireRate(this.#wave);
    const maxBlts = CFG.MAX_ATK_BLTS + (this.#wave-1);

    for (let c=0; c<CFG.COLS; c++)
      for (let r=0; r<CFG.ROWS; r++) {
        const a = this.#attackers[c]?.[r];
        if (!a?.alive) continue;
        if (this.#aBullets.length >= maxBlts) return;
        const dist     = Math.abs(a.x + CFG.ATK_W/2 - (this.#px + CFG.PLR_W/2));
        const prox     = Math.max(0, 1 - dist/canvas.width);
        const prob     = rate*(0.4 + prox*1.6) / 60;
        if (Math.random() < prob) {
          this.#aBullets.push(this.#bltPool.acquire({
            x: a.x + CFG.ATK_W/2 - CFG.BLT_W/2,
            y: a.y + CFG.ATK_H,
            vx:0, vy: CFG.ATK_BLT_SPEED * (0.9 + this.#wave*0.12),
            w: CFG.BLT_W, h: CFG.BLT_H, boss:false,
          }));
        }
      }
  }

  // ── POWER-UPS ─────────────────────────────────────────────────
  #updatePowerUps(dt) {
    for (let i=this.#powerUps.length-1; i>=0; i--) {
      const p = this.#powerUps[i];
      p.update(dt);
      if (!p.alive) { this.#powerUps.splice(i,1); continue; }

      if (this.#overlap(p.x,p.y,p.w,p.h,
          this.#px,this.#py,CFG.PLR_W,CFG.PLR_H)) {
        this.#collectPowerUp(p); this.#powerUps.splice(i,1);
      }
    }
  }

  #collectPowerUp(p) {
    this.#audio.powerUp();
    this.#parts.powerUpPop(p.x+p.w/2, p.y+p.h/2, p.type);
    const label = `${PU_EMOJI[p.type]} ${p.type}!`;
    this.#floats.spawn(this.#px+CFG.PLR_W/2, this.#py-10, label,
      PU_COLOR[p.type], 18);

    switch (p.type) {
      case "SHIELD":
        this.#shield = true; this.#shieldT = 10; break;
      case "TRIPLE":
        this.#triple = true; this.#tripleT = 8; break;
      case "NUKE":
        this.#doNuke(); break;
    }
  }

  #doNuke() {
    this.#audio.nukeBlast();
    this.#fx.flash(255,220,0,0.85);
    this.#fx.shake(0.7);
    this.#fx.chroma(0.08);
    let killed = 0;
    for (let c=0; c<CFG.COLS; c++)
      for (let r=0; r<CFG.ROWS; r++) {
        const a = this.#attackers[c]?.[r];
        if (a?.alive) {
          a.alive = false; killed++;
          setTimeout(() =>
            this.#parts.explosion(a.x+CFG.ATK_W/2, a.y+CFG.ATK_H/2),
            Math.random()*400);
        }
      }
    const nukeScore = killed * 50 * this.#combo;
    this.#score += nukeScore;
    this.#floats.spawn(canvas.width/2, canvas.height/2-30,
      `💣 NUKE! +${nukeScore}`, PAL.NEON_YEL, 28);
    this.#aBullets.forEach(b => this.#bltPool.release(b));
    this.#aBullets = [];
  }

  // ── UFO ───────────────────────────────────────────────────────
  #updateUFO(dt) {
    if (this.#ufo) {
      this.#ufo.update(dt, this.#audio);
      if (!this.#ufo.alive) this.#ufo = null;
    } else {
      this.#ufoTimer += dt*1000;
      if (this.#ufoTimer > CFG.UFO_INTERVAL) {
        this.#ufoTimer = 0;
        this.#ufo = new UFO(canvas.width);
      }
    }
  }

  // ── COMBO ─────────────────────────────────────────────────────
  #bumpCombo() {
    this.#combo = Math.min(8, this.#combo+1);
    this.#comboT = CFG.COMBO_WINDOW/1000;
  }

  #tickCombo(dt) {
    if (this.#combo > 1) {
      this.#comboT -= dt;
      if (this.#comboT <= 0) { this.#combo = 1; }
    }
    // Power-up timers
    if (this.#shield) { this.#shieldT -= dt; if (this.#shieldT<=0) this.#shield=false; }
    if (this.#triple) { this.#tripleT -= dt; if (this.#tripleT<=0) this.#triple=false; }
  }

  // ── SCORE ─────────────────────────────────────────────────────
  #addScore(pts, x, y, label) {
    this.#score += pts;
    const col = pts >= 500 ? PAL.NEON_GRN : pts >= 200 ? PAL.NEON_YEL : PAL.NEON_CYAN;
    this.#floats.spawn(x, y, label, col, pts >= 200 ? 20 : 16);
  }

  // ── LOSE LIFE ─────────────────────────────────────────────────
  #loseLife() {
    this.#lives--;
    this.#parts.playerExplosion(this.#px+CFG.PLR_W/2, this.#py+CFG.PLR_H/2);
    this.#fx.shake(0.5); this.#fx.flash(255,50,50,0.6);
    this.#fx.chroma(0.04);
    this.#audio.playerHit();
    this.#combo = 1;

    if (this.#lives <= 0) { this.#gameOver(); return; }
    this.#hitPause = CFG.HIT_PAUSE_MS/1000;
    this.#px = canvas.width/2 - CFG.PLR_W/2;
    this.#floats.spawn(canvas.width/2, canvas.height/2,
      `💀 -1 LIFE`, PAL.NEON_RED, 24);
  }

  // ── WIN / LOSE CHECKS ─────────────────────────────────────────
  #checkPlayingEnd() {
    if (this.#lives <= 0) { this.#gameOver(); return; }
    if (this.#countAlive() === 0) {
      this.#audio.levelUp();
      this.#fx.startWarp(canvas.width, canvas.height);
      this.#fx.flash(0,255,200,0.4);
      this.#floats.spawn(canvas.width/2, canvas.height/2, "🌊 WAVE CLEAR!", PAL.NEON_GRN, 26);
      this.#state   = STATE.LEVEL_CLEAR;
      this.#bannerT = 0;
    }
    // Attacker reaches bottom
    for (let c=0; c<CFG.COLS; c++)
      for (let r=0; r<CFG.ROWS; r++) {
        const a = this.#attackers[c]?.[r];
        if (a?.alive && a.y + CFG.ATK_H >= this.#py)
          { this.#lives=0; this.#gameOver(); return; }
      }
  }

  #countAlive() {
    let n = 0;
    for (let c=0; c<CFG.COLS; c++)
      for (let r=0; r<CFG.ROWS; r++)
        if (this.#attackers[c]?.[r]?.alive) n++;
    return n;
  }

  #endBoss() {
    this.#audio.levelUp();
    this.#fx.startWarp(canvas.width, canvas.height);
    this.#fx.flash(255,200,0,0.7);

    if (this.#wave >= CFG.TOTAL_WAVES) {
      this.#state = STATE.YOU_WIN;
      this.#saveHi();
      return;
    }

    this.#state = STATE.LEVEL_CLEAR;
    this.#bannerT = 0;
  }

  // ── GAME OVER ─────────────────────────────────────────────────
  #gameOver() {
    this.#audio.stopBGM();
    this.#fx.flash(255,0,0,0.8);
    this.#fx.shake(1);
    this.#audio.playerHit();
    this.#parts.bossExplosion(canvas.width/2, canvas.height/2);
    this.#state = STATE.GAME_OVER;
    this.#saveHi();
  }

  #saveHi() {
    if (this.#score > this.#hi) {
      this.#hi = this.#score;
      try { localStorage.setItem("si_hi", this.#hi); } catch(_){}
    }
  }

  // ── START / NEXT WAVE / BACK ───────────────────────────────────
  #startGame() {
    this.#score  = 0; this.#lives = CFG.PLR_START_LIVES;
    this.#combo  = 1; this.#comboT= 0;
    this.#wave   = 1; this.#dir   = 1;
    this.#shield = false; this.#triple = false;
    this.#audio.startBGM();
    this.#beginWave();
  }

  #nextWave() {
    this.#wave++;
    this.#dir = 1;
    this.#audio.stopBGM();
    this.#audio.startBGM();
    this.#beginWave();
  }

  #beginWave() {
    this.#pBullets  = []; this.#aBullets  = [];
    this.#powerUps  = []; this.#ufo       = null;
    this.#ufoTimer  = 0;  this.#canShoot  = true;
    this.#px = canvas.width/2 - CFG.PLR_W/2;
    this.#py = canvas.height - CFG.PLR_H - 30;
    this.#buildAttackers();
    this.#buildBlocks();

    const isBoss = this.#wave % 3 === 0;
    if (isBoss) {
      this.#boss = new Boss(this.#wave);
      this.#bannerBoss = true;
      this.#state = STATE.BOSS_WARNING;
    } else {
      this.#boss = null;
      this.#bannerBoss = false;
      this.#state = STATE.WAVE_BANNER;
    }
    this.#bannerT = 0;
  }

  #backToTitle() {
    this.#audio.stopBGM();
    this.#state = STATE.TITLE;
    this.#pBullets=[]; this.#aBullets=[];
    this.#powerUps=[]; this.#ufo=null;
    this.#boss=null;
    this.#input.flushPressed();
  }

  // ── BUILD ─────────────────────────────────────────────────────
  #buildAttackers() {
    this.#attackers = [];
    const startX = (canvas.width - CFG.COLS*(CFG.ATK_W+CFG.ATK_SX))/2;
    for (let c=0; c<CFG.COLS; c++) {
      this.#attackers[c] = [];
      for (let r=0; r<CFG.ROWS; r++) {
        this.#attackers[c][r] = {
          x: startX + c*(CFG.ATK_W+CFG.ATK_SX),
          y: 70 + r*(CFG.ATK_H+CFG.ATK_SY),
          alive: true,
          imageIndex: Math.floor(Math.random()*CFG.IMAGE_COUNT),
          phase: Math.random()*Math.PI*2,
        };
      }
    }
  }

  #buildBlocks() {
    this.#blocks = [];
    const total  = CFG.BLK_COLS*(CFG.BLK_W+20) - 20;
    const startX = (canvas.width - total)/2;
    for (let c=0; c<CFG.BLK_COLS; c++)
      this.#blocks.push(new Block(startX + c*(CFG.BLK_W+20),
        canvas.height - 110));
  }

  // ── RENDER ────────────────────────────────────────────────────
  #render() {
    const W = canvas.width, H = canvas.height;

    ctx.fillStyle = PAL.BG;
    ctx.fillRect(0, 0, W, H);
    this.#stars.draw(ctx);

    switch (this.#state) {
      case STATE.TITLE:
        this.#title.draw(ctx, W, H, this.#stars);
        break;

      case STATE.WAVE_BANNER:
      case STATE.BOSS_WARNING:
        this.#renderGame(W, H);
        drawWaveBanner(ctx, W, H, this.#wave,
          this.#bannerT, this.#bannerBoss);
        break;

      case STATE.PLAYING:
      case STATE.BOSS:
      case STATE.LEVEL_CLEAR:
        this.#renderGame(W, H);
        break;

      case STATE.GAME_OVER:
        this.#renderGame(W, H);
        drawEndScreen(ctx, W, H, this.#score, this.#hi, false);
        break;

      case STATE.YOU_WIN:
        this.#renderGame(W, H);
        drawEndScreen(ctx, W, H, this.#score, this.#hi, true);
        break;
    }

    this.#fx.drawPostFX(ctx, W, H);
  }

  #renderGame(W, H) {
    this.#fx.applyShake(ctx);

    this.#renderBlocks();
    this.#renderAttackers();
    this.#boss?.draw(ctx, this.#assets.get(`act${this.#boss?.imgIdx??0}`));
    this.#renderPlayer(W, H);
    this.#renderBullets();
    this.#ufo?.draw(ctx, this.#assets.get("act0"));
    this.#powerUps.forEach(p => p.draw(ctx));
    this.#parts.draw(ctx);
    this.#floats.draw(ctx);

    // Chromatic aberration overlay
    if (this.#fx.chromaAmount > 0.005) {
      const shift = this.#fx.chromaAmount * canvas.width;
      ctx.save();
      ctx.globalAlpha  = 0.35;
      ctx.globalCompositeOperation = "screen";
      ctx.drawImage(canvas, shift, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    this.#fx.restoreShake(ctx);

    // HUD (outside shake)
    this.#hud.setState(this.#score, this.#hi, this.#lives,
      this.#wave, this.#combo, this.#shield, this.#triple);
    this.#hud.draw(ctx, W, H);
  }

  #renderAttackers() {
    const t = performance.now();
    for (let c=0; c<CFG.COLS; c++)
      for (let r=0; r<CFG.ROWS; r++) {
        const a   = this.#attackers[c]?.[r];
        if (!a?.alive) continue;
        const img = this.#assets.get(`act${a.imageIndex}`);
        const bob = Math.sin(a.phase + t*0.0015) * 2.5;
        const hue = (r*60 + t*0.03) % 360;

        ctx.save();
        ctx.shadowColor = `hsl(${hue},100%,60%)`;
        ctx.shadowBlur  = 8 + Math.sin(a.phase+t*0.002)*4;
        if (img) {
          ctx.drawImage(img, a.x, a.y+bob, CFG.ATK_W, CFG.ATK_H);
        } else {
          ctx.fillStyle = `hsl(${hue},80%,55%)`;
          ctx.fillRect(a.x, a.y+bob, CFG.ATK_W, CFG.ATK_H);
          ctx.font = "16px serif"; ctx.textAlign="center";
          ctx.fillText("👾", a.x+CFG.ATK_W/2, a.y+bob+CFG.ATK_H*0.75);
        }
        ctx.restore();
      }
  }

  #renderPlayer(W, H) {
    const img = this.#assets.get("player");

    // Engine thruster glow
    const thrusterGrad = ctx.createRadialGradient(
      this.#px+CFG.PLR_W/2, this.#py+CFG.PLR_H+8, 0,
      this.#px+CFG.PLR_W/2, this.#py+CFG.PLR_H+8, 14
    );
    const flicker = 0.5 + Math.random()*0.5;
    thrusterGrad.addColorStop(0, `rgba(0,180,255,${flicker})`);
    thrusterGrad.addColorStop(1, "rgba(0,0,255,0)");
    ctx.fillStyle = thrusterGrad;
    ctx.fillRect(this.#px, this.#py, CFG.PLR_W, CFG.PLR_H+20);

    ctx.save();
    if (this.#shield) {
      // Shield bubble
      const pulse = Math.sin(performance.now()*0.006)*0.3+0.7;
      ctx.strokeStyle = `rgba(0,200,255,${pulse})`;
      ctx.lineWidth   = 2.5;
      ctx.shadowColor = PAL.NEON_CYAN;
      ctx.shadowBlur  = 18*pulse;
      ctx.beginPath();
      ctx.ellipse(this.#px+CFG.PLR_W/2, this.#py+CFG.PLR_H/2,
        CFG.PLR_W*0.8, CFG.PLR_H*1.3, 0, 0, Math.PI*2);
      ctx.stroke();
    }

    ctx.shadowColor = PAL.NEON_CYAN;
    ctx.shadowBlur  = 14;
    if (img) {
      ctx.drawImage(img, this.#px, this.#py, CFG.PLR_W, CFG.PLR_H);
    } else {
      ctx.fillStyle = PAL.NEON_CYAN;
      ctx.fillRect(this.#px, this.#py, CFG.PLR_W, CFG.PLR_H);
    }
    ctx.restore();

    // Hit pause countdown bar
    if (this.#hitPause > 0) {
      const frac = this.#hitPause / (CFG.HIT_PAUSE_MS/1000);
      ctx.fillStyle = `rgba(255,100,100,${frac*0.4})`;
      ctx.fillRect(0, 0, W*frac, H);
    }
  }

  #renderBullets() {
    // Player bullets
    for (const b of this.#pBullets) {
      ctx.save();
      const grad = ctx.createLinearGradient(b.x, b.y+b.h, b.x, b.y);
      grad.addColorStop(0, PAL.NEON_CYAN);
      grad.addColorStop(1, "#FFFFFF");
      ctx.fillStyle  = grad;
      ctx.shadowColor= PAL.NEON_CYAN;
      ctx.shadowBlur = 10;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.restore();
    }

    // Attacker/boss bullets
    for (const b of this.#aBullets) {
      ctx.save();
      const col = b.boss ? PAL.NEON_YEL : PAL.NEON_ORG;
      ctx.shadowColor= col; ctx.shadowBlur = 10;
      ctx.fillStyle  = col;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      // Boss bullets get a glow trail
      if (b.boss) {
        ctx.globalAlpha = 0.3;
        ctx.fillRect(b.x - b.vx*0.02, b.y - b.vy*0.02, b.w*2, b.h*2);
      }
      ctx.restore();
    }
  }

  #renderBlocks() {
    this.#blocks.forEach(bl => bl.draw(ctx));
  }

  // ── UTIL ──────────────────────────────────────────────────────
  #overlap(ax,ay,aw,ah, bx,by,bw,bh) {
    return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by;
  }

  #drawLoading() {
    ctx.fillStyle = PAL.BG; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.font      = "bold 28px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillStyle = PAL.NEON_CYAN; ctx.shadowColor=PAL.NEON_CYAN; ctx.shadowBlur=20;
    ctx.fillText("⚡ LOADING ASSETS…", canvas.width/2, canvas.height/2);
    ctx.shadowBl
