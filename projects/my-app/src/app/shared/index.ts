// Shared public API
// Re-export everything used by 2+ unrelated features from here.
// Features must import from '@app/shared', never from internal paths.
//
// Example:
// export type { PagedResult } from './models/pagination.model';
// export { DATE_FORMAT } from './constants/app.constants';
// export { SpinnerComponent } from './components/spinner/spinner.component';

// Components
export { ButtonComponent } from './components/button/button.component';
export type { ButtonVariant, ButtonSize, ButtonType } from './components/button/button.component';
export { NavbarComponent } from './components/navbar/navbar.component';
export { SidebarComponent } from './components/sidebar/sidebar.component';

// Directives
export { AdaptSvgDirective } from './directives/adapt-svg.directive';
export type { AdaptiveSvgIconVm } from './directives/adapt-svg.directive';

// Models
export * from './models';

// Constants
export { APP_ICONS, type AppIconDefinition, type AppIconName, SYMBOL_ICONS, type SymbolIconName } from './constants/icons';
export { API_PREFIX, API_PREFIX_REGEX } from './constants/regex.constants';

// Utils
export { getAdaptiveSvgColorVar } from './utils/adaptive-svg-color.util';
