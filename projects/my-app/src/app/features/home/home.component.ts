import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { contextConsole } from '@app/core/services';
import { ButtonComponent } from '@app/shared';

const console = contextConsole('HomeComponent');

@Component({
  selector: 'app-home',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  logCount(): void {
    console.count('[logCount]');
  }
}
