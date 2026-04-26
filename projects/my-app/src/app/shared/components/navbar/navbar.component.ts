import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_ICONS } from '../../constants/icons';
import { AdaptSvgDirective, type AdaptiveSvgIconVm } from '../../directives/adapt-svg.directive';
import { getAdaptiveSvgColorVar } from '../../utils/adaptive-svg-color.util';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, AdaptSvgDirective],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  private readonly menuIconDef = APP_ICONS.hamburger;

  protected readonly menuIconVm: AdaptiveSvgIconVm = {
    src: this.menuIconDef.src,
    colorVar: getAdaptiveSvgColorVar(this.menuIconDef),
  };
}
