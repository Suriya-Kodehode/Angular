---
name: monorepo
description: Repo-specific structure guide for the d:\Projects\Angular workspace. Use when adding new features, deciding where code lives, sharing types between Angular and Express, or running project commands. Keywords: monorepo, project structure, my-app, my-lib, server, where to put, shared types, cross-project, Angular CLI workspace, projects folder, new feature, new file.
---

# Monorepo Structure — This Repo

> This is an **Angular CLI workspace** (not Nx or Turborepo).  
> Projects are declared in `angular.json` and live under `projects/`.

---

## Projects Overview

| Project | Path | Runtime | Purpose |
|---|---|---|---|
| `my-app` | `projects/my-app/` | Angular 21 + SSR | Frontend web application |
| `my-lib` | `projects/my-lib/` | ng-packagr | Shared Angular library (components, directives, pipes, services) + **shared TypeScript DTOs/models** between Angular and server |
| `server` | `projects/server/` | Bun + Express 5 | Backend REST API |
| `scripts` | `projects/scripts/` | Node / Bun | One-off utility scripts |
| `temp` | `projects/temp/` | — | Scratch / temporary files, never committed as production code |

---

## Why This Is a Monorepo — Benefits for This Repo

A monorepo is **multiple distinct projects with well-defined relationships** in one repository — not just code colocation. The relationships matter as much as the co-location.

| Benefit | How it applies here |
|---|---|
| **Atomic cross-project commits** | Update a server API shape and the Angular type definition in a single commit — no version coordination across repos |
| **Single dependency version** | `my-app` and `my-lib` share one `node_modules` at the root — one Angular version, no peer-dep conflicts |
| **Share without publishing** | `my-lib` compiles to `dist/my-lib` and is consumed by path alias — no npm registry needed |
| **Full context for AI agents** | An agent can navigate from `my-app` features → `my-lib` building blocks → server handlers in one pass, with no repo boundary walls |

---

## Workspace Root

```
d:\Projects\Angular\
├── angular.json          ← Angular CLI config — registers my-app and my-lib
├── package.json          ← Root npm workspace (Angular + my-app deps)
├── tsconfig.json         ← Root TypeScript config with path aliases (see below)
├── projects/
│   ├── my-app/           ← Angular application
│   ├── my-lib/           ← Angular shared library
│   ├── server/           ← Express backend (own package.json, own tsconfig)
│   ├── scripts/          ← Utility scripts
│   └── temp/             ← Scratch space
└── dist/
    ├── my-app/           ← Built Angular app
    └── my-lib/           ← Built library (required before my-app can use it)
```

> ⚠️ `projects/server/` has its **own `package.json` and `tsconfig.json`** — it is completely independent from the root npm workspace and Angular CLI. Never add backend deps to the root `package.json`.

---

## TypeScript Path Aliases (root `tsconfig.json`)

These aliases are available in `my-app` only (Angular build resolves them):

| Alias | Resolves to |
|---|---|
| `my-lib` | `dist/my-lib` (built library) |
| `@my-lib` | `dist/my-lib` (built library, alternate prefix) |
| `@my-lib/*` | `dist/my-lib/*` (sub-path imports) |
| `@app/shared` | `projects/my-app/src/app/shared/index.ts` |
| `@app/core/*` | `projects/my-app/src/app/core/*` |
| `@app/features/*` | `projects/my-app/src/app/features/*` |
| `@app/environments` | `projects/my-app/src/environments/environment.ts` |

> `projects/server/` does **not** inherit these aliases — it has its own `tsconfig.json` with no path aliases.

---

## Project Structures

### `my-app` — Angular Application

