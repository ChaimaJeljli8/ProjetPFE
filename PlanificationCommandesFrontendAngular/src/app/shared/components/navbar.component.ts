import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';
import { LanguageService } from '../services/language.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <nav class="navbar-container">
      <div class="navbar-inner">
        <!-- Logo -->
        <a routerLink="/" class="navbar-logo">
          <div class="logo-icon">
            <img src="/logo app.png" alt="Logo" width="40" height="40">
          </div>
          <div class="logo-text">
            <span class="logo-name">{{ t().appName }}</span>
            <span class="logo-sub">{{ t().tagline }}</span>
          </div>
        </a>

        <!-- Actions -->
        <div class="navbar-actions">
          <!-- Language Toggle -->
          <button class="toggle-btn lang-toggle"
            (click)="toggleLanguage()"
            [title]="lang() === 'fr' ? 'Switch to English' : 'Passer en Français'">
            <span class="lang-flag">{{ lang() === 'fr' ? 'FR' : 'EN' }}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </button>

          <!-- Theme Toggle -->
          <button class="toggle-btn theme-toggle"
            (click)="toggleTheme()"
            [title]="theme() === 'dark' ? 'Mode clair' : 'Mode sombre'">
            <svg *ngIf="theme() === 'light'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg *ngIf="theme() === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </button>

          <ng-container *ngIf="!currentUser()">
            <a routerLink="/auth/login" class="btn-ghost">{{ t().login }}</a>
            <a routerLink="/auth/signup" class="btn-primary">{{ t().signup }}</a>
          </ng-container>
          <ng-container *ngIf="currentUser()">
            <span class="user-chip">
              {{ currentUser()!.firstName }} {{ currentUser()!.lastName }}
            </span>
            <button class="btn-ghost" (click)="logout()">{{ t().logout }}</button>
          </ng-container>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar-container {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: var(--nav-bg);
      border-bottom: 1px solid var(--nav-border);
      backdrop-filter: blur(12px);
    }
    .navbar-inner {
      max-width: 1280px; margin: 0 auto;
      padding: 0 2rem; height: 64px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .navbar-logo { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
    .logo-icon { flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .logo-icon img { display: block; max-width: 100%; height: auto; border-radius: 6px; }
    .logo-text { display: flex; flex-direction: column; line-height: 1; }
    .logo-name { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 1.15rem; color: var(--color-primary); letter-spacing: 0.02em; }
    .logo-sub { font-size: 0.65rem; font-weight: 500; color: var(--text-muted); letter-spacing: 0.08em; text-transform: uppercase; }
    .navbar-actions { display: flex; align-items: center; gap: 0.5rem; }
    .toggle-btn {
      display: flex; align-items: center; gap: 0.35rem;
      padding: 0.4rem 0.65rem; border: 1px solid var(--border); border-radius: 6px;
      background: var(--surface); color: var(--text-muted);
      cursor: pointer; font-size: 0.75rem; font-weight: 600; transition: all 0.2s;
    }
    .toggle-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
    .lang-flag { font-weight: 700; letter-spacing: 0.05em; }
    .btn-ghost {
      padding: 0.45rem 1rem; border-radius: 6px; border: 1px solid var(--border);
      background: transparent; color: var(--text); font-size: 0.875rem; font-weight: 500;
      cursor: pointer; text-decoration: none; transition: all 0.2s;
    }
    .btn-ghost:hover { border-color: var(--color-primary); color: var(--color-primary); }
    .btn-primary {
      padding: 0.45rem 1.25rem; border-radius: 6px;
      background: var(--color-primary); color: #fff;
      font-size: 0.875rem; font-weight: 600;
      cursor: pointer; text-decoration: none; border: none; transition: all 0.2s;
    }
    .btn-primary:hover { background: var(--color-primary-dark); transform: translateY(-1px); }
    .user-chip {
      padding: 0.3rem 0.75rem; border-radius: 20px;
      background: var(--color-accent-light); color: var(--color-primary);
      font-size: 0.8rem; font-weight: 600;
    }
  `]
})
export class NavbarComponent {
  private themeService = inject(ThemeService);
  private langService  = inject(LanguageService);
  private authService  = inject(AuthService);

  theme       = this.themeService.theme;
  lang        = this.langService.lang;
  t           = this.langService.t;
  currentUser = this.authService.currentUser;

  toggleTheme():    void { this.themeService.toggle(); }
  toggleLanguage(): void { this.langService.toggle();  }
  logout():         void { this.authService.logout();  }
}
