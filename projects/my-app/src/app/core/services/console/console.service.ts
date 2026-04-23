import { Injectable } from '@angular/core';
import { environment } from '@app/environments';

/** Unique marker that unambiguously identifies a ConsoleCallOptions object. */
export const CONSOLE_OPTIONS = Symbol('ConsoleCallOptions');

/** Per-call override options. */
export interface ConsoleCallOptions {
  /** Marker that prevents false-positive detection on data payloads with `force` or `suppress` keys. */
  [CONSOLE_OPTIONS]: true;
  /**
   * Force this specific call to output regardless of the global toggle.
   * Use for critical errors that must always be visible.
   */
  force?: boolean;
  /**
   * Suppress this specific call regardless of the global toggle.
   * Use to silence individual noisy log lines without touching the global flag.
   */
  suppress?: boolean;
}

/** The user-facing options, without the internal Symbol marker. */
export type ConsoleOverrides = Omit<ConsoleCallOptions, typeof CONSOLE_OPTIONS>;

/**
 * Factory helper — creates a `ConsoleCallOptions` object with the required Symbol marker.
 * Use this instead of object literals to avoid verbose Symbol syntax at call sites.
 *
 * @example
 * console.error(opts({ force: true }), 'Critical error:', err);
 */
export function opts(options: ConsoleOverrides): ConsoleCallOptions {
  return { [CONSOLE_OPTIONS]: true, ...options };
}

/** Pre-built options object — pass as the first argument to force output regardless of the global toggle. */
export const always: ConsoleCallOptions = opts({ force: true });

/** Pre-built options object — pass as the first argument to permanently silence a call. */
export const never: ConsoleCallOptions = opts({ suppress: true });

/** Names of the native console methods wrapped by ConsoleService. Routes through `output()` for force/suppress support. */
type ConsoleMethodName = 'log' | 'warn' | 'error' | 'debug' | 'info' | 'trace' | 'group' | 'groupCollapsed';

/** Typed call signature for label-based methods: `count`, `countReset`, `time`, `timeEnd`. */
type ConsoleLabelMethod      = (label?: string) => void;
/** Typed call signature for `console.timeLog`. */
type ConsoleTimeLabelMethod  = (label?: string, ...data: unknown[]) => void;
/** Typed call signature for `console.assert`. */
type ConsoleAssertMethod     = (condition?: boolean, ...data: unknown[]) => void;
/** Typed call signature for `console.table`. */
type ConsoleTableMethod      = (tabularData?: unknown, properties?: string[]) => void;
/** Typed call signature for `console.dir`. */
type ConsoleDirMethod        = (item?: unknown, options?: unknown) => void;
/** Typed call signature for no-arg methods: `groupEnd`, `clear`. */
type ConsoleVoidMethod       = () => void;

/** Typed call signatures that ConsoleService methods must satisfy. */
type ConsoleMethod = {
  (message?: unknown, ...optionalParams: unknown[]): void;
  (options: ConsoleCallOptions, message?: unknown, ...optionalParams: unknown[]): void;
};

/** A scoped logger bound to a context tag. Returned by `ConsoleService.forContext()`. */
export interface ScopedLogger {
  readonly log:            ConsoleMethod;
  readonly warn:           ConsoleMethod;
  readonly error:          ConsoleMethod;
  readonly debug:          ConsoleMethod;
  readonly info:           ConsoleMethod;
  readonly trace:          ConsoleMethod;
  readonly group:          ConsoleMethod;
  readonly groupCollapsed: ConsoleMethod;
  /** Increments a named counter. Repeated calls update the same line in DevTools. */
  readonly count:          ConsoleLabelMethod;
  /** Resets the named counter to zero. */
  readonly countReset:     ConsoleLabelMethod;
  /** Starts a named timer. */
  readonly time:           ConsoleLabelMethod;
  /** Stops the named timer and logs elapsed ms. */
  readonly timeEnd:        ConsoleLabelMethod;
  /** Logs the current value of the named timer without stopping it. */
  readonly timeLog:        ConsoleTimeLabelMethod;
  /** Logs an error if `condition` is false. */
  readonly assert:         ConsoleAssertMethod;
  /** Displays tabular data as a table. */
  readonly table:          ConsoleTableMethod;
  /** Displays an interactive object listing. */
  readonly dir:            ConsoleDirMethod;
  /** Closes the current inline group. */
  readonly groupEnd:       ConsoleVoidMethod;
  /** Clears the console. */
  readonly clear:          ConsoleVoidMethod;
}

/**
 * Module-level helper — shadows the global `console` with a scoped logger bound to `tag`.
 * Add one line at the top of any file to get auto-prefixed output while keeping
 * the familiar `console.log()` call syntax everywhere below it.
 *
 * Safe to call at module evaluation time (e.g. `const console = contextConsole('ClassName')`
 * at the top of a file). Resolution of `ConsoleService.instance` is deferred to the first
 * actual method call via a lazy proxy, so Angular will have fully bootstrapped by then.
 *
 * @example
 * const console = contextConsole('AuthService');
 * console.log('Token refreshed');  // → [AuthService] Token refreshed
 */
