import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { contextConsole } from '@app/core/services/console/console.service';

const console = contextConsole('HomeComponent');

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  logCount(): void {
    console.count('[logCount]');
  }
}
