// ============================================================
// SPACE INVADERS V2 - Modernized Engine
// CrowdStrike Edition | 2026
// ============================================================

"use strict";

// ─── CANVAS SETUP ────────────────────────────────────────────
const canvas = document.getElementById("gameCanvas");
const ctx    = canvas.getContext("2d", { alpha: false });

canvas.width  = 800;
canvas.height = 600;

// ─── CONSTANTS ───────────────────────────────────────────────
const CFG = Object.freeze({
  // Attacker grid
  ATTACKER_COLS      : 5,
  ATTACKER_ROWS      : 3,
  ATTACKER_W         : 40,
  ATTACKER_H         : 30,
  ATTACKER_SPACING_X : 30,
  ATTACKER_SPACING_Y : 30,
  ATTACKER_SPEED     : 120,   // px / second
  ATTACKER_DROP      : 30,    // px per edge-hit
  ATTACKER_FIRE_RATE : 0.30,
  MAX_ATTACKER_BULLETS: 4,

  // Player
  PLAYER_W     : 40,
  PLAYER_H     : 20,
  PLAYER_SPEED : 220,         // px / second

  // Bullets
  BULLET_W      : 3,
  BULLET_H      : 10,
  BULLET_SPEED  : 420,        // px / second

  // Protection blocks
  BLOCK_W       : 40,
  BLOCK_H       : 20,
  BLOCK_COLS    : 7,
  BLOCK_ROWS    : 1,
  BLOCK_SPACING : 30,
  BLOCK_STRENGTH: 3,

  // Misc
  SCORE_PER_KILL : 100,
  HIT_PAUSE_MS   : 800,
  IMAGE_COUNT    : 15,
});

// ─── ASSET MANAGER ───────────────────────────────────────────
class AssetManager {
  #cache = new Map();

  async loadImage(key, src) {
    return new Promise((resolve, reject) => {
      const img  = new Image();
      img.onload  = () => { this.#cache.set(key, img); resolve(img); };
      img.onerror = () => reject(new Error(`Failed: ${src}`));
      img.src     = src;
    });
  }

  async loadAll(manifest) {
    await Promise.all(
      manifest.map(({ key, src }) => this.loadImage(key, src))
    );
  }

  get(key) { return this.#cache.get(key) ?? null; }
}

// ─── OBJECT POOL ─────────────────────────────────────────────
class ObjectPool {
  #pool   = [];
  #factory;

  constructor(factory, initialSize = 20) {
    this.#factory = factory;
    for (let i = 0; i < initialSize; i++) this.#pool.push(factory());
  }

  acquire(init) {
    const obj = this.#pool.pop() ?? this.#factory();
    return init ? Object.assign(obj, init) : obj;
  }

  release(obj) { this.#pool.push(obj); }
}

// ─── WEB AUDIO ENGINE ────────────────────────────────────────
class AudioEngine {
  #ctx;

  constructor() {
    this.#ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  #resume() {
    if (this.#ctx.state === "suspended") this.#ctx.resume();
  }

  #play({ type = "sawtooth", freqStart, freqEnd, duration,
          gainPeak = 0.4, filterFreq = null }) {
    this.#resume();
    const ac  = this.#ctx;
    const osc = ac.createOscillator();
    const gain= ac.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, ac.currentTime);
    if (freqEnd !== undefined)
      osc.frequency.exponentialRampToValueAtTime(freqEnd,
        ac.currentTime + duration);

    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(gainPeak, ac.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001,
      ac.currentTime + duration);

    let node = osc;
    if (filterFreq) {
      const filter = ac.createBiquadFilter();
      filter.type            = "lowpass";
      filter.frequency.value = filterFreq;
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }
    gain.connect(ac.destination);

    osc.start();
    osc.stop(ac.currentTime + duration);
  }

  laser()     { this.#play({ type:"sawtooth", freqStart:880,
                  freqEnd:220, duration:0.12, gainPeak:0.3 }); }

  explosion() { this.#play({ type:"square",  freqStart:200,
                  freqEnd:40,  duration:0.4,  gainPeak:0.5,
                  filterFreq:800 }); }

  playerHit() { this.#play({ type:"triangle",freqStart:440,
                  freqEnd:110, duration:0.5,  gainPeak:0.4 }); }

  levelUp()   { this.#play({ type:"sine",    freqStart:440,
                  freqEnd:880, duration:0.3,  gainPeak:0.3 }); }
}

