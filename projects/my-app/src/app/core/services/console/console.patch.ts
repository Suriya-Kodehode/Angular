import { ConsoleService, consolePatchMethodNames } from './console.service';

/**
 * Patches the native `console` object with `ConsoleService` methods.
 * Call once in `App.ngOnInit()` after Angular has bootstrapped.
 */
export function patchConsole(cs: ConsoleService): void {
  const patch = Object.fromEntries(
    consolePatchMethodNames.map((method) => [method, cs[method]])
  ) as Partial<Console>;

  Object.assign(console, patch);
}
