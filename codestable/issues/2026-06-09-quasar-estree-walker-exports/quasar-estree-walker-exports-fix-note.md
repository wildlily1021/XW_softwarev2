---
doc_type: issue-fix
issue: 2026-06-09-quasar-estree-walker-exports
status: fixed
severity: high
tags:
  - rewrite
  - quasar
  - vite
  - dependency
---

# Quasar Estree Walker Exports Fix Note

## Problem

`pnpm -C .\rewrite dev` failed while Quasar was loading `quasar.config.ts`.

The fatal log was:

```text
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: No "exports" main defined in ...\rewrite\node_modules\.pnpm\node_modules\estree-walker\package.json
```

## Root Cause

`rewrite/node_modules/.pnpm/node_modules/estree-walker` resolves to `estree-walker@3.0.3`, which is ESM-only and does not expose a CommonJS `require` entry.

Vue compiler CJS bundles still call:

```text
require('estree-walker')
```

They expect `estree-walker@2.0.2`, which is present as a nested dependency, but the project-level hoist setup exposes `3.0.3` at the shared hoist location. Loading Quasar/Vue compiler dependencies during config evaluation can hit this shared hoist location before the app can compile.

## Fix

Remove the optional `vite-plugin-vue-devtools` import and plugin registration from `rewrite/quasar.config.ts`.

The app does not require this plugin for runtime behavior.

Add a rewrite-local pnpm config to disable hoisting for the independent rewrite app:

- `rewrite/.npmrc`

This keeps Vue compiler dependencies resolved from their package-local dependency layout instead of the shared hoist location.

## Verification

Not run in this tool environment because `node` is not available on the tool PATH.

User-side verification command:

```powershell
pnpm -C .\rewrite install --force
pnpm -C .\rewrite dev
```

## Known Gaps

- Existing `rewrite/node_modules` must be regenerated after adding `rewrite/.npmrc`; otherwise the old hoisted `estree-walker@3.0.3` layout remains on disk.
