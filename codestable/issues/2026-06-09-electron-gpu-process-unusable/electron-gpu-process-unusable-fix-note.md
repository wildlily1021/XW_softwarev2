---
doc_type: issue-fix
slug: electron-gpu-process-unusable
status: fallback-expanded-pending-runtime-confirmation
date: 2026-06-09
severity: medium
tags:
  - rewrite
  - electron
  - windows
  - gpu
---

# Electron GPU Process Unusable Fix Note

## Direct Contract

- User runtime log from `pnpm -C .\rewrite dev` on Windows:
  - `GPU process exited unexpectedly`
  - `GPU process isn't usable. Goodbye.`
  - Electron exit code `2147483651`

Boundary guards:

- `codestable/architecture/rewrite-target-structure.md`
- `codestable/quality/rewrite-quality-rules.md`
- Electron main remains platform/lifecycle only and does not receive business rules.

## Root Cause

Quasar finished compiling Electron main and preload successfully, then Electron/Chromium failed during GPU process initialization. This is a runtime graphics initialization failure, not a TypeScript or Quasar compile failure.

## Fix

Updated `rewrite/src-electron/main/index.ts` to configure a Windows Chromium GPU fallback before `app.whenReady()`.

First pass:

- disable hardware acceleration,
- append `disable-gpu`,
- append `disable-gpu-compositing`,
- allow opt-out via `ELECTRON_ENABLE_HARDWARE_ACCELERATION=1`.

Second pass after the first runtime retry still failed:

- append `disable-gpu-sandbox`,
- append `disable-direct-composition`,
- force SwiftShader via `use-angle=swiftshader` and `use-gl=swiftshader`,
- append `enable-unsafe-swiftshader`,
- disable selected Windows/Chromium GPU-dependent features:
  - `CalculateNativeWinOcclusion`
  - `D3D11VideoDecode`
  - `HardwareMediaKeyHandling`
  - `MediaFoundationVideoDecode`
  - `VizDisplayCompositor`

This keeps Electron security settings unchanged:

- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: false`

## Verification

- `pnpm -C rewrite exec eslint -c ./eslint.config.js ./src-electron/main/index.ts`: passed after first pass and second pass.
- `pnpm -C rewrite exec vitest run src/features/fpga-rs422`: passed, 2 files / 26 tests.

Known unrelated validation results:

- Full `pnpm -C rewrite lint` currently fails on pre-existing northbound/storage/display lint errors, not this Electron main change.
- Broad `pnpm -C rewrite test -- src/features/fpga-rs422` invoked Vitest with an argument pattern that still ran the whole suite; FPGA tests passed, while an existing connection fixture assertion and TCP loopback `ECONNRESET` failed elsewhere.

Runtime confirmation still needed:

- Re-run `pnpm -C .\rewrite dev` in a normal Windows PowerShell with Node 22 to confirm Electron window starts on the affected machine.
