import * as THREE from "three";
import {
  createPlayerShip,
  createPlayer2Ship,
  createEnemyShip,
  createBullet,
  createAsteroid,
  createPowerup,
  createBoss,
} from "./models";
import { createStarfield } from "./starfield";
import Hud from "./hud";
import { getSpaceMusic } from "../classes/util/spaceMusic";
import { NetHost, NetClient } from "./net";

const FIELD_X = 18;
const FIELD_Y = 11;
const SPAWN_Z = -120;
const KILL_Z = 12;

// ---------- helpers ----------
const _v = new THREE.Vector3();
function distSq2D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}
function shareUrlForCode(code) {
  const u = new URL(window.location.href);
  u.searchParams.set("join", code);
  u.hash = "";
  return u.toString();
}
function readJoinFromUrl() {
  const u = new URL(window.location.href);
  return (u.searchParams.get("join") || "").toUpperCase();
}

// ---------- Game ----------
class ThreeGame {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth;
    this.height = container.clientHeight || this.width * 0.6;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      62,
      this.width / this.height,
      0.1,
      2000,
    );
    this.camera.position.set(0, 2.5, 8);
    this.camera.lookAt(0, 0, -10);
    this.cameraShake = 0;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    // Lighting
    this.scene.add(new THREE.AmbientLight(0x445577, 0.6));
    const key = new THREE.DirectionalLight(0xffeec8, 1.0);
    key.position.set(5, 8, 6);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x66aaff, 0.7);
    rim.position.set(-6, -3, -8);
    this.scene.add(rim);

    createStarfield(this.scene);

    // Player ships (created up-front; visibility toggled by mode)
    this.player = createPlayerShip();
    this.player.position.set(0, 0, 2);
    this.scene.add(this.player);
    this.player2 = createPlayer2Ship();
    this.player2.position.set(3, 0, 2);
    this.player2.visible = false;
    this.scene.add(this.player2);

    // Game state
    this.bullets = [];
    this.enemies = [];
    this.asteroids = [];
    this.particles = [];
    this.powerups = [];
    this.boss = null;
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.fireCooldown = 0;
    this.fireCooldown2 = 0;
    this.spawnCooldown = 0;
    this.bossSpawnedForWave = 0;
    this.invuln = 0;
    this.invuln2 = 0;
    this.shield1 = 0;
    this.shield2 = 0;
    this.power1 = null; // {kind, until}
    this.power2 = null;
    this.running = false;
    this.gameOver = false;
    this.entId = 1;
    this.netRole = "solo"; // 'solo' | 'host' | 'client'
    this.net = null;
    this.netSnapTimer = 0;
    this.netInputTimer = 0;
    this.lastSnap = null; // for client interpolation
    this.remoteIn = { x: 0, y: 0, fire: false, dragging: false };

    this.input = {
      x: 0,
      y: 0,
      fire: false,
      dragging: false,
      dragX: 0,
      dragY: 0,
    };

    this.hud = new Hud();
    this.music = getSpaceMusic();

    this.bindInput();
    window.addEventListener("resize", () => this.onResize());
    if (typeof ResizeObserver !== "undefined") {
      this.ro = new ResizeObserver(() => this.onResize());
      this.ro.observe(container);
    }

    this.clock = new THREE.Clock();
    this.renderer.setAnimationLoop(() => this.tick());
    requestAnimationFrame(() => this.onResize());

    this.hud.setScore(0);
    this.hud.setLives(this.lives);
    this.hud.setWave(this.wave);
    this.openMenu();
  }

  // ---------- Menu / mode selection ----------
  openMenu() {
    // Pause the world while we're in menus so leftover entities can't keep
    // hitting the (forgotten) player from a previous run.
    this.running = false;
    // Reset visible HUD counters so a stale "lives = 1" doesn't confuse the
    // player while they're choosing the next mode.
    this.hud.setScore(0);
    this.hud.setLives(3);
    this.hud.setWave(1);
    this.hud.setPower(null);
    this.hud.setNetStatus("");
    const prefill = readJoinFromUrl();
    if (prefill) {
      this.openJoin(prefill);
      return;
    }
    this.hud.showMenu({
      onSolo: () => this.startSolo(),
      onHost: () => this.openHost(),
      onJoin: () => this.openJoin(),
    });
  }

  openHost() {
    this.running = false;
    this.netRole = "host";
    if (this.net) this.net.destroy();
    this.net = new NetHost();
    const showLobby = () => {
      const url = shareUrlForCode(this.net.code);
      this.hud.showHostLobby({
        code: this.net.code,
        shareUrl: url,
        onCancel: () => {
          this.net.destroy();
          this.net = null;
          this.netRole = "solo";
          this.openMenu();
        },
        onStart: () => {
          this.net.send({ t: "go" });
          this.startMultiplayer();
        },
      });
    };
    showLobby();
    this.net.onStatus = (s) => this.hud.showToast(s, 1800);
    this.net.onOpen = () => this.hud.setLobbyConnected(true);
    this.net.onClose = () => this.hud.setLobbyConnected(false);
    this.net.onMessage = (msg) => this.handleNetMessage(msg);
  }

  openJoin(prefill) {
    this.running = false;
    this.netRole = "client";
    this.hud.showJoinForm({
      prefillCode: prefill,
      onCancel: () => {
        if (this.net) {
          this.net.destroy();
          this.net = null;
        }
        this.netRole = "solo";
        this.openMenu();
      },
      onJoin: (code) => {
        if (this.net) this.net.destroy();
        this.net = new NetClient(code);
        this.net.onStatus = (s) => this.hud.setJoinStatus(s);
        this.net.onMessage = (msg) => this.handleNetMessage(msg);
        this.net.onOpen = () =>
          this.hud.setJoinStatus("Connected. Waiting for host to launch…");
        this.net.onClose = () =>
          this.hud.setJoinStatus("Disconnected from host.");
      },
    });
    if (prefill) {
      // auto-submit
      setTimeout(() => {
        const btn = document.getElementById("hud-join-go");
        if (btn) btn.click();
      }, 50);
    }
  }

  // ---------- Lifecycle ----------
  startSolo() {
    this.netRole = "solo";
    if (this.net) {
      this.net.destroy();
      this.net = null;
    }
    this.player2.visible = false;
    this.hud.setNetStatus("");
    this._beginRun();
  }

  startMultiplayer() {
    this.player2.visible = true;
    this.hud.setNetStatus(this.netRole === "host" ? "CO-OP · HOST" : "CO-OP · CLIENT");
    this._beginRun();
  }

  _beginRun() {
    this.reset();
    this.running = true;
    this.gameOver = false;
    this.invuln = 2.0;
    this.invuln2 = 2.0;
    this.spawnCooldown = 1.4;
    this.music.start();
    this.hud.hideBanner();
  }

  reset() {
    [...this.bullets, ...this.enemies, ...this.asteroids, ...this.particles, ...this.powerups]
      .forEach((o) => this.scene.remove(o.mesh));
    if (this.boss) {
      this.scene.remove(this.boss.mesh);
      this.boss = null;
    }
    this.bullets = [];
    this.enemies = [];
    this.asteroids = [];
    this.particles = [];
    this.powerups = [];
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.bossSpawnedForWave = 0;
    this.invuln = 0;
    this.invuln2 = 0;
    this.shield1 = 0;
    this.shield2 = 0;
    this.power1 = null;
    this.power2 = null;
    this.gameOver = false;
    this.player.position.set(this.netRole === "solo" ? 0 : -2, 0, 2);
    this.player.visible = true;
    this.player2.position.set(2, 0, 2);
    this.player2.visible = this.netRole !== "solo";
    this.hud.setScore(0);
    this.hud.setLives(this.lives);
    this.hud.setWave(this.wave);
    this.hud.setPower(null);
  }

  // ---------- Input ----------
  bindInput() {
    const keys = {};
    window.addEventListener("keydown", (e) => {
      keys[e.code] = true;
      if (e.code === "Space") e.preventDefault();
    });
    window.addEventListener("keyup", (e) => {
      keys[e.code] = false;
    });

    this.tickInput = () => {
      let x = 0;
      let y = 0;
      if (keys.ArrowLeft || keys.KeyA) x -= 1;
      if (keys.ArrowRight || keys.KeyD) x += 1;
      if (keys.ArrowUp || keys.KeyW) y += 1;
      if (keys.ArrowDown || keys.KeyS) y -= 1;
      this.input.x = x;
      this.input.y = y;
      this.input.fire = !!keys.Space || this.input.dragging;
    };

    const canvas = this.renderer.domElement;
    canvas.style.touchAction = "none";
    const setDrag = (cx, cy) => {
      const r = canvas.getBoundingClientRect();
      const nx = ((cx - r.left) / r.width) * 2 - 1;
      const ny = -(((cy - r.top) / r.height) * 2 - 1);
      this.input.dragX = nx * FIELD_X;
      this.input.dragY = ny * FIELD_Y;
    };
    canvas.addEventListener("pointerdown", (e) => {
      this.input.dragging = true;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {/* ignore */}
      setDrag(e.clientX, e.clientY);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (this.input.dragging) setDrag(e.clientX, e.clientY);
    });
    const endDrag = () => { this.input.dragging = false; };
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
  }

  // ---------- Networking ----------
  handleNetMessage(msg) {
    if (!msg || !msg.t) return;
    if (this.netRole === "host") {
      if (msg.t === "in") {
        this.remoteIn = msg;
      }
    } else if (this.netRole === "client") {
      if (msg.t === "go") {
        this.startMultiplayer();
      } else if (msg.t === "snap") {
        this.applySnapshot(msg);
      } else if (msg.t === "fx") {
        // small fx event: burst at position
        this.spawnBurst({ x: msg.x, y: msg.y, z: msg.z }, msg.c || 0xff8844, msg.n || 16);
        if (msg.shake) this.cameraShake = Math.max(this.cameraShake, msg.shake);
      } else if (msg.t === "over") {
        this.gameOver = true;
        this.running = false;
        this.hud.showBanner("GAME OVER", `Final score: ${msg.score}`,
          "BACK TO MENU", () => this.openMenu());
      }
    }
  }

  /** Build snapshot for transmission to client. Lightweight. */
  buildSnapshot() {
    const enc = (e, type) => ({
      id: e.id, t: type,
      x: +e.mesh.position.x.toFixed(2),
      y: +e.mesh.position.y.toFixed(2),
      z: +e.mesh.position.z.toFixed(2),
      r: e.radius || 0,
    });
    return {
      t: "snap",
      p1: { x: +this.player.position.x.toFixed(2), y: +this.player.position.y.toFixed(2), v: this.player.visible, i: this.invuln > 0 },
      p2: { x: +this.player2.position.x.toFixed(2), y: +this.player2.position.y.toFixed(2), v: this.player2.visible, i: this.invuln2 > 0 },
      bs: this.bullets.map((b) => ({
        id: b.id, x: +b.mesh.position.x.toFixed(2), y: +b.mesh.position.y.toFixed(2), z: +b.mesh.position.z.toFixed(2),
        f: b.friendly ? 1 : 0,
      })),
      es: this.enemies.map((e) => enc(e, "e")),
      as: this.asteroids.map((a) => enc(a, "a")),
      ps: this.powerups.map((p) => ({ id: p.id, k: p.kind,
        x: +p.mesh.position.x.toFixed(2), y: +p.mesh.position.y.toFixed(2), z: +p.mesh.position.z.toFixed(2) })),
      bo: this.boss ? { x: +this.boss.mesh.position.x.toFixed(2), y: +this.boss.mesh.position.y.toFixed(2), z: +this.boss.mesh.position.z.toFixed(2), hp: this.boss.hp } : null,
      sc: this.score, lv: this.lives, wv: this.wave,
      pw1: this.power1 ? this.power1.kind : null,
      pw2: this.power2 ? this.power2.kind : null,
      sh1: this.shield1, sh2: this.shield2,
    };
  }

  /** Apply received snapshot on client by reconciling local mesh pool. */
  applySnapshot(s) {
    if (!this.running) {
      this.running = true;
      this.player2.visible = true;
      this.hud.hideBanner();
      this.hud.setNetStatus("CO-OP · CLIENT");
    }
    this.lastSnap = s;
    // Players
    this.player.position.set(s.p1.x, s.p1.y, 2);
    this.player.visible = s.p1.v && !(s.p1.i && Math.floor(performance.now()/70)%2);
    this.player2.position.set(s.p2.x, s.p2.y, 2);
    this.player2.visible = s.p2.v && !(s.p2.i && Math.floor(performance.now()/70)%2);
    // HUD
    this.score = s.sc; this.lives = s.lv; this.wave = s.wv;
    this.hud.setScore(s.sc); this.hud.setLives(s.lv); this.hud.setWave(s.wv);
    const power = this.netRole === "client" ? s.pw2 : s.pw1;
    const shield = this.netRole === "client" ? s.sh2 : s.sh1;
    this._updatePowerHud(power, shield);
    // Reconcile entity pools
    this._reconcilePool(this.bullets, s.bs, (item) => {
      const c = item.f ? 0x66e0ff : 0xff5ed1;
      const m = createBullet(c);
      this.scene.add(m);
      return { mesh: m, id: item.id, friendly: !!item.f };
    });
    this._reconcilePool(this.enemies, s.es, (item) => {
      const m = createEnemyShip();
      this.scene.add(m);
      return { mesh: m, id: item.id };
    });
    this._reconcilePool(this.asteroids, s.as, (item) => {
      const r = item.r || 0.8;
      const m = createAsteroid(r);
      this.scene.add(m);
      return { mesh: m, id: item.id, radius: r };
    });
    this._reconcilePool(this.powerups, s.ps, (item) => {
      const m = createPowerup(item.k);
      this.scene.add(m);
      return { mesh: m, id: item.id, kind: item.k };
    });
    if (s.bo) {
      if (!this.boss) {
        const m = createBoss();
        this.scene.add(m);
        this.boss = { mesh: m, hp: s.bo.hp };
      }
      this.boss.mesh.position.set(s.bo.x, s.bo.y, s.bo.z);
      this.boss.hp = s.bo.hp;
    } else if (this.boss) {
      this.scene.remove(this.boss.mesh);
      this.boss = null;
    }
  }

  _reconcilePool(localArr, remoteArr, makeFn) {
    const seen = new Set();
    for (const item of remoteArr) {
      seen.add(item.id);
      let local = localArr.find((l) => l.id === item.id);
      if (!local) {
        local = makeFn(item);
        localArr.push(local);
      }
      local.mesh.position.set(item.x, item.y, item.z);
    }
    for (let i = localArr.length - 1; i >= 0; i -= 1) {
      if (!seen.has(localArr[i].id)) {
        this.scene.remove(localArr[i].mesh);
        localArr.splice(i, 1);
      }
    }
  }

  _updatePowerHud(kind, shield) {
    let label = "";
    if (kind === "rapid") label = "⚡ RAPID FIRE";
    else if (kind === "triple") label = "🔱 TRIPLE-SHOT";
    if (shield > 0) label = (label ? label + " · " : "") + "🛡 SHIELD";
    this.hud.setPower(label || null);
  }

  // ---------- Spawning ----------
  spawnEnemy() {
    const enemy = createEnemyShip();
    enemy.position.set(
      (Math.random() * 2 - 1) * FIELD_X * 0.85,
      (Math.random() * 2 - 1) * FIELD_Y * 0.85,
      SPAWN_Z,
    );
    this.scene.add(enemy);
    this.enemies.push({
      id: this.entId++,
      mesh: enemy,
      speed: 22 + this.wave * 2 + Math.random() * 6,
      drift: new THREE.Vector2((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4),
      hp: 1,
      fireTimer: 1 + Math.random() * 2,
    });
  }

  spawnAsteroid() {
    const radius = 0.6 + Math.random() * 1.4;
    const ast = createAsteroid(radius);
    ast.position.set(
      (Math.random() * 2 - 1) * FIELD_X,
      (Math.random() * 2 - 1) * FIELD_Y,
      SPAWN_Z,
    );
    this.scene.add(ast);
    this.asteroids.push({
      id: this.entId++,
      mesh: ast,
      speed: 18 + Math.random() * 10,
      spin: new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2),
      radius,
    });
  }

  spawnBoss() {
    const m = createBoss();
    m.position.set(0, 0, SPAWN_Z * 0.6);
    this.scene.add(m);
    this.boss = {
      mesh: m,
      id: this.entId++,
      hp: 12 + this.wave * 2,
      speed: 6,
      fireTimer: 1.5,
      sweepT: 0,
    };
    this.hud.showToast(`⚠ MINI-BOSS — WAVE ${this.wave} ⚠`, 2200);
  }

  spawnPowerup(at) {
    const kinds = ["rapid", "triple", "shield"];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const m = createPowerup(kind);
    m.position.copy(at);
    this.scene.add(m);
    this.powerups.push({ id: this.entId++, mesh: m, kind, speed: 8 });
  }

  fireFrom(ship, owner) {
    const power = owner === 1 ? this.power1 : this.power2;
    const color = owner === 1 ? 0x66e0ff : 0xff5ed1;
    const make = (offX, dir) => {
      const b = createBullet(color);
      b.position.copy(ship.position);
      b.position.x += offX;
      b.position.z -= 1.6;
      this.scene.add(b);
      const speed = 80;
      const vel = new THREE.Vector3(dir * 8, 0, -speed);
      this.bullets.push({ id: this.entId++, mesh: b, vel, friendly: true, owner });
    };
    if (power && power.kind === "triple") {
      make(0, 0); make(-0.7, -0.8); make(0.7, 0.8);
      make(-1.4, -1.6); make(1.4, 1.6);
    } else {
      make(0, 0); make(-1.0, 0); make(1.0, 0);
    }
  }

  enemyFireFrom(srcMesh, targetMesh) {
    const bullet = createBullet(0xff5ed1);
    bullet.position.copy(srcMesh.position);
    bullet.position.z += 1;
    this.scene.add(bullet);
    const dir = new THREE.Vector3()
      .subVectors(targetMesh.position, srcMesh.position)
      .normalize()
      .multiplyScalar(45);
    this.bullets.push({ id: this.entId++, mesh: bullet, vel: dir, friendly: false });
  }

  spawnBurst(position, color = 0xffaa66, count = 20) {
    for (let i = 0; i < count; i += 1) {
      const geo = new THREE.SphereGeometry(0.08 + Math.random() * 0.12, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(position);
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel: new THREE.Vector3((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14),
        life: 0.6 + Math.random() * 0.4,
      });
    }
  }

  applyPower(owner, kind) {
    const slot = owner === 1 ? "power1" : "power2";
    const shieldSlot = owner === 1 ? "shield1" : "shield2";
    if (kind === "shield") {
      this[shieldSlot] = 1;
    } else {
      this[slot] = { kind, until: performance.now() / 1000 + 8 };
    }
    if ((owner === 1 && this.netRole !== "client") || (owner === 2 && this.netRole === "client")) {
      this._updatePowerHud(kind === "shield" ? (this[slot] && this[slot].kind) : kind,
                           this[shieldSlot]);
      this.hud.showToast(`POWER-UP: ${kind.toUpperCase()}`);
    }
  }

  // ---------- Main tick ----------
  tick() {
    const dt = Math.min(0.05, this.clock.getDelta());
    this.tickInput();

    // Animate decorative powerup rings/spin even on title
    for (const p of this.powerups) {
      p.mesh.rotation.y += dt * 1.6;
      if (p.mesh.userData.ring) p.mesh.userData.ring.rotation.x += dt * 2.4;
    }

    if (this.netRole === "client") {
      // Local control of own ship (client = player2). Send to host.
      this.netInputTimer -= dt;
      if (this.netInputTimer <= 0) {
        this.netInputTimer = 1 / 30;
        if (this.net && this.net.conn && this.net.conn.open) {
          this.net.send({ t: "in", x: this.input.x, y: this.input.y,
            fire: this.input.fire, dragging: this.input.dragging,
            dragX: this.input.dragX, dragY: this.input.dragY });
        }
      }
      // Move own ship locally for snappy feel (host will overwrite via snapshot)
      this._movePlayerLocal(this.player2, this.input, dt);
      this._renderFrame(dt);
      return;
    }

    // SOLO or HOST: full simulation runs locally.
    if (this.netRole === "host") {
      // Apply remote input to player2
      this._movePlayerLocal(this.player2, this.remoteIn, dt);
      this.fireCooldown2 -= dt;
      const rapid2 = this.power2 && this.power2.kind === "rapid";
      if (this.remoteIn.fire && this.fireCooldown2 <= 0 && this.running && !this.gameOver) {
        this.fireFrom(this.player2, 2);
        this.fireCooldown2 = rapid2 ? 0.08 : 0.16;
      }
    }
    this._movePlayerLocal(this.player, this.input, dt);

    if (!this.running) {
      this._renderFrame(dt);
      return;
    }

    // Player 1 fire
    this.fireCooldown -= dt;
    const rapid1 = this.power1 && this.power1.kind === "rapid";
    if (this.input.fire && this.fireCooldown <= 0 && !this.gameOver) {
      this.fireFrom(this.player, 1);
      this.fireCooldown = rapid1 ? 0.08 : 0.16;
    }

    // Power timers
    const now = performance.now() / 1000;
    if (this.power1 && this.power1.until < now) this.power1 = null;
    if (this.power2 && this.power2.until < now) this.power2 = null;
    this._updatePowerHud(
      (this.netRole === "host" ? this.power1 : (this.power1 || this.power2))?.kind,
      this.netRole === "host" ? this.shield1 : Math.max(this.shield1, this.shield2),
    );

    // Boss spawn check (every 3 waves, once per wave)
    if (!this.boss && this.wave % 3 === 0 && this.bossSpawnedForWave !== this.wave) {
      this.spawnBoss();
      this.bossSpawnedForWave = this.wave;
    }

    // Regular spawning (paused while boss alive)
    if (!this.boss) {
      this.spawnCooldown -= dt;
      if (this.spawnCooldown <= 0 && !this.gameOver) {
        if (Math.random() < 0.65) this.spawnEnemy(); else this.spawnAsteroid();
        this.spawnCooldown = Math.max(0.4, 1.5 - this.wave * 0.07);
      }
    }

    // Bullets
    for (let i = this.bullets.length - 1; i >= 0; i -= 1) {
      const b = this.bullets[i];
      if (b.vel) {
        b.mesh.position.addScaledVector(b.vel, dt);
        b.mesh.lookAt(_v.copy(b.mesh.position).add(b.vel));
      }
      const z = b.mesh.position.z;
      if (z < SPAWN_Z - 5 || z > KILL_Z + 8 || Math.abs(b.mesh.position.x) > 50 || Math.abs(b.mesh.position.y) > 50) {
        this.scene.remove(b.mesh);
        this.bullets.splice(i, 1);
      }
    }

    // Power-up drift
    for (let i = this.powerups.length - 1; i >= 0; i -= 1) {
      const p = this.powerups[i];
      p.mesh.position.z += p.speed * dt;
      // Pickup check (both players)
      const players = [{ s: this.player, owner: 1 }];
      if (this.netRole !== "solo") players.push({ s: this.player2, owner: 2 });
      let picked = false;
      for (const pl of players) {
        if (distSq2D(p.mesh.position, pl.s.position) < 1.4 ** 2) {
          this.applyPower(pl.owner, p.kind);
          this.spawnBurst(p.mesh.position, 0xffffaa, 14);
          picked = true;
          break;
        }
      }
      if (picked || p.mesh.position.z > KILL_Z) {
        this.scene.remove(p.mesh);
        this.powerups.splice(i, 1);
      }
    }

    // Enemies
    for (let i = this.enemies.length - 1; i >= 0; i -= 1) {
      const e = this.enemies[i];
      e.mesh.position.z += e.speed * dt;
      e.mesh.position.x += e.drift.x * dt;
      e.mesh.position.y += e.drift.y * dt;
      e.mesh.rotation.z += dt * 1.2;

      e.fireTimer -= dt;
      if (e.fireTimer <= 0 && e.mesh.position.z < -10) {
        const target = (this.netRole !== "solo" && Math.random() < 0.5) ? this.player2 : this.player;
        this.enemyFireFrom(e.mesh, target);
        e.fireTimer = 1.6 + Math.random() * 1.5;
      }

      if (e.mesh.position.z > KILL_Z) {
        this.scene.remove(e.mesh);
        this.enemies.splice(i, 1);
        continue;
      }

      for (let j = this.bullets.length - 1; j >= 0; j -= 1) {
        const b = this.bullets[j];
        if (!b.friendly) continue;
        if (distSq2D(b.mesh.position, e.mesh.position) < 1.6) {
          this.spawnBurst(e.mesh.position, 0xff8844, 18);
          this._broadcastFx(e.mesh.position, 0xff8844, 18, 0);
          this.scene.remove(e.mesh);
          this.scene.remove(b.mesh);
          this.enemies.splice(i, 1);
          this.bullets.splice(j, 1);
          this._scoreUp(100);
          if (Math.random() < 0.18) this.spawnPowerup(e.mesh.position);
          break;
        }
      }
    }

    // Asteroids
    for (let i = this.asteroids.length - 1; i >= 0; i -= 1) {
      const a = this.asteroids[i];
      a.mesh.position.z += a.speed * dt;
      a.mesh.rotation.x += a.spin.x * dt;
      a.mesh.rotation.y += a.spin.y * dt;
      a.mesh.rotation.z += a.spin.z * dt;
      if (a.mesh.position.z > KILL_Z) {
        this.scene.remove(a.mesh);
        this.asteroids.splice(i, 1);
        continue;
      }
      for (let j = this.bullets.length - 1; j >= 0; j -= 1) {
        const b = this.bullets[j];
        if (!b.friendly) continue;
        if (distSq2D(b.mesh.position, a.mesh.position) < (a.radius + 0.2) ** 2) {
          this.spawnBurst(a.mesh.position, 0xaa9988, 12);
          this.scene.remove(b.mesh);
          this.bullets.splice(j, 1);
          a.radius -= 0.3;
          a.mesh.scale.multiplyScalar(0.7);
          if (a.radius < 0.4) {
            this.scene.remove(a.mesh);
            this.asteroids.splice(i, 1);
            this._scoreUp(25);
          }
          break;
        }
      }
    }

    // Boss
    if (this.boss) {
      this.boss.sweepT += dt;
      const bm = this.boss.mesh;
      // approach then sweep
      if (bm.position.z < -22) {
        bm.position.z += this.boss.speed * dt;
      } else {
        bm.position.x = Math.sin(this.boss.sweepT * 0.7) * 12;
        bm.position.y = Math.cos(this.boss.sweepT * 0.5) * 5;
      }
      bm.rotation.y += dt * 0.6;
      bm.rotation.z += dt * 0.3;
      this.boss.fireTimer -= dt;
      if (this.boss.fireTimer <= 0) {
        // Triple spread toward random player
        const tgt = (this.netRole !== "solo" && Math.random() < 0.5) ? this.player2 : this.player;
        const base = new THREE.Vector3().subVectors(tgt.position, bm.position).normalize();
        for (let k = -1; k <= 1; k += 1) {
          const dir = base.clone();
          dir.x += k * 0.18;
          dir.normalize().multiplyScalar(48);
          const bullet = createBullet(0xffaa00);
          bullet.position.copy(bm.position);
          bullet.position.z += 2;
          this.scene.add(bullet);
          this.bullets.push({ id: this.entId++, mesh: bullet, vel: dir, friendly: false });
        }
        this.boss.fireTimer = 1.0;
      }
      // Bullet hits
      for (let j = this.bullets.length - 1; j >= 0; j -= 1) {
        const b = this.bullets[j];
        if (!b.friendly) continue;
        if (distSq2D(b.mesh.position, bm.position) < 4.5) {
          this.spawnBurst(b.mesh.position, 0xffcc66, 8);
          this.scene.remove(b.mesh);
          this.bullets.splice(j, 1);
          this.boss.hp -= 1;
          this.cameraShake = Math.max(this.cameraShake, 0.15);
          if (this.boss.hp <= 0) {
            this.spawnBurst(bm.position, 0xffaa00, 60);
            this._broadcastFx(bm.position, 0xffaa00, 60, 0.6);
            this.cameraShake = Math.max(this.cameraShake, 0.6);
            this.scene.remove(bm);
            this.boss = null;
            this._scoreUp(1500);
            this.spawnPowerup({ x: 0, y: 0, z: -10 });
            this.hud.showToast("MINI-BOSS DOWN!", 1800);
            break;
          }
        }
      }
    }

    // Player collisions (per player)
    this._tickPlayerHits(this.player, 1, dt);
    if (this.netRole !== "solo") this._tickPlayerHits(this.player2, 2, dt);

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.life -= dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.vel.multiplyScalar(0.94);
      p.mesh.material.opacity = Math.max(0, p.life);
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }

    // Wave up
    if (this.score > 0 && this.score >= this.wave * 1000) {
      this.wave += 1;
      this.hud.setWave(this.wave);
      this.hud.showToast(`WAVE ${this.wave}!`);
    }

    // Net snapshot send
    if (this.netRole === "host") {
      this.netSnapTimer -= dt;
      if (this.netSnapTimer <= 0) {
        this.netSnapTimer = 1 / 20;
        if (this.net && this.net.conn && this.net.conn.open) {
          this.net.send(this.buildSnapshot());
        }
      }
    }

    this._renderFrame(dt);
  }

  _scoreUp(n) {
    this.score += n;
    this.hud.setScore(this.score);
  }

  _broadcastFx(pos, color, count, shake) {
    if (this.netRole !== "host" || !this.net || !this.net.conn || !this.net.conn.open) return;
    this.net.send({ t: "fx", x: pos.x, y: pos.y, z: pos.z, c: color, n: count, shake });
  }

  _tickPlayerHits(ship, owner, dt) {
    const invKey = owner === 1 ? "invuln" : "invuln2";
    const shieldKey = owner === 1 ? "shield1" : "shield2";
    if (this[invKey] > 0) this[invKey] -= dt;
    if (this[invKey] > 0 || this.gameOver) return;
    let hit = null;
    for (const e of this.enemies) {
      if (distSq2D(e.mesh.position, ship.position) < 1.4 ** 2) {
        hit = { mesh: e.mesh, src: this.enemies };
        break;
      }
    }
    if (!hit) {
      for (const a of this.asteroids) {
        if (distSq2D(a.mesh.position, ship.position) < (a.radius + 0.6) ** 2) {
          hit = { mesh: a.mesh, src: this.asteroids };
          break;
        }
      }
    }
    if (!hit && this.boss && distSq2D(this.boss.mesh.position, ship.position) < 6.5 ** 2) {
      hit = { kind: "boss" };
    }
    if (!hit) {
      for (let j = this.bullets.length - 1; j >= 0; j -= 1) {
        const b = this.bullets[j];
        if (b.friendly) continue;
        if (distSq2D(b.mesh.position, ship.position) < 0.6 ** 2) {
          this.scene.remove(b.mesh);
          this.bullets.splice(j, 1);
          hit = { kind: "bullet" };
          break;
        }
      }
    }
    if (!hit) return;
    if (this[shieldKey] > 0) {
      this[shieldKey] = 0;
      this.spawnBurst(ship.position, 0x66e0ff, 20);
      this._broadcastFx(ship.position, 0x66e0ff, 20, 0.2);
      this[invKey] = 1.0;
      this.hud.showToast("SHIELD ABSORBED!");
      return;
    }
    this.spawnBurst(ship.position, owner === 1 ? 0x66e0ff : 0xff5ed1, 30);
    this._broadcastFx(ship.position, owner === 1 ? 0x66e0ff : 0xff5ed1, 30, 0.35);
    this.cameraShake = Math.max(this.cameraShake, 0.35);
    this.lives -= 1;
    this.hud.setLives(this.lives);
    this[invKey] = 1.6;
    if (hit.src && hit.mesh) {
      const idx = hit.src.findIndex((o) => o.mesh === hit.mesh);
      if (idx >= 0) {
        this.scene.remove(hit.mesh);
        hit.src.splice(idx, 1);
      }
    }
    if (this.lives <= 0) this.endGame();
  }

  _movePlayerLocal(ship, inp, dt) {
    const PSPEED = 26;
    if (inp.dragging) {
      const lerp = 1 - Math.exp(-dt * 12);
      ship.position.x += (inp.dragX - ship.position.x) * lerp;
      ship.position.y += (inp.dragY - ship.position.y) * lerp;
    } else {
      ship.position.x += (inp.x || 0) * PSPEED * dt;
      ship.position.y += (inp.y || 0) * PSPEED * dt;
    }
    ship.position.x = THREE.MathUtils.clamp(ship.position.x, -FIELD_X, FIELD_X);
    ship.position.y = THREE.MathUtils.clamp(ship.position.y, -FIELD_Y, FIELD_Y);
    const targetRoll = -(inp.x || 0) * 0.5;
    const targetPitch = -(inp.y || 0) * 0.25;
    ship.rotation.z += (targetRoll - ship.rotation.z) * 0.15;
    ship.rotation.x += (targetPitch - ship.rotation.x) * 0.15;
    // Player blink while invuln
    const inv = ship === this.player ? this.invuln : this.invuln2;
    ship.visible = !(inv > 0 && Math.floor(inv * 14) % 2 === 0);
  }

  _renderFrame(_dt) {
    // Camera follows the average of both player ships in coop, else just p1
    let tx = this.player.position.x;
    let ty = this.player.position.y;
    if (this.netRole !== "solo" && this.player2.visible) {
      tx = (this.player.position.x + this.player2.position.x) * 0.5;
      ty = (this.player.position.y + this.player2.position.y) * 0.5;
    }
    const camTargetX = tx * 0.35;
    const camTargetY = 2.2 + ty * 0.2;
    this.camera.position.x += (camTargetX - this.camera.position.x) * 0.08;
    this.camera.position.y += (camTargetY - this.camera.position.y) * 0.08;

    // Screen shake decay
    if (this.cameraShake > 0) {
      const s = this.cameraShake;
      this.camera.position.x += (Math.random() - 0.5) * s;
      this.camera.position.y += (Math.random() - 0.5) * s;
      this.cameraShake = Math.max(0, this.cameraShake - 0.04);
    }
    this.camera.lookAt(tx * 0.5, ty * 0.4, -20);
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight || w * 0.6;
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  endGame() {
    this.gameOver = true;
    this.running = false;
    this.player.visible = true;
    this.player2.visible = this.netRole !== "solo";
    if (this.netRole === "host" && this.net && this.net.conn && this.net.conn.open) {
      this.net.send({ t: "over", score: this.score });
    }
    this.hud.showBanner("GAME OVER", `Final score: ${this.score}`,
      "BACK TO MENU", () => this.openMenu());
  }
}

export default ThreeGame;
