// Shared public API
// Re-export everything used by 2+ unrelated features from here.
// Features must import from '@app/shared', never from internal paths.
//
// Example:
// export type { PagedResult } from './models/pagination.model';
// export { DATE_FORMAT } from './constants/app.constants';
// export { SpinnerComponent } from './components/spinner/spinner.component';

export { logger } from './utils/console';
export { ButtonComponent } from './components/button/button.component';
export type { ButtonVariant, ButtonSize, ButtonType } from './components/button/button.component';
export { NavbarComponent } from './components/navbar/navbar.component';
export { SidebarComponent } from './components/sidebar/sidebar.component';