```
projects/my-app/src/
├── app/
│   ├── core/             guards/, interceptors/, services/, tokens/
│   ├── features/         domain-first — one folder per domain, each owning its pages
│   │   ├── <domain>/     e.g. auth/, home/
│   │   │   ├── <page>/   one folder per page/sub-feature inside the domain (if domain has multiple pages)
│   │   │   │             OR component files directly at domain root (if domain is a single page)
│   │   │   └── <domain>.routes.ts  ← lazy route config for the whole domain
│   └── shared/           components/, constants/, directives/, models/, pipes/, utils/
│       └── index.ts      ← public API — always import from here, not deep paths
├── environments/         environment.ts, environment.prod.ts
├── styles/               7-1 SCSS architecture
├── styles.scss           ← root global stylesheet (imports from styles/)
├── main.ts
├── main.server.ts
├── server.ts             ← Angular SSR server entry (Express under the hood)
└── index.html
```

**Domain = swappable unit.** Each domain folder owns all pages that belong to it. To swap out an entire area of the app for a different domain, remove or replace the domain folder and its route registration in `app.routes.ts`. Features inside a domain must never import from a sibling domain — cross-domain dependencies go through `shared/` or `my-lib` instead.

#### Domain vs Page — Decision Rule

| Item | Where to put it |
|---|---|
| Top-level area of the app (e.g. auth, home) | `features/<domain>/` — a domain folder |
| A page/view inside a multi-page domain | `features/<domain>/<page>/` |
| A domain that is itself a single page | component files directly in `features/<domain>/` alongside `<domain>.routes.ts` |
| Component/pipe/util shared across 2+ domains in `my-app` | `shared/` → export through `shared/index.ts` |
| Component/service shared across multiple Angular projects | `my-lib` → export through `public-api.ts` |

### `my-lib` — Shared Angular Library

```
projects/my-lib/src/
├── public-api.ts         ← ONLY re-export Angular-specific exports from here (components, services, directives, pipes)
└── lib/
    ├── my-lib.ts         ← scaffold placeholder — delete or replace when adding real code
    ├── my-lib.spec.ts    ← scaffold placeholder — delete or replace when adding real code
    ├── <domain>/         mirrors my-app feature domains (e.g. auth/, home/)
    │   ├── components/   Angular components (presentational only)
    │   ├── models/       ← DTOs and interfaces for this domain — pure TypeScript, no Angular imports
    │   ├── services/     Angular services (data-access / business logic)
    │   ├── directives/
    │   └── pipes/
    ├── components/       truly generic, domain-free components (e.g. SpinnerComponent)
    ├── models/           ← cross-domain DTOs and shared interfaces — pure TypeScript, no Angular imports
    ├── pipes/            truly generic, domain-free pipes
    └── services/         truly generic, domain-free services
```

> **Current state:** `my-lib` is at scaffold state — only flat folders exist on disk. The domain-first structure above is the **target pattern** to follow as new code is added. The scaffold files (`my-lib.ts`, `my-lib.spec.ts`) are ng-packagr placeholders; remove them when the first real domain folder is created.

> **Secondary entry point for server consumption:** The main `my-lib` entry (`public-api.ts`) exports Angular-decorated code which cannot be imported by the Bun server. DTOs/models are exposed via a **`my-lib/models` secondary entry point** (ng-packagr secondary entry at `projects/my-lib/src/models/`). The server imports from `'my-lib/models'` only — this compiles to pure JavaScript with no Angular runtime dependencies.

**Domain = swappable unit.** `my-lib` domains mirror `my-app` feature domains. `my-lib/lib/auth/` contains the reusable Angular building blocks (components, services, models) consumed by `my-app/features/auth/`. When a domain is removed or replaced in `my-app`, remove or replace the matching `my-lib/lib/<domain>/` folder and its re-exports in `public-api.ts`.

