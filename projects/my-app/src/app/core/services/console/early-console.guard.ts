import { environment } from '@app/environments';

const NOOP = (): void => {};

const EARLY_GUARDED_METHODS = [
  'log',
  'error',
  'info',
  'debug',
  'warn',
  'trace',
  'group',
  'groupCollapsed',
  'groupEnd',
  'table',
  'dir',
  'count',
  'countReset',
  'time',
  'timeLog',
  'timeEnd',
  'assert',
] as const;

/**
 * Silences native console methods before Angular bootstraps.
 * This covers logs emitted before ConsoleService patching starts.
 */
export function applyEarlyConsoleGuard(): void {
  if (environment.enableConsole) return;

  for (const method of EARLY_GUARDED_METHODS) {
    (console as Record<(typeof EARLY_GUARDED_METHODS)[number], unknown>)[method] = NOOP;
  }
}
