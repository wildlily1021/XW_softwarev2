# laser_ctrl_block A/B通用遥测状态具体执行

## 执行链路

1. `laser_ctrl_impl_a/b` 在 40 MHz 域生成 `laser_ctrl_tm_param_t`。
2. `laser_ctrl_tm_agent` 在收到遥测请求时对 `cfg/stat` 做快照。
3. `runtime_word()` 或 `cfg_word()` 按 word 索引把结构体字段转换为 32 bit 遥测字。
4. `ctrl_status_tm_frame_builder` 打包成状态流，再通过异步 FIFO 回到 200 MHz 控制域。

## Runtime组

| 项 | 内容 |
| --- | --- |
| group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| word数 | `36` |
| 说明 | 前 14 字保持原有 gdian 运行状态，word14 起追加 A/B 通用扫频/参数包状态；内部 flags 已拆成独立遥测 word |
| payload_length_bytes | `00000094` |
| 应用层头字 | `12480240` |
| 校验字 | `2D17FEF1` |
| 完整字节流 | `1A CF FC 1D 00 00 00 94 12 48 02 40 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 2D 17 FE F1` |

新增字的实际打包表达式：

| word | 表达式 | 说明 |
| --- | --- | --- |
| 14 | `{16'h0000, stat_i.yc_mod_i_set}` | gdian I 路调制设定 |
| 15 | `{16'h0000, stat_i.yc_mod_q_set}` | gdian Q 路调制设定 |
| 16 | `{16'h0000, stat_i.yc_mod_p_set}` | gdian P 路调制设定 |
| 17 | `bool_to_u32(stat_i.freq_scan_status_flags[LASER_FREQ_STATUS_PARAM_READY_BIT_C])` | 参数包基准已就绪 |
| 18 | `bool_to_u32(stat_i.freq_scan_status_flags[LASER_FREQ_STATUS_BASELINE_READY_BIT_C])` | 已捕获本套硬件 LO 基准码值 |
| 19 | `bool_to_u32(stat_i.freq_scan_status_flags[LASER_FREQ_STATUS_PARAM_RECOVER_BIT_C])` | 当前处于参数包恢复阶段 |
| 20 | `bool_to_u32(stat_i.freq_scan_status_flags[LASER_FREQ_STATUS_SCAN_ACTIVE_BIT_C])` | 扫频/卸载正在接管 LO set |
| 21 | `bool_to_u32(stat_i.freq_scan_status_flags[LASER_FREQ_STATUS_SCAN_EN_BIT_C])` | 遥控扫频使能有效值 |
| 22 | `bool_to_u32(stat_i.freq_scan_status_flags[LASER_FREQ_STATUS_UNLOAD_EN_BIT_C])` | 遥控卸载使能有效值 |
| 23 | `bool_to_u32(stat_i.yc_m195_jz_ok)` | 参数包校验 OK |
| 24 | `bool_to_u32(stat_i.frame_lock_state)` | 帧同步锁定 |
| 25 | `{28'd0, stat_i.freq_scan_state}` | 扫频状态机状态 |
| 26 | `{24'd0, stat_i.last_fault_reason}` | 最近一次禁止/退出原因 |
| 27 | `bool_to_u32(stat_i.temp_stable_status_flags[LASER_TEMP_STABLE_TXM1_1S_BIT_C])` | TXM1 最近一次 1s 温度稳定 |
| 28 | `bool_to_u32(stat_i.temp_stable_status_flags[LASER_TEMP_STABLE_TXM2_1S_BIT_C])` | TXM2 最近一次 1s 温度稳定 |
| 29 | `bool_to_u32(stat_i.temp_stable_status_flags[LASER_TEMP_STABLE_LO1_1S_BIT_C])` | LO1 最近一次 1s 温度稳定 |
| 30 | `bool_to_u32(stat_i.temp_stable_status_flags[LASER_TEMP_STABLE_LO2_1S_BIT_C])` | LO2 最近一次 1s 温度稳定 |
| 31 | `bool_to_u32(stat_i.temp_stable_status_flags[LASER_TEMP_STABLE_TXM1_10S_BIT_C])` | TXM1 连续 10s 温度稳定 |
| 32 | `bool_to_u32(stat_i.temp_stable_status_flags[LASER_TEMP_STABLE_TXM2_10S_BIT_C])` | TXM2 连续 10s 温度稳定 |
| 33 | `bool_to_u32(stat_i.temp_stable_status_flags[LASER_TEMP_STABLE_LO1_10S_BIT_C])` | LO1 连续 10s 温度稳定 |
| 34 | `bool_to_u32(stat_i.temp_stable_status_flags[LASER_TEMP_STABLE_LO2_10S_BIT_C])` | LO2 连续 10s 温度稳定 |
| 35 | `{{16{stat_i.freq_scan_offset_code[15]}}, stat_i.freq_scan_offset_code}` | 当前选中 LO 相对参数包基准的有符号偏移码值 |

## Config组

| 项 | 内容 |
| --- | --- |
| group | `TM_GROUP_CFG_C` |
| group_id | `8'h81` |
| word数 | `9` |
| 说明 | 仅回传当前主机遥控帧仍然开放的有效配置项，不再回读固定 set 和 gdian 历史管脚 |

当前打包表达式：

| word | 表达式 | 说明 |
| --- | --- | --- |
| 0 | `{30'h0000_0000, cfg_i.txm_on}` | 发射激光器开关 |
| 1 | `{30'h0000_0000, cfg_i.lo_on}` | 本振激光器开关 |
| 2 | `bool_to_u32(cfg_i.wave_set_on)` | 参数包/外部 set 路径请求 |
| 3 | `bool_to_u32(cfg_i.tec_on1)` | TEC1 开关 |
| 4 | `bool_to_u32(cfg_i.tec_on2)` | TEC2 开关 |
| 5 | `{30'h0000_0000, cfg_i.modu_mode}` | 调制模式 |
| 6 | `bool_to_u32(cfg_i.vol_auto)` | 调制开始 |
| 7 | `bool_to_u32(cfg_i.freq_scan_en)` | 扫频使能配置快照 |
| 8 | `bool_to_u32(cfg_i.freq_unload_en)` | 卸载使能配置快照 |

## 关键状态解释

`freq_param_ready=1` 是扫频/卸载允许启动的核心门槛。它不是单独由状态机状态推出，而是由基准已捕获、温度稳定、参数包校验 OK、非恢复阶段、时钟未复位共同形成。

`freq_scan_active=1` 表示扫频/卸载正在接管 LO set。配置组不再回读 `lo1_set/lo2_set`，接管状态请看 runtime 组 word20 和 word25，实际温度码值请看 runtime 组的 gdian 回读温度。

`last_fault_reason` 是 40 MHz 域寄存器事件记录，不参与状态机决策，不应作为实时状态替代 `freq_scan_state` 和 word17..word24 的实时状态。
`temp_stable_status_flags` 是 40 MHz 域温度稳定检测结果的内部聚合状态，遥测时已拆成 word27..word34。
`freq_scan_offset_code` 是当前选中 LO 的 `当前 set - 参数包基准`，单位为温度码值，采用 16 bit 二补码有符号数回传。
