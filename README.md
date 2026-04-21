# _Project Name TBD_

> _Description pending._

![Angular](https://img.shields.io/badge/Angular-21.2-dd0031?logo=angular) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript) ![SSR](https://img.shields.io/badge/SSR-enabled-green) ![Vitest](https://img.shields.io/badge/Vitest-4.x-6e9f18?logo=vitest)

---

## Table of Contents

- [Projects](#projects)
- [Stack](#stack)
- [Commands](#commands)
- [Docs](#docs)

---

## Projects

| Project | Path | Description |
|---|---|---|
| `my-app` | `projects/my-app` | Angular SSR application |
| `my-lib` | `projects/my-lib` | Publishable Angular library |
| `server` | `projects/server` | Standalone Express backend |

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21.2, SSR (`AngularNodeAppEngine`) |
| Language | TypeScript 5.9 |
| Styling | SCSS (7-1 pattern) |
| Backend | Express 5 · Bun 1.3.13 |
| Testing | Vitest + jsdom |
| Library build | ng-packagr |

See [`package.json`](package.json) for the full dependency list.

---

## Commands

**Install**
```bash
npm install
```

**Develop**
```bash
npm start                  # serve my-app at http://localhost:4200
```

**Build**
```bash
npm run build:my-app       # production build (Angular app)
npm run build:my-lib       # build library → dist/my-lib
npm run build:all          # build lib then app
npm run serve:ssr:my-app   # run compiled SSR server
```

**Test**
```bash
npm run test:my-app
npm run test:my-lib
```

**Express server** _(run from `projects/server`)_
```bash
bun run dev                # watch mode (bun --watch)
bun run start              # run directly with Bun
bun run typecheck          # type-check only (tsc --noEmit)
```

---

## Docs

See [`.doc/repo-structure.md`](.doc/repo-structure.md) for full folder structure and conventions.
