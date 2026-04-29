import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface LocalStorageAdapter {
  hasItem(key: string): boolean;
  getItem<T extends JsonValue = JsonValue>(key: string): T | null;
  setItem<T extends JsonValue = JsonValue>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * Browser-safe wrapper for localStorage.
 *
 * Best usage:
 * - Keep this service as a low-level helper only.
 * - Encapsulate storage keys and typed data in higher-level services.
 * - Use a short injected name such as `storage`.
 *
 * Example:
 * ```ts
 * interface UserPreferences {
 *   theme: 'light' | 'dark';
 *   showSidebar: boolean;
 * }
 *
 * @Component({ ... })
 * export class SettingsComponent {
 *   constructor(private readonly storage: LocalStorageService) {}
 *
 *   savePreferences(preferences: UserPreferences): void {
 *     this.storage.setItem('user-preferences', preferences);
 *   }
 *
 *   loadPreferences(): UserPreferences | null {
 *     return this.storage.getItem<UserPreferences>('user-preferences');
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService implements LocalStorageAdapter {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storage = this.getStorage();

  private getStorage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  hasItem(key: string): boolean {
    if (!this.storage) {
      return false;
    }

    try {
      return this.storage.getItem(key) != null;
    } catch {
      return false;
    }
  }

  getItem<T extends JsonValue = JsonValue>(key: string): T | null {
    if (!this.storage) {
      return null;
    }

    try {
      const raw = this.storage.getItem(key);
      if (raw == null) {
        return null;
      }

      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setItem<T extends JsonValue = JsonValue>(key: string, value: T): void {
    if (!this.storage) {
      return;
    }

    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore failures for disabled storage, quota issues, or invalid values.
    }
  }

  removeItem(key: string): void {
    if (!this.storage) {
      return;
    }

    try {
      this.storage.removeItem(key);
    } catch {
      // Ignore failures when storage is unavailable.
    }
  }

  clear(): void {
    if (!this.storage) {
      return;
    }

    try {
      this.storage.clear();
    } catch {
      // Ignore failures when storage is unavailable.
    }
  }
}
