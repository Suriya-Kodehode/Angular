# Console Controller — Implementation Template

**Feature**: Console Controller  
**Status**: ⭕ Not Started  
**Priority**: TBD  
**Target Completion**: TBD  

**Motivation**: Sensitive data and debug messages are currently emitted via raw `console.log` calls in production builds. This template introduces a centralized `ConsoleService` that gates all console output through an environment-aware boolean with per-call override support, while keeping all existing call sites syntactically unchanged after a one-time bootstrap patch.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Phase Timeline](#phase-timeline)
- [Phase 1 — ConsoleService Core](#phase-1--consoleservice-core)
- [Phase 2 — Environment & Global Toggle Wiring](#phase-2--environment--global-toggle-wiring)
- [Usage Guide](#usage-guide)
- [Visibility Rules Reference](#visibility-rules-reference)
- [Testing Checklist](#testing-checklist)

---

## Overview

### Goals

- **Silence console output in production** without touching every individual `console.*` call.
- **Preserve full debug output in development** so existing workflows are unaffected.
- **Expose a global runtime toggle** (`ConsoleService.enabled`) so any environment can flip verbosity without a rebuild.
- **Support per-call overrides** so critical error paths can force output even when the global toggle is off, and chatty dev logs can be individually silenced.

### Non-Goals

- Remote log shipping / server-side logging (out of scope).
- Browser extension DevTools panel (out of scope).
- Source-map stripping or build-time dead-code elimination of log calls (handled by Angular AOT / terser separately).
- Implementing optional console methods (`group`/`groupCollapsed`/`groupEnd`, `count`/`countReset`, `time`/`timeEnd`/`timeLog`, `table`, `dir`, `assert`) unless the developer **explicitly requests them**. The core five methods (`log`, `warn`, `error`, `debug`, `info`) are always included. Do not add optional APIs speculatively.

### Approach: Wrapper Service (Drop-in Replacement)

`ConsoleService` wraps all 18 native `console` methods. After a one-time bootstrap patch in `App.ngOnInit()` via `patchConsole()`, all `console.*` calls across the entire app — including third-party libraries — are automatically routed through the service. The `opts()` helper and the `always`/`never` pre-built constants provide clean syntax for per-call overrides at any call site with no injection required.

---

## Project Structure

```
src/
└── app/
    └── services/
        └── console/                               [NEW] 🚀
            ├── console.service.ts                 [NEW] 🚀  Core service
            └── console.patch.ts                   [NEW] 🚀  Bootstrap patch helper (see §2.2)
src/
└── environments/
    ├── environment.ts                             [MODIFY] 🔧  Add enableConsole flag
    └── environment.prod.ts                        [MODIFY] 🔧  Add enableConsole flag
src/
└── app/
    └── app.component.ts                           [MODIFY] 🔧  Bootstrap console patch
```

---

## Phase Timeline

| Phase | Description | Status | Dependencies | Estimated Effort |
|-------|-------------|--------|--------------|-----------------|
| 1.0 | `ConsoleService` core implementation | ⭕ Not Started | None | 1 hour |
| 2.0 | Environment config + global toggle wiring | ⭕ Not Started | Phase 1 | 30 min |

---

## Phase 1 — ConsoleService Core

> **⚠️ Agent pre-flight — ask before implementing:**
> Before writing any code, ask the developer:
> *"Should the implementation include the optional console APIs — `group`/`groupCollapsed`/`groupEnd`, `count`/`countReset`, `time`/`timeEnd`/`timeLog`, `table`, `dir`, and `assert`? The core five (`log`, `warn`, `error`, `debug`, `info`) are always included. Optional APIs add ~60 lines and broader `patchConsole` coverage but may not be needed for every project."*
>
> Wait for confirmation before proceeding. If the developer confirms **all optional APIs**, implement the full 18-method version below. If they decline, implement only the 5-method version (omit the extra type aliases, `ScopedLogger` entries, `_native` bindings, public fields, `forContext` entries, and private helpers for the optional methods, and keep `patchConsole` to the core five).

### 1.1 Create `ConsoleService`

**File**: `src/app/services/console/console.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

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
export const never:  ConsoleCallOptions = opts({ suppress: true });

// ─── Internal type aliases ────────────────────────────────────────────────────
type ConsoleMethodName      = 'log' | 'warn' | 'error' | 'debug' | 'info' | 'trace' | 'group' | 'groupCollapsed';
type ConsoleLabelMethodName = 'count' | 'countReset' | 'time' | 'timeEnd';
type ConsoleVoidMethodName  = 'groupEnd' | 'clear';

// ─── Public call signatures ───────────────────────────────────────────────────
type ConsoleMethod = {
  (message?: unknown, ...optionalParams: unknown[]): void;
  (options: ConsoleCallOptions, message?: unknown, ...optionalParams: unknown[]): void;
};
type ConsoleLabelMethod = {
  (label?: string): void;
  (options: ConsoleCallOptions, label?: string): void;
};
type ConsoleTimeLabelMethod = {
  (label?: string, ...data: unknown[]): void;
  (options: ConsoleCallOptions, label?: string, ...data: unknown[]): void;
};
type ConsoleAssertMethod = {
  (condition?: boolean, ...data: unknown[]): void;
  (options: ConsoleCallOptions, condition?: boolean, ...data: unknown[]): void;
};
type ConsoleTableMethod = {
  (tabularData?: unknown, properties?: string[]): void;
  (options: ConsoleCallOptions, tabularData?: unknown, properties?: string[]): void;
};
type ConsoleDirMethod = {
  (item?: unknown, dirOptions?: unknown): void;
  (options: ConsoleCallOptions, item?: unknown, dirOptions?: unknown): void;
};
type ConsoleVoidMethod = {
  (): void;
  (options: ConsoleCallOptions): void;
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
  readonly count:          ConsoleLabelMethod;
  readonly countReset:     ConsoleLabelMethod;
  readonly time:           ConsoleLabelMethod;
  readonly timeEnd:        ConsoleLabelMethod;
  readonly timeLog:        ConsoleTimeLabelMethod;
  readonly assert:         ConsoleAssertMethod;
  readonly table:          ConsoleTableMethod;
  readonly dir:            ConsoleDirMethod;
  readonly groupEnd:       ConsoleVoidMethod;
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
  providedIn: 'root'
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
  readonly count:          ConsoleLabelMethod     = (...args: unknown[]) => this.labelOutput('count',      args);
  readonly countReset:     ConsoleLabelMethod     = (...args: unknown[]) => this.labelOutput('countReset', args);
  readonly time:           ConsoleLabelMethod     = (...args: unknown[]) => this.labelOutput('time',       args);
  readonly timeEnd:        ConsoleLabelMethod     = (...args: unknown[]) => this.labelOutput('timeEnd',    args);
  readonly timeLog:        ConsoleTimeLabelMethod = (...args: unknown[]) => this.timeLabelOutput(null,     args);
  readonly assert:         ConsoleAssertMethod    = (...args: unknown[]) => this.assertOutput(null,        args);
  readonly table:          ConsoleTableMethod     = (...args: unknown[]) => this.tableOutput(args);
  readonly dir:            ConsoleDirMethod       = (...args: unknown[]) => this.dirOutput(args);
  readonly groupEnd:       ConsoleVoidMethod      = (...args: unknown[]) => this.voidOutput('groupEnd',   args);
  readonly clear:          ConsoleVoidMethod      = (...args: unknown[]) => this.voidOutput('clear',      args);

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
      assert:     (...args: unknown[]) => this.assertOutput(prefix, args),
      table:      (...args: unknown[]) => this.tableOutput(args),
      dir:        (...args: unknown[]) => this.dirOutput(args),
      groupEnd:   (...args: unknown[]) => this.voidOutput('groupEnd', args),
      clear:      (...args: unknown[]) => this.voidOutput('clear',    args),
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

  private output(method: ConsoleMethodName, args: unknown[]): void {
    const { allowed, rest } = this.resolveCall(args);
    if (allowed) this._native[method](...rest);
  }

  private labelOutput(method: ConsoleLabelMethodName, args: unknown[]): void {
    const { allowed, rest } = this.resolveCall(args);
    if (allowed) this._native[method](rest[0] as string | undefined);
  }

  private labelOutputCtx(method: ConsoleLabelMethodName, prefix: string, args: unknown[]): void {
    const { allowed, rest } = this.resolveCall(args);
    if (!allowed) return;
    const label = rest[0] as string | undefined;
    this._native[method](label ? `${prefix} ${label}` : prefix);
  }

  private timeLabelOutput(prefix: string | null, args: unknown[]): void {
    const { allowed, rest } = this.resolveCall(args);
    if (!allowed) return;
    const label = rest[0] as string | undefined;
    const resolvedLabel = prefix ? (label ? `${prefix} ${label}` : prefix) : label;
    this._native.timeLog(resolvedLabel, ...rest.slice(1));
  }

  private assertOutput(prefix: string | null, args: unknown[]): void {
    const { allowed, rest } = this.resolveCall(args);
    if (!allowed) return;
    const [condition, ...data] = rest;
    this._native.assert(
      condition as boolean | undefined,
      ...(prefix ? [prefix, ...data] : data)
    );
  }

  private tableOutput(args: unknown[]): void {
    const { allowed, rest } = this.resolveCall(args);
    if (allowed) this._native.table(rest[0], rest[1] as string[] | undefined);
  }

  private dirOutput(args: unknown[]): void {
    const { allowed, rest } = this.resolveCall(args);
    if (allowed) this._native.dir(rest[0], rest[1]);
  }

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
    if (first !== null && typeof first === 'object' && (first as Record<symbol, unknown>)[CONSOLE_OPTIONS] === true) {
      return { options: first as ConsoleCallOptions, rest: args.slice(1) };
    }
    return { options: null, rest: args };
  }

  /** Inserts the context prefix after any options object and before the first message argument. */
  private prependTag(prefix: string, args: unknown[]): unknown[] {
    const { options, rest } = this.extractOptions(args);
    return options ? [options, prefix, ...rest] : [prefix, ...rest];
  }
}
```

**Deliverables**: ✔️ `ConsoleService` created, ✔️ All 18 `console` methods implemented, ✔️ Per-call override logic via `resolveCall()`, ✔️ `forContext()` scoped logger implemented, ✔️ `contextConsole()` export added, ✔️ `static instance` set in constructor, ✔️ No `any` types used

---

## Phase 2 — Environment & Global Toggle Wiring

### 2.1 Add `enableConsole` to Environment Files

Add the flag to both environment files, keeping them in sync. The two files are mirrors of each other — only the flag values differ. Adjust the existing properties to match your project.

**File**: `src/environments/environment.ts` — `[MODIFY]` 🔧

```typescript
export const environment = {
  production: false,
  enableConsole: true,            // Dev: console ON by default
  // ...existing properties
} satisfies { production: boolean; enableConsole: boolean; [key: string]: unknown };
```

**File**: `src/environments/environment.prod.ts` — `[MODIFY]` 🔧

```typescript
export const environment = {
  production: true,
  enableConsole: false,           // Prod: console OFF by default
  // ...existing properties
} satisfies { production: boolean; enableConsole: boolean; [key: string]: unknown };
```

> **Note:** `satisfies` requires TypeScript 4.9+. If your project uses an older TypeScript version, remove `satisfies ...` — the object literal still works correctly without it.

**Deliverables**: ✔️ `environment.ts` updated, ✔️ `environment.prod.ts` updated, ✔️ Both files mirrored, ✔️ Build-time defaults confirmed

### 2.2 Patch Native Console at Bootstrap

Extract all `console.*` assignments into a dedicated helper file, then call it once in `AppComponent.ngOnInit()`. After this runs, every `console.*` call anywhere in the app — including third-party libraries — is routed through the service.

> ⚠️ **Recursion guard:** `ConsoleService` captures the original browser console methods in `_native` at construction time (before this patch runs). `output()` delegates to `_native[method]` — not `console[method]` — so the patched `console` calling back into the service does not cause infinite recursion.

**File**: `src/app/services/console/console.patch.ts` — `[NEW]` 🚀

Create a `patchConsole()` function that assigns the core five methods. **Only add extra methods here if the developer has explicitly requested them** (see Non-Goals):

```typescript
import { ConsoleService } from './console.service';

/**
 * Patches the native `console` object with `ConsoleService` methods.
 * Call once in `AppComponent.ngOnInit()` after Angular has bootstrapped.
 */
export function patchConsole(cs: ConsoleService): void {
  Object.assign(console, {
    log: cs.log, warn: cs.warn, error: cs.error, debug: cs.debug,
    info: cs.info, trace: cs.trace, group: cs.group, groupCollapsed: cs.groupCollapsed,
    groupEnd: cs.groupEnd, clear: cs.clear, count: cs.count, countReset: cs.countReset,
    time: cs.time, timeEnd: cs.timeEnd, timeLog: cs.timeLog,
    assert: cs.assert, table: cs.table, dir: cs.dir,
  });
}
```

**File**: `src/app/app.ts` — `[MODIFY]` 🔧

Inject `ConsoleService` via `inject()`, import `patchConsole`, and call it at the top of `ngOnInit()`:

```typescript
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { patchConsole } from './services/console/console.patch';

// Using inject() — no constructor needed:
private readonly consoleService = inject(ConsoleService);

ngOnInit(): void {
  patchConsole(this.consoleService);
  // ...rest of existing ngOnInit
}
```

After this patch, `always` and `never` can be passed to `console` at any call site without injecting the service:

```typescript
import { always, never } from './services/console/console.service';

console.error(always, 'Critical failure:', err);  // → always visible
console.log(never,  'Noisy trace:', data);        // → always silent
console.log('Normal log');                        // → gated by enabled
```

### 2.3 Runtime Toggle (Optional)

`ConsoleService.enabled` is a plain public boolean that can be flipped at runtime without a rebuild:

```typescript
this.consoleService.enabled = true;   // reveal all non-suppressed logs
this.consoleService.enabled = false;  // silence all non-forced logs
```

> **Ownership rule:** Only `App.ngOnInit()` should write to `enabled` on startup. Prefer `always` for individual critical calls rather than toggling the global flag — a global flip silences or reveals all logging across the entire app at once.

**Deliverables**: ✔️ Native `console` patched at bootstrap, ✔️ All call sites gated without per-file changes

---

## Usage Guide

### No Injection Needed for Basic Use

After the bootstrap patch, `console.*` calls anywhere in the app are already routed through `ConsoleService`. Import `always` or `never` only where overrides are needed:

```typescript
import { always, never } from '../services/console/console.service';

console.error(always, 'Critical error:', err);  // always visible
console.log(never,  'Noisy trace:', data);      // always silent
console.log('Normal log');                      // gated by enabled
```

For tagged output, add `const console = contextConsole('ClassName')` at the top of the file — no injection needed. See [Scoped Logger (Tagged Output)](#scoped-logger-tagged-output) below.

`opts` is available for custom or combined options not covered by `always`/`never`.

---

### Standard Logging

After the bootstrap patch, existing calls are automatically gated by `ConsoleService.enabled` — no changes required at the call site.

```typescript
console.log('User loaded', user);
console.warn('Rate limit approaching');
console.error('Request failed', err);
console.debug('Raw payload', response);
console.info('App initialised');
console.trace('Call stack trace');
```

---

### Scoped Logger (Tagged Output)

Use `contextConsole(tag)` to shadow the global `console` at the top of any file. **No injection required.** Every `console.*` call below that line uses the tagged logger — the call syntax is identical to native `console`.

```typescript
import { contextConsole, always, never } from '../services/console/console.service';

// Shadow global console — one line per file:
const console = contextConsole('AuthService');

export class AuthService {
  login(): void {
    console.log('Attempting login');                 // → [AuthService] Attempting login
    console.error(always, 'Auth failed:', err);      // → [AuthService] Auth failed: ...
    console.log(never,  'Raw response:', res);       // silent
  }
}
```

> ℹ️ **Safe at module level:** `contextConsole()` returns a lazy proxy. `ConsoleService.instance` is not read until the **first actual method call** (`console.log(...)`, etc.), by which point Angular has fully bootstrapped and constructed the service. The `const console = contextConsole(...)` line itself is safe to place at the top of any module.

All per-call overrides (`force`, `suppress`) work identically.

---

### Force Output in Production

Pass `always` as the **first** argument. The call bypasses the global toggle and always reaches the console. Use for errors and operational events that must be visible regardless of environment.

```typescript
import { always } from '../services/console/console.service';

console.error(always, 'Critical failure:', err);
console.warn(always, 'Connection lost');
```

```typescript
// With contextConsole — tag is prepended automatically:
import { contextConsole, always } from '../services/console/console.service';
const console = contextConsole('ClassName');    // top of file
console.error(always, 'Critical failure:', err);  // → [ClassName] Critical failure: ...
```

---

### Suppress a Specific Call

Pass `never` as the **first** argument. The call is permanently silenced — even when `enabled = true` in development. Use for high-frequency traces that are useful during initial development but noisy thereafter.

```typescript
import { never } from '../services/console/console.service';

console.log(never, 'Polling tick');
console.log(never, 'Cache hit:', key);
```

```typescript
// With contextConsole — tag is prepended automatically:
import { contextConsole, never } from '../services/console/console.service';
const console = contextConsole('ClassName');    // top of file
console.log(never, 'Cache hit:', key);          // → silent
```

---

### Groups *(Optional)*

Use `group`/`groupCollapsed` to nest related logs. The indented block closes with `groupEnd()`. All three accept `always`/`never`.

```typescript
const console = contextConsole('DataService');

console.group('[loadData]');
console.log('Fetching page', page);
console.log('Response size', items.length);
console.groupEnd();

// Force a group visible in production:
console.group(always, '[loadData]');
console.error(always, 'Request failed:', err);
console.groupEnd(always);
```

---

### Timers *(Optional)*

`time`/`timeEnd`/`timeLog` accept an optional label. With `contextConsole`, the tag is prepended to the label automatically (`[ClassName] label`).

```typescript
const console = contextConsole('DataService');

console.time('fetchAll');
const data = await this.dataService.getAll();
console.timeLog('fetchAll', 'items loaded:', data.length);  // → [DataService] fetchAll: 42ms items loaded: 100
console.timeEnd('fetchAll');                                 // → [DataService] fetchAll: 87ms
```

---

### Count *(Optional)*

Increments a named counter each call. The counter persists in DevTools until `countReset()`. With `contextConsole`, the tag is prepended to the label.

```typescript
const console = contextConsole('CacheService');

console.count('cache-hit');    // → [CacheService] cache-hit: 1
console.count('cache-hit');    // → [CacheService] cache-hit: 2
console.countReset('cache-hit');

// Suppress noisy counter in dev:
console.count(never, 'poll-tick');
```

---

### Table & Dir *(Optional)*

`table` displays array/object data as a formatted grid. `dir` renders an interactive object tree. Context prefix is **not** applied to either — they are data-display methods.

```typescript
console.table(users, ['id', 'name', 'role']);
console.dir(this.config);

// Suppress verbose data in dev:
console.table(never, rawPayload);
```

---

### Assert *(Optional)*

Logs an error only when `condition` is false. With `contextConsole`, the tag is prepended to the data args.

```typescript
const console = contextConsole('AuthGuard');

console.assert(user !== null, '[canActivate] user is null — redirecting');
// → [AuthGuard] Assertion failed: [canActivate] user is null — redirecting

// Force assert visible even in production:
console.assert(always, isValid, '[validate] schema invalid:', errors);
```

---

### Quick Reference

| Intent | Syntax |
|--------|--------|
| Normal log (gated by toggle) | `console.log('msg', data)` |
| Always visible in prod | `console.error(always, 'msg', err)` |
| Always silent, even in dev | `console.log(never, 'msg')` |
| Tagged output (auto-prefixed) | `const console = contextConsole('ClassName')` (top of file), then `console.log('msg', data)` |
| Group related logs *(optional)* | `console.group('[method]'); ... console.groupEnd();` |
| Time an operation *(optional)* | `console.time('label'); ... console.timeEnd('label');` |
| Time mid-operation *(optional)* | `console.timeLog('label', 'extra data')` |
| Count invocations *(optional)* | `console.count('label')` / `console.countReset('label')` |
| Display array as table *(optional)* | `console.table(arr, ['col1', 'col2'])` |
| Display object tree *(optional)* | `console.dir(obj)` |
| Assert a condition *(optional)* | `console.assert(condition, 'msg')` |
| Enable all logging at runtime | `this.consoleService.enabled = true` |
| Disable all logging at runtime | `this.consoleService.enabled = false` |

---

## Visibility Rules Reference

| Condition | Output? | Use case |
|-----------|---------|---------|
| `suppress: true` (per-call) | ❌ Never | Noisy traces you want quiet even in dev |
| `suppress: true` + `force: true` | ❌ Never | `suppress` always wins — Rule 1 takes priority |
| `force: true` + `enabled = false` | ✅ Always | Critical errors that must appear in prod |
| `force: true` + `enabled = true` | ✅ Always | (no change from normal) |
| `enabled = true` (no override) | ✅ Yes | Normal dev logging |
| `enabled = false` (no override) | ❌ No | Normal prod silencing |

### Default Behaviour by Environment

| Environment | `environment.enableConsole` | `ConsoleService.enabled` on boot |
|-------------|----------------------------|----------------------------------|
| `ng serve` (dev) | `true` | **ON** — all `console.*` visible |
| `ng build` (prod) | `false` | **OFF** — all `console.*` silent unless `force: true` |

---

## Testing Checklist

### Manual
- [ ] `ng serve` — console output appears in DevTools as expected
- [ ] `ng build` — built app produces no `console.*` output without `force: true`
- [ ] Admin toggle (`consoleService.enabled = true`) in prod re-enables output at runtime
- [ ] `always` call appears in DevTools even in a prod build
- [ ] `never` call does not appear in DevTools even in a dev build
- [ ] Third-party library console output is also gated after bootstrap patch

### Security
- [ ] No auth tokens, API keys, or user PII appear in console in a prod build
- [ ] `always` is used only on operational messages (errors, disconnects), not data-bearing logs
- [ ] Call sites that log sensitive response data use `never` or have been reviewed
