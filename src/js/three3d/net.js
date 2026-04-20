import { Peer } from "peerjs";

// Tiny PeerJS wrapper for 2-player co-op.
// Uses the public PeerServer broker (free, works from static GitHub Pages).
// Host generates a room code; client connects with that code.
// Game data flows over a single WebRTC DataChannel.

const ROOM_PREFIX = "cosmoswars-"; // namespace so we don't collide with random peers

function randomCode(len = 5) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // omit confusables
  let out = "";
  for (let i = 0; i < len; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export class NetHost {
  constructor() {
    this.role = "host";
    this.code = randomCode();
    this.conn = null;
    this.onOpen = null; // called when remote client connects
    this.onClose = null;
    this.onMessage = null; // called with parsed JSON messages from client
    this.onStatus = null; // called with human-readable status updates
    this.peer = new Peer(ROOM_PREFIX + this.code, { debug: 1 });
    this.peer.on("open", () => {
      if (this.onStatus) this.onStatus(`Room ${this.code} ready. Waiting…`);
    });
    this.peer.on("error", (err) => {
      if (this.onStatus) this.onStatus(`Net error: ${err.type || err.message}`);
    });
    this.peer.on("connection", (conn) => {
      this.conn = conn;
      conn.on("open", () => {
        if (this.onStatus) this.onStatus("Player 2 connected!");
        if (this.onOpen) this.onOpen();
      });
      conn.on("data", (raw) => {
        try {
          const msg = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (this.onMessage) this.onMessage(msg);
        } catch (_) {
          /* ignore malformed */
        }
      });
      conn.on("close", () => {
        this.conn = null;
        if (this.onStatus) this.onStatus("Player 2 disconnected.");
        if (this.onClose) this.onClose();
      });
    });
  }

  send(msg) {
    if (this.conn && this.conn.open) this.conn.send(JSON.stringify(msg));
  }

  destroy() {
    try {
      if (this.conn) this.conn.close();
    } catch (_) {
      /* ignore */
    }
    try {
      if (this.peer) this.peer.destroy();
    } catch (_) {
      /* ignore */
    }
  }
}

export class NetClient {
  constructor(code) {
    this.role = "client";
    this.code = String(code || "")
      .trim()
      .toUpperCase();
    this.conn = null;
    this.onOpen = null;
    this.onClose = null;
    this.onMessage = null;
    this.onStatus = null;
    this.peer = new Peer({ debug: 1 });
    this.peer.on("open", () => {
      if (this.onStatus) this.onStatus(`Connecting to ${this.code}…`);
      const conn = this.peer.connect(ROOM_PREFIX + this.code, {
        reliable: false, // unreliable+ordered = lower-latency, suits realtime
      });
      this.conn = conn;
      conn.on("open", () => {
        if (this.onStatus) this.onStatus("Connected!");
        if (this.onOpen) this.onOpen();
      });
      conn.on("data", (raw) => {
        try {
          const msg = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (this.onMessage) this.onMessage(msg);
        } catch (_) {
          /* ignore */
        }
      });
      conn.on("close", () => {
        this.conn = null;
        if (this.onStatus) this.onStatus("Host disconnected.");
        if (this.onClose) this.onClose();
      });
      conn.on("error", (err) => {
        if (this.onStatus)
          this.onStatus(`Connect error: ${err.type || err.message}`);
      });
    });
    this.peer.on("error", (err) => {
      if (this.onStatus) this.onStatus(`Net error: ${err.type || err.message}`);
    });
  }

  send(msg) {
    if (this.conn && this.conn.open) this.conn.send(JSON.stringify(msg));
  }

  destroy() {
    try {
      if (this.conn) this.conn.close();
    } catch (_) {
      /* ignore */
    }
    try {
      if (this.peer) this.peer.destroy();
    } catch (_) {
      /* ignore */
    }
  }
}
