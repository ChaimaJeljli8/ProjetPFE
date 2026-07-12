import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'denim-theme';
  theme = signal<Theme>(this.getStoredTheme());

  constructor() {
    effect(() => {
      const t = this.theme();
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem(this.STORAGE_KEY, t);
    });
  }

  toggle() {
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
  }

  private getStoredTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem(this.STORAGE_KEY) as Theme) || 'light';
  }
}
