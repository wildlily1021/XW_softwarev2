---
doc_type: feature-design
feature: 2026-06-09-fpga-rs422-20260609-registry
status: approved
summary: Bring the 20260609 FPGA RS422 command/UI definitions into the existing registry surface and golden-frame tests.
roadmap: fpga-rs422-protocol-closure
roadmap_item: fpga-rs422-20260609-registry
tags:
  - rewrite
  - fpga
  - rs422
  - registry
  - protocol
---

# FPGA RS422 20260609 Registry Design

## 0. Direct Contract

Direct contract:

- `codestable/roadmap/fpga-rs422-protocol-closure/fpga-rs422-protocol-closure-roadmap.md`
- `codestable/roadmap/fpga-rs422-protocol-closure/fpga-rs422-protocol-closure-items.yaml`
- Roadmap item: `fpga-rs422-20260609-registry`
- `待做任务/遥控遥测20260609v1(1)/UI字段定义/`
- `待做任务/遥控遥测20260609v1(1)/指令与状态/`

Boundary guards:

- `codestable/architecture/rewrite-target-structure.md`
- `codestable/quality/rewrite-quality-rules.md`
- `codestable/features/2026-06-06-fpga-rs422-console/fpga-rs422-console-design.md`
- `codestable/features/2026-06-06-fpga-rs422-console/fpga-rs422-console-checklist.yaml`

## 1. Scope

This feature updates the existing `rewrite/src/features/fpga-rs422/core` registry surface so the 20260609 documents can become a traceable source for UI labels, UI control metadata, default command frames, and golden-frame regression tests.

It is the first roadmap item only. It does not redesign the console page, add a transaction service, change the serial writer, or add northbound bridge behavior.

## 2. Decisions

- Keep the current `FPGA_RS422_CATALOG` as the public catalog consumed by the existing service and page.
- Add metadata fields to catalog types rather than creating a parallel runtime schema that the page cannot consume yet.
- Replace module and command-group `label: key` defaults with explicit Chinese labels.
- For the first implementation pass, use `comm_rx_block` as the strict 20260609 parity target because it exposes the largest immediate conflict: the new docs contain `COMM_RX_PARAM_LOOP_ENABLE_C` and default all-zero golden frames.
- Keep unresolved or undocumented labels explicitly marked as `未标注中文名` or `待确认`; do not invent names or enum semantics.
- Add golden-frame fixtures sourced from `指令与状态/遥控指令具体执行/*.md` and assert the builder output exactly matches the documented bytes.

## 3. Acceptance Contract

Static acceptance:

- Module and command-group option helpers no longer return raw keys as labels for represented modules/groups.
- `comm_rx_block / COMM_RX_CMD_GROUP_MAP_C` contains all 8 parameters from the 20260609 UI field definition, including `COMM_RX_PARAM_LOOP_ENABLE_C`.
- `comm_rx_block` default command build output matches the 20260609 documented golden frames for MAP, VALUE, and three pulse groups.
- The catalog exposes enough optional metadata for later UI work: control kind, bit range, signedness, options, and source references.
- Existing command validation continues to reject out-of-range values before transport write.

Explicit non-goals:

- No UI layout/style changes in this item.
- No command transaction, ACK, timeout, retry, or expected-telemetry semantics in this item.
- No northbound/result/report/file-delivery changes in this item.
- No hardware validation claim.

## 4. Verification

Run focused Vitest coverage for `fpga-rs422`, then run at least `pnpm -C rewrite lint`. Build is run if the changed surface touches build/runtime entrypoints or if lint/tests reveal type uncertainty.

