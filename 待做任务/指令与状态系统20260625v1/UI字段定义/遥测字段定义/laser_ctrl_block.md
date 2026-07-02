# laser_ctrl_block A/B通用遥测 UI 字段定义

- 来源：`import/rtl_source/laser_ctrl_block/vars/laser_ctrl_ctrl_pkg.sv` 和 `指令与状态/遥测指令清单/laser_ctrl_block.md`
- word 列表示遥测 payload 数据字索引，不包含 RS422 帧头、长度字、应用层头和 checksum。
- A/B 共用主机侧遥测字段；A/B 的 gdian 实现不同，但字段含义保持一致。

## TM_GROUP_RUNTIME_C

- group_id：`8'h80`
- word 数：`36`

| 参数原始字段名 | UI显示名称 | word | 索引位宽 | 有符号/无符号 | UI类型 |
| --- | --- | --- | --- | --- | --- |
| `txm1_t_m_out` | 发射1温度 | `0` | `word[15:0]` | 无符号数 | 显示 |
| `txm1_c_m_out` | 发射1状态参数 | `1` | `word[15:0]` | 无符号数 | 显示 |
| `lo1_t_m_out` | 本振1温度 | `2` | `word[15:0]` | 无符号数 | 显示 |
| `lo1_c_m_out` | 本振1状态参数 | `3` | `word[15:0]` | 无符号数 | 显示 |
| `tec1_t_m_out` | TEC1温度 | `4` | `word[15:0]` | 无符号数 | 显示 |
| `tec1_c_2v5_m_out` | TEC1状态参数 | `5` | `word[15:0]` | 无符号数 | 显示 |
| `mod_pd_yc_out` | 调制器状态参数1 | `6` | `word[15:0]` | 无符号数 | 显示 |
| `hmc_mod_pd_yc_out` | 调制器状态参数2 | `7` | `word[15:0]` | 无符号数 | 显示 |
| `txm2_t_m_out` | 发射2温度 | `8` | `word[15:0]` | 无符号数 | 显示 |
| `txm2_c_m_out` | 发射2状态参数 | `9` | `word[15:0]` | 无符号数 | 显示 |
| `lo2_t_m_out` | 本振2温度 | `10` | `word[15:0]` | 无符号数 | 显示 |
| `lo2_c_m_out` | 本振2状态参数 | `11` | `word[15:0]` | 无符号数 | 显示 |
| `tec2_t_m_out` | TEC2温度 | `12` | `word[15:0]` | 无符号数 | 显示 |
| `tec2_c_2v5_m_out` | TEC2状态参数 | `13` | `word[15:0]` | 无符号数 | 显示 |
| `yc_mod_i_set` | I路调制设定回读 | `14` | `word[15:0]` | 无符号数 | 显示 |
| `yc_mod_q_set` | Q路调制设定回读 | `15` | `word[15:0]` | 无符号数 | 显示 |
| `yc_mod_p_set` | P路调制设定回读 | `16` | `word[15:0]` | 无符号数 | 显示 |
| `freq_param_ready` | 参数基准就绪 | `17` | `word[0]` | 无符号数 | 状态灯 |
| `freq_baseline_ready` | 基准已捕获 | `18` | `word[0]` | 无符号数 | 状态灯 |
| `laser_param_recover` | 参数包恢复中 | `19` | `word[0]` | 无符号数 | 状态灯 |
| `freq_scan_active` | 扫频接管中 | `20` | `word[0]` | 无符号数 | 状态灯 |
| `freq_scan_en_status` | 扫频使能状态 | `21` | `word[0]` | 无符号数 | 状态灯 |
| `freq_unload_en_status` | 卸载使能状态 | `22` | `word[0]` | 无符号数 | 状态灯 |
| `yc_m195_jz_ok` | 参数包校验OK | `23` | `word[0]` | 无符号数 | 状态灯 |
| `frame_lock_state` | 帧同步锁定 | `24` | `word[0]` | 无符号数 | 状态灯 |
| `freq_scan_state` | 扫频状态机状态 | `25` | `word[3:0]` | 无符号数 | 枚举状态 |
| `last_fault_reason` | 最近禁止/退出原因 | `26` | `word[7:0]` | 无符号数 | 枚举状态 |
| `txm1_temp_1s_stable` | TXM1 1s稳定 | `27` | `word[0]` | 无符号数 | 状态灯 |
| `txm2_temp_1s_stable` | TXM2 1s稳定 | `28` | `word[0]` | 无符号数 | 状态灯 |
| `lo1_temp_1s_stable` | LO1 1s稳定 | `29` | `word[0]` | 无符号数 | 状态灯 |
| `lo2_temp_1s_stable` | LO2 1s稳定 | `30` | `word[0]` | 无符号数 | 状态灯 |
| `txm1_temp_10s_stable` | TXM1 10s稳定 | `31` | `word[0]` | 无符号数 | 状态灯 |
| `txm2_temp_10s_stable` | TXM2 10s稳定 | `32` | `word[0]` | 无符号数 | 状态灯 |
| `lo1_temp_10s_stable` | LO1 10s稳定 | `33` | `word[0]` | 无符号数 | 状态灯 |
| `lo2_temp_10s_stable` | LO2 10s稳定 | `34` | `word[0]` | 无符号数 | 状态灯 |
| `freq_scan_offset_code` | 当前扫频偏移码值 | `35` | `word[15:0]` | 有符号数 | 显示 |

