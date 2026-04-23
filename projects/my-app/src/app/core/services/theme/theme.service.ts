import { Injectable, inject, PLATFORM_ID, effect, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import type { ThemePalette, ThemeMode } from './theme.model';


@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _palette = signal<ThemePalette>('default');
  private readonly _mode = signal<ThemeMode>('system');

  readonly palette = this._palette.asReadonly();
  readonly mode = this._mode.asReadonly();

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      const p = this._palette();
      if (p === 'default') {
        this.doc.documentElement.removeAttribute('data-theme');
      } else {
        this.doc.documentElement.setAttribute('data-theme', p);
      }
    });

    effect(() => {
      if (!this.isBrowser) return;
      const m = this._mode();
      if (m === 'system') {
        this.doc.documentElement.removeAttribute('data-mode');
      } else {
        this.doc.documentElement.setAttribute('data-mode', m);
      }
    });
  }

  setPalette(palette: ThemePalette): void {
    this._palette.set(palette);
  }

  setMode(mode: ThemeMode): void {
    this._mode.set(mode);
  }
}
