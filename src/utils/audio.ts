const VOLUME_KEY = "cinexox_volume";

/** Kaydırıcı 0..1 -> doğrusal kazanç. Kare alma, hareketi tüm kaydırma boyuna yayar (audio-design). */
export function volumeToGain(slider01: number): number {
  const v = Math.min(1, Math.max(0, Number.isFinite(slider01) ? slider01 : 1));
  return v <= 0 ? 0 : v * v;
}

/** Aynı sesin her çalışta hafifçe farklı çıkması için perde çarpanı: 1 ± spread. */
export function pitchVariation(spread: number, rand: () => number = Math.random): number {
  return 1 + (rand() * 2 - 1) * spread;
}

export class AudioService {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private volume: number = 1;
  private muted: boolean = false;
  private activeOscillators: OscillatorNode[] = [];
  private activeTimeouts: NodeJS.Timeout[] = [];

  constructor() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = window.localStorage.getItem(VOLUME_KEY);
        if (saved !== null) {
          const n = Number(saved);
          if (Number.isFinite(n)) this.volume = Math.min(1, Math.max(0, n));
        }
      }
    } catch {
      // Depolama yoksa varsayılan düzey
    }
  }

  /** Tüm sesler tek ana kanaldan geçer: ses düzeyi + limiter (üst üste binen sesler kırpılmasın). */
  private out(): AudioNode {
    const ctx = this.context as AudioContext;
    if (!this.master) {
      const master = ctx.createGain();
      master.gain.value = volumeToGain(this.volume);
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -6;
      limiter.knee.value = 0;
      limiter.ratio.value = 20;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.12;
      master.connect(limiter);
      limiter.connect(ctx.destination);
      this.master = master;
    }
    return this.master;
  }

  public setVolume(slider01: number): void {
    this.volume = Math.min(1, Math.max(0, Number.isFinite(slider01) ? slider01 : 1));
    if (this.master) this.master.gain.value = volumeToGain(this.volume);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(VOLUME_KEY, String(this.volume));
      }
    } catch {
      // Kayıt başarısız olursa oturum boyunca geçerli kalır
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  private initializeContext(): void {
    if (typeof window === "undefined") return;

    if (!this.context) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (AudioContextClass) {
        this.context = new AudioContextClass();
      }
    }

    if (this.context && this.context.state === "suspended") {
      this.context.resume().catch(() => {});
    }
  }

  private registerOscillator(osc: OscillatorNode): void {
    this.activeOscillators.push(osc);
    const cleanup = () => {
      this.activeOscillators = this.activeOscillators.filter((o) => o !== osc);
    };
    osc.addEventListener("ended", cleanup, { once: true });
  }

  public stopAll(): void {
    this.activeTimeouts.forEach((t) => clearTimeout(t));
    this.activeTimeouts = [];

    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Node already stopped or disconnected
      }
    });
    this.activeOscillators = [];
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopAll();
    }
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public playSelect(): void {
    if (this.muted) return;
    this.initializeContext();
    if (!this.context) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    const pv = pitchVariation(0.03);
    osc.type = "sine";
    osc.frequency.setValueAtTime(440 * pv, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880 * pv, this.context.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.out());

    this.registerOscillator(osc);
    osc.start();
    osc.stop(this.context.currentTime + 0.05);
  }

  // Sinematik 35mm film seti ahşap klaket çarpma sesi (tok ahşap rezonans + keskin çat sesi)
  public playClapperSnap(): void {
    if (this.muted) return;
    this.initializeContext();
    if (!this.context) return;

    const now = this.context.currentTime;

    // 1. Katman: Tok ahşap gövde darbesi (düşük frekanslı tok rezonans)
    const woodOsc = this.context.createOscillator();
    const woodGain = this.context.createGain();
    woodOsc.type = "triangle";
    const pvW = pitchVariation(0.04);
    woodOsc.frequency.setValueAtTime(260 * pvW, now);
    woodOsc.frequency.exponentialRampToValueAtTime(72 * pvW, now + 0.045);
    woodGain.gain.setValueAtTime(0.45, now);
    woodGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    woodOsc.connect(woodGain);
    woodGain.connect(this.out());
    this.registerOscillator(woodOsc);
    woodOsc.start(now);
    woodOsc.stop(now + 0.055);

    // 2. Katman: Keskin mekanik klik / clapper arm çat sesi
    const snapOsc = this.context.createOscillator();
    const snapGain = this.context.createGain();
    snapOsc.type = "sawtooth";
    snapOsc.frequency.setValueAtTime(1400, now);
    snapOsc.frequency.exponentialRampToValueAtTime(320, now + 0.016);
    snapGain.gain.setValueAtTime(0.28, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
    snapOsc.connect(snapGain);
    snapGain.connect(this.out());
    this.registerOscillator(snapOsc);
    snapOsc.start(now);
    snapOsc.stop(now + 0.02);
  }

  // Analog klaket / mekanik arcade hücre mühürleme sesi (çift katmanlı tok darbe + mekanik klik)
  public playChessMove(): void {
    if (this.muted) return;
    this.initializeContext();
    if (!this.context) return;

    const now = this.context.currentTime;

    // 1. Katman: Tok mekanik gövde vuruşu
    const bodyOsc = this.context.createOscillator();
    const bodyGain = this.context.createGain();
    bodyOsc.type = "sine";
    const pvB = pitchVariation(0.05);
    bodyOsc.frequency.setValueAtTime(210 * pvB, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(62 * pvB, now + 0.055);
    bodyGain.gain.setValueAtTime(0.36, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    bodyOsc.connect(bodyGain);
    bodyGain.connect(this.out());
    this.registerOscillator(bodyOsc);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.065);

    // 2. Katman: Kısa klaket mandalı klik geçişi
    const clickOsc = this.context.createOscillator();
    const clickGain = this.context.createGain();
    clickOsc.type = "triangle";
    clickOsc.frequency.setValueAtTime(1180, now);
    clickOsc.frequency.exponentialRampToValueAtTime(340, now + 0.018);
    clickGain.gain.setValueAtTime(0.16, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    clickOsc.connect(clickGain);
    clickGain.connect(this.out());
    this.registerOscillator(clickOsc);
    clickOsc.start(now);
    clickOsc.stop(now + 0.022);
  }

  // Kafa Topu 2 tarzı süper güç / joker açılış sesi
  public playPowerup(): void {
    if (this.muted) return;
    this.initializeContext();
    if (!this.context) return;

    const now = this.context.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((freq, idx) => {
      if (!this.context) return;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.2, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.18);

      osc.connect(gain);
      gain.connect(this.out());

      this.registerOscillator(osc);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.2);
    });
  }

  // Block Blast tarzı artan kombo sesi (Her komboda nota yükselir)
  public playCombo(comboIndex: number = 1): void {
    if (this.muted) return;
    this.initializeContext();
    if (!this.context) return;

    // Pentatonic scale base frequencies
    const baseFreqs = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
    const freq = baseFreqs[Math.min(comboIndex, baseFreqs.length - 1)];
    const now = this.context.currentTime;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.12);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.out());

    this.registerOscillator(osc);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playSuccess(): void {
    if (this.muted) return;
    this.initializeContext();
    if (!this.context) return;

    const now = this.context.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 triad
    notes.forEach((freq, idx) => {
      if (!this.context) return;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.15, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);

      osc.connect(gain);
      gain.connect(this.out());

      this.registerOscillator(osc);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.22);
    });
  }

  public playError(): void {
    if (this.muted) return;
    this.initializeContext();
    if (!this.context) return;

    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = "sawtooth";
    const pvE = pitchVariation(0.04);
    osc.frequency.setValueAtTime(160 * pvE, now);
    osc.frequency.linearRampToValueAtTime(90 * pvE, now + 0.18);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.out());

    this.registerOscillator(osc);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playTick(frequency: number = 800): void {
    if (this.muted) return;
    this.initializeContext();
    if (!this.context) return;

    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency * pitchVariation(0.015), now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.out());

    this.registerOscillator(osc);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playVictory(): void {
    if (this.muted) return;
    this.initializeContext();
    if (!this.context) return;

    const chords = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
    const now = this.context.currentTime;

    chords.forEach((freq, index) => {
      if (!this.context) return;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + index * 0.07);

      gain.gain.setValueAtTime(0.2, now + index * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + 0.45);

      osc.connect(gain);
      gain.connect(this.out());

      this.registerOscillator(osc);
      osc.start(now + index * 0.07);
      osc.stop(now + index * 0.07 + 0.5);
    });
  }

  // Sakin, düşük tonlu yenilgi / çekim kesme tonu (haptic.error ile tutarlı)
  public playDefeat(): void {
    if (this.muted) return;
    this.initializeContext();
    if (!this.context) return;

    const now = this.context.currentTime;
    const pv = pitchVariation(0.03);
    const notes = [220, 164.81]; // A3 -> E3 sakin iniş

    notes.forEach((freq, idx) => {
      if (!this.context) return;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      const start = now + idx * 0.12;
      const dur = idx === 0 ? 0.16 : 0.32;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq * pv, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.96 * pv, start + dur);

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(gain);
      gain.connect(this.out());

      this.registerOscillator(osc);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    });
  }
}

export const audio = new AudioService();
