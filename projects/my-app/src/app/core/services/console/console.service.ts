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
type ConsoleMethodName      = 'log' | 'warn' | 'error' | 'debug' | 'info' | 'trace' | 'group' | 'groupCollapsed';
/** Names of label-based native methods routed through `labelOutput()`. */
type ConsoleLabelMethodName = 'count' | 'countReset' | 'time' | 'timeEnd';
/** Names of no-arg native methods routed through `voidOutput()`. */
type ConsoleVoidMethodName  = 'groupEnd' | 'clear';

/** Typed call signature for label-based methods: `count`, `countReset`, `time`, `timeEnd`. */
type ConsoleLabelMethod = {
  (label?: string): void;
  (options: ConsoleCallOptions, label?: string): void;
};
/** Typed call signature for `console.timeLog`. */
type ConsoleTimeLabelMethod = {
  (label?: string, ...data: unknown[]): void;
  (options: ConsoleCallOptions, label?: string, ...data: unknown[]): void;
};
/** Typed call signature for `console.assert`. */
type ConsoleAssertMethod = {
  (condition?: boolean, ...data: unknown[]): void;
  (options: ConsoleCallOptions, condition?: boolean, ...data: unknown[]): void;
};
/** Typed call signature for `console.table`. */
type ConsoleTableMethod = {
  (tabularData?: unknown, properties?: string[]): void;
  (options: ConsoleCallOptions, tabularData?: unknown, properties?: string[]): void;
};
/** Typed call signature for `console.dir`. */
type ConsoleDirMethod = {
  (item?: unknown, dirOptions?: unknown): void;
  (options: ConsoleCallOptions, item?: unknown, dirOptions?: unknown): void;
};
/** Typed call signature for no-arg methods: `groupEnd`, `clear`. Supports `always`/`never`. */
type ConsoleVoidMethod = {
  (): void;
  (options: ConsoleCallOptions): void;
};

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
    count:          (...args: unknown[]) => (get().count          as (...a: unknown[]) => void)(...args),
    countReset:     (...args: unknown[]) => (get().countReset     as (...a: unknown[]) => void)(...args),
    time:           (...args: unknown[]) => (get().time           as (...a: unknown[]) => void)(...args),
    timeEnd:        (...args: unknown[]) => (get().timeEnd        as (...a: unknown[]) => void)(...args),
    timeLog:        (...args: unknown[]) => (get().timeLog        as (...a: unknown[]) => void)(...args),
    assert:         (...args: unknown[]) => (get().assert         as (...a: unknown[]) => void)(...args),
    table:          (...args: unknown[]) => (get().table          as (...a: unknown[]) => void)(...args),
    dir:            (...args: unknown[]) => (get().dir            as (...a: unknown[]) => void)(...args),
    groupEnd:       (...args: unknown[]) => (get().groupEnd       as (...a: unknown[]) => void)(...args),
    clear:          (...args: unknown[]) => (get().clear          as (...a: unknown[]) => void)(...args),
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
  /** Increments a named counter. Repeated calls update the same line in DevTools. Supports `always`/`never`. */
  readonly count:      ConsoleLabelMethod     = (...args: unknown[]) => this.labelOutput('count',      args);
  /** Resets the named counter to zero. Supports `always`/`never`. */
  readonly countReset: ConsoleLabelMethod     = (...args: unknown[]) => this.labelOutput('countReset', args);
  /** Starts a named timer. Supports `always`/`never`. */
  readonly time:       ConsoleLabelMethod     = (...args: unknown[]) => this.labelOutput('time',       args);
  /** Stops the named timer and logs elapsed ms. Supports `always`/`never`. */
  readonly timeEnd:    ConsoleLabelMethod     = (...args: unknown[]) => this.labelOutput('timeEnd',    args);
  /** Logs the current value of the named timer without stopping it. Supports `always`/`never`. */
  readonly timeLog:    ConsoleTimeLabelMethod = (...args: unknown[]) => this.timeLabelOutput(null,     args);
  /** Logs an error if `condition` is false. Supports `always`/`never`. */
  readonly assert:   ConsoleAssertMethod = (...args: unknown[]) => this.assertOutput(null,     args);
  /** Displays tabular data as a table. Supports `always`/`never`. */
  readonly table:    ConsoleTableMethod  = (...args: unknown[]) => this.tableOutput(args);
  /** Displays an interactive object listing. Supports `always`/`never`. */
  readonly dir:      ConsoleDirMethod    = (...args: unknown[]) => this.dirOutput(args);
  /** Closes the current inline group. Supports `always`/`never`. */
  readonly groupEnd: ConsoleVoidMethod   = (...args: unknown[]) => this.voidOutput('groupEnd', args);
  /** Clears the console. Supports `always`/`never`. */
  readonly clear:    ConsoleVoidMethod   = (...args: unknown[]) => this.voidOutput('clear',    args);

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
      count:      (...args: unknown[]) => this.labelOutputCtx('count',      prefix, args),
      countReset: (...args: unknown[]) => this.labelOutputCtx('countReset', prefix, args),
      time:       (...args: unknown[]) => this.labelOutputCtx('time',       prefix, args),
      timeEnd:    (...args: unknown[]) => this.labelOutputCtx('timeEnd',    prefix, args),
      timeLog:    (...args: unknown[]) => this.timeLabelOutput(prefix, args),
      assert:   (...args: unknown[]) => this.assertOutput(prefix, args),
      table:    (...args: unknown[]) => this.tableOutput(args),
      dir:      (...args: unknown[]) => this.dirOutput(args),
      groupEnd: (...args: unknown[]) => this.voidOutput('groupEnd', args),
      clear:    (...args: unknown[]) => this.voidOutput('clear',    args),
    };
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  /**
   * Extracts per-call options from `args` and evaluates the three visibility rules:
   *   1. `suppress: true`  → always silent (wins over everything).
   *   2. `force: true`     → always output (bypasses global toggle).
   *   3. `enabled = false` → silent (no per-call override present).
   * Returns `allowed` and the remaining args with the options object removed.
   */
  private resolveCall(args: unknown[]): { allowed: boolean; rest: unknown[] } {
    const { options, rest } = this.extractOptions(args);
    const { force, suppress } = options ?? {};
    return { allowed: !suppress && (!!force || this.enabled), rest };
  }

  /** Delegates to the named native method when `resolveCall` permits. */
  private output(method: ConsoleMethodName, args: unknown[]): void {
    const { allowed, rest } = this.resolveCall(args);
    if (allowed) this._native[method](...rest);
  }

  /** `count`/`countReset`/`time`/`timeEnd` — strips options then passes the label. */
  private labelOutput(method: ConsoleLabelMethodName, args: unknown[]): void {
    const { allowed, rest } = this.resolveCall(args);
    if (allowed) this._native[method](rest[0] as string | undefined);
  }

  /** Context-scoped `labelOutput` — prepends `prefix` to the label. */
  private labelOutputCtx(method: ConsoleLabelMethodName, prefix: string, args: unknown[]): void {
    const { allowed, rest } = this.resolveCall(args);
    if (!allowed) return;
    const label = rest[0] as string | undefined;
    this._native[method](label ? `${prefix} ${label}` : prefix);
  }

  /** `timeLog` — optionally prepends `prefix` to the label when context-scoped. */
  private timeLabelOutput(prefix: string | null, args: unknown[]): void {
    const { allowed, rest } = this.resolveCall(args);
    if (!allowed) return;
    const label = rest[0] as string | undefined;
    const resolvedLabel = prefix ? (label ? `${prefix} ${label}` : prefix) : label;
    this._native.timeLog(resolvedLabel, ...rest.slice(1));
  }

  /** `assert` — optionally prepends `prefix` to the message when context-scoped. */
  private assertOutput(prefix: string | null, args: unknown[]): void {
    const { allowed, rest } = this.resolveCall(args);
    if (!allowed) return;
    const condition = rest[0] as boolean | undefined;
    const data = rest.slice(1);
    this._native.assert(condition, ...(prefix ? [prefix, ...data] : data));
  }

  /** `table` — strips options then passes tabularData and properties. */
  private tableOutput(args: unknown[]): void {
    const { allowed, rest } = this.resolveCall(args);
    if (allowed) this._native.table(rest[0], rest[1] as string[] | undefined);
  }

  /** `dir` — strips options then passes item and dirOptions. */
  private dirOutput(args: unknown[]): void {
    const { allowed, rest } = this.resolveCall(args);
    if (allowed) this._native.dir(rest[0], rest[1]);
  }

  /** `groupEnd`/`clear` — no-arg call, only checks visibility. */
  private voidOutput(method: ConsoleVoidMethodName, args: unknown[]): void {
    const { allowed } = this.resolveCall(args);
    if (allowed) this._native[method]();
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
