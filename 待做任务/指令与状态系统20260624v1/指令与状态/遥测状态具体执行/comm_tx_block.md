# comm_tx_block 遥测状态具体执行

说明：以下遥测帧示例统一按“所有上报数据字为 0”计算，不使用模块 `default_cfg()` 的默认配置值。

## TM_GROUP_RUNTIME_C

| 字段 | 内容 |
| --- | --- |
| module_id | `MODULE_ID_COMM_TX_C = 4'h7` |
| group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字数 | `4` |
| payload_length_bytes | `00000014` |
| 应用层头字 | `12780040` |
| 校验字 | `2D47FC71` |
| 完整字节流 | `1A CF FC 1D 00 00 00 14 12 78 00 40 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 2D 47 FC 71` |

| 上报字索引 | 来源表达式 | 关联字段 | 默认值 |
| --- | --- | --- | --- |
| `0` | `stat_i.idle_frame_count_sec` | `idle_frame_count_sec` | `00000000` |
| `1` | `stat_i.biz_frame_count_sec` | `biz_frame_count_sec` | `00000000` |
| `2` | `stat_i.biz_frame_count_total` | `biz_frame_count_total` | `00000000` |
| `3` | `bool_to_u32(stat_i.reset_status)` | `reset_status` | `00000000` |

## TM_GROUP_CFG_C

| 字段 | 内容 |
| --- | --- |
| module_id | `MODULE_ID_COMM_TX_C = 4'h7` |
| group | `TM_GROUP_CFG_C` |
| group_id | `8'h81` |
| 上报字数 | `3` |
| payload_length_bytes | `00000010` |
| 应用层头字 | `12781030` |
| 校验字 | `2D480C5D` |
| 完整字节流 | `1A CF FC 1D 00 00 00 10 12 78 10 30 00 00 00 00 00 00 00 00 00 00 00 00 2D 48 0C 5D` |

| 上报字索引 | 来源表达式 | 关联字段 | 默认值 |
| --- | --- | --- | --- |
| `0` | `{24'h000000, cfg_i.rate_sel}` | `rate_sel` | `00000000` |
| `1` | `bool_to_u32(cfg_i.scramble_enable)` | `scramble_enable` | `00000000` |
| `2` | `bool_to_u32(cfg_i.encode_sel)` | `encode_sel` | `00000000` |

## COMM_TX_TM_GROUP_FAULT_RUNTIME_C

| 字段 | 内容 |
| --- | --- |
| module_id | `MODULE_ID_COMM_TX_C = 4'h7` |
| group | `COMM_TX_TM_GROUP_FAULT_RUNTIME_C` |
| group_id | `8'h90` |
| 上报字数 | `5` |
| payload_length_bytes | `00000018` |
| 应用层头字 | `12790050` |
| 校验字 | `2D48FC85` |
| 完整字节流 | `1A CF FC 1D 00 00 00 18 12 79 00 50 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 2D 48 FC 85` |

| 上报字索引 | 来源表达式 | 关联字段 | 默认值 |
| --- | --- | --- | --- |
| `0` | `{28'h0000_000, stat_i.ber_inject_mode_status}` | `ber_inject_mode_status` | `00000000` |
| `1` | `{16'h0000, stat_i.crc_error_inject_status, stat_i.header_error_inject_status, stat_i.data_type_error_inject_status, stat_i.field_pos_error_inject_status}` | `crc/header/data_type/field_pos` 状态 | `00000000` |
| `2` | `{24'h000000, stat_i.encode_error_inject_status, stat_i.encode_sel_status}` | `encode_error_inject_status`、`encode_sel_status` | `00000000` |
| `3` | `{12'h000, stat_i.actual_encode_sel_status, stat_i.frame_fault_scope_status, stat_i.frame_count_error_inject_status, stat_i.endian_error_inject_status}` | `actual_encode/frame_scope/frame_count/endian` 状态 | `00000000` |
| `4` | `bool_to_u32(stat_i.optical_signal_interrupt_status)` | `optical_signal_interrupt_status` | `00000000` |

## COMM_TX_TM_GROUP_FAULT_CFG_C

| 字段 | 内容 |
| --- | --- |
| module_id | `MODULE_ID_COMM_TX_C = 4'h7` |
| group | `COMM_TX_TM_GROUP_FAULT_CFG_C` |
| group_id | `8'h91` |
| 上报字数 | `11` |
| payload_length_bytes | `00000030` |
| 应用层头字 | `127910B0` |
| 校验字 | `2D490CFD` |
| 完整字节流 | `1A CF FC 1D 00 00 00 30 12 79 10 B0 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 2D 49 0C FD` |

| 上报字索引 | 来源表达式 | 关联字段 | 默认值 |
| --- | --- | --- | --- |
| `0` | `{28'h0000_000, cfg_i.ber_inject_mode}` | `ber_inject_mode` | `00000000` |
| `1` | `{28'h0000_000, cfg_i.crc_error_inject}` | `crc_error_inject` | `00000000` |
| `2` | `{28'h0000_000, cfg_i.header_error_inject}` | `header_error_inject` | `00000000` |
| `3` | `{28'h0000_000, cfg_i.data_type_error_inject}` | `data_type_error_inject` | `00000000` |
| `4` | `{28'h0000_000, cfg_i.field_pos_error_inject}` | `field_pos_error_inject` | `00000000` |
| `5` | `{28'h0000_000, cfg_i.encode_error_inject}` | `encode_error_inject` | `00000000` |
| `6` | `bool_to_u32(cfg_i.data_link_break_inject)` | `data_link_break_inject` | `00000000` |
| `7` | `{28'h0000_000, cfg_i.frame_fault_scope}` | `frame_fault_scope` | `00000000` |
| `8` | `{28'h0000_000, cfg_i.frame_count_error_inject}` | `frame_count_error_inject` | `00000000` |
| `9` | `{28'h0000_000, cfg_i.endian_error_inject}` | `endian_error_inject` | `00000000` |
| `10` | `bool_to_u32(cfg_i.optical_signal_interrupt_inject)` | `optical_signal_interrupt_inject` | `00000000` |
