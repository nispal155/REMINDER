import { Injectable, signal, computed } from '@angular/core';
import { environment } from '../../../environments/environment';
import { GoogleUser } from '../models/sync.model';

// Declare Google Identity Services global
declare const google: {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
        error_callback?: (error: unknown) => void;
      }) => TokenClient;
      revoke: (token: string, done?: () => void) => void;
    };
  };
};

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
}

interface TokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

const STORAGE_KEY_TOKEN = 'reminder_oauth_token';
const STORAGE_KEY_TOKEN_EXPIRY = 'reminder_oauth_token_expiry';
const STORAGE_KEY_USER = 'reminder_oauth_user';
const STORAGE_KEY_CLIENT_ID = 'reminder_google_client_id';
const STORAGE_KEY_AUTHORIZED_EMAIL = 'reminder_authorized_email';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly token = signal<string | null>(null);
  private readonly tokenExpiry = signal<number>(0);
  readonly currentUser = signal<GoogleUser | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly authError = signal<string | null>(null);

  readonly isAuthenticated = computed(() => {
    const t = this.token();
    const expiry = this.tokenExpiry();
    const user = this.currentUser();
    return !!t && Date.now() < expiry && !!user;
  });

  readonly isAuthorizedUser = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    const requiredEmail = this.getAuthorizedEmail();
    if (!requiredEmail) return true; // If none configured, accept the authenticated user
    return user.email.toLowerCase() === requiredEmail.toLowerCase();
  });

  private tokenClient: TokenClient | null = null;

  constructor() {
    this.restoreSession();
  }

  getClientId(): string {
    return localStorage.getItem(STORAGE_KEY_CLIENT_ID) || environment.googleClientId || '';
  }

  setClientId(clientId: string): void {
    if (clientId) {
      localStorage.setItem(STORAGE_KEY_CLIENT_ID, clientId.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_CLIENT_ID);
    }
    this.tokenClient = null; // Recreate on next login
  }

  getAuthorizedEmail(): string {
    return localStorage.getItem(STORAGE_KEY_AUTHORIZED_EMAIL) || environment.authorizedEmail || '';
  }

  setAuthorizedEmail(email: string): void {
    if (email) {
      localStorage.setItem(STORAGE_KEY_AUTHORIZED_EMAIL, email.trim().toLowerCase());
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTHORIZED_EMAIL);
    }
  }

  private restoreSession(): void {
    try {
      const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      const savedExpiry = Number(localStorage.getItem(STORAGE_KEY_TOKEN_EXPIRY) || '0');
      const savedUserStr = localStorage.getItem(STORAGE_KEY_USER);

      if (savedToken && savedExpiry > Date.now() && savedUserStr) {
        const user: GoogleUser = JSON.parse(savedUserStr);
        this.token.set(savedToken);
        this.tokenExpiry.set(savedExpiry);
        this.currentUser.set(user);

        // Verify authorized email
        const allowedEmail = this.getAuthorizedEmail();
        if (allowedEmail && user.email.toLowerCase() !== allowedEmail.toLowerCase()) {
          this.logout();
          this.authError.set(`Unauthorized account: ${user.email}. Expected: ${allowedEmail}`);
        }
      }
    } catch {
      this.logout();
    }
  }

  async login(): Promise<boolean> {
    this.authError.set(null);
    const clientId = this.getClientId();

    if (!clientId) {
      this.authError.set('Google Client ID is not configured. Please enter your Google OAuth Client ID in Settings.');
      return false;
    }

    if (typeof google === 'undefined' || !google.accounts?.oauth2) {
      this.authError.set('Google Identity Services script not loaded. Please verify your internet connection.');
      return false;
    }

    this.isLoading.set(true);

    return new Promise((resolve) => {
      try {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: environment.driveScopes,
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              this.isLoading.set(false);
              this.authError.set(`Authentication failed: ${tokenResponse.error_description || tokenResponse.error}`);
              resolve(false);
              return;
            }

            const accessToken = tokenResponse.access_token;
            const expiresIn = (tokenResponse.expires_in || 3599) * 1000;
            const expiryTime = Date.now() + expiresIn;

            try {
              // Fetch user profile from Google userinfo API
              const userInfo = await this.fetchUserProfile(accessToken);

              // Single user check: verify authorized email
              const allowedEmail = this.getAuthorizedEmail();
              if (allowedEmail && userInfo.email.toLowerCase() !== allowedEmail.toLowerCase()) {
                this.isLoading.set(false);
                this.authError.set(`Access restricted: ${userInfo.email} is not the authorized owner (${allowedEmail}).`);
                google.accounts.oauth2.revoke(accessToken);
                resolve(false);
                return;
              }

              // Store session
              this.token.set(accessToken);
              this.tokenExpiry.set(expiryTime);
              this.currentUser.set(userInfo);

              localStorage.setItem(STORAGE_KEY_TOKEN, accessToken);
              localStorage.setItem(STORAGE_KEY_TOKEN_EXPIRY, String(expiryTime));
              localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userInfo));

              this.isLoading.set(false);
              resolve(true);
            } catch (err: unknown) {
              this.isLoading.set(false);
              const msg = err instanceof Error ? err.message : 'Failed to retrieve Google profile';
              this.authError.set(msg);
              resolve(false);
            }
          },
          error_callback: (err) => {
            this.isLoading.set(false);
            this.authError.set('OAuth popup closed or blocked.');
            resolve(false);
          }
        });

        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err: unknown) {
        this.isLoading.set(false);
        const msg = err instanceof Error ? err.message : 'OAuth initialization error';
        this.authError.set(msg);
        resolve(false);
      }
    });
  }

  async logout(): Promise<void> {
    const currentToken = this.token();
    if (currentToken && typeof google !== 'undefined' && google.accounts?.oauth2?.revoke) {
      try {
        google.accounts.oauth2.revoke(currentToken);
      } catch {}
    }

    this.token.set(null);
    this.tokenExpiry.set(0);
    this.currentUser.set(null);
    this.authError.set(null);

    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_TOKEN_EXPIRY);
    localStorage.removeItem(STORAGE_KEY_USER);
  }

  getAccessToken(): string | null {
    if (Date.now() >= this.tokenExpiry()) {
      return null;
    }
    return this.token();
  }

  private async fetchUserProfile(accessToken: string): Promise<GoogleUser> {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!res.ok) {
      throw new Error(`Profile request failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      id: data.sub,
      email: data.email,
      name: data.name || data.email,
      picture: data.picture
    };
  }
}

