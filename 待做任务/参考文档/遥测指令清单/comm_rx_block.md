# comm_rx_block 遥测指令清单

## 来源

- 遥测 agent：`D:/vivado_project/CZW/CZW_V7_runner_201803/repo_main/import/rtl_source/comm_rx_block/ctrl_tm/comm_rx_tm_agent.sv`
- module_id：`MODULE_ID_COMM_RX_C = 4'h8`

## Group 总表

### TM_GROUP_RUNTIME_C

| 上报字索引 | 关联字段 | 字段中文名 | 来源表达式 | 字段真实位宽 |
| --- | --- | --- | --- | --- |
| [TM_GROUP_RUNTIME_C_WORD_0](#tm_group_runtime_c_word_0) | `signal_power` | 接收信号功率测量值 | `{16'h0000, stat_i.signal_power}` | `16 bit` |
| [TM_GROUP_RUNTIME_C_WORD_1](#tm_group_runtime_c_word_1) | `carrier_freq_offset` | 载波频偏测量值 | `stat_i.carrier_freq_offset` | `32 bit` |
| [TM_GROUP_RUNTIME_C_WORD_2](#tm_group_runtime_c_word_2) | `carrier_lock_state` | 载波锁定状态 | `bool_to_u32(stat_i.carrier_lock_state)` | `1 bit` |
| [TM_GROUP_RUNTIME_C_WORD_3](#tm_group_runtime_c_word_3) | `symbol_lock_state` | 符号锁定状态 | `bool_to_u32(stat_i.symbol_lock_state)` | `1 bit` |
| [TM_GROUP_RUNTIME_C_WORD_4](#tm_group_runtime_c_word_4) | `frame_lock_state` | 帧锁定状态 | `bool_to_u32(stat_i.frame_lock_state)` | `1 bit` |
| [TM_GROUP_RUNTIME_C_WORD_5](#tm_group_runtime_c_word_5) | `frame_count_sec` | 每秒帧总计数 | `stat_i.frame_count_sec` | `32 bit` |
| [TM_GROUP_RUNTIME_C_WORD_6](#tm_group_runtime_c_word_6) | `error_frame_count_sec` | 每秒错误帧计数 | `stat_i.error_frame_count_sec` | `32 bit` |
| [TM_GROUP_RUNTIME_C_WORD_7](#tm_group_runtime_c_word_7) | `air_frame_count_sec` | 每秒空口帧计数 | `stat_i.air_frame_count_sec` | `32 bit` |
| [TM_GROUP_RUNTIME_C_WORD_8](#tm_group_runtime_c_word_8) | `biz_frame_count_sec` | 每秒业务帧计数 | `stat_i.biz_frame_count_sec` | `32 bit` |
| [TM_GROUP_RUNTIME_C_WORD_9](#tm_group_runtime_c_word_9) | `total_bit_count_sec` | 每秒总比特计数 | `stat_i.total_bit_count_sec` | `32 bit` |
| [TM_GROUP_RUNTIME_C_WORD_10](#tm_group_runtime_c_word_10) | `pre_dec_err_bits_sec` | 每秒译码前误码计数 | `stat_i.pre_dec_err_bits_sec` | `32 bit` |
| [TM_GROUP_RUNTIME_C_WORD_11](#tm_group_runtime_c_word_11) | `post_dec_err_bits_sec` | 每秒译码后误码计数 | `stat_i.post_dec_err_bits_sec` | `32 bit` |
| [TM_GROUP_RUNTIME_C_WORD_12](#tm_group_runtime_c_word_12) | `ranging_reset_status` | 测距复位接受/忙状态 | `bool_to_u32(stat_i.ranging_reset_status)` | `1 bit` |
| [TM_GROUP_RUNTIME_C_WORD_13](#tm_group_runtime_c_word_13) | `manual_reset_status` | 手动接收复位接受/忙状态 | `bool_to_u32(stat_i.manual_reset_status)` | `1 bit` |

### TM_GROUP_CFG_C

| 上报字索引 | 关联字段 | 字段中文名 | 来源表达式 | 字段真实位宽 |
| --- | --- | --- | --- | --- |
| [TM_GROUP_CFG_C_WORD_0](#tm_group_cfg_c_word_0) | `rate_sel` | 接收链路速率选择寄存值 | `{24'h000000, cfg_i.rate_sel}` | `8 bit` |
| [TM_GROUP_CFG_C_WORD_1](#tm_group_cfg_c_word_1) | `decode_sel` | 解码选择，0=RS，1=LDPC | `bool_to_u32(cfg_i.decode_sel)` | `1 bit` |
| [TM_GROUP_CFG_C_WORD_2](#tm_group_cfg_c_word_2) | `descramble_enable` | 接收解扰使能位 | `bool_to_u32(cfg_i.descramble_enable)` | `1 bit` |
| [TM_GROUP_CFG_C_WORD_3](#tm_group_cfg_c_word_3) | `carrier_filter_enable` | 载波滤波使能位 | `bool_to_u32(cfg_i.carrier_filter_enable)` | `1 bit` |
| [TM_GROUP_CFG_C_WORD_4](#tm_group_cfg_c_word_4) | `timing_loop_bw_sel` | 定时环路带宽选择编码 | `{29'h0000_0000, cfg_i.timing_loop_bw_sel}` | `3 bit` |
| [TM_GROUP_CFG_C_WORD_5](#tm_group_cfg_c_word_5) | `timing_filter_enable` | 定时滤波使能位 | `bool_to_u32(cfg_i.timing_filter_enable)` | `1 bit` |
| [TM_GROUP_CFG_C_WORD_6](#tm_group_cfg_c_word_6) | `frame_sync_corr_peak_th` | 帧同步相关峰阈值 | `{25'h0000_000, cfg_i.frame_sync_corr_peak_th}` | `7 bit` |
| [TM_GROUP_CFG_C_WORD_7](#tm_group_cfg_c_word_7) | `frame_lock_threshold` | 帧锁定门限值 | `{16'h0000, cfg_i.frame_lock_threshold}` | `16 bit` |
| [TM_GROUP_CFG_C_WORD_8](#tm_group_cfg_c_word_8) | `frame_unlock_threshold` | 帧失锁门限值 | `{16'h0000, cfg_i.frame_unlock_threshold}` | `16 bit` |
| [TM_GROUP_CFG_C_WORD_9](#tm_group_cfg_c_word_9) | `auto_reset_enable` | 自动复位使能位 | `bool_to_u32(cfg_i.auto_reset_enable)` | `1 bit` |

## 上报字说明表

### TM_GROUP_RUNTIME_C_WORD_0

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `0` |
| 来源表达式 | `{16'h0000, stat_i.signal_power}` |
| 关联字段 | `signal_power` |
| 字段中文名 | 接收信号功率测量值 |
| 字段真实位宽 | `16 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_1

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `1` |
| 来源表达式 | `stat_i.carrier_freq_offset` |
| 关联字段 | `carrier_freq_offset` |
| 字段中文名 | 载波频偏测量值 |
| 字段真实位宽 | `32 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_2

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `2` |
| 来源表达式 | `bool_to_u32(stat_i.carrier_lock_state)` |
| 关联字段 | `carrier_lock_state` |
| 字段中文名 | 载波锁定状态 |
| 字段真实位宽 | `1 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_3

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `3` |
| 来源表达式 | `bool_to_u32(stat_i.symbol_lock_state)` |
| 关联字段 | `symbol_lock_state` |
| 字段中文名 | 符号锁定状态 |
| 字段真实位宽 | `1 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_4

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `4` |
| 来源表达式 | `bool_to_u32(stat_i.frame_lock_state)` |
| 关联字段 | `frame_lock_state` |
| 字段中文名 | 帧锁定状态 |
| 字段真实位宽 | `1 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_5

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `5` |
| 来源表达式 | `stat_i.frame_count_sec` |
| 关联字段 | `frame_count_sec` |
| 字段中文名 | 每秒帧总计数 |
| 字段真实位宽 | `32 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_6

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `6` |
| 来源表达式 | `stat_i.error_frame_count_sec` |
| 关联字段 | `error_frame_count_sec` |
| 字段中文名 | 每秒错误帧计数 |
| 字段真实位宽 | `32 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_7

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `7` |
| 来源表达式 | `stat_i.air_frame_count_sec` |
| 关联字段 | `air_frame_count_sec` |
| 字段中文名 | 每秒空口帧计数 |
| 字段真实位宽 | `32 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_8

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `8` |
| 来源表达式 | `stat_i.biz_frame_count_sec` |
| 关联字段 | `biz_frame_count_sec` |
| 字段中文名 | 每秒业务帧计数 |
| 字段真实位宽 | `32 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_9

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `9` |
| 来源表达式 | `stat_i.total_bit_count_sec` |
| 关联字段 | `total_bit_count_sec` |
| 字段中文名 | 每秒总比特计数 |
| 字段真实位宽 | `32 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_10

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `10` |
| 来源表达式 | `stat_i.pre_dec_err_bits_sec` |
| 关联字段 | `pre_dec_err_bits_sec` |
| 字段中文名 | 每秒译码前误码计数 |
| 字段真实位宽 | `32 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_11

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `11` |
| 来源表达式 | `stat_i.post_dec_err_bits_sec` |
| 关联字段 | `post_dec_err_bits_sec` |
| 字段中文名 | 每秒译码后误码计数 |
| 字段真实位宽 | `32 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_12

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `12` |
| 来源表达式 | `bool_to_u32(stat_i.ranging_reset_status)` |
| 关联字段 | `ranging_reset_status` |
| 字段中文名 | 测距复位接受/忙状态 |
| 字段真实位宽 | `1 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_13

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `13` |
| 来源表达式 | `bool_to_u32(stat_i.manual_reset_status)` |
| 关联字段 | `manual_reset_status` |
| 字段中文名 | 手动接收复位接受/忙状态 |
| 字段真实位宽 | `1 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_CFG_C_WORD_0

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_CFG_C` |
| group_id | `8'h81` |
| 上报字索引 | `0` |
| 来源表达式 | `{24'h000000, cfg_i.rate_sel}` |
| 关联字段 | `rate_sel` |
| 字段中文名 | 接收链路速率选择寄存值 |
| 字段真实位宽 | `8 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_CFG_C_WORD_1

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_CFG_C` |
| group_id | `8'h81` |
| 上报字索引 | `1` |
| 来源表达式 | `bool_to_u32(cfg_i.decode_sel)` |
| 关联字段 | `decode_sel` |
| 字段中文名 | 解码选择，0=RS，1=LDPC |
| 字段真实位宽 | `1 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_CFG_C_WORD_2

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_CFG_C` |
| group_id | `8'h81` |
| 上报字索引 | `2` |
| 来源表达式 | `bool_to_u32(cfg_i.descramble_enable)` |
| 关联字段 | `descramble_enable` |
| 字段中文名 | 接收解扰使能位 |
| 字段真实位宽 | `1 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_CFG_C_WORD_3

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_CFG_C` |
| group_id | `8'h81` |
| 上报字索引 | `3` |
| 来源表达式 | `bool_to_u32(cfg_i.carrier_filter_enable)` |
| 关联字段 | `carrier_filter_enable` |
| 字段中文名 | 载波滤波使能位 |
| 字段真实位宽 | `1 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_CFG_C_WORD_4

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_CFG_C` |
| group_id | `8'h81` |
| 上报字索引 | `4` |
| 来源表达式 | `{29'h0000_0000, cfg_i.timing_loop_bw_sel}` |
| 关联字段 | `timing_loop_bw_sel` |
| 字段中文名 | 定时环路带宽选择编码 |
| 字段真实位宽 | `3 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_CFG_C_WORD_5

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_CFG_C` |
| group_id | `8'h81` |
| 上报字索引 | `5` |
| 来源表达式 | `bool_to_u32(cfg_i.timing_filter_enable)` |
| 关联字段 | `timing_filter_enable` |
| 字段中文名 | 定时滤波使能位 |
| 字段真实位宽 | `1 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_CFG_C_WORD_6

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_CFG_C` |
| group_id | `8'h81` |
| 上报字索引 | `6` |
| 来源表达式 | `{25'h0000_000, cfg_i.frame_sync_corr_peak_th}` |
| 关联字段 | `frame_sync_corr_peak_th` |
| 字段中文名 | 帧同步相关峰阈值 |
| 字段真实位宽 | `7 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_CFG_C_WORD_7

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_CFG_C` |
| group_id | `8'h81` |
| 上报字索引 | `7` |
| 来源表达式 | `{16'h0000, cfg_i.frame_lock_threshold}` |
| 关联字段 | `frame_lock_threshold` |
| 字段中文名 | 帧锁定门限值 |
| 字段真实位宽 | `16 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_CFG_C_WORD_8

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_CFG_C` |
| group_id | `8'h81` |
| 上报字索引 | `8` |
| 来源表达式 | `{16'h0000, cfg_i.frame_unlock_threshold}` |
| 关联字段 | `frame_unlock_threshold` |
| 字段中文名 | 帧失锁门限值 |
| 字段真实位宽 | `16 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_CFG_C_WORD_9

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_CFG_C` |
| group_id | `8'h81` |
| 上报字索引 | `9` |
| 来源表达式 | `bool_to_u32(cfg_i.auto_reset_enable)` |
| 关联字段 | `auto_reset_enable` |
| 字段中文名 | 自动复位使能位 |
| 字段真实位宽 | `1 bit` |
| 应用层上报字位宽 | `32 bit` |
