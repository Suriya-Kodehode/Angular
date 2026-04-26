import type { AdaptiveIcon } from '../models';

export function getAdaptiveSvgColorVar(icon: AdaptiveIcon): string {
  switch (icon.colorRole) {
    case 'on-primary':
      return 'var(--color-on-primary)';
    case 'primary-on-container':
      return 'var(--color-primary-on-container)';
    case 'on-secondary':
      return 'var(--color-on-secondary)';
    case 'secondary-on-container':
      return 'var(--color-secondary-on-container)';
    case 'on-tertiary':
      return 'var(--color-on-tertiary)';
    case 'tertiary-on-container':
      return 'var(--color-tertiary-on-container)';
    case 'text':
      return 'var(--color-text)';
    case 'text-muted':
      return 'var(--color-text-muted)';
    case 'success':
      return 'var(--color-success)';
    case 'warning':
      return 'var(--color-warning)';
    case 'error':
      return 'var(--color-error)';
    default:
      return 'currentColor';
  }
}
