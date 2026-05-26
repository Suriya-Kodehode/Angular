import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { applyEarlyConsoleGuard } from './app/core/services/console/early-console.guard';

applyEarlyConsoleGuard();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
