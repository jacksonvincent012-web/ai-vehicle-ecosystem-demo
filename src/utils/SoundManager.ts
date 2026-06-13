// ============================================
// SOUND MANAGER - Web Audio API
// ============================================

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = false;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context not available
    }
  }

  // Event sounds
  negotiationStart() {
    this.playTone(440, 0.15, 'sine', 0.08);
    setTimeout(() => this.playTone(554, 0.15, 'sine', 0.08), 100);
  }

  negotiationComplete() {
    this.playTone(523, 0.1, 'sine', 0.06);
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.06), 80);
    setTimeout(() => this.playTone(784, 0.15, 'sine', 0.06), 160);
  }

  hazardAlert() {
    this.playTone(800, 0.2, 'square', 0.05);
    setTimeout(() => this.playTone(600, 0.2, 'square', 0.05), 250);
  }

  criticalAlert() {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playTone(880, 0.15, 'square', 0.08);
        setTimeout(() => this.playTone(440, 0.15, 'square', 0.08), 150);
      }, i * 350);
    }
  }

  emergencyDispatch() {
    this.playTone(660, 0.3, 'sawtooth', 0.06);
    setTimeout(() => this.playTone(880, 0.3, 'sawtooth', 0.06), 300);
    setTimeout(() => this.playTone(660, 0.3, 'sawtooth', 0.06), 600);
  }

  fuelLow() {
    this.playTone(300, 0.4, 'triangle', 0.05);
    setTimeout(() => this.playTone(250, 0.4, 'triangle', 0.05), 400);
  }

  stepComplete() {
    this.playTone(1200, 0.05, 'sine', 0.03);
  }

  click() {
    this.playTone(1000, 0.03, 'sine', 0.04);
  }

  success() {
    this.playTone(523, 0.1, 'sine', 0.06);
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.06), 100);
    setTimeout(() => this.playTone(784, 0.2, 'sine', 0.06), 200);
  }

  error() {
    this.playTone(200, 0.3, 'square', 0.05);
    setTimeout(() => this.playTone(150, 0.4, 'square', 0.05), 300);
  }
}

export const soundManager = new SoundManager();
export default SoundManager;
