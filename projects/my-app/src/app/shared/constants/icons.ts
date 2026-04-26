import type { AppIcon } from '../models';

export const APP_ICONS = {
  hamburger: {
    kind: 'adaptive',
    src: '/icons/hamburger.svg',
    colorRole: 'text',
  },
} as const satisfies Readonly<Record<string, AppIcon>>;

export type AppIconName = keyof typeof APP_ICONS;
export type AppIconDefinition = (typeof APP_ICONS)[AppIconName];
