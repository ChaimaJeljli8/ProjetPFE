import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CommonModule } from '@angular/common';
import { LanguageService } from '../shared/services/language.service';
import { ThemeService } from '../shared/services/theme.service';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="auth-root">
      <!-- Left panel -->
      <div class="auth-left">
        <div class="auth-left-inner">
          <!-- Logo -->
          <div class="auth-logo">
             <img src="/logo app.png" alt="Logo" width="40" height="40">

          </div>

          <!-- Tagline -->
          <div class="auth-left-content">
            <h1 class="auth-left-title" [innerHTML]="getTitleHTML()"></h1>
            <p class="auth-left-desc">{{ t().authLayoutDesc }}</p>

            <!-- Feature list -->
            <ul class="auth-features">
              <li *ngFor="let f of features()">
                <span class="check-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                <span>{{ f }}</span>
              </li>
            </ul>
          </div>

          <!-- Decorative chart -->
          <div class="auth-deco-chart">
            <svg viewBox="0 0 200 80" fill="none" width="100%">
              <path d="M0 70 L20 60 L40 65 L60 45 L80 50 L100 30 L120 35 L140 15 L160 20 L180 8 L200 5"
                stroke="#FF8051" stroke-width="2" fill="none"/>
              <path d="M0 70 L20 60 L40 65 L60 45 L80 50 L100 30 L120 35 L140 15 L160 20 L180 8 L200 5 L200 80 L0 80Z"
                fill="rgba(151,192,9,0.08)"/>
              <path d="M0 75 L25 70 L50 72 L75 62 L100 58 L125 48 L150 45 L175 35 L200 30"
                stroke="#8ACCF2" stroke-width="1.5" fill="none" stroke-dasharray="4 2" opacity="0.5"/>
            </svg>
          </div>

          <!-- Bottom toggles -->
          <div class="auth-left-toggles">
            <button class="auth-toggle-btn" (click)="langService.toggle()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              {{ lang() === 'fr' ? 'EN' : 'FR' }}
            </button>
            <button class="auth-toggle-btn" (click)="themeService.toggle()">
              <svg *ngIf="theme() === 'light'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              <svg *ngIf="theme() === 'dark'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              </svg>
              {{ theme() === 'light' ? 'Dark' : 'Light' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Right panel: form outlet -->
      <div class="auth-right">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .auth-root {
      min-height: 100vh; display: grid;
      grid-template-columns: 420px 1fr;
    }
    .auth-left {
      background: var(--color-primary);
      position: relative; overflow: hidden;
    }
    .auth-left::before {
      content: '';
      position: absolute; inset: 0;
      background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .auth-left-inner {
      position: relative; z-index: 1;
      height: 100%; display: flex; flex-direction: column;
      padding: 2.5rem;
    }
    .auth-logo { display: flex; align-items: center; gap: 0.75rem; margin-bottom: auto; }
    .auth-brand { font-family: 'Barlow Condensed', sans-serif; font-size: 1.4rem; font-weight: 700; color: #fff; letter-spacing: 0.02em; }
    .auth-left-content { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 2rem 0; }
    .auth-left-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 2rem; font-weight: 800; color: #fff;
      line-height: 1.2; margin-bottom: 1rem;
    }
    .title-highlight { color: #97C009; }
    .auth-left-desc { color: rgba(255,255,255,0.75); font-size: 0.9rem; line-height: 1.65; margin-bottom: 2rem; }
    .auth-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
    .auth-features li { display: flex; align-items: center; gap: 0.6rem; color: rgba(255,255,255,0.9); font-size: 0.88rem; }
    .check-icon {
      width: 20px; height: 20px; border-radius: 50%;
      background: rgba(151,192,9,0.2); color: #97C009;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .auth-deco-chart { margin: 1.5rem 0; }
    .auth-left-toggles { display: flex; gap: 0.5rem; }
    .auth-toggle-btn {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.4rem 0.85rem; border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8);
      font-size: 0.78rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
    }
    .auth-toggle-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
    .auth-right {
      background: var(--bg);
      display: flex; align-items: center; justify-content: center;
      padding: 2rem;
    }
    @media (max-width: 768px) {
      .auth-root { grid-template-columns: 1fr; }
      .auth-left { display: none; }
    }
  `]
})
export class AuthLayoutComponent {
  langService = inject(LanguageService);
  themeService = inject(ThemeService);
  lang = this.langService.lang;
  theme = this.themeService.theme;
  t = this.langService.t;

  getTitleHTML(): string {
    const translations = this.t();
    if (this.lang() === 'fr') {
      return 'Système de planification<br><span class="title-highlight">optimisée</span> du Denim';
    } else {
      return 'Planning System<br><span class="title-highlight">Optimized</span> for Denim';
    }
  }

  features() {
    const translations = this.t();
    return [
      translations.authFeature1,
      translations.authFeature2,
      translations.authFeature3,

    ];
  }
}
