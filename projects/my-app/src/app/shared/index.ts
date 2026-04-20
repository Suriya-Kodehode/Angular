// Shared public API
// Re-export everything used by 2+ unrelated features from here.
// Features must import from '@my-app/shared' (or '../shared'), never from internal paths.
//
// Example:
// export type { PagedResult } from './models/pagination.model';
// export { DATE_FORMAT } from './constants/app.constants';
// export { SpinnerComponent } from './components/spinner/spinner.component';
