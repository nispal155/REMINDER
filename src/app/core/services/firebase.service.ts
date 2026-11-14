import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics, logEvent } from 'firebase/analytics';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private readonly platformId = inject(PLATFORM_ID);

  app: FirebaseApp | null = null;
  analytics: Analytics | null = null;
  private isInitialized = false;

  constructor() {
    this.initFirebase();
  }

  private async initFirebase() {
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') {
      return;
    }

    if (this.isInitialized) return;

    if (!environment.firebaseConfig?.apiKey) {
      // Firebase not configured in environment/.env - skip initialization
      return;
    }

    try {
      // 1. Initialize Firebase App with user credentials
      this.app = initializeApp(environment.firebaseConfig);
      this.isInitialized = true;

      // 2. Conditionally Initialize Analytics (handles ad-blockers, offline, and browser support)
      const supported = await isSupported().catch(() => false);
      if (supported && this.app) {
        this.analytics = getAnalytics(this.app);
        this.logEvent('app_open', {
          app_version: environment.appVersion,
          platform: 'pwa'
        });
      }
    } catch (err) {
      console.warn('Firebase initialization notice (offline or restricted):', err);
    }
  }

  /**
   * Safe event logging wrapper
   */
  logEvent(eventName: string, eventParams?: Record<string, any>): void {
    if (this.analytics) {
      try {
        logEvent(this.analytics, eventName, eventParams);
      } catch {
        // Silently swallow analytics reporting errors
      }
    }
  }
}

