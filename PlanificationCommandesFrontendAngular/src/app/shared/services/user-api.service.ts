import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import {
  UserRecord,
  CreateUserPayload,
  UpdateUserPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from '../models/user.model';

export type { UserRecord, CreateUserPayload, UpdateUserPayload, UpdateProfilePayload, ChangePasswordPayload };

@Injectable({ providedIn: 'root' })
export class UserApiService {
  isLoading = signal(false);
  error     = signal<string | null>(null);

  constructor(private auth: AuthService) {}

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.auth.getToken()}`,
    };
  }

  private async handle<T>(req: Promise<Response>): Promise<T | null> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const res  = await req;
      const text = await res.text();

      if (!res.ok) {
        let msg = text;
        try {
          const body = JSON.parse(text);
          if (Array.isArray(body)) msg = body[0]?.description ?? body[0] ?? text;
          else if (typeof body === 'string') msg = body;
        } catch { }
        this.error.set(msg || 'Une erreur est survenue.');
        return null;
      }

      if (!text) return true as unknown as T;
      try {
        return JSON.parse(text) as T;
      } catch {
        return true as unknown as T;
      }
    } catch {
      this.error.set('Impossible de contacter le serveur.');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  // Admin: User CRUD
  getAllUsers() {
    return this.handle<UserRecord[]>(
      fetch(`${environment.apiUrl}/User`, { headers: this.headers })
    );
  }

  createUser(payload: CreateUserPayload) {
    return this.handle<true>(
      fetch(`${environment.apiUrl}/User`, {
        method: 'POST', headers: this.headers, body: JSON.stringify(payload),
      })
    );
  }

  updateUser(id: string, payload: UpdateUserPayload) {
    return this.handle<true>(
      fetch(`${environment.apiUrl}/User/${id}`, {
        method: 'PUT', headers: this.headers, body: JSON.stringify(payload),
      })
    );
  }

  deleteUser(id: string) {
    return this.handle<true>(
      fetch(`${environment.apiUrl}/User/${id}`, {
        method: 'DELETE', headers: this.headers,
      })
    );
  }

  sendPasswordReset(id: string) {
    return this.handle<true>(
      fetch(`${environment.apiUrl}/User/${id}/reset-password`, {
        method: 'POST', headers: this.headers,
      })
    );
  }

  // Self-service profile
  getMyProfile() {
    return this.handle<UserRecord>(
      fetch(`${environment.apiUrl}/Profile/me`, { headers: this.headers })
    );
  }

  updateProfile(payload: UpdateProfilePayload) {
    return this.handle<true>(
      fetch(`${environment.apiUrl}/Profile/me`, {
        method: 'PUT', headers: this.headers, body: JSON.stringify(payload),
      })
    );
  }

  changePassword(payload: ChangePasswordPayload) {
    return this.handle<true>(
      fetch(`${environment.apiUrl}/Profile/me/password`, {
        method: 'PUT', headers: this.headers, body: JSON.stringify(payload),
      })
    );
  }
}
