import { environment } from '@app/environments';

// Evaluated once at module load — no per-call overhead.
const isProd: boolean = environment.production;
// Global kill-switch for dev logging — flip enableLogging in environment.ts to silence everything.
const globalEnabled: boolean = environment.enableLogging;

type LogFn = (enabled: boolean, allowProd: boolean, ...args: unknown[]) => void;

interface Logger {
  log:   LogFn;
  warn:  LogFn;
  error: LogFn;
}

/**
 * Logger with per-call dev/prod control.
 *
 * @param enabled   - master toggle; `false` silences the call everywhere
 * @param allowProd - opt-in to also log in production (default: `false`)
 * @param args      - values to log
 *
 * Examples:
 *   import { logger } from '@app/shared';
 *   const { log, warn, error } = logger;
 *
 *   log(true,  false, 'user loaded', user);   // dev only
 *   log(false, false, 'raw response', res);   // silenced everywhere
 *   log(true,  true,  'critical info', data); // dev + prod
 */
export const logger: Logger = {
  /** General debug info */
  log(enabled, allowProd, ...args): void {
    if (globalEnabled && enabled && (!isProd || allowProd)) console.log(...args);
  },
  /** Non-critical warnings */
  warn(enabled, allowProd, ...args): void {
    if (globalEnabled && enabled && (!isProd || allowProd)) console.warn(...args);
  },
  /** Errors */
  error(enabled, allowProd, ...args): void {
    if (globalEnabled && enabled && (!isProd || allowProd)) console.error(...args);
  },
};
