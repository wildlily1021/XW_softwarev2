# FPGA RS422 UI Registry Refresh Design

Status: approved-for-implementation
Date: 2026-06-09

## Direct Contract

- `待做任务/遥控遥测20260609v2(1)/UI字段定义/遥控字段定义/*.md`
- `待做任务/遥控遥测20260609v2(1)/UI字段定义/遥测字段定义/*.md`
- `codestable/roadmap/fpga-rs422-protocol-closure/fpga-rs422-protocol-closure-items.yaml` item `fpga-rs422-ui-registry-refresh`
- User request: verify UI fields against the task files, and keep edited command values while switching selections during the current app run, resetting to defaults after app restart.

## Boundary Guards

- `codestable/architecture/rewrite-target-structure.md`
- `codestable/quality/rewrite-quality-rules.md`
- `codestable/quality/rewrite-review-checklist.md`
- `codestable/quality/rewrite-frontend-conventions.md`
- `codestable/quality/rewrite-frontend-checklist.md`
- `codestable/reference/rewrite-frontend-quickref.md`
- Approved registry feature: `codestable/features/2026-06-09-fpga-rs422-20260609-registry/fpga-rs422-20260609-registry-design.md`

## Scope

- Update `fpga-rs422` registry metadata so command fields, telemetry fields, labels, group ids, word slices, signed display metadata, and command UI controls match the 20260609 UI field definition files.
- Fix command panel rendering so select, switch, number, and trigger controls follow registry metadata instead of treating every payload field as a number input.
- Keep command parameter draft values in renderer memory per module/group during the current application run. Do not persist them to disk, localStorage, or Electron main; a process restart must return to registry defaults.
- Keep changes inside `rewrite/src/features/fpga-rs422`, `rewrite/src/pages/FpgaRs422ConsolePage.vue`, and this feature note.

## Service Readiness Audit

- `buildFpgaCommandFrame` already accepts caller-provided param values and validates them against registry bit widths.
- `getDefaultFpgaCommandParamValues` provides the default draft seed for non-pulse params.
- The page needs read-for-edit command drafts with session lifetime. This is UI state, so it should live in a feature composable with module-scope memory, not in main/preload or persistent storage.
- Telemetry parsing needs field-level bit slicing and signed conversion to satisfy the UI field definitions.
- No Electron/preload/main API change is required.
- No northbound, SCOE, report, or file delivery behavior is in scope.

## Acceptance

- Command registry contains every command field listed in the 20260609 remote-control UI field definitions.
- Telemetry registry contains every telemetry field listed in the 20260609 telemetry UI field definitions, including `comm_rx` IQ group `8'h82`.
- Command controls render as dropdowns, switches, number inputs, or trigger-only controls according to `UI类型`.
- Edited command values survive module/group switching within the running renderer session.
- Restart behavior remains default-only because drafts are in memory and are never persisted.