**Rules:**
- Every Angular export must go through `src/public-api.ts` — nothing else is public to Angular consumers
- DTOs and models are exposed through the `my-lib/models` secondary entry point — never through the main entry
- **Models/DTOs must be pure TypeScript** — interfaces, types, and enums only. Zero Angular imports (`@angular/*`), zero decorators. This is what makes them safe to import in the Bun server.
- Build `my-lib` before `my-app` can consume it: `npm run build:my-lib`
- `my-lib` has Angular peer deps — the main entry is **Angular-specific**; only the `my-lib/models` secondary entry is framework-agnostic
- New code goes into the relevant **domain folder first** — only promote to flat folders if it truly has no domain context
- `components/` inside a domain are **presentational only** — receive data via `input()` signals, emit events via `output()`, no services injected directly (`@Input`/`@Output` decorators are legacy; use the signal-based functions in Angular 17+)
- `services/` inside a domain handle **data-access or business logic** — inject `HttpClient`, manage state, or orchestrate API calls

#### Domain vs Flat — Decision Rule

| Item | Where to put it |
|---|---|
| Component/service/model for a domain | `lib/<domain>/` — matches `my-app/features/<domain>/` |
| Interface shared across 2+ domains inside `my-lib` | `lib/models/` |
| Truly generic item with no domain (e.g. `SpinnerComponent`, `TruncatePipe`) | Flat folder: `lib/components/`, `lib/pipes/`, etc. |

All exports go through `src/public-api.ts` — the internal folder structure is an implementation detail to consumers.

### `server` — Express Backend

```
projects/server/src/
├── app.ts                ← Express app setup
├── main.ts               ← Entry point (Bun)
├── config/               environment config (validated at startup)
├── constants/            shared constant values
├── controllers/          HTTP handlers (parse req → call service → send res)
├── routes/               router definitions
├── services/             business logic
├── repositories/         DB queries only
├── models/               ORM/DB models
├── types/                TypeScript interfaces and enums
├── middlewares/          auth, logging, error handling
├── errors/               custom error classes
└── utils/                pure helper functions
```

---

## Where to Put New Code — Decision Rules

### New domain (top-level area of the app)
→ `projects/my-app/src/app/features/<domain>/`  
→ Add a `<domain>.routes.ts` inside it and register a lazy `loadChildren` in `app.routes.ts`

### New page inside an existing domain
→ `projects/my-app/src/app/features/<domain>/<page>/`  
→ Register the route inside `features/<domain>/<domain>.routes.ts`

### New reusable Angular component/directive/pipe used by 2+ domains
→ `projects/my-app/src/app/shared/components|directives|pipes/`  
→ Export through `shared/index.ts`

### New DTO/model shared between Angular and server
→ `projects/my-lib/src/lib/<domain>/models/` (domain-specific) or `projects/my-lib/src/lib/models/` (cross-domain)  
→ Must be **pure TypeScript** — interfaces, types, enums only. No Angular imports.  
→ Re-export through the `my-lib/models` secondary entry point (`projects/my-lib/src/models/public-api.ts`)  
→ Angular app imports from `'my-lib/models'`; server imports from `'my-lib/models'` using its tsconfig path alias

### New domain-specific component/service shared across Angular projects
→ `projects/my-lib/src/lib/<domain>/` — use the domain that matches `my-app/features/<domain>/`  
→ Export through `public-api.ts`

### New truly generic Angular component/directive/pipe (no domain affiliation)
→ `projects/my-lib/src/lib/components|directives|pipes|services/`  
→ Export through `public-api.ts`

### New backend route/feature
→ `projects/server/src/` — add controller, service, repository, router following the existing MVC pattern

### New utility script (DB seed, data migration, etc.)
→ `projects/scripts/`

---

## Shared Types Between Frontend and Backend

`my-lib` is the **single source of truth for shared DTOs** in this repo. The key constraint: the main `my-lib` entry exports Angular-decorated code which crashes in Bun. The solution is a **secondary entry point** (`my-lib/models`) that exports only pure TypeScript — both Angular and the server can import from it safely.

### Primary approach — `my-lib/models` secondary entry point

Set up ng-packagr secondary entry at `projects/my-lib/src/models/`:

```
projects/my-lib/src/models/
├── ng-package.json      ← { "lib": { "entryFile": "public-api.ts" } }
└── public-api.ts        ← re-exports all shared DTOs
```

