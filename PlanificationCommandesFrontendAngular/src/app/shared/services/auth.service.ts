import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, LoginCredentials, SignupCredentials } from '../models/user.model';

export type { User, LoginCredentials, SignupCredentials };

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);
  isLoading   = signal(false);
  error       = signal<string | null>(null);

  private readonly TOKEN_KEY = 'denim-token';
  private readonly USER_KEY  = 'denim-user';

  constructor(private router: Router) {
    // localStorage = "remember me" users; sessionStorage = session-only users
    const stored = localStorage.getItem(this.USER_KEY) ?? sessionStorage.getItem(this.USER_KEY);
    if (stored) this.currentUser.set(JSON.parse(stored));
  }

  private async extractError(res: Response, fallback: string): Promise<string> {
    const raw = await res.text();
    try {
      const body = JSON.parse(raw);
      if (Array.isArray(body))        return body[0]?.description ?? fallback;
      if (typeof body === 'string')   return body || fallback;
      if (body?.title)                return body.title;
      if (body?.message)              return body.message;
    } catch {
    }
    return raw.trim() || fallback;
  }

  //  Login
  async login(credentials: LoginCredentials): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const res = await fetch(`${environment.apiUrl}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:    credentials.email,
          password: credentials.password,
        }),
      });

      if (!res.ok) {
        this.error.set(await this.extractError(res, 'Email ou mot de passe incorrect.'));
        return false;
      }

      const data = await res.json();
      const user: User = {
        id:           data.user.id,
        firstName:    data.user.firstName,
        lastName:     data.user.lastName,
        email:        data.user.email,
        role:         data.user.role,
        profilePhoto: data.user.profilePhoto ?? null,
      };

      this.storeSession(data.token, user, credentials.rememberMe ?? false);
      this.currentUser.set(user);
      return true;
    } catch {
      this.error.set('Impossible de contacter le serveur. Vérifiez votre connexion.');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  //  Signup
  async signup(credentials: SignupCredentials): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);

    const roleMap: Record<string, string> = {
      admin:    'Admin',
      planner:  'PlanificationResponsable',
      operator: 'Worker',
    };

    try {
      const res = await fetch(`${environment.apiUrl}/Auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: credentials.firstName,
          lastName:  credentials.lastName,
          email:     credentials.email,
          password:  credentials.password,
          role:      roleMap[credentials.role] ?? credentials.role,
        }),
      });

      if (!res.ok) {
        this.error.set(await this.extractError(res, 'Erreur lors de la création du compte.'));
        return false;
      }

      return true; // backend sends welcome email; redirect to login
    } catch {
      this.error.set('Impossible de contacter le serveur. Vérifiez votre connexion.');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  //  Forgot password
  async sendPasswordReset(email: string): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const res = await fetch(`${environment.apiUrl}/Auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // Backend always returns 200 to avoid email enumeration
      return res.ok;
    } catch {
      this.error.set('Impossible de contacter le serveur.');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  //  Reset password
  async resetPassword(email: string, token: string, newPassword: string): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const res = await fetch(`${environment.apiUrl}/Auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
      });

      if (!res.ok) {
        this.error.set(await this.extractError(res, 'Erreur lors de la réinitialisation.'));
        return false;
      }

      return true;
    } catch {
      this.error.set('Impossible de contacter le serveur. Vérifiez votre connexion.');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  //  Logout
  async logout(): Promise<void> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      // Fire-and-forget — don't block navigation on server error
      fetch(`${environment.apiUrl}/Auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    this.currentUser.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/auth/login']);
  }

  // Helpers
  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  getToken(): string | null {
    // localStorage for "remember me" users, sessionStorage for session-only
    return localStorage.getItem(this.TOKEN_KEY) ?? sessionStorage.getItem(this.TOKEN_KEY);
  }

  persistCurrentUser(): void {
    const user = this.currentUser();
    if (!user) return;
    const s = JSON.stringify(user);
    if (localStorage.getItem(this.USER_KEY)) {
      localStorage.setItem(this.USER_KEY, s);
    } else {
      sessionStorage.setItem(this.USER_KEY, s);
    }
  }

  private storeSession(token: string, user: User, remember = false): void {
    const s = JSON.stringify(user);
    if (remember) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, s);
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem(this.USER_KEY, s);
      localStorage.removeItem(this.TOKEN_KEY); // clear any stale "remember me" token
      localStorage.removeItem(this.USER_KEY);
    }
  }
}
