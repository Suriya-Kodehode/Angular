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
  /**
   * Returns a single log function prefixed with [prefix].
   * Use for warn/error by falling back to logger.warn / logger.error directly.
   *
   * @example
   *   const log = logger.scope('ROUTER');
   *   log(true, false, 'navigated to', url); // → [ROUTER] navigated to /home
   */
  scope: (prefix: string) => LogFn;
}

const canLog = (enabled: boolean, allowProd: boolean): boolean =>
  globalEnabled && enabled && (!isProd || allowProd);

/**
 * Logger with per-call dev/prod control.
 *
 * @param enabled   - per-call toggle; `false` silences this call everywhere
 * @param allowProd - opt-in to also log in production (default: `false`)
 * @param args      - values to log
 *
 * ─── Global kill-switch ──────────────────────────────────────────────────────
 *   environment.ts → enableLogging: false   silences ALL calls regardless of flags
 *
 * ─── Unscoped ────────────────────────────────────────────────────────────────
 *   import { logger } from '@app/shared';
 *   const { log, warn, error } = logger;
 *
 *   log(true,  false, 'msg');  // dev only
 *   log(true,  true,  'msg');  // dev + prod
 *   log(false, false, 'msg');  // silenced everywhere
 *   log(false, true,  'msg');  // silenced everywhere (enabled=false wins)
 *
 *   warn(true,  false, 'msg'); // dev only
 *   warn(true,  true,  'msg'); // dev + prod
 *   warn(false, false, 'msg'); // silenced everywhere
 *   warn(false, true,  'msg'); // silenced everywhere
 *
 *   error(true,  false, 'msg'); // dev only
 *   error(true,  true,  'msg'); // dev + prod
 *   error(false, false, 'msg'); // silenced everywhere
 *   error(false, true,  'msg'); // silenced everywhere
 *
 * ─── Scoped (recommended — declare once per file) ────────────────────────────
 *   const log = logger.scope('AUTH');  // prefix: [AUTH]
 *
 *   log(true,  false, 'msg');  // [AUTH] msg  — dev only
 *   log(true,  true,  'msg');  // [AUTH] msg  — dev + prod
 *   log(false, false, 'msg');  // silenced everywhere
 *   log(false, true,  'msg');  // silenced everywhere
 *
 * ─── Behaviour matrix ────────────────────────────────────────────────────────
 *   enableLogging | enabled | allowProd | dev | prod
 *   ─────────────────────────────────────────────────
 *   false         | any     | any       | ✗   | ✗
 *   true          | false   | any       | ✗   | ✗
 *   true          | true    | false     | ✓   | ✗
 *   true          | true    | true      | ✓   | ✓
 */
export const logger: Logger = {
  log(enabled, allowProd, ...args): void {
    if (canLog(enabled, allowProd)) console.log(...args);
  },
  warn(enabled, allowProd, ...args): void {
    if (canLog(enabled, allowProd)) console.warn(...args);
  },
  error(enabled, allowProd, ...args): void {
    if (canLog(enabled, allowProd)) console.error(...args);
  },
  scope(prefix: string): LogFn {
    const tag = `[${prefix}]`;
    return (enabled, allowProd, ...args): void => {
      if (canLog(enabled, allowProd)) console.log(tag, ...args);
    };
  },
};

