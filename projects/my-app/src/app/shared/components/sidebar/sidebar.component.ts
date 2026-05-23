import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SidebarItemComponent } from './sidebar-item.component';

@Component({
  selector: 'app-sidebar',
  imports: [SidebarItemComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly expanded = input<boolean>(false);

  protected readonly navItems = [
    { label: 'Example', icon: 'files', route: '/', exact: true },
  ] as const;
}