export function contextConsole(tag: string): ScopedLogger {
  let _logger: ScopedLogger | undefined;
  const get = (): ScopedLogger => (_logger ??= ConsoleService.instance.forContext(tag));
  return {
    log:            (...args: unknown[]) => (get().log            as (...a: unknown[]) => void)(...args),
    warn:           (...args: unknown[]) => (get().warn           as (...a: unknown[]) => void)(...args),
    error:          (...args: unknown[]) => (get().error          as (...a: unknown[]) => void)(...args),
    debug:          (...args: unknown[]) => (get().debug          as (...a: unknown[]) => void)(...args),
    info:           (...args: unknown[]) => (get().info           as (...a: unknown[]) => void)(...args),
    trace:          (...args: unknown[]) => (get().trace          as (...a: unknown[]) => void)(...args),
    group:          (...args: unknown[]) => (get().group          as (...a: unknown[]) => void)(...args),
    groupCollapsed: (...args: unknown[]) => (get().groupCollapsed as (...a: unknown[]) => void)(...args),
    count:          (label)              => get().count(label),
    countReset:     (label)              => get().countReset(label),
    time:           (label)              => get().time(label),
    timeEnd:        (label)              => get().timeEnd(label),
    timeLog:        (label, ...data)     => get().timeLog(label, ...data),
    assert:         (condition, ...data) => get().assert(condition, ...data),
    table:          (tabularData, properties) => get().table(tabularData, properties),
    dir:            (item, options)      => get().dir(item, options),
    groupEnd:       ()                   => get().groupEnd(),
    clear:          ()                   => get().clear(),
  } as ScopedLogger;
}

/**
 * ConsoleService — environment-aware wrapper around the native browser console.
 *
 * Visibility rules (evaluated in order):
 *   1. Per-call `suppress: true`  → always silent.
 *   2. Per-call `force: true`     → always output.
 *   3. `ConsoleService.enabled`   → runtime global toggle.
 *   4. `environment.enableConsole`→ build-time default (false in production).
 */
@Injectable({
  providedIn: 'root',
})
export class ConsoleService {
  /**
   * Singleton reference set in the constructor. Used by `contextConsole()` so files
   * can access `forContext()` without injecting the service.
   */
  static instance: ConsoleService;

  /**
   * Runtime toggle. Initialised from `environment.enableConsole`.
   * Can be flipped at runtime: `consoleService.enabled = true`.
   */
  enabled: boolean = environment.enableConsole;

  constructor() {
    ConsoleService.instance = this;
  }

  // ─── Native console references (captured before any bootstrap patch) ────────

  /**
   * Holds references to the original browser console methods captured at construction
   * time — before AppComponent patches `console.*` with this service's methods.
   * `output()` must call these directly to avoid infinite recursion after patching.
   */
  private readonly _native = {
    log:            console.log.bind(console),
    warn:           console.warn.bind(console),
    error:          console.error.bind(console),
    debug:          console.debug.bind(console),
    info:           console.info.bind(console),
    trace:          console.trace.bind(console),
    group:          console.group.bind(console),
    groupCollapsed: console.groupCollapsed.bind(console),
    groupEnd:       console.groupEnd.bind(console),
    clear:          console.clear.bind(console),
    count:          console.count.bind(console),
    countReset:     console.countReset.bind(console),
    time:           console.time.bind(console),
    timeEnd:        console.timeEnd.bind(console),
    timeLog:        console.timeLog.bind(console),
    assert:         console.assert.bind(console),
    table:          console.table.bind(console),
    dir:            console.dir.bind(console),
  } as const;

  // ─── Public API (mirrors native console) ──────────────────────────────────

