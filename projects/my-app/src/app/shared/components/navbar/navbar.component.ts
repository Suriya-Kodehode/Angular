import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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
  readonly sidebarExpanded = input<boolean>(false);
  readonly toggleSidebar = output<void>();

  protected readonly menuIconVm: AdaptiveSvgIconVm = {
    src: APP_ICONS.hamburger.src,
    colorVar: getAdaptiveSvgColorVar(APP_ICONS.hamburger),
  };

  onMenuClick(): void {
    this.toggleSidebar.emit();
  }
}
