/**
 * Procedural space-ambient music synthesizer.
 *
 * Generates a looping background track at runtime using the Web Audio API,
 * so we don't need to ship a music binary. The track is a slow chord pad
 * with an arpeggiated lead over a 4-chord progression in A minor.
 */

const PROGRESSION = [
  // [root semitones from A4=0, chord intervals]
  { root: -12, intervals: [0, 7, 12, 15] }, // Am
  { root: -7,  intervals: [0, 7, 12, 16] }, // F  (relative)
  { root: -5,  intervals: [0, 7, 12, 16] }, // C
  { root: -3,  intervals: [0, 7, 12, 15] }, // Dm
];

const ARP_PATTERN = [0, 2, 1, 3, 1, 2];

const A4 = 440;
const semitone = (n) => A4 * (2 ** (n / 12));

class SpaceMusic {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.timer = null;
    this.playing = false;
    this.volume = 0.18;
  }

  ensureContext() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);
  }

  start() {
    this.ensureContext();
    if (!this.ctx || this.playing) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.playing = true;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 1.2);

    const beat = 0.5; // seconds per arp note
    const barNotes = ARP_PATTERN.length;
    const barDuration = beat * barNotes;
    let chordIndex = 0;

    const scheduleBar = () => {
      if (!this.playing || !this.ctx) return;
      const now = this.ctx.currentTime;
      const chord = PROGRESSION[chordIndex % PROGRESSION.length];
      this.scheduleChordPad(now, barDuration, chord);
      this.scheduleArp(now, beat, chord);
      this.scheduleBass(now, barDuration, chord);
      chordIndex += 1;
    };

    scheduleBar();
    this.timer = window.setInterval(scheduleBar, barDuration * 1000);
  }

  stop() {
    if (!this.ctx || !this.playing) return;
    this.playing = false;
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.4);
  }

  scheduleChordPad(startTime, duration, chord) {
    chord.intervals.forEach((iv) => {
      const freq = semitone(chord.root + iv);
      this.voice({
        type: 'sawtooth',
        freq,
        startTime,
        duration: duration + 0.4,
        attack: 0.6,
        release: 0.8,
        peak: 0.06,
        filterFreq: 1200,
      });
      this.voice({
        type: 'sine',
        freq: freq * 2,
        startTime,
        duration: duration + 0.4,
        attack: 0.8,
        release: 0.8,
        peak: 0.04,
        filterFreq: 2400,
      });
    });
  }

  scheduleArp(startTime, beat, chord) {
    ARP_PATTERN.forEach((step, i) => {
      const interval = chord.intervals[step % chord.intervals.length];
      const freq = semitone(chord.root + interval + 12); // up an octave
      this.voice({
        type: 'triangle',
        freq,
        startTime: startTime + i * beat,
        duration: beat * 0.9,
        attack: 0.01,
        release: 0.25,
        peak: 0.09,
        filterFreq: 3500,
      });
    });
  }

  scheduleBass(startTime, duration, chord) {
    const freq = semitone(chord.root - 12);
    this.voice({
      type: 'sine',
      freq,
      startTime,
      duration: duration + 0.2,
      attack: 0.05,
      release: 0.4,
      peak: 0.18,
      filterFreq: 600,
    });
  }

  voice({ type, freq, startTime, duration, attack, release, peak, filterFreq }) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    osc.type = type;
    osc.frequency.value = freq;

    const t0 = startTime;
    const tEnd = startTime + duration;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + attack);
    gain.gain.setValueAtTime(peak, Math.max(t0 + attack, tEnd - release));
    gain.gain.linearRampToValueAtTime(0, tEnd);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);

    osc.start(t0);
    osc.stop(tEnd + 0.05);
  }
}

// Shared across scene transitions so the loop doesn't restart.
let shared = null;
export function getSpaceMusic() {
  if (!shared) shared = new SpaceMusic();
  return shared;
}

export default SpaceMusic;
