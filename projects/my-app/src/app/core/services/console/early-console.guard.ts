import { environment } from '@app/environments';

const NOOP = (): void => {};

/**
 * Silences native console methods before Angular bootstraps.
 * This covers logs emitted before ConsoleService patching starts.
 * console.error is intentionally kept so critical errors remain visible in production.
 */
export function applyEarlyConsoleGuard(): void {
  if (environment.enableConsole) return;

  console.log            = NOOP;
  console.warn           = NOOP;
  console.info           = NOOP;
  console.debug          = NOOP;
  console.trace          = NOOP;
  console.group          = NOOP;
  console.groupCollapsed = NOOP;
  console.groupEnd       = NOOP;
  console.table          = NOOP;
  console.dir            = NOOP;
  console.count          = NOOP;
  console.countReset     = NOOP;
  console.time           = NOOP;
  console.timeLog        = NOOP;
  console.timeEnd        = NOOP;
  console.assert         = NOOP;
}