## freq_scan_state 枚举

| 值 | UI显示 |
| --- | --- |
| `0` | 等待 |
| `1` | 扫频初始化 |
| `2` | 频率搜索 |
| `3` | 频率确定 |
| `4` | 扫频完成 |
| `5` | 卸载初始化 |
| `6` | 卸载跟踪 |
| `7` | 手动初始化 |
| `8` | 手动移动 |
| `9` | 手动完成 |

## last_fault_reason 枚举

| 值 | UI显示 |
| --- | --- |
| `8'h00` | 无故障 |
| `8'h01` | 参数包基准未就绪 |
| `8'h02` | 扫频完成/卸载阶段失锁 |
| `8'h03` | 温度未稳定 |
| `8'h04` | 非法边界预留 |
| `8'h05` | 激光器选择变化 |
| `8'h06` | 请求时帧同步未锁定 |

## TM_GROUP_CFG_C

- group_id：`8'h81`
- word 数：`9`
- 本组仅显示当前主机遥控帧仍然开放的有效配置项。

| 参数原始字段名 | UI显示名称 | word | 索引位宽 | 有符号/无符号 | UI类型 |
| --- | --- | --- | --- | --- | --- |
| `txm_on` | 发射激光器开关 | `0` | `word[1:0]` | 无符号数 | 显示 |
| `lo_on` | 本振激光器开关 | `1` | `word[1:0]` | 无符号数 | 显示 |
| `wave_set_on` | 实际外部set路径 | `2` | `word[0]` | 无符号数 | 显示 |
| `tec_on1` | TEC1 开关 | `3` | `word[0]` | 无符号数 | 显示 |
| `tec_on2` | TEC2 开关 | `4` | `word[0]` | 无符号数 | 显示 |
| `modu_mode` | 调制模式 | `5` | `word[1:0]` | 无符号数 | 显示 |
| `vol_auto` | 调制开始 | `6` | `word[0]` | 无符号数 | 显示 |
| `freq_scan_en` | 扫频使能配置 | `7` | `word[0]` | 无符号数 | 显示 |
| `freq_unload_en` | 卸载使能配置 | `8` | `word[0]` | 无符号数 | 显示 |

## 配置快照说明

`txm1_set/txm2_set/lo1_set/lo2_set`、`saomiao_on/genzong_on/flag_mod/flag_sz/dat_sz`、`doppler_on/doppler_pre` 已从当前 A/B 通用配置遥测组删除。扫频接管与 LO 状态请查看 runtime 组的 `freq_scan_active/freq_scan_state` 和 gdian 温度回读。
