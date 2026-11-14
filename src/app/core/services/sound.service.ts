import { Injectable, inject } from '@angular/core';
import { SettingsService } from '../../features/settings/settings.service';
import { SoundChimeType } from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private readonly settingsService = inject(SettingsService);
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  playChime(overrideType?: SoundChimeType): void {
    const settings = this.settingsService.settings();
    if (!settings.notificationSound && !overrideType) return;

    const chimeType = overrideType || settings.soundChime || 'temple';
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      switch (chimeType) {
        case 'temple':
          this.playTempleBell(ctx);
          break;
        case 'singing_bowl':
          this.playSingingBowl(ctx);
          break;
        case 'digital':
          this.playDigitalChime(ctx);
          break;
        case 'classic':
        default:
          this.playClassicBell(ctx);
          break;
      }
    } catch (e) {
      console.warn('Web Audio playback failed:', e);
    }
  }

  private playTempleBell(ctx: AudioContext): void {
    const now = ctx.currentTime;
    // Fundamental and harmonics of a traditional heavy bronze bell
    const frequencies = [440, 880, 1320, 1760];
    const gains = [0.4, 0.25, 0.15, 0.08];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gains[idx], now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.6);
    });
  }

  private playSingingBowl(ctx: AudioContext): void {
    const now = ctx.currentTime;
    // Resonant Himalayan Singing Bowl (~432Hz deep meditative warm hum)
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator(); // subtle vibrato/wobble
    const lfoGain = ctx.createGain();
    const masterGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(432, now);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(4.5, now); // 4.5 Hz throbbing resonance
    lfoGain.gain.setValueAtTime(3.0, now);

    lfo.connect(osc.frequency);

    masterGain.gain.setValueAtTime(0.01, now);
    masterGain.gain.linearRampToValueAtTime(0.35, now + 0.15); // soft strike attack
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

    osc.connect(masterGain);
    masterGain.connect(ctx.destination);

    lfo.start(now);
    osc.start(now);

    lfo.stop(now + 3.3);
    osc.stop(now + 3.3);
  }

  private playDigitalChime(ctx: AudioContext): void {
    const now = ctx.currentTime;
    // Fast high-tech rising two-tone chime
    const notes = [659.25, 880.0]; // E5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = now + idx * 0.09;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });
  }

  private playClassicBell(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.25);
  }
}
