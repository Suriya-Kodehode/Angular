export const themePalettes = ['default', 'ocean'] as const;
export const themeModes = ['light', 'dark', 'system'] as const;

export type ThemePalette = (typeof themePalettes)[number];
export type ThemeMode = (typeof themeModes)[number];

export const defaultThemePalette: ThemePalette = 'default';
export const defaultThemeMode: ThemeMode = 'system';
