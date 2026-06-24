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
| word数 | `23` |
| 说明 | 前 14 字保持原有 gdian 运行状态，word14 起追加 A/B 通用扫频/参数包状态 |

新增字的实际打包表达式：

| word | 表达式 | 说明 |
| --- | --- | --- |
| 14 | `{16'h0000, stat_i.yc_mod_i_set}` | gdian I 路调制设定 |
| 15 | `{16'h0000, stat_i.yc_mod_q_set}` | gdian Q 路调制设定 |
| 16 | `{16'h0000, stat_i.yc_mod_p_set}` | gdian P 路调制设定 |
| 17 | `{16'h0000, stat_i.freq_scan_status_flags}` | 扫频状态打包字 |
| 18 | `{31'd0, stat_i.yc_m195_jz_ok}` | 参数包校验 OK |
| 19 | `{31'd0, stat_i.frame_lock_state}` | 帧同步锁定 |
| 20 | `{28'd0, stat_i.freq_scan_state}` | 扫频状态机状态 |
| 21 | `{24'd0, stat_i.last_fault_reason}` | 最近一次禁止/退出原因 |
| 22 | `{16'h0000, stat_i.temp_stable_status_flags}` | 四路激光器 1s/10s 温度稳定状态字 |

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

`freq_scan_active=1` 表示扫频/卸载正在接管 LO set。配置组不再回读 `lo1_set/lo2_set`，接管状态请看 `freq_scan_status_flags/freq_scan_state`，实际温度码值请看 runtime 组的 gdian 回读温度。

`last_fault_reason` 是 40 MHz 域寄存器事件记录，不参与状态机决策，不应作为实时状态替代 `freq_scan_state` 和 `freq_scan_status_flags`。
`temp_stable_status_flags` 是 40 MHz 域温度稳定检测结果的打包遥测字，bit0..3 为 TXM1/TXM2/LO1/LO2 的 1s 稳定状态，bit4..7 为对应 10s 稳定状态。