// ─── PARTICLE SYSTEM ─────────────────────────────────────────
class ParticleSystem {
  #particles = [];
  #pool;

  constructor() {
    this.#pool = new ObjectPool(() => ({
      x:0, y:0, vx:0, vy:0, life:0, maxLife:0,
      r:0, g:0, b:0, size:0, active:false
    }), 200);
  }

  emit(x, y, count = 20, palette = [[255,120,0],[255,200,0],[255,60,0]]) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 160;
      const color = palette[Math.floor(Math.random() * palette.length)];
      const p     = this.#pool.acquire({
        x, y,
        vx      : Math.cos(angle) * speed,
        vy      : Math.sin(angle) * speed,
        life    : 0,
        maxLife : 0.4 + Math.random() * 0.4,
        r: color[0], g: color[1], b: color[2],
        size    : 2 + Math.random() * 4,
        active  : true,
      });
      this.#particles.push(p);
    }
  }

  emitPlayerHit(x, y) {
    this.emit(x, y, 30, [[0,180,255],[0,120,255],[255,255,255]]);
  }

  update(dt) {
    for (let i = this.#particles.length - 1; i >= 0; i--) {
      const p = this.#particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.#pool.release(p);
        this.#particles.splice(i, 1);
        continue;
      }
      p.x  += p.vx * dt;
      p.y  += p.vy * dt;
      p.vy += 60 * dt; // gravity
    }
  }

  draw(ctx) {
    for (const p of this.#particles) {
      const alpha = 1 - p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = `rgb(${p.r},${p.g},${p.b})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

// ─── SCREEN SHAKE ────────────────────────────────────────────
class ScreenShake {
  #trauma  = 0;
  #offsetX = 0;
  #offsetY = 0;

  add(amount) { this.#trauma = Math.min(1, this.#trauma + amount); }

  update(dt) {
    this.#trauma = Math.max(0, this.#trauma - dt * 1.5);
    const shake  = this.#trauma ** 2;
    this.#offsetX = (Math.random() * 2 - 1) * shake * 12;
    this.#offsetY = (Math.random() * 2 - 1) * shake * 12;
  }

  apply(ctx) {
    ctx.save();
    ctx.translate(this.#offsetX, this.#offsetY);
  }

  restore(ctx) { ctx.restore(); }
}

// ─── STARFIELD ───────────────────────────────────────────────
class Starfield {
  #layers;

  constructor(w, h) {
    this.#layers = [
      this.#makeLayer(80,  w, h, 0.5, 1),
      this.#makeLayer(50,  w, h, 1.2, 1.5),
      this.#makeLayer(20,  w, h, 2.5, 2),
    ];
  }

  #makeLayer(count, w, h, speed, size) {
    return {
      speed,
      size,
      stars: Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
      })),
      w, h,
    };
  }

  update(dt) {
    for (const layer of this.#layers) {
      for (const s of layer.stars) {
        s.y += layer.speed * dt * 60;
        if (s.y > layer.h) { s.y = 0; s.x = Math.random() * layer.w; }
      }
    }
  }

  draw(ctx) {
    for (const layer of this.#layers) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + layer.speed * 0.2})`;
      for (const s of layer.stars) {
        ctx.fillRect(s.x, s.y, layer.size, layer.size);
      }
    }
  }
}

// ─── INPUT MANAGER ───────────────────────────────────────────
class InputManager {
  #keys = new Set();

