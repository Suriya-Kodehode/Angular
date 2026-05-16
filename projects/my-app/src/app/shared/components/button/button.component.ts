import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ButtonColor = 'primary' | 'secondary';
export type ButtonVariant = 'fill' | 'outline' | 'transparent' | 'icon';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  standalone: true,
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly color = input<ButtonColor>('primary');
  readonly variant = input<ButtonVariant>('fill');
  readonly size = input<ButtonSize>('md');
  readonly type = input<ButtonType>('button');
  readonly loading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly hover = input<boolean>(true);

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected readonly btnClass = computed(() => {
    const base = `btn btn--${this.color()} btn--${this.variant()} btn--${this.size()}`;
    return this.hover() ? base : `${base} btn--no-hover`;
  });
}
