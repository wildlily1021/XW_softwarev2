---
doc_type: issue-fix
issue: 2026-06-06-serial-resource-discovery
status: fixed
severity: high
tags:
  - rewrite
  - connection
  - serial
  - ui
---

# Serial Resource Discovery Fix Note

## Problem

The rewrite app could not create a new serial connection from the connection page.

## Root Cause

Three adjacent connection-resource wiring issues broke the serial creation flow:

- `ConnectionPage.refreshResources()` assigned the unresolved `Promise` from `connectionService.discoverResources()` into the `resources` ref, so the dialog received a Promise instead of an array.
- `createCompositeAdapter()` did not expose `discoverResources()`, so the runtime-level connection adapter hid the real serial adapter's port enumeration API.
- `createRealSerialAdapter().discoverResources()` returned `id: serial:${port.path}` while `NewConnectionDialog` writes the selected candidate id directly into `SerialTransportConfig.portPath`; this made the actual open request use `serial:COM3` instead of `COM3`.

## Fix

- Await resource discovery in `ConnectionPage.refreshResources()`.
- Add `discoverResources()` to the composite adapter and merge child adapter resources.
- Use the raw serial path as the serial resource candidate id.
- Add regression tests for composite resource discovery and serial candidate id semantics.

## Verification

- `pnpm -C .\rewrite test -- src/features/connection/__tests__/connection-composite-adapter.spec.ts src/features/connection/__tests__/connection-serial-adapter.spec.ts`
  - Passed: 2 test files, 2 tests.
- `pnpm -C .\rewrite exec eslint -c ./eslint.config.js "src/features/connection/**/*.{ts,vue}" "src/pages/ConnectionPage.vue"`
  - Passed.
- `pnpm -C .\rewrite exec quasar build -m spa`
  - Passed.

## Known Gaps

- Real serial hardware open was not validated in this session.
- Full connection test sweep still has one pre-existing test expectation mismatch in `connection-core.spec.ts`: the test expects normalized serial config to equal the input fixture, while the normalizer adds default serial fields.
