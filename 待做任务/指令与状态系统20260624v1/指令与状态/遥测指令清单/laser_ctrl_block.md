# laser_ctrl_block A/B通用遥测指令清单

## 来源

- 通用包：`D:/vivado_project/CZW/CZW_V7_runner_201803/repo_main/import/rtl_source/laser_ctrl_block/vars/laser_ctrl_ctrl_pkg.sv`
- 通用遥测 agent：`D:/vivado_project/CZW/CZW_V7_runner_201803/repo_main/import/rtl_source/laser_ctrl_block/ctrl_tm/laser_ctrl_tm_agent.sv`
- module_id：`MODULE_ID_LASER_CTRL_C = 4'h4`

## Runtime遥测组

`TM_RUNTIME_WORDS_C = 24`。前 14 个字保持原有 gdian 运行状态顺序，后续追加扫频/参数包/调制状态。

| word | 字段 | 说明 |
| --- | --- | --- |
| 0 | `txm1_t_m_out` | 当前 gdian 回读 TXM1 温度码值 |
| 1 | `txm1_c_m_out` | TXM1 控制/状态回读 |
| 2 | `lo1_t_m_out` | 当前 gdian 回读 LO1 温度码值 |
| 3 | `lo1_c_m_out` | LO1 控制/状态回读 |
| 4 | `tec1_t_m_out` | TEC1 温度 |
| 5 | `tec1_c_2v5_m_out` | TEC1 状态 |
| 6 | `mod_pd_yc_out` | 调制器状态参数1 |
| 7 | `hmc_mod_pd_yc_out` | 调制器状态参数2 |
| 8 | `txm2_t_m_out` | 当前 gdian 回读 TXM2 温度码值 |
| 9 | `txm2_c_m_out` | TXM2 控制/状态回读 |
| 10 | `lo2_t_m_out` | 当前 gdian 回读 LO2 温度码值 |
| 11 | `lo2_c_m_out` | LO2 控制/状态回读 |
| 12 | `tec2_t_m_out` | TEC2 温度 |
| 13 | `tec2_c_2v5_m_out` | TEC2 状态 |
| 14 | `yc_mod_i_set` | gdian 回读 I 路调制设定 |
| 15 | `yc_mod_q_set` | gdian 回读 Q 路调制设定 |
| 16 | `yc_mod_p_set` | gdian 回读 P 路调制设定 |
| 17 | `freq_scan_status_flags` | 扫频状态打包字 |
| 18 | `yc_m195_jz_ok` | gdian 参数包校验/就绪标志 |
| 19 | `frame_lock_state` | 帧同步锁定状态 |
| 20 | `freq_scan_state` | 扫频状态机状态 |
| 21 | `last_fault_reason` | 最近一次扫频/卸载退出或禁止原因 |
| 22 | `temp_stable_status_flags` | 四路激光器 1s/10s 温度稳定状态字 |
| 23 | `freq_scan_offset_code` | 当前选中 LO 相对参数包基准的有符号偏移码值 |

## freq_scan_status_flags

| bit | 字段 | 含义 |
| --- | --- | --- |
| 0 | `freq_param_ready` | 参数包基准已就绪，允许启动扫频/卸载 |
| 1 | `freq_baseline_ready` | 已捕获本套硬件 LO 基准码值 |
| 2 | `laser_param_recover` | 当前处于参数包恢复阶段 |
| 3 | `freq_scan_active` | 扫频/卸载正在接管 LO set |
| 4 | `freq_scan_en` | 遥控扫频使能有效值 |
| 5 | `freq_unload_en` | 遥控卸载使能有效值 |
| 6 | `frame_lock_state` | 帧同步锁定状态 |
| 7 | `yc_m195_jz_ok` | gdian 参数包校验 OK |
| 15:8 | 保留 | 当前固定 `0` |

## last_fault_reason

| 值 | 含义 |
| --- | --- |
| `8'h00` | 无故障或复位默认 |
| `8'h01` | 请求扫频/卸载时参数包基准未就绪 |
| `8'h02` | 扫频完成/卸载过程中失锁 |
| `8'h03` | 请求时温度未稳定 |
| `8'h04` | 预留：非法边界 |
| `8'h05` | TX/LO 选择变化，重新进入参数包恢复 |
| `8'h06` | 请求扫频/卸载时帧同步未锁定 |

## temp_stable_status_flags

| bit | 字段 | 含义 |
| --- | --- | --- |
| 0 | `txm1_temp_1s_stable` | TXM1 最近一次 1s 温度稳定 |
| 1 | `txm2_temp_1s_stable` | TXM2 最近一次 1s 温度稳定 |
| 2 | `lo1_temp_1s_stable` | LO1 最近一次 1s 温度稳定 |
| 3 | `lo2_temp_1s_stable` | LO2 最近一次 1s 温度稳定 |
| 4 | `txm1_temp_10s_stable` | TXM1 连续 10s 温度稳定 |
| 5 | `txm2_temp_10s_stable` | TXM2 连续 10s 温度稳定 |
| 6 | `lo1_temp_10s_stable` | LO1 连续 10s 温度稳定 |
| 7 | `lo2_temp_10s_stable` | LO2 连续 10s 温度稳定 |
| 15:8 | 保留 | 当前固定 `0` |

## Config遥测组

`TM_CFG_WORDS_C = 9`。该组仅回传当前主机遥控帧仍然开放的有效配置项；固定 set、gdian 历史管脚、数传输入和多普勒相关项不再进入配置回读组。

| word | 字段 | 说明 |
| --- | --- | --- |
| 0 | `txm_on` | 发射激光器开关 |
| 1 | `lo_on` | 本振激光器开关 |
| 2 | `wave_set_on` | 实际送入 gdian 的参数包/外部 set 路径选择 |
| 3 | `tec_on1` | TEC1 开关 |
| 4 | `tec_on2` | TEC2 开关 |
| 5 | `modu_mode` | 调制模式 |
| 6 | `vol_auto` | 调制开始 |
| 7 | `freq_scan_en` | 遥控扫频使能配置快照 |
| 8 | `freq_unload_en` | 遥控卸载使能配置快照 |

`txm1_set/txm2_set/lo1_set/lo2_set`、`saomiao_on/genzong_on/flag_mod/flag_sz/dat_sz`、`doppler_on/doppler_pre` 已从配置遥测组删除；需要观察扫频接管状态时使用 runtime 组的 `freq_scan_status_flags/freq_scan_state`。
