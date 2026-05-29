import { environment } from '@app/environments';

const NOOP = (): void => {};
const earlyConsoleMethodNames = [
  'log', 'warn', 'info', 'debug', 'trace',
  'group', 'groupCollapsed', 'groupEnd',
  'table', 'dir',
  'count', 'countReset', 'time', 'timeLog', 'timeEnd', 'assert',
] as const;

type EarlyConsoleMethodName = (typeof earlyConsoleMethodNames)[number];

/**
 * Silences native console methods before Angular bootstraps.
 * This covers logs emitted before ConsoleService patching starts.
 * console.error is intentionally kept so critical errors remain visible in production.
 */
export function applyEarlyConsoleGuard(): void {
  if (environment.enableConsole) return;

  earlyConsoleMethodNames.forEach((method) => {
    (console as unknown as Record<EarlyConsoleMethodName, typeof NOOP>)[method] = NOOP;
  });
}
