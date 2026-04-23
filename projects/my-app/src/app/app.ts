import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ConsoleService } from './core/services/console/console.service';
import { patchConsole } from './core/services/console/console.patch';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly consoleService = inject(ConsoleService);

  ngOnInit(): void {
    patchConsole(this.consoleService);
  }
}