  constructor() {
    window.addEventListener("keydown", e => {
      this.#keys.add(e.key);
      e.preventDefault();
    });
    window.addEventListener("keyup",   e => this.#keys.delete(e.key));
  }

  isDown(key) { return this.#keys.has(key); }

  consume(key) {
    const had = this.#keys.has(key);
    this.#keys.delete(key);
    return had;
  }
}

// ─── HUD ─────────────────────────────────────────────────────
class HUD {
  #scoreEl;
  #livesEl;
  #msgEl;

  constructor() {
    // Build DOM overlay for crisp text (no canvas font blurring)
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position:absolute; top:0; left:0;
      width:${canvas.width}px; height:${canvas.height}px;
      pointer-events:none; font-family:'Courier New',monospace;
      color:#fff; user-select:none;
    `;

    this.#scoreEl = this.#el("Score: 0",
      "position:absolute;top:12px;left:12px;font-size:20px;");
    this.#livesEl = this.#el("❤️❤️❤️",
      "position:absolute;top:12px;right:12px;font-size:18px;");
    this.#msgEl   = this.#el("",
      `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
       font-size:36px;text-align:center;text-shadow:0 0 20px #0af;
       display:none;`);

    overlay.append(this.#scoreEl, this.#livesEl, this.#msgEl);

    // Insert overlay next to canvas
    canvas.parentElement?.appendChild(overlay)
      ?? document.body.appendChild(overlay);
  }

  #el(text, style) {
    const d = document.createElement("div");
    d.style.cssText = style;
    d.textContent   = text;
    return d;
  }

  update(score, lives) {
    this.#scoreEl.textContent = `Score: ${score.toLocaleString()}`;
    this.#livesEl.textContent = "❤️".repeat(Math.max(0, lives));
  }

  showMessage(msg) {
    this.#msgEl.textContent   = msg;
    this.#msgEl.style.display = "block";
  }

  hideMessage() { this.#msgEl.style.display = "none"; }
}

// ─── PROTECTION BLOCKS ───────────────────────────────────────
class ProtectionBlock {
  constructor(x, y) {
    this.x        = x;
    this.y        = y;
    this.strength = CFG.BLOCK_STRENGTH;
    this.w        = CFG.BLOCK_W;
    this.h        = CFG.BLOCK_H;
  }

  hit() { this.strength = Math.max(0, this.strength - 1); }
  get alive() { return this.strength > 0; }

  draw(ctx) {
    if (!this.alive) return;
    const t = this.strength / CFG.BLOCK_STRENGTH;
    ctx.fillStyle = `rgba(0,${Math.floor(180*t + 60)},${Math.floor(255*t)},${0.5+t*0.5})`;
    ctx.fillRect(this.x, this.y, this.w, this.h);

    // Crack overlay
    if (this.strength < CFG.BLOCK_STRENGTH) {
      ctx.strokeStyle = `rgba(255,255,255,${1-t})`;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(this.x + this.w * 0.3, this.y);
      ctx.lineTo(this.x + this.w * 0.5, this.y + this.h);
      ctx.stroke();
    }
  }
}

// ─── ATTACKER AI ─────────────────────────────────────────────
class AttackerAI {
  // Weighted shooting: attackers closer to player fire more often
  shouldFire(attacker, playerX, aliveCount, bulletCount) {
    if (bulletCount >= CFG.MAX_ATTACKER_BULLETS) return false;
    const dist     = Math.abs(attacker.x - playerX);
    const proximity= Math.max(0, 1 - dist / canvas.width);
    const rate     = CFG.ATTACKER_FIRE_RATE * (0.5 + proximity * 1.5)
                     * (1 + (15 - aliveCount) * 0.05); // speed up as fewer remain
    return Math.random() < rate / 60; // per-frame probability
  }
}

// ─── MAIN GAME CLASS ─────────────────────────────────────────
class Game {
  // Private fields
  #assets       = new AssetManager();
  #audio        = new AudioEngine();
  #particles    = new ParticleSystem();
  #shake        = new ScreenShake();
  #starfield;
  #input        = new InputManager();
  #hud          = new HUD();
  #ai           = new AttackerAI();
  #bulletPool;

  #attackers    = [];
  #playerBullets= [];
  #attackerBullets = [];
  #blocks       = [];

  #playerX;
  #playerY;
  #score        = 0;
  #lives        = 3;
  #canShoot     = true;
  #direction    = 1;       // attacker horizontal direction
  #hitPause     = 0;       // ms remaining in hit-pause
  #running      = false;
  #lastTime     = 0;
  #animFrame    = null;

  // Attacker animation
  #animTick     = 0;
  #animFrame2   = 0;       // 0 or 1 for sprite flip

  async init() {
    // Build asset manifest
    const manifest = [
      { key: "player", src: "space.png" },
      ...Array.from({ length: CFG.IMAGE_COUNT }, (_, i) =>
        ({ key: `act${i}`, src: `act${i}.png` })
      ),
    ];

    // Show loading state
    this.#drawLoading();

    try {
      await this.#assets.loadAll(manifest);
    } catch (e) {
      console.warn("Some assets failed to load:", e.message);
    }

    this.#starfield = new Starfield(canvas.width, canvas.height);
    this.#bulletPool = new ObjectPool(() =>
      ({ x:0, y:0, width:CFG.BULLET_W, height:CFG.BULLET_H, active:false }),
      40
    );

    this.#reset();
    this.#running = true;
    this.#lastTime = performance.now();
    this.#loop(this.#lastTime);
  }

  // ── Reset / Level Setup ──────────────────────────────────
  #reset() {
    this.#playerX = canvas.width  / 2 - CFG.PLAYER_W / 2;
    this.#playerY = canvas.height - CFG.PLAYER_H - 30;
    this.#playerBullets  = [];
    this.#attackerBullets= [];
    this.#score   = 0;
    this.#lives   = 3;
    this.#canShoot= true;
    this.#direction = 1;
    this.#hitPause  = 0;
    this.#buildAttackers();
    this.#buildBlocks();
    this.#hud.update(this.#score, this.#lives);
    this.#hud.hideMessage();
  }

  #buildAttackers() {
    this.#attackers = [];
    const startX = 60;
    const startY = 50;

    for (let c = 0; c < CFG.ATTACKER_COLS; c++) {
      this.#attackers[c] = [];
      for (let r = 0; r < CFG.ATTACKER_ROWS; r++) {
        this.#attackers[c][r] = {
          x          : startX + c * (CFG.ATTACKER_W + CFG.ATTACKER_SPACING_X),
          y          : startY + r * (CFG.ATTACKER_H + CFG.ATTACKER_SPACING_Y),
          alive      : true,
          imageIndex : Math.floor(Math.random() * CFG.IMAGE_COUNT),
          glowPhase  : Math.random() * Math.PI * 2,
        };
      }
    }
  }

  #buildBlocks() {
    this.#blocks = [];
    const totalW = CFG.BLOCK_COLS * (CFG.BLOCK_W + CFG.BLOCK_SPACING)
                   - CFG.BLOCK_SPACING;
    const startX = (canvas.width - totalW) / 2;
    const y      = canvas.height - 100;

    for (let c = 0; c < CFG.BLOCK_COLS; c++) {
      for (let r = 0; r < CFG.BLOCK_ROWS; r++) {
        this.#blocks.push(new ProtectionBlock(
          startX + c * (CFG.BLOCK_W + CFG.BLOCK_SPACING),
          y + r * (CFG.BLOCK_H + 4)
        ));
      }
    }
  }

  // ── Main Loop ────────────────────────────────────────────
  #loop = (timestamp) => {
    const dt = Math.min((timestamp - this.#lastTime) / 1000, 0.05); // cap at 50ms
    this.#lastTime = timestamp;

    this.#update(dt, timestamp);
    this.#render();

    if (this.#running) {
      this.#animFrame = requestAnimationFrame(this.#loop);
    }
  };

  // ── Update ───────────────────────────────────────────────
  #update(dt, timestamp) {
    if (this.#hitPause > 0) {
      this.#hitPause -= dt * 1000;
      this.#particles.update(dt);
      this.#shake.update(dt);
      this.#starfield.update(dt);
      return;
    }

    this.#starfield.update(dt);
    this.#particles.update(dt);
    this.#shake.update(dt);

    // Attacker animation tick
    this.#animTick += dt;
    if (this.#animTick > 0.5) {
      this.#animTick   = 0;
      this.#animFrame2 = 1 - this.#animFrame2;
    }

    this.#handleInput(dt);
    this.#moveAttackers(dt);
    this.#movePlayerBullets(dt);
    this.#moveAttackerBullets(dt);
    this.#attackersShoot(timestamp);
    this.#checkWinLose();
  }

  // ── Input ────────────────────────────────────────────────
  #handleInput(dt) {
    if (this.#input.isDown("ArrowRight")) {
      this.#playerX = Math.min(
        canvas.width - CFG.PLAYER_W,
        this.#playerX + CFG.PLAYER_SPEED * dt
      );
    }
    if (this.#input.isDown("ArrowLeft")) {
      this.#playerX = Math.max(0, this.#playerX - CFG.PLAYER_SPEED * dt);
    }
    if (this.#input.consume(" ") && this.#canShoot) {
      this.#firePlayerBullet();
    }
  }

  #firePlayerBullet() {
    const b = this.#bulletPool.acquire({
      x      : this.#playerX + CFG.PLAYER_W / 2 - CFG.BULLET_W / 2,
      y      : this.#playerY - CFG.BULLET_H,
      width  : CFG.BULLET_W,
      height : CFG.BULLET_H,
      active : true,
    });
    this.#playerBullets.push(b);
    this.#canShoot = false;
    this.#audio.laser();
  }

  // ── Attacker Movement ────────────────────────────────────
  #moveAttackers(dt) {
    let hitEdge = false;

    for (let c = 0; c < CFG.ATTACKER_COLS; c++) {
      for (let r = 0; r < CFG.ATTACKER_ROWS; r++) {
        const a = this.#attackers[c][r];
        if (!a.alive) continue;
        a.x += this.#direction * CFG.ATTACKER_SPEED * dt;
        if (a.x + CFG.ATTACKER_W > canvas.width || a.x < 0) hitEdge = true;
      }
    }

    if (hitEdge) {
      this.#direction *= -1;
      for (let c = 0; c < CFG.ATTACKER_COLS; c++) {
        for (let r = 0; r < CFG.ATTACKER_ROWS; r++) {
          this.#attackers[c][r].y += CFG.ATTACKER_DROP;
        }
      }
    }
  }

  // ── Player Bullets ───────────────────────────────────────
  #movePlayerBullets(dt) {
    for (let i = this.#playerBullets.length - 1; i >= 0; i--) {
      const b = this.#playerBullets[i];
      b.y -= CFG.BULLET_SPEED * dt;

      if (b.y + b.height < 0) {
        this.#bulletPool.release(b);
        this.#playerBullets.splice(i, 1);
        this.#canShoot = true;
        continue;
      }

      // vs attackers
      let hit = false;
      outer: for (let c = 0; c < CFG.ATTACKER_COLS; c++) {
        for (let r = 0; r < CFG.ATTACKER_ROWS; r++) {
          const a = this.#attackers[c][r];
          if (a.alive && this.#rectOverlap(b, a,
              CFG.ATTACKER_W, CFG.ATTACKER_H)) {
            a.alive = false;
            this.#score += CFG.SCORE_PER_KILL;
            this.#hud.update(this.#score, this.#lives);
            this.#particles.emit(
              a.x + CFG.ATTACKER_W / 2,
              a.y + CFG.ATTACKER_H / 2
            );
            this.#shake.add(0.15);
            this.#audio.explosion();
            this.#bulletPool.release(b);
            this.#playerBullets.splice(i, 1);
            this.#canShoot = true;
            hit = true;
            break outer;
          }
        }
      }
      if (hit) continue;

      // vs blocks
      for (const block of this.#blocks) {
        if (block.alive && this.#rectOverlap(b, block, block.w, block.h)) {
          block.hit();
          this.#bulletPool.release(b);
          this.#playerBullets.splice(i, 1);
          this.#canShoot = true;
          break;
        }
      }
    }
  }

  // ── Attacker Bullets ─────────────────────────────────────
  #moveAttackerBullets(dt) {
    for (let i = this.#attackerBullets.length - 1; i >= 0; i--) {
      const b = this.#attackerBullets[i];
      b.y += CFG.BULLET_SPEED * dt;

      if (b.y > canvas.height) {
        this.#bulletPool.release(b);
        this.#attackerBullets.splice(i, 1);
        continue;
      }

      // vs player
      if (this.#rectOverlap(b,
          { x: this.#playerX, y: this.#playerY },
          CFG.PLAYER_W, CFG.PLAYER_H)) {
        this.#bulletPool.release(b);
        this.#attackerBullets.splice(i, 1);
        this.#lives--;
        this.#hud.update(this.#score, this.#lives);
        this.#particles.emitPlayerHit(
          this.#playerX + CFG.PLAYER_W / 2,
          this.#playerY + CFG.PLAYER_H / 2
        );
        this.#shake.add(0.4);
        this.#audio.playerHit();
        this.#hitPause = CFG.HIT_PAUSE_MS;
        continue;
      }

      // vs blocks
      for (const block of this.#blocks) {
        if (block.alive && this.#rectOverlap(b, block, block.w, block.h)) {
          block.hit();
          this.#bulletPool.release(b);
          this.#attackerBullets.splice(i, 1);
          break;
        }
      }
    }
  }

  // ── Attacker Shooting (AI) ───────────────────────────────
  #attackersShoot(timestamp) {
    const alive = this.#countAlive();
    for (let c = 0; c < CFG.ATTACKER_COLS; c++) {
      for (let r = 0; r < CFG.ATTACKER_ROWS; r++) {
        const a = this.#attackers[c][r];
        if (!a.alive) continue;
        if (this.#ai.shouldFire(a, this.#playerX, alive,
            this.#attackerBullets.length)) {
          const b = this.#bulletPool.acquire({
            x      : a.x + CFG.ATTACKER_W / 2 - CFG.BULLET_W / 2,
            y      : a.y + CFG.ATTACKER_H,
            width  : CFG.BULLET_W,
            height : CFG.BULLET_H,
            active : true,
          });
          this.#attackerBullets.push(b);
        }
      }
    }
  }

  // ── Win / Lose ───────────────────────────────────────────
  #checkWinLose() {
    if (this.#lives <= 0) {
      this.#running = false;
      this.#hud.showMessage(`💀 GAME OVER\nScore: ${this.#score}\n[R] Restart`);
      window.addEventListener("keydown", this.#onRestart);
      return;
    }

    if (this.#countAlive() === 0) {
      this.#audio.levelUp();
      this.#hud.showMessage("🏆 YOU WIN!\n[R] Play Again");
      this.#running = false;
      window.addEventListener("keydown", this.#onRestart);
    }

    // Attacker reaches player row
    for (let c = 0; c < CFG.ATTACKER_COLS; c++) {
      for (let r = 0; r < CFG.ATTACKER_ROWS; r++) {
        const a = this.#attackers[c][r];
        if (a.alive && a.y + CFG.ATTACKER_H >= this.#playerY) {
          this.#lives = 0;
          this.#checkWinLose();
          return;
        }
      }
    }
  }

  #onRestart = (e) => {
    if (e.key === "r" || e.key === "R") {
      window.removeEventListener("keydown", this.#onRestart);
      this.#reset();
      this.#running  = true;
      this.#lastTime = performance.now();
      this.#loop(this.#lastTime);
    }
  };

  // ── Render ───────────────────────────────────────────────
  #render() {
    // Background
    ctx.fillStyle = "#000010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.#starfield.draw(ctx);

    this.#shake.apply(ctx);

    this.#drawBlocks();
    this.#drawAttackers();
    this.#drawPlayer();
    this.#drawBullets();
    this.#particles.draw(ctx);

    this.#shake.restore(ctx);
  }

  #drawLoading() {
    ctx.fillStyle = "#000010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0af";
    ctx.font      = "bold 28px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("Loading assets…", canvas.width / 2, canvas.height / 2);
    ctx.textAlign = "left";
  }

  #drawPlayer() {
    const img = this.#assets.get("player");
    if (img) {
      // Subtle engine glow
      ctx.save();
      ctx.shadowColor = "#0af";
      ctx.shadowBlur  = 12;
      ctx.drawImage(img, this.#playerX, this.#playerY,
        CFG.PLAYER_W, CFG.PLAYER_H);
      ctx.restore();
    } else {
      // Fallback shape
      ctx.fillStyle = "#0af";
      ctx.fillRect(this.#playerX, this.#playerY, CFG.PLAYER_W, CFG.PLAYER_H);
    }
  }

  #drawAttackers() {
    for (let c = 0; c < CFG.ATTACKER_COLS; c++) {
      for (let r = 0; r < CFG.ATTACKER_ROWS; r++) {
        const a = this.#attackers[c][r];
        if (!a.alive) continue;

        const key = `act${a.imageIndex}`;
        const img = this.#assets.get(key);

        // Animated glow pulse
        const glow = Math.sin(a.glowPhase + performance.now() * 0.002) * 0.5 + 0.5;

        ctx.save();
        ctx.shadowColor = `rgba(255,${Math.floor(100+glow*155)},0,0.8)`;
        ctx.shadowBlur  = 6 + glow * 8;

        if (img) {
          // Slight bob animation using animFrame2
          const bobY = this.#animFrame2 * 2;
          ctx.drawImage(img, a.x, a.y + bobY, CFG.ATTACKER_W, CFG.ATTACKER_H);
        } else {
          ctx.fillStyle = `hsl(${a.imageIndex * 24},80%,60%)`;
          ctx.fillRect(a.x, a.y, CFG.ATTACKER_W, CFG.ATTACKER_H);
        }
        ctx.restore();
      }
    }
  }

  #drawBullets() {
    // Player bullets — cyan laser
    for (const b of this.#playerBullets) {
      ctx.save();
      ctx.shadowColor = "#0ff";
      ctx.shadowBlur  = 8;
      ctx.fillStyle   = "#0ff";
      ctx.fillRect(b.x, b.y, b.width, b.height);
      ctx.restore();
    }

    // Attacker bullets — red plasma
    for (const b of this.#attackerBullets) {
      ctx.save();
      ctx.shadowColor = "#f40";
      ctx.shadowBlur  = 8;
      ctx.fillStyle   = "#f84";
      ctx.fillRect(b.x, b.y, b.width, b.height);
      ctx.restore();
    }
  }

  #drawBlocks() {
    for (const block of this.#blocks) block.draw(ctx);
  }

  // ── Helpers ──────────────────────────────────────────────
  #rectOverlap(a, b, bw, bh) {
    return (
      a.x < b.x + bw &&
      a.x + a.width  > b.x &&
      a.y < b.y + bh &&
      a.y + a.height > b.y
    );
  }

  #countAlive() {
    let n = 0;
    for (let c = 0; c < CFG.ATTACKER_COLS; c++)
      for (let r = 0; r < CFG.ATTACKER_ROWS; r++)
        if (this.#attackers[c][r].alive) n++;
    return n;
  }
}

// ─── BOOTSTRAP ───────────────────────────────────────────────
const game = new Game();
game.init().catch(console.error);