  readonly log:            ConsoleMethod          = (...args: unknown[]) => this.output('log',            args);
  readonly warn:           ConsoleMethod          = (...args: unknown[]) => this.output('warn',           args);
  readonly error:          ConsoleMethod          = (...args: unknown[]) => this.output('error',          args);
  readonly debug:          ConsoleMethod          = (...args: unknown[]) => this.output('debug',          args);
  readonly info:           ConsoleMethod          = (...args: unknown[]) => this.output('info',           args);
  readonly trace:          ConsoleMethod          = (...args: unknown[]) => this.output('trace',          args);
  readonly group:          ConsoleMethod          = (...args: unknown[]) => this.output('group',          args);
  readonly groupCollapsed: ConsoleMethod          = (...args: unknown[]) => this.output('groupCollapsed', args);
  /** Increments a named counter. Repeated calls update the same line in DevTools. Gated by `enabled`. */
  readonly count:          ConsoleLabelMethod     = (label)              => { if (this.enabled) this._native.count(label); };
  /** Resets the named counter to zero. Gated by `enabled`. */
  readonly countReset:     ConsoleLabelMethod     = (label)              => { if (this.enabled) this._native.countReset(label); };
  /** Starts a named timer. Gated by `enabled`. */
  readonly time:           ConsoleLabelMethod     = (label)              => { if (this.enabled) this._native.time(label); };
  /** Stops the named timer and logs elapsed ms. Gated by `enabled`. */
  readonly timeEnd:        ConsoleLabelMethod     = (label)              => { if (this.enabled) this._native.timeEnd(label); };
  /** Logs the current value of the named timer without stopping it. Gated by `enabled`. */
  readonly timeLog:        ConsoleTimeLabelMethod = (label, ...data)     => { if (this.enabled) this._native.timeLog(label, ...data); };
  /** Logs an error if `condition` is false. Gated by `enabled`. */
  readonly assert:         ConsoleAssertMethod    = (condition, ...data) => { if (this.enabled) this._native.assert(condition, ...data); };
  /** Displays tabular data as a table. Gated by `enabled`. */
  readonly table:          ConsoleTableMethod     = (tabularData, properties) => { if (this.enabled) this._native.table(tabularData, properties); };
  /** Displays an interactive object listing. Gated by `enabled`. */
  readonly dir:            ConsoleDirMethod       = (item, options)      => { if (this.enabled) this._native.dir(item, options); };
  /** Closes the current inline group. Gated by `enabled`. */
  readonly groupEnd:       ConsoleVoidMethod      = ()                   => { if (this.enabled) this._native.groupEnd(); };
  /** Clears the console. Gated by `enabled`. */
  readonly clear:          ConsoleVoidMethod      = ()                   => { if (this.enabled) this._native.clear(); };

  /**
   * Returns a scoped logger that automatically prepends `[tag]` to every message.
   * Prefer `contextConsole(tag)` at the top of a file over calling this directly.
   *
   * @example
   * const console = contextConsole('AuthService');
   * console.log('Token refreshed');  // → [AuthService] Token refreshed
   */
  forContext(tag: string): ScopedLogger {
    const prefix = `[${tag}]`;
    return {
      log:            (...args: unknown[]) => this.output('log',            this.prependTag(prefix, args)),
      warn:           (...args: unknown[]) => this.output('warn',           this.prependTag(prefix, args)),
      error:          (...args: unknown[]) => this.output('error',          this.prependTag(prefix, args)),
      debug:          (...args: unknown[]) => this.output('debug',          this.prependTag(prefix, args)),
      info:           (...args: unknown[]) => this.output('info',           this.prependTag(prefix, args)),
      trace:          (...args: unknown[]) => this.output('trace',          this.prependTag(prefix, args)),
      group:          (...args: unknown[]) => this.output('group',          this.prependTag(prefix, args)),
      groupCollapsed: (...args: unknown[]) => this.output('groupCollapsed', this.prependTag(prefix, args)),
      count:          (label) => { if (this.enabled) this._native.count(label          ? `${prefix} ${label}` : prefix); },
      countReset:     (label) => { if (this.enabled) this._native.countReset(label     ? `${prefix} ${label}` : prefix); },
      time:           (label) => { if (this.enabled) this._native.time(label           ? `${prefix} ${label}` : prefix); },
      timeEnd:        (label) => { if (this.enabled) this._native.timeEnd(label        ? `${prefix} ${label}` : prefix); },
      timeLog:        (label, ...data) => { if (this.enabled) this._native.timeLog(label ? `${prefix} ${label}` : prefix, ...data); },
      assert:         (condition, ...data) => { if (this.enabled) this._native.assert(condition, prefix, ...data); },
      table:          (tabularData, properties) => { if (this.enabled) this._native.table(tabularData, properties); },
      dir:            (item, options) => { if (this.enabled) this._native.dir(item, options); },
      groupEnd:       () => { if (this.enabled) this._native.groupEnd(); },
      clear:          () => { if (this.enabled) this._native.clear(); },
    };
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  /**
   * Resolves visibility and delegates to the native console method.
   *
   * @param method  Native console method name.
   * @param args    Raw argument list as passed by the caller.
   */
  private output(method: ConsoleMethodName, args: unknown[]): void {
    const { options, rest } = this.extractOptions(args);
    const { force, suppress } = options ?? {};

    // Rule 1 — per-call suppress wins over everything.
    if (suppress) return;

    // Rule 2 — per-call force bypasses global toggle.
    if (!force && !this.enabled) return;

    this._native[method](...rest);
  }

  /**
   * Checks whether the first argument is a `ConsoleCallOptions` object by verifying
   * the `CONSOLE_OPTIONS` Symbol marker, then separates it from the rest of the arguments.
   */
  private extractOptions(args: unknown[]): { options: ConsoleCallOptions | null; rest: unknown[] } {
    const first = args[0];
    if (
      first !== null &&
      typeof first === 'object' &&
      (first as Record<symbol, unknown>)[CONSOLE_OPTIONS] === true
    ) {
      return { options: first as ConsoleCallOptions, rest: args.slice(1) };
    }
    return { options: null, rest: args };
  }

  /**
   * Inserts the context prefix after any options object and before the first message argument.
   */
  private prependTag(prefix: string, args: unknown[]): unknown[] {
    const { options, rest } = this.extractOptions(args);
    return options ? [options, prefix, ...rest] : [prefix, ...rest];
  }
}
