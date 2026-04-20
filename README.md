# Angular Workspace

Angular `21.2` · TypeScript `5.9` · SSR · Vitest

## Projects

| Project | Path | Description |
|---|---|---|
| `my-app` | `projects/my-app` | Angular SSR application |
| `my-lib` | `projects/my-lib` | Publishable Angular library |
| `server` | `projects/server` | Standalone Express backend |

## Dependencies

### Runtime (`dependencies`)

| Package | Version | Purpose |
|---|---|---|
| `@angular/common` | `^21.2.9` | Common directives, pipes, HTTP |
| `@angular/compiler` | `^21.2.9` | Template compiler |
| `@angular/core` | `^21.2.9` | Core framework |
| `@angular/forms` | `^21.2.9` | Reactive & template-driven forms |
| `@angular/platform-browser` | `^21.2.9` | Browser bootstrapping |
| `@angular/platform-server` | `^21.2.9` | Server-side rendering |
| `@angular/router` | `^21.2.9` | Client-side routing |
| `@angular/ssr` | `^21.2.7` | SSR engine (`AngularNodeAppEngine`) |
| `express` | `^5.2.1` | HTTP server (SSR + backend) |
| `rxjs` | `~7.8.0` | Reactive streams |
| `tslib` | `^2.3.0` | TypeScript runtime helpers |

### Dev (`devDependencies`)

| Package | Version | Purpose |
|---|---|---|
| `@angular/build` | `^21.2.7` | Angular build tooling (esbuild) |
| `@angular/cli` | `^21.2.7` | CLI (`ng serve`, `ng build`, etc.) |
| `@angular/compiler-cli` | `^21.2.9` | AOT compiler |
| `@types/express` | `^5.0.1` | Express TypeScript types |
| `@types/node` | `^20.19.39` | Node.js TypeScript types |
| `jsdom` | `^27.4.0` | DOM environment for Vitest |
| `ng-packagr` | `^21.2.3` | Library build (`my-lib`) |
| `typescript` | `~5.9.2` | TypeScript compiler |
| `vitest` | `^4.1.4` | Test runner |

### Library peer deps (`projects/my-lib`)

| Package | Version |
|---|---|
| `@angular/common` | `^21.0.0` |
| `@angular/core` | `^21.0.0` |

> The `server` project (`projects/server`) has no npm dependencies — it uses only Node.js built-ins and the workspace `express` / TypeScript installs.

## Commands

```bash
# Angular app
npm start                  # serve my-app at http://localhost:4200
npm run build:my-app       # production build
npm run serve:ssr:my-app   # run compiled SSR server

# Library
npm run build:my-lib       # build library to dist/my-lib

# Both
npm run build:all          # build lib then app

# Tests
npm run test:my-app
npm run test:my-lib

# Express server (run from projects/server)
npm run dev                # --watch with --experimental-strip-types
npm run build              # tsc → dist/
npm start                  # node dist/main.js
```

## Docs

See [`.doc/repo-structure.md`](.doc/repo-structure.md) for full folder structure and conventions.
