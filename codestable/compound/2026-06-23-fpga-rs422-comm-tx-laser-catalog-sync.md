# FPGA RS422 Catalog Sync 2026-06-23

## Summary

本次同步将 `rewrite/src/features/fpga-rs422/core/catalog.ts` 对齐到 `待做任务/控制与状态系统20260623v2` 中 `comm_tx_block` 与 `laser_ctrl_block` 的最新文档定义，并同步更新了对应解析/展示测试。

## Direct contract

- `待做任务/控制与状态系统20260623v2/UI字段定义/遥控字段定义/comm_tx_block.md`
- `待做任务/控制与状态系统20260623v2/UI字段定义/遥测字段定义/comm_tx_block.md`
- `待做任务/控制与状态系统20260623v2/指令与状态/遥控指令清单/comm_tx_block.md`
- `待做任务/控制与状态系统20260623v2/指令与状态/遥控指令具体执行/comm_tx_block.md`
- `待做任务/控制与状态系统20260623v2/指令与状态/遥测指令清单/comm_tx_block.md`
- `待做任务/控制与状态系统20260623v2/指令与状态/遥测状态具体执行/comm_tx_block.md`
- `待做任务/控制与状态系统20260623v2/UI字段定义/遥控字段定义/laser_ctrl_block.md`
- `待做任务/控制与状态系统20260623v2/UI字段定义/遥测字段定义/laser_ctrl_block.md`
- `待做任务/控制与状态系统20260623v2/指令与状态/遥控指令清单/laser_ctrl_block.md`
- `待做任务/控制与状态系统20260623v2/指令与状态/遥控指令具体执行/laser_ctrl_block.md`
- `待做任务/控制与状态系统20260623v2/指令与状态/遥测指令清单/laser_ctrl_block.md`
- `待做任务/控制与状态系统20260623v2/指令与状态/遥测状态具体执行/laser_ctrl_block.md`

## comm_tx_block changes

- 遥控组拆分为 4 组：
  - `COMM_TX_CMD_GROUP_MAP_C` `0x10`：仅保留正常工作参数 `rate/scramble/encode`
  - `COMM_TX_CMD_GROUP_FAULT_C` `0x11`：新增 11 个异常注入参数
  - `COMM_TX_CMD_GROUP_PULSE_RESET_C` `0x12`
  - `COMM_TX_CMD_GROUP_PULSE_CLEAR_C` `0x13`
- 参数 id 调整为连续协议定义：
  - 正常配置 `0..2`
  - fault 配置 `3..13`
  - pulse `14..15`
- 遥测组拆分为 4 组：
  - `runtime` `0x80`
  - `cfg` `0x81`
  - `fault-runtime` `0x90`
  - `fault-cfg` `0x91`
- 原先混在 `runtime/cfg` 里的异常注入字段，已迁移到独立 `fault-*` 组。

## laser_ctrl_block changes

- 删除主机侧不再开放的 4 个手动设温组：
  - `LASER_CTRL_CMD_GROUP_TXM1_SET_C`
  - `LASER_CTRL_CMD_GROUP_TXM2_SET_C`
  - `LASER_CTRL_CMD_GROUP_LO1_SET_C`
  - `LASER_CTRL_CMD_GROUP_LO2_SET_C`
- 新增 2 个主机侧控制组：
  - `LASER_CTRL_CMD_GROUP_FREQ_SCAN_EN_C` `0x30`
  - `LASER_CTRL_CMD_GROUP_FREQ_UNLOAD_EN_C` `0x31`
- `runtime` 遥测组从 14 字段扩展为 23 字段，补入：
  - `yc_mod_i_set`
  - `yc_mod_q_set`
  - `yc_mod_p_set`
  - `freq_scan_status_flags`
  - `yc_m195_jz_ok`
  - `frame_lock_state`
  - `freq_scan_state`
  - `last_fault_reason`
  - `temp_stable_status_flags`
- `cfg` 遥测组收缩为 9 字段，仅保留当前主机仍可配置的有效项：
  - `txm_on`
  - `lo_on`
  - `wave_set_on`
  - `tec_on1`
  - `tec_on2`
  - `modu_mode`
  - `vol_auto`
  - `freq_scan_en`
  - `freq_unload_en`
- 删除旧 `cfg` 遥测中的固定 set、doppler、扫频旧标志等字段。

## Code impact

- 扩展 `FpgaTelemetryGroupKey`：
  - 新增 `fault-runtime`
  - 新增 `fault-cfg`
- 遥测展示层将 `fault-runtime` 视作十进制展示组，`fault-cfg` 继续保持十六进制字值展示。
- `comm_tx_block` / `laser_ctrl_block` source refs 已切到 `20260623v2` 文档集。

## Verification scope

- 更新了 `fpga-rs422` core/service tests，覆盖：
  - `comm_tx` 新 command/telemetry 分组
  - `laser_ctrl` 新 command/telemetry 分组
  - 新 telemetry group key 的展示行为

