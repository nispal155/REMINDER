import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { NotificationPermissionState } from '../models/notification.model';

export interface NotificationActionMessage {
  action: 'complete' | 'snooze';
  reminderId: string;
  minutes?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly permissionState = signal<NotificationPermissionState>('default');
  readonly actionReceived$ = new Subject<NotificationActionMessage>();
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.checkInitialPermission();
    this.initServiceWorkerHandle();
    this.listenToServiceWorkerMessages();
  }

  private listenToServiceWorkerMessages() {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const data = event.data;
        if (data?.type === 'REMINDER_COMPLETE' && data.reminderId) {
          this.actionReceived$.next({ action: 'complete', reminderId: data.reminderId });
        } else if (data?.type === 'REMINDER_SNOOZE' && data.reminderId) {
          this.actionReceived$.next({ action: 'snooze', reminderId: data.reminderId, minutes: data.minutes || 15 });
        }
      });
    }
  }

  private checkInitialPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      this.permissionState.set('unsupported');
      return;
    }
    this.permissionState.set(Notification.permission as NotificationPermissionState);
  }

  private async initServiceWorkerHandle() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        this.swRegistration = reg;
      } catch (err) {
        console.warn('ServiceWorker ready error in NotificationService:', err);
      }
    }
  }

  /**
   * Request browser notification permission
   */
  async requestPermission(): Promise<NotificationPermissionState> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      this.permissionState.set('unsupported');
      return 'unsupported';
    }

    try {
      const result = await Notification.requestPermission();
      const state = result as NotificationPermissionState;
      this.permissionState.set(state);

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('reminder_notif_permission_prompted', 'true');
      }

      return state;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return 'denied';
    }
  }

  /**
   * Play an in-app synthesized notification chime using Web Audio API
   */
  playNotificationSound() {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      // Pleasant two-tone chime (800Hz -> 1050Hz)
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, now); // G5 note
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.12); // C6 note

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      // Audio autoplay might be suspended until user interaction
      console.warn('AudioContext playback restricted:', e);
    }
  }

  /**
   * Trigger device vibration
   */
  vibrate(pattern: number[] = [200, 100, 200]) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  /**
   * Display local system notification with actions
   */
  async showNotification(title: string, options: {
    body: string;
    tag?: string;
    data?: any;
    silent?: boolean;
    soundEnabled?: boolean;
    vibrationEnabled?: boolean;
  }): Promise<boolean> {
    if (this.permissionState() !== 'granted') {
      return false;
    }

    // Play feedback if not silent
    if (!options.silent) {
      if (options.soundEnabled !== false) {
        this.playNotificationSound();
      }
      if (options.vibrationEnabled !== false) {
        this.vibrate([200, 100, 200]);
      }
    }

    const notifOptions: NotificationOptions & { actions?: Array<{ action: string; title: string }> } = {
      body: options.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: options.tag || 'reminder-' + Date.now(),
      data: options.data,
      silent: options.silent,
      actions: [
        { action: 'complete', title: '✓ Complete' },
        { action: 'snooze', title: '💤 Snooze 15m' }
      ]
    };

    // Prefer ServiceWorker showNotification so actions work in PWA
    if (this.swRegistration && 'showNotification' in this.swRegistration) {
      try {
        await this.swRegistration.showNotification(title, notifOptions);
        return true;
      } catch (e) {
        console.warn('ServiceWorker showNotification failed, using fallback Notification:', e);
      }
    }

    // Fallback to standard window Notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const notif = new Notification(title, notifOptions);
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        return true;
      } catch (e) {
        console.error('Failed to trigger window Notification:', e);
      }
    }

    return false;
  }
}
