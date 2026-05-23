import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import type { SymbolIconName } from '../../constants/icons';

@Component({
  selector: 'app-sidebar-item',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar-item.component.html',
  styleUrl: './sidebar-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarItemComponent {
  readonly label = input.required<string>();
  readonly icon = input.required<SymbolIconName>();
  readonly route = input.required<string>();
  readonly expanded = input<boolean>(false);
  readonly exact = input<boolean>(false);
}