Domain models live in `lib/<domain>/models/` and are re-exported through here. Angular imports:

```ts
import { LoginRequest } from 'my-lib/models';
```

Server setup — add path alias to `projects/server/tsconfig.json`:

```json
"paths": {
  "my-lib/models": ["../../dist/my-lib/models"]
}
```

Server imports:

```ts
import type { LoginRequest } from 'my-lib/models';
```

> `import type` is preferred in the server — TypeScript erases it completely, guaranteeing zero runtime Angular dependency.

### Option B — Duplicate (only for small, stable contracts not worth centralising)
Define the TypeScript interface independently in both places and keep in sync manually. Avoid growing this pattern.

```
projects/my-app/src/app/shared/models/user.dto.ts   ← TypeScript interface only
projects/server/src/types/user.types.ts              ← Same shape, Zod schema added on top
```

### Option C — New `packages/shared-types/` package (only if server gains non-TS consumers)
If the repo needs to share types with a third project that cannot use ng-packagr output, extract a plain TypeScript package. **Do not create this unless there is a concrete need — the `my-lib/models` secondary entry is sufficient for Angular + Bun.**

---

## Dependency Direction Rules

```
my-app  →  my-lib              ✅ allowed (main entry — Angular components, services, models)
my-app  →  my-lib/models       ✅ allowed (secondary entry — pure TS DTOs)
my-app  →  server              ❌ forbidden (server is not a library)
server  →  my-lib/models       ✅ allowed (secondary entry, pure TS only — use `import type`)
server  →  my-lib              ❌ forbidden (main entry contains Angular-decorated code — crashes in Bun)
server  →  my-app              ❌ forbidden
my-lib  →  my-app              ❌ forbidden (circular)
```

Never use `../` to cross project boundaries at the file level. If a project needs code from another, it must be installed as a package dependency.

### Boundary enforcement

