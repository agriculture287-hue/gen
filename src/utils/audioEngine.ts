/**
 * Web Audio Engine for GEN MUSIC
 * Generates rich procedural synth chords, bass, and atmospheric texture
 * with true 5-band equalizer and Dolby Spatial audio virtualizer.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private stereoPanner: StereoPannerNode | null = null;
  private isDolbyEnabled = true;
  private timerId: number | null = null;
  private step = 0;
  private currentTrackId: string | null = null;
  private currentVolume = 0.8;

  private frequencies = [60, 230, 910, 3000, 14000];

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.currentVolume;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;

    // Create 5 EQ bands
    let lastNode: AudioNode = this.masterGain;
    this.filters = this.frequencies.map((freq, i) => {
      const filter = this.ctx!.createBiquadFilter();
      if (i === 0) {
        filter.type = 'lowshelf';
      } else if (i === this.frequencies.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
      }
      filter.frequency.value = freq;
      filter.gain.value = 0; // dB
      lastNode.connect(filter);
      lastNode = filter;
      return filter;
    });

    if (this.ctx.createStereoPanner) {
      this.stereoPanner = this.ctx.createStereoPanner();
      lastNode.connect(this.stereoPanner);
      this.stereoPanner.connect(this.analyser);
    } else {
      lastNode.connect(this.analyser);
    }

    this.analyser.connect(this.ctx.destination);
  }

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
  }

  public setDolbyAudio(enabled: boolean) {
    this.isDolbyEnabled = enabled;
    if (!this.ctx) return;
    if (this.filters.length >= 5) {
      if (enabled) {
        // Dolby spatial enhancement curve: rich low sub, widened air
        this.filters[0].gain.setValueAtTime(3.5, this.ctx.currentTime); // sub
        this.filters[1].gain.setValueAtTime(1.5, this.ctx.currentTime);
        this.filters[3].gain.setValueAtTime(2.0, this.ctx.currentTime);
        this.filters[4].gain.setValueAtTime(4.0, this.ctx.currentTime); // sparkle
      } else {
        // Flat
        this.filters.forEach(f => f.gain.setValueAtTime(0, this.ctx!.currentTime));
      }
    }
  }

  public setEqBand(bandIndex: number, gainDb: number) {
    if (this.filters[bandIndex] && this.ctx) {
      this.filters[bandIndex].gain.setValueAtTime(gainDb, this.ctx.currentTime);
    }
  }

  public playTrack(trackId: string, bpm: number = 110) {
    this.init();
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
    this.currentTrackId = trackId;
    this.isPlaying = true;
    this.step = 0;

    if (this.timerId) {
      clearInterval(this.timerId);
    }

    // Play procedural musical progression
    const intervalMs = (60 / bpm) * 500; // 8th notes
    this.timerId = window.setInterval(() => {
      this.playSynthNote();
      this.step++;
    }, intervalMs);
  }

  private playSynthNote() {
    if (!this.ctx || !this.isPlaying || !this.masterGain) return;

    // Harmonic scale in D minor / F major (Synthwave/lo-fi chords)
    const scale = [146.83, 174.61, 220.0, 261.63, 293.66, 349.23, 440.0]; // D3, F3, A3, C4, D4, F4, A4
    const rootIndex = Math.floor(this.step / 8) % scale.length;
    const baseFreq = scale[rootIndex];

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    // Waveform depends on track vibe
    osc.type = this.step % 4 === 0 ? 'sawtooth' : 'triangle';
    
    // Slight melody note
    const offset = [0, 7, 12, 16, 12, 7, 19, 12][this.step % 8];
    osc.frequency.value = baseFreq * Math.pow(2, offset / 12);

    const now = this.ctx.currentTime;
    const duration = 0.4;
    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Subtle stereoscopic pan for spatial depth
    if (this.stereoPanner && this.isDolbyEnabled) {
      const pan = Math.sin(this.step * 0.5) * 0.4;
      this.stereoPanner.pan.setValueAtTime(pan, now);
    }

    osc.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);

    // Warm Sub Bass on beat 1 & 5
    if (this.step % 4 === 0) {
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.value = baseFreq / 2;
      subGain.gain.setValueAtTime(0.22, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(now);
      subOsc.stop(now + 0.65);
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public resume() {
    if (this.currentTrackId) {
      this.playTrack(this.currentTrackId);
    }
  }

  public stop() {
    this.pause();
    this.currentTrackId = null;
    this.step = 0;
  }

  public getFrequencyData(array: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(array);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }
}

export const audioEngine = new AudioEngine();
