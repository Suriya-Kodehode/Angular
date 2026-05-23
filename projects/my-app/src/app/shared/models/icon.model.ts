/** SVG sprite icon — references a symbol inside an external SVG sprite file. */
export type SpriteIcon = {
  kind: 'sprite';
  spritePath: string;
  symbolId: string;
};

/** Semantic color roles mapped to CSS custom properties in the active theme. */
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

/**
 * Local SVG icon rendered via CSS `mask-image` and a `--icon-url` CSS variable.
 * Color is applied through `background-color` using a semantic color role.
 * Use the `AdaptSvgDirective` to bind this to a host element.
 */
export type AdaptiveIcon = {
  kind: 'adaptive';
  src: string;
  colorRole?: AdaptiveIconColorRole;
};

/** Discriminated union of all supported icon kinds in the app. */
export type AppIcon = SpriteIcon | AdaptiveIcon;

export function isAdaptiveIcon(icon: AppIcon): icon is AdaptiveIcon {
  return icon.kind === 'adaptive';
}

export function isSpriteIcon(icon: AppIcon): icon is SpriteIcon {
  return icon.kind === 'sprite';
}


