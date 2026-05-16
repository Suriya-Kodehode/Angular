import { Directive, input } from '@angular/core';

export type AdaptiveSvgIconVm = {
  src: string;
  colorVar?: string;
};

@Directive({
  selector: '[adaptSvg]',
  standalone: true,
  host: {
    '[style.--icon-url]': 'iconUrl()',
  },
})
export class AdaptSvgDirective {
  adaptSvg = input.required<AdaptiveSvgIconVm>();

  protected iconUrl(): string {
    return `url(${this.adaptSvg().src})`;
  }
}
