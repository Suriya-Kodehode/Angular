import { ConsoleService } from './console.service';

/**
 * Patches the native `console` object with `ConsoleService` methods.
 * Call once in `App.ngOnInit()` after Angular has bootstrapped.
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
