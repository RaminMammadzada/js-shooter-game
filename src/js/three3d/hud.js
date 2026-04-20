/**
 * HUD overlay manager. Updates text nodes inside #hud-overlay
 * and handles the start menu (Solo / Host / Join), in-game banners,
 * toast popups, room-code display, and power-up indicator.
 */
class Hud {
  constructor() {
    this.root = document.getElementById("hud-overlay");
    this.scoreEl = document.getElementById("hud-score");
    this.livesEl = document.getElementById("hud-lives");
    this.waveEl = document.getElementById("hud-wave");
    this.banner = document.getElementById("hud-banner");
    this.toast = document.getElementById("hud-toast");
    this.powerEl = document.getElementById("hud-power");
    this.netStatusEl = document.getElementById("hud-net");
    this.toastTimer = null;
  }

  setScore(n) {
    if (this.scoreEl) this.scoreEl.textContent = String(n).padStart(6, "0");
  }

  setLives(n) {
    if (!this.livesEl) return;
    this.livesEl.textContent = "♥".repeat(Math.max(0, n));
  }

  setWave(n) {
    if (this.waveEl) this.waveEl.textContent = `WAVE ${n}`;
  }

  setPower(label) {
    if (!this.powerEl) return;
    if (!label) {
      this.powerEl.textContent = "";
      this.powerEl.classList.remove("visible");
    } else {
      this.powerEl.textContent = label;
      this.powerEl.classList.add("visible");
    }
  }

  setNetStatus(text) {
    if (!this.netStatusEl) return;
    this.netStatusEl.textContent = text || "";
    this.netStatusEl.classList.toggle("visible", !!text);
  }

  showBanner(title, subtitle, buttonText, onStart) {
    this._renderBanner({
      title,
      subtitle,
      body: `<button class="hud-btn primary" id="hud-primary">${escapeHtml(buttonText || "START")}</button>`,
    });
    document.getElementById("hud-primary").onclick = () => {
      this.hideBanner();
      if (onStart) onStart();
    };
  }

  showMenu({ onSolo, onHost, onJoin }) {
    this._renderBanner({
      title: "COSMOS WARS",
      subtitle:
        "WebGL space shooter · solo or two-player co-op over peer-to-peer",
      body: `
        <div class="hud-menu">
          <button class="hud-btn primary" id="hud-mode-solo">SOLO</button>
          <button class="hud-btn" id="hud-mode-host">HOST CO-OP</button>
          <button class="hud-btn" id="hud-mode-join">JOIN CO-OP</button>
        </div>
        <p class="hud-hint">Move: WASD / arrows / drag &middot; Fire: Space / hold mouse</p>
      `,
    });
    document.getElementById("hud-mode-solo").onclick = () => {
      this.hideBanner();
      if (onSolo) onSolo();
    };
    document.getElementById("hud-mode-host").onclick = () => {
      if (onHost) onHost();
    };
    document.getElementById("hud-mode-join").onclick = () => {
      if (onJoin) onJoin();
    };
  }

  showHostLobby({ code, shareUrl, onCancel, onStart }) {
    this._renderBanner({
      title: "HOSTING",
      subtitle: "Share this room code with player 2",
      body: `
        <div class="hud-room-code">${escapeHtml(code)}</div>
        <p class="hud-hint">or send this link:</p>
        <div class="hud-share">
          <input class="hud-input" id="hud-share-url" readonly value="${escapeAttr(shareUrl)}" />
          <button class="hud-btn small" id="hud-share-copy">COPY</button>
        </div>
        <p class="hud-status" id="hud-lobby-status">Waiting for player 2…</p>
        <div class="hud-row">
          <button class="hud-btn primary" id="hud-lobby-start" disabled>LAUNCH CO-OP</button>
          <button class="hud-btn ghost" id="hud-lobby-cancel">CANCEL</button>
        </div>
      `,
    });
    document.getElementById("hud-share-copy").onclick = async () => {
      const v = document.getElementById("hud-share-url").value;
      try {
        await navigator.clipboard.writeText(v);
        this.showToast("Link copied!");
      } catch (_) {
        document.getElementById("hud-share-url").select();
      }
    };
    document.getElementById("hud-lobby-cancel").onclick = () => {
      if (onCancel) onCancel();
    };
    document.getElementById("hud-lobby-start").onclick = () => {
      this.hideBanner();
      if (onStart) onStart();
    };
  }

  setLobbyConnected(connected) {
    const status = document.getElementById("hud-lobby-status");
    const btn = document.getElementById("hud-lobby-start");
    if (status)
      status.textContent = connected
        ? "Player 2 connected — ready to launch!"
        : "Waiting for player 2…";
    if (btn) btn.disabled = !connected;
  }

  showJoinForm({ onCancel, onJoin, prefillCode }) {
    this._renderBanner({
      title: "JOIN CO-OP",
      subtitle: "Enter the room code from your friend",
      body: `
        <input class="hud-input big" id="hud-join-code" maxlength="8"
               placeholder="ROOM CODE" value="${escapeAttr(prefillCode || "")}" />
        <p class="hud-status" id="hud-join-status"></p>
        <div class="hud-row">
          <button class="hud-btn primary" id="hud-join-go">CONNECT</button>
          <button class="hud-btn ghost" id="hud-join-cancel">CANCEL</button>
        </div>
      `,
    });
    const input = document.getElementById("hud-join-code");
    input.focus();
    input.addEventListener("input", () => {
      input.value = input.value.toUpperCase();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("hud-join-go").click();
    });
    document.getElementById("hud-join-cancel").onclick = () => {
      if (onCancel) onCancel();
    };
    document.getElementById("hud-join-go").onclick = () => {
      const code = input.value.trim().toUpperCase();
      if (code.length < 3) {
        document.getElementById("hud-join-status").textContent =
          "Code looks too short.";
        return;
      }
      if (onJoin) onJoin(code);
    };
  }

  setJoinStatus(text) {
    const el = document.getElementById("hud-join-status");
    if (el) el.textContent = text || "";
  }

  hideBanner() {
    if (this.banner) this.banner.classList.remove("visible");
  }

  showToast(text, ms = 1400) {
    if (!this.toast) return;
    this.toast.textContent = text;
    this.toast.classList.add("visible");
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast.classList.remove("visible");
    }, ms);
  }

  _renderBanner({ title, subtitle, body }) {
    if (!this.banner) return;
    this.banner.innerHTML = `
      <div class="hud-banner-title">${escapeHtml(title)}</div>
      <div class="hud-banner-sub">${escapeHtml(subtitle || "")}</div>
      <div class="hud-banner-body">${body}</div>
    `;
    this.banner.classList.add("visible");
  }
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}
function escapeAttr(s) {
  return escapeHtml(s);
}

export default Hud;
