# Repository Structure

> Workspace root: `d:\Projects\Angular`
> Angular `21.2.x` · TypeScript `5.9.x` · Node ESM server · SSR enabled

---

## Root

```
d:\Projects\Angular\
├── .doc/                          ← project documentation (this file lives here)
├── .github/                       ← GitHub workflows / CI config (empty)
├── .vscode/
│   ├── extensions.json            ← recommended VS Code extensions
│   ├── launch.json                ← debug configurations
│   └── tasks.json                 ← workspace task definitions
├── projects/
│   ├── my-app/                    ← Angular SSR application
│   ├── my-lib/                    ← Angular library + shared TypeScript DTOs for Angular & server
│   ├── scripts/                   ← workspace-level utility scripts (empty)
│   ├── server/                    ← standalone Express backend
│   └── temp/                      ← scratch / log files
│       ├── frontend.log
│       └── issue.log
├── .editorconfig
├── .gitignore
├── angular.json                   ← Angular CLI workspace config
├── bun.lock
├── package.json                   ← workspace root (npm scripts + dependencies)
├── package-lock.json
├── README.md
└── tsconfig.json                  ← root TypeScript config (path aliases defined here)
```

### Root `package.json` scripts

| Script | Purpose |
|---|---|
| `start` / `serve` | `ng serve my-app` |
| `build:my-app` | production build of the Angular app |
| `build:my-lib` | build the Angular library |
| `build:all` | build app then lib (⚠ wrong order — run `build:my-lib` manually first if `dist/my-lib` is missing) |
| `test:my-app` / `test:my-lib` | single-run Vitest suites |
| `serve:ssr:my-app` | run the compiled SSR server |

### Root `tsconfig.json` path aliases

| Alias | Resolves to |
|---|---|
| `my-lib` / `@my-lib` | `dist/my-lib` |
| `@my-lib/*` | `dist/my-lib/*` (sub-path imports) |
| `@app/shared` | `projects/my-app/src/app/shared/index.ts` |
| `@app/core/*` | `projects/my-app/src/app/core/*` |
| `@app/features/*` | `projects/my-app/src/app/features/*` |
| `@app/environments` | `projects/my-app/src/environments/environment.ts` |

---

## Angular App — `projects/my-app/`

Angular `21.2`, SSR via `@angular/ssr`, standalone component API, Vitest for tests.

```
my-app/
├── tsconfig.app.json
├── tsconfig.spec.json
├── public/
│   └── favicon.ico
└── src/
    ├── index.html
    ├── main.ts              ← browser bootstrap: bootstrapApplication(App, appConfig)
    ├── main.server.ts       ← SSR bootstrap: exports default bootstrap fn
    ├── server.ts            ← SSR Express server (AngularNodeAppEngine)
    ├── styles.scss          ← global style entry point — @use only, no styles defined here
    ├── environments/
    │   ├── environment.ts       ← { production: false }
    │   └── environment.prod.ts  ← { production: true }
    ├── styles/              ← 7-1 SCSS architecture
    │   ├── abstracts/
    │   │   ├── _variables.scss  ← :root CSS custom properties + Sass $breakpoints map
    │   │   ├── _mixins.scss     ← respond-above(), respond-below(), flex-center(), visually-hidden()
    │   │   ├── _functions.scss  ← tint(), shade(), rem()
    │   │   └── _index.scss      ← @forward variables, functions, mixins
    │   ├── base/
    │   │   ├── _reset.scss      ← box-sizing, margin/padding reset, img/input normalize
    │   │   ├── _typography.scss ← h1–h4, p, small using CSS custom properties
    │   │   └── _base.scss       ← body min-height, focus-visible outline
    │   ├── layout/
    │   │   ├── _grid.scss       ← .container with responsive max-widths
    │   │   ├── _header.scss     ← .app-header sticky + z-index
    │   │   └── _footer.scss     ← .app-footer
    │   ├── components/          ← global reusable UI styles only
    │   │   ├── _buttons.scss    ← .btn, --primary, --secondary, --sm, --lg (BEM)
    │   │   └── _cards.scss      ← .card, __header, __body, __footer (BEM)
    │   ├── themes/
    │   │   └── _dark.scss       ← .dark class overrides CSS custom properties
    │   └── vendors/
    │       └── _vendors.scss    ← placeholder for third-party style overrides
    └── app/
        ├── app.ts               ← root component; selector: app-root
        ├── app.html             ← root template; add <router-outlet /> here
        ├── app.scss             ← root component styles
        ├── app.spec.ts          ← root component tests
        ├── app.config.ts        ← browser ApplicationConfig; add provideRouter(routes) here
        ├── app.config.server.ts ← merges appConfig + provideServerRendering(withRoutes(...))
        ├── app.routes.ts        ← top-level Routes array; one loadChildren entry per feature
        ├── app.routes.server.ts ← ServerRoute[] — default: RenderMode.Prerender for '**'
        ├── core/                ← singleton, app-wide concerns (never imported by features directly)
        │   ├── guards/          ← route guards (CanActivate, CanMatch, etc.)
        │   ├── interceptors/    ← HTTP interceptors
        │   ├── services/        ← app-wide singleton services
        │   └── tokens/          ← InjectionTokens
        ├── features/            ← one folder per product feature (lazy-loaded)
        │   └── <feature>/
        │       ├── <feature>.routes.ts   ← exported Routes array, used via loadChildren
        │       └── *.component.ts        ← loaded via loadComponent inside routes
        └── shared/              ← reusable across features; exported via index.ts barrel
            ├── index.ts         ← public barrel export for @app/shared alias
            ├── components/      ← shared presentational components
            ├── constants/       ← app-wide constants
            ├── directives/      ← shared directives
            ├── models/          ← shared interfaces / types / enums
            ├── pipes/           ← shared pipes
            └── utils/           ← pure utility functions
```

