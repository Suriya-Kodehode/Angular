# Angular Workspace

Angular `21.2` · TypeScript `5.9` · SSR · Vitest

## Projects

| Project | Path | Description |
|---|---|---|
| `my-app` | `projects/my-app` | Angular SSR application |
| `my-lib` | `projects/my-lib` | Publishable Angular library |
| `server` | `projects/server` | Standalone Express backend |

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
