import type { AppIcon } from '../models';

/**
 * Central registry for adaptive and sprite icons used across the app.
 *
 * Only icons that require metadata (file path, color role, sprite reference) belong here.
 * Material Symbol font icons are plain strings — use `SYMBOL_ICONS` and `SymbolIconName`
 * for compile-time safety. Add to `SYMBOL_ICONS` when using a new symbol name.
 */
export const APP_ICONS = {
  /** Hamburger menu toggle icon used in the navbar. */
  hamburger: {
    kind: 'adaptive',
    src: '/icons/hamburger.svg',
    colorRole: 'text',
  },
} as const satisfies Readonly<Record<string, AppIcon>>;

/** Union of all registered icon keys. */
export type AppIconName = keyof typeof APP_ICONS;

/** The icon definition type for a given registry key. */
export type AppIconDefinition = (typeof APP_ICONS)[AppIconName];

/**
 * Registry of Material Symbol ligature names used in this app.
 * Add a new entry here when using a symbol for the first time.
 * This gives compile-time safety — typos in icon names are caught at build time.
 */
export const SYMBOL_ICONS = {
  home: 'home',
  files: 'files',
} as const;

/** Union of all registered Material Symbol names. */
export type SymbolIconName = (typeof SYMBOL_ICONS)[keyof typeof SYMBOL_ICONS];