---

## Angular Library — `projects/my-lib/`

Publishable library built with `ng-packagr`. Contains two distinct outputs:
- **Main entry** (`my-lib` / `@my-lib`) — Angular components, directives, pipes, services. Angular-only consumers.
- **Secondary entry** (`my-lib/models`) — pure TypeScript DTOs, interfaces, enums. Consumed by both Angular and the Bun server.

Organized **by domain** — each domain area is self-contained. Flat type folders exist only for items that are genuinely generic with no domain affiliation.

```
my-lib/
├── ng-package.json
├── package.json
├── README.md
├── tsconfig.lib.json
├── tsconfig.lib.prod.json
├── tsconfig.spec.json
└── src/
    ├── public-api.ts        ← Angular exports only — components, directives, pipes, services
    ├── models/              ← secondary entry point (ng-packagr)
    │   ├── ng-package.json  ← { "lib": { "entryFile": "public-api.ts" } }
    │   └── public-api.ts    ← re-exports all shared DTOs/models
    └── lib/
        ├── <domain>/        ← one folder per domain (e.g. auth/, table/, forms/)
        │   ├── components/
        │   ├── models/      ← DTOs and interfaces for this domain — pure TypeScript, no Angular imports
        │   ├── services/
        │   ├── directives/
        │   └── pipes/
        ├── components/      ← truly generic, domain-free components only
        ├── models/          ← cross-domain DTOs and shared interfaces — pure TypeScript, no Angular imports
        ├── pipes/           ← truly generic, domain-free pipes only
        └── services/        ← truly generic, domain-free services only
```

### Library conventions
- New code goes into the relevant **domain folder first** — only use flat folders if the item has no domain context
- Angular exports go through `src/public-api.ts`; DTOs/models go through the `my-lib/models` secondary entry (`src/models/public-api.ts`)
- **Models/DTOs must be pure TypeScript** — interfaces, types, enums only; zero `@angular/*` imports or decorators
- The main `my-lib` entry exports Angular-decorated code — **never import it in the server** (Angular decorators execute at import time and crash Bun)
- The `my-lib/models` secondary entry is framework-agnostic and safe for both Angular and the Bun server
- To consume models in the server, add `"my-lib/models": ["../../dist/my-lib/models"]` to `projects/server/tsconfig.json` `paths`; use `import type` to guarantee zero runtime overhead

---

## Express Server — `projects/server/`

Standalone **Bun** server (`"type": "module"`, `"packageManager": "bun@1.3.13"`). Not part of the Angular workspace build — managed separately with its own `package.json` and `tsconfig.json`.

```
server/
├── package.json             ← scripts: dev (bun --watch), build (bun build), start (bun src/main.ts), typecheck (tsc --noEmit)
├── tsconfig.json            ← target ESNext, module ESNext, moduleResolution Bundler, strict, outDir: dist/
└── src/
    ├── app.ts               ← creates Express app, registers global middleware + routes, exports default
    ├── main.ts              ← entry: app.listen() on process.env.PORT ?? 3000
    ├── config/              ← environment config / validation
    ├── constants/           ← server-wide constants
    ├── controllers/         ← route handler functions (thin, delegate to services)
    ├── errors/              ← custom error classes + error-handling middleware
    ├── middlewares/         ← Express middleware (auth, validation, logging, etc.)
    ├── models/              ← data models / DB schemas
    ├── repositories/        ← data access layer (DB queries)
    ├── routes/              ← Express Router definitions; mounted in app.ts
    ├── services/            ← business logic layer
    ├── types/               ← TypeScript types / interfaces / augmentations
    └── utils/               ← pure utility functions
```

### Server `package.json` scripts

| Script | Command |
|---|---|
| `dev` | `bun --watch src/main.ts` |
| `build` | `bun build src/main.ts --outdir dist --target bun` |
| `start` | `bun src/main.ts` |
| `typecheck` | `tsc --noEmit` |

---

## Conventions

### Styles
- `@use` / `@forward` only — **never `@import`** (deprecated in Dart Sass)
- To use abstracts in any partial: `@use '../abstracts' as *;`
- Component-specific styles stay in the component's own `.scss` file — **never** added to `styles/`
- CSS custom properties (`:root { --token: value }`) for runtime / themeable values
- Sass `$variables` only for compile-time values (e.g. `$breakpoints` used in `@media`)
- Dark mode via `.dark` class on `<html>` or `<body>` — overrides CSS custom properties

### Routing
- `app.routes.ts` — top-level only; one `loadChildren` entry per feature
- Feature routes defined in `features/<name>/<name>.routes.ts` as a named `Routes` export
- Individual components use `loadComponent` inside feature route files
- Guards registered on the feature-level route in `app.routes.ts`
- SSR render mode set per route in `app.routes.server.ts`

### Library
- Angular exports go through `src/public-api.ts`; DTOs/models through the `my-lib/models` secondary entry
- Import Angular code via `my-lib` or `@my-lib`; import models via `my-lib/models` or `@my-lib/models`
- Both require `dist/my-lib` to exist — run `build:my-lib` first

### TypeScript
- Strict mode enabled workspace-wide (`strict: true`, `noImplicitOverride`, `noImplicitReturns`)
- Use path aliases (`@app/shared`, `@app/core/*`, etc.) — never use deep relative imports across feature boundaries
