import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent, SidebarComponent } from '@app/shared';
import { ConsoleService, patchConsole } from '@app/core/services';
import { SidebarStateService } from '@app/core/services/state/sidebar-state.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly consoleService = inject(ConsoleService);
  private readonly sidebarStateService = inject(SidebarStateService);

  readonly sidebarIsExpanded = this.sidebarStateService.sidebarIsExpanded;

  ngOnInit(): void {
    patchConsole(this.consoleService);
  }

  onToggleSidebar(): void {
    this.sidebarStateService.toggleSidebar();
  }
}
