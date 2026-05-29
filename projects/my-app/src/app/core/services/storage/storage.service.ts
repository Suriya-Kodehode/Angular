import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type JsonPrimitive = string | number | boolean | null;
export type JsonArray = JsonValue[];
export type JsonObject = { readonly [key: string]: JsonValue };
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

export type LocalStorageSchema = Record<string, JsonValue>;
export type LocalStorageKey<Schema extends LocalStorageSchema> = keyof Schema & string;

export interface LocalStorageAdapter<Schema extends LocalStorageSchema = Record<string, JsonValue>> {
  hasItem<Key extends LocalStorageKey<Schema>>(key: Key): boolean;
  getItem<Key extends LocalStorageKey<Schema>>(key: Key): Schema[Key] | null;
  setItem<Key extends LocalStorageKey<Schema>>(key: Key, value: Schema[Key]): void;
  removeItem(key: LocalStorageKey<Schema>): void;
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

  private withStorage<T>(callback: (storage: Storage) => T): T | null {
    if (!this.storage) {
      return null;
    }

    try {
      return callback(this.storage);
    } catch {
      return null;
    }
  }

  hasItem(key: string): boolean {
    return this.withStorage((storage) => storage.getItem(key) != null) ?? false;
  }

  getItem<T extends JsonValue = JsonValue>(key: string): T | null {
    return this.withStorage((storage) => {
      const raw = storage.getItem(key);
      return raw == null ? null : (JSON.parse(raw) as T);
    });
  }

  setItem<T extends JsonValue = JsonValue>(key: string, value: T): void {
    this.withStorage((storage) => {
      storage.setItem(key, JSON.stringify(value));
      return true;
    });
  }

  removeItem(key: string): void {
    this.withStorage((storage) => {
      storage.removeItem(key);
      return true;
    });
  }

  clear(): void {
    this.withStorage((storage) => {
      storage.clear();
      return true;
    });
  }
}
