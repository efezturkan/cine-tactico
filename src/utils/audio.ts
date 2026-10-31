export class AudioService {
  private context: AudioContext | null = null;
  private muted: boolean = false;
  private activeOscillators: OscillatorNode[] = [];
  private activeTimeouts: NodeJS.Timeout[] = [];

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

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.context.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.context.destination);

    this.registerOscillator(osc);
    osc.start();
    osc.stop(this.context.currentTime + 0.05);
  }

  // Chess.com tarzı tok ahşap/taş hamle vuruş sesi
  public playChessMove(): void {
    if (this.muted) return;
    this.initializeContext();
    if (!this.context) return;

    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.04);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.context.destination);

    this.registerOscillator(osc);
    osc.start(now);
    osc.stop(now + 0.05);
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
      gain.connect(this.context.destination);

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
    gain.connect(this.context.destination);

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
      gain.connect(this.context.destination);

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
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.18);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.context.destination);

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
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.context.destination);

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
      gain.connect(this.context.destination);

      this.registerOscillator(osc);
      osc.start(now + index * 0.07);
      osc.stop(now + index * 0.07 + 0.5);
    });
  }
}

export const audio = new AudioService();
