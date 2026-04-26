export type SpriteIcon = {
  kind: 'sprite';
  spritePath: string;
  symbolId: string;
};

export type AdaptiveIconColorRole =
  | 'on-primary'
  | 'primary-on-container'
  | 'on-secondary'
  | 'secondary-on-container'
  | 'on-tertiary'
  | 'tertiary-on-container'
  | 'text'
  | 'text-muted'
  | 'success'
  | 'warning'
  | 'error';

export type AdaptiveIcon = {
  kind: 'adaptive';
  src: string;
  colorRole?: AdaptiveIconColorRole;
};

export type AppIcon = SpriteIcon | AdaptiveIcon;

export function isAdaptiveIcon(icon: AppIcon): icon is AdaptiveIcon {
  return icon.kind === 'adaptive';
}

export function isSpriteIcon(icon: AppIcon): icon is SpriteIcon {
  return icon.kind === 'sprite';
}
