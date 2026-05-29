import { Injectable, inject, PLATFORM_ID, effect, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import type { ThemeMode, ThemePalette } from './theme.model';
import { defaultThemeMode, defaultThemePalette } from './theme.model';

const themeAttributeMap = {
  palette: {
    attr: 'data-theme' as const,
    defaultValue: defaultThemePalette,
  },
  mode: {
    attr: 'data-mode' as const,
    defaultValue: defaultThemeMode,
  },
} as const;

type ThemeAttributeKey = keyof typeof themeAttributeMap;

type ThemeAttributeValues = {
  palette: ThemePalette;
  mode: ThemeMode;
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _palette = signal<ThemePalette>(defaultThemePalette);
  private readonly _mode = signal<ThemeMode>(defaultThemeMode);

  readonly palette = this._palette.asReadonly();
  readonly mode = this._mode.asReadonly();

  constructor() {
    effect(() => {
      this.updateAttribute('palette', this._palette());
    });

    effect(() => {
      this.updateAttribute('mode', this._mode());
    });
  }

  setPalette(palette: ThemePalette): void {
    this._palette.set(palette);
  }

  setMode(mode: ThemeMode): void {
    this._mode.set(mode);
  }

  private updateAttribute<Key extends ThemeAttributeKey>(
    key: Key,
    value: ThemeAttributeValues[Key]
  ): void {
    if (!this.isBrowser) return;

    const { attr, defaultValue } = themeAttributeMap[key];

    if (value === defaultValue) {
      this.doc.documentElement.removeAttribute(attr);
      return;
    }

    this.doc.documentElement.setAttribute(attr, value);
  }
}
