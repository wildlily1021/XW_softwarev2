# comm_rx_block 遥测状态具体执行

说明：以下遥测帧示例统一按“所有上报数据字为 0”计算，不使用模块 `default_cfg()` 的默认配置值。

## TM_GROUP_RUNTIME_C

| 字段 | 内容 |
| --- | --- |
| module_id | `MODULE_ID_COMM_RX_C = 4'h8` |
| group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字数常量 | `TM_RUNTIME_WORDS_C` |
| 上报字数 | `14` |
| 应用层头字 | `128800E0` |
| 校验字 | `2D57FD39` |
| 完整字节流 | `1A CF FC 1D 00 00 00 3C 12 88 00 E0 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 2D 57 FD 39` |

| 上报字索引 | 来源表达式 | 关联字段 | 字段真实位宽 | 默认值 |
| --- | --- | --- | --- | --- |
| `0` | `{16'h0000, stat_i.signal_power}` | `signal_power` | `16 bit` | `00000000` |
| `1` | `stat_i.carrier_freq_offset` | `carrier_freq_offset` | `32 bit` | `00000000` |
| `2` | `bool_to_u32(stat_i.carrier_lock_state)` | `carrier_lock_state` | `1 bit` | `00000000` |
| `3` | `bool_to_u32(stat_i.symbol_lock_state)` | `symbol_lock_state` | `1 bit` | `00000000` |
| `4` | `bool_to_u32(stat_i.frame_lock_state)` | `frame_lock_state` | `1 bit` | `00000000` |
| `5` | `stat_i.frame_count_sec` | `frame_count_sec` | `32 bit` | `00000000` |
| `6` | `stat_i.error_frame_count_sec` | `error_frame_count_sec` | `32 bit` | `00000000` |
| `7` | `stat_i.air_frame_count_sec` | `air_frame_count_sec` | `32 bit` | `00000000` |
| `8` | `stat_i.biz_frame_count_sec` | `biz_frame_count_sec` | `32 bit` | `00000000` |
| `9` | `stat_i.total_bit_count_sec` | `total_bit_count_sec` | `32 bit` | `00000000` |
| `10` | `stat_i.pre_dec_err_bits_sec` | `pre_dec_err_bits_sec` | `32 bit` | `00000000` |
| `11` | `stat_i.post_dec_err_bits_sec` | `post_dec_err_bits_sec` | `32 bit` | `00000000` |
| `12` | `bool_to_u32(stat_i.ranging_reset_status)` | `ranging_reset_status` | `1 bit` | `00000000` |
| `13` | `bool_to_u32(stat_i.manual_reset_status)` | `manual_reset_status` | `1 bit` | `00000000` |

| 帧字序号 | 含义 | 32bit 值 |
| --- | --- | --- |
| 0 | RS422 帧头 | `1ACFFC1D` |
| 1 | payload_length_bytes | `0000003C` |
| 2 | 应用层头 | `128800E0` |
| 3 | 遥测数据字 0 | `00000000` |
| 4 | 遥测数据字 1 | `00000000` |
| 5 | 遥测数据字 2 | `00000000` |
| 6 | 遥测数据字 3 | `00000000` |
| 7 | 遥测数据字 4 | `00000000` |
| 8 | 遥测数据字 5 | `00000000` |
| 9 | 遥测数据字 6 | `00000000` |
| 10 | 遥测数据字 7 | `00000000` |
| 11 | 遥测数据字 8 | `00000000` |
| 12 | 遥测数据字 9 | `00000000` |
| 13 | 遥测数据字 10 | `00000000` |
| 14 | 遥测数据字 11 | `00000000` |
| 15 | 遥测数据字 12 | `00000000` |
| 16 | 遥测数据字 13 | `00000000` |
| 17 | checksum | `2D57FD39` |

## TM_GROUP_CFG_C

| 字段 | 内容 |
| --- | --- |
| module_id | `MODULE_ID_COMM_RX_C = 4'h8` |
| group | `TM_GROUP_CFG_C` |
| group_id | `8'h81` |
| 上报字数常量 | `TM_CFG_WORDS_C` |
| 上报字数 | `10` |
| 应用层头字 | `128810A0` |
| 校验字 | `2D580CE9` |
| 完整字节流 | `1A CF FC 1D 00 00 00 2C 12 88 10 A0 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 2D 58 0C E9` |

| 上报字索引 | 来源表达式 | 关联字段 | 字段真实位宽 | 默认值 |
| --- | --- | --- | --- | --- |
| `0` | `{24'h000000, cfg_i.rate_sel}` | `rate_sel` | `8 bit` | `00000000` |
| `1` | `bool_to_u32(cfg_i.decode_sel)` | `decode_sel` | `1 bit` | `00000000` |
| `2` | `bool_to_u32(cfg_i.descramble_enable)` | `descramble_enable` | `1 bit` | `00000000` |
| `3` | `bool_to_u32(cfg_i.carrier_filter_enable)` | `carrier_filter_enable` | `1 bit` | `00000000` |
| `4` | `{29'h0000_0000, cfg_i.timing_loop_bw_sel}` | `timing_loop_bw_sel` | `3 bit` | `00000000` |
| `5` | `bool_to_u32(cfg_i.timing_filter_enable)` | `timing_filter_enable` | `1 bit` | `00000000` |
| `6` | `{25'h0000_000, cfg_i.frame_sync_corr_peak_th}` | `frame_sync_corr_peak_th` | `7 bit` | `00000000` |
| `7` | `{16'h0000, cfg_i.frame_lock_threshold}` | `frame_lock_threshold` | `16 bit` | `00000000` |
| `8` | `{16'h0000, cfg_i.frame_unlock_threshold}` | `frame_unlock_threshold` | `16 bit` | `00000000` |
| `9` | `bool_to_u32(cfg_i.auto_reset_enable)` | `auto_reset_enable` | `1 bit` | `00000000` |

| 帧字序号 | 含义 | 32bit 值 |
| --- | --- | --- |
| 0 | RS422 帧头 | `1ACFFC1D` |
| 1 | payload_length_bytes | `0000002C` |
| 2 | 应用层头 | `128810A0` |
| 3 | 遥测数据字 0 | `00000000` |
| 4 | 遥测数据字 1 | `00000000` |
| 5 | 遥测数据字 2 | `00000000` |
| 6 | 遥测数据字 3 | `00000000` |
| 7 | 遥测数据字 4 | `00000000` |
| 8 | 遥测数据字 5 | `00000000` |
| 9 | 遥测数据字 6 | `00000000` |
| 10 | 遥测数据字 7 | `00000000` |
| 11 | 遥测数据字 8 | `00000000` |
| 12 | 遥测数据字 9 | `00000000` |
| 13 | checksum | `2D580CE9` |