This workspace does **not use Nx**, so dependency boundaries are **not automatically enforced** — enforcement is by code-review convention. To add lightweight linting, install [`eslint-plugin-boundaries`](https://github.com/javierbrea/eslint-plugin-boundaries) and configure rules matching the table above. Without it, rely on PR review to catch violations.

---

## Commands

### Angular App (`my-app`)
```bash
# Run from workspace root (d:\Projects\Angular)
npm start                      # serve my-app (dev)
npm run build                  # build my-app
npm run test:my-app            # run my-app tests once
npm run lint:my-app
```

### Angular Library (`my-lib`)
```bash
# Run from workspace root
npm run build:my-lib           # build library → dist/my-lib (required before serving my-app)
npm run build:all              # builds my-app then my-lib — NOTE: my-app is built first in this script;
                               #   if dist/my-lib is missing, run build:my-lib manually first
npm run test:my-lib
```

### Express Server
```bash
# Run from projects/server/
cd projects/server
bun run dev                    # watch mode
bun run start                  # production
bun run build                  # compile to dist/
bun run typecheck              # tsc --noEmit
```

> The server uses **Bun** as its runtime and package manager. Run `bun install` inside `projects/server/`, not `npm install`.

---

## Renaming Projects (`my-app` / `my-lib`)

`my-app` and `my-lib` are Angular CLI placeholder names. When the project gets a real name (e.g. `dashboard`, `ui-kit`), every reference must be updated together — they are scattered across multiple config files.

### What to update when renaming `my-app` → `<new-name>`

| File | What to change |
|---|---|
| `angular.json` | Project key `"my-app"` → `"<new-name>"`, all `projects/my-app/` paths, and `buildTarget` references like `my-app:build:production` |
| `package.json` (root) | Script names and targets: `ng serve my-app`, `ng build my-app`, `ng test my-app`, `ng lint my-app`; also the script **value** of `serve:ssr:my-app`: `node dist/my-app/server/server.mjs` → `node dist/<new-name>/server/server.mjs` |
| `tsconfig.json` (root) | All `@app/*` path alias values: `projects/my-app/src/...` → `projects/<new-name>/src/...` |
| `projects/my-app/` folder | Rename the folder itself on disk |
| `projects/my-app/tsconfig.app.json` | `extends` path back to root (`../../tsconfig.json`) — usually unaffected unless folder depth changes |

### What to update when renaming `my-lib` → `<new-name>`

| File | What to change |
|---|---|
| `angular.json` | Project key `"my-lib"` → `"<new-name>"`, all `projects/my-lib/` paths |
| `package.json` (root) | Script targets: `ng build my-lib`, `ng test my-lib`, `ng lint my-lib` |
| `tsconfig.json` (root) | Path alias keys and values: `"my-lib"`, `"@my-lib"`, `"@my-lib/*"` → new names; values `./dist/my-lib` → `./dist/<new-name>` |
| `projects/my-lib/package.json` | `"name"` field — this is what `my-app` imports from (e.g. `import { X } from 'my-lib'`) |
| `projects/my-lib/ng-package.json` | `"dest"` field: `../../dist/my-lib` → `../../dist/<new-name>` |
| `projects/my-lib/` folder | Rename the folder itself on disk |
| Any `import` in `my-app` source | Update `import { X } from 'my-lib'` → `import { X } from '<new-name>'` |

### Safe rename approach

The Angular CLI `move` schematic does not exist for standard Angular CLI workspaces (it is an Nx feature). Rename manually following the tables above, then verify with:

```bash
npm run build:my-lib    # confirm library builds under new name
npm start               # confirm Angular app resolves the renamed lib
```

> After renaming, update the `description` field at the top of this SKILL.md and the paths in the `## Workspace Root` and `## TypeScript Path Aliases` sections to match.

---

## Common Mistakes

### Mistake 1 — Installing server deps in the root `package.json`
The server has its own `package.json`. Backend dependencies (e.g. `zod`, a DB driver) must be installed inside `projects/server/`, not at the workspace root.

```bash
# ❌ Wrong
npm install zod              # installs in root — not visible to server

# ✅ Correct
cd projects/server
bun add zod
```

### Mistake 2 — Importing the main `my-lib` entry in the server
The main `my-lib` entry exports Angular-decorated code (components, directives, pipes). Angular decorators execute at import time and crash Bun with missing browser/Angular APIs.

```ts
// ❌ Wrong — pulls in Angular-decorated code
import { AuthService } from 'my-lib';

// ✅ Correct — secondary entry exports pure TS DTOs only
import type { LoginRequest } from 'my-lib/models';
```

Only the `my-lib/models` secondary entry point is safe to import in the server.

### Mistake 3 — Importing across project boundaries with `../`
```ts
// ❌ From server, reaching into Angular app source
import { UserDto } from '../../my-app/src/app/shared/models/user.dto';

// ✅ Copy the interface locally or extract to a shared-types package
```

### Mistake 4 — Forgetting to build `my-lib` before serving `my-app`
`my-app` imports from `dist/my-lib` (the compiled output), not from source. If `dist/my-lib` is missing or stale, the Angular build will fail with a module-not-found error.

```bash
npm run build:my-lib   # always run this first when my-lib changes
npm start
```

### Mistake 5 — Putting new Angular components directly in `my-lib` that should be in `my-app/shared`
`my-lib` is for code shared across **multiple Angular projects**. If a component is only used within `my-app`, it belongs in `my-app/src/app/shared/`, not in `my-lib`.

### Mistake 6 — Extracting app-specific feature pages to `my-lib` prematurely
Feature pages in `my-app/features/` are app-specific — they are lazy-loaded routes that contain container components which inject services and belong to one app. Only extract to `my-lib` when the same component or service genuinely needs to run inside a **second Angular project**. Premature extraction adds a required build step (`build:my-lib`) for no benefit and blurs the line between app-specific and truly shared code.
