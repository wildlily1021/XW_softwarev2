# comm_tx_block 遥测指令清单

## 来源

- 遥测 agent：`import/rtl_source/comm_tx_block/ctrl_tm/comm_tx_tm_agent.sv`
- 参数包：`import/rtl_source/comm_tx_block/vars/comm_tx_ctrl_pkg.sv`
- module_id：`MODULE_ID_COMM_TX_C = 4'h7`
- 当前有效协议：正常遥测与异常遥测分帧回传。

## Group 总表

| group | group_id | 数据字数常量 | 数据字数 | 说明 |
| --- | --- | --- | --- | --- |
| `TM_GROUP_RUNTIME_C` | `8'h80` | `TM_RUNTIME_WORDS_C` | 4 | 正常运行计数和复位状态 |
| `TM_GROUP_CFG_C` | `8'h81` | `TM_CFG_WORDS_C` | 3 | 正常工作配置回显 |
| `COMM_TX_TM_GROUP_FAULT_RUNTIME_C` | `8'h90` | `TM_FAULT_RUNTIME_WORDS_C` | 4 | 异常注入运行状态回显 |
| `COMM_TX_TM_GROUP_FAULT_CFG_C` | `8'h91` | `TM_FAULT_CFG_WORDS_C` | 10 | 异常注入配置回显 |

## TM_GROUP_RUNTIME_C

| 上报字索引 | 关联字段 | 来源表达式 | 字段真实位宽 |
| --- | --- | --- | --- |
| `0` | `idle_frame_count_sec` | `stat_i.idle_frame_count_sec` | `32 bit` |
| `1` | `biz_frame_count_sec` | `stat_i.biz_frame_count_sec` | `32 bit` |
| `2` | `biz_frame_count_total` | `stat_i.biz_frame_count_total` | `32 bit` |
| `3` | `reset_status` | `bool_to_u32(stat_i.reset_status)` | `1 bit` |

## TM_GROUP_CFG_C

| 上报字索引 | 关联字段 | 来源表达式 | 字段真实位宽 |
| --- | --- | --- | --- |
| `0` | `rate_sel` | `{24'h000000, cfg_i.rate_sel}` | `8 bit` |
| `1` | `scramble_enable` | `bool_to_u32(cfg_i.scramble_enable)` | `1 bit` |
| `2` | `encode_sel` | `bool_to_u32(cfg_i.encode_sel)` | `1 bit` |

## COMM_TX_TM_GROUP_FAULT_RUNTIME_C

| 上报字索引 | 关联字段 | 来源表达式 | 字段真实位宽 |
| --- | --- | --- | --- |
| `0` | `ber_inject_mode_status` | `{28'h0000_000, stat_i.ber_inject_mode_status}` | `4 bit` |
| `1` | `crc/header/data_type/field_pos` 状态 | `{16'h0000, stat_i.crc_error_inject_status, stat_i.header_error_inject_status, stat_i.data_type_error_inject_status, stat_i.field_pos_error_inject_status}` | `4 bit` x4 |
| `2` | `encode_error_inject_status`、`encode_sel_status` | `{24'h000000, stat_i.encode_error_inject_status, stat_i.encode_sel_status}` | `4 bit` + `4 bit` |
| `3` | `actual_encode_sel_status`、`frame_fault_scope_status`、`frame_count_error_inject_status`、`endian_error_inject_status` | `{12'h000, stat_i.actual_encode_sel_status, stat_i.frame_fault_scope_status, stat_i.frame_count_error_inject_status, stat_i.endian_error_inject_status}` | `4 bit` x4 |

## COMM_TX_TM_GROUP_FAULT_CFG_C

| 上报字索引 | 关联字段 | 来源表达式 | 字段真实位宽 |
| --- | --- | --- | --- |
| `0` | `ber_inject_mode` | `{28'h0000_000, cfg_i.ber_inject_mode}` | `4 bit` |
| `1` | `crc_error_inject` | `{28'h0000_000, cfg_i.crc_error_inject}` | `4 bit` |
| `2` | `header_error_inject` | `{28'h0000_000, cfg_i.header_error_inject}` | `4 bit` |
| `3` | `data_type_error_inject` | `{28'h0000_000, cfg_i.data_type_error_inject}` | `4 bit` |
| `4` | `field_pos_error_inject` | `{28'h0000_000, cfg_i.field_pos_error_inject}` | `4 bit` |
| `5` | `encode_error_inject` | `{28'h0000_000, cfg_i.encode_error_inject}` | `4 bit` |
| `6` | `data_link_break_inject` | `bool_to_u32(cfg_i.data_link_break_inject)` | `1 bit` |
| `7` | `frame_fault_scope` | `{28'h0000_000, cfg_i.frame_fault_scope}` | `4 bit` |
| `8` | `frame_count_error_inject` | `{28'h0000_000, cfg_i.frame_count_error_inject}` | `4 bit` |
| `9` | `endian_error_inject` | `{28'h0000_000, cfg_i.endian_error_inject}` | `4 bit` |

## 回读取值

`rate_sel`、`encode_sel`、异常注入参数的取值含义与遥控指令清单一致。`comm_tx_tm_agent` 在接受请求时快照 `cfg/stat`，同一个遥测帧内不会混入请求后的新配置值。
