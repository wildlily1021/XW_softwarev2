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
| `COMM_TX_TM_GROUP_FAULT_RUNTIME_C` | `8'h90` | `TM_FAULT_RUNTIME_WORDS_C` | 5 | 异常注入运行状态回显 |
| `COMM_TX_TM_GROUP_FAULT_CFG_C` | `8'h91` | `TM_FAULT_CFG_WORDS_C` | 11 | 异常注入配置回显 |

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

| 上报字索引 | 标准状态名称 | 关联字段 | 来源表达式 | 字段真实位宽 |
| --- | --- | --- | --- | --- |
| `0` | 空口通信误码注入状态 | `ber_inject_mode_status` | `{28'h0000_000, stat_i.ber_inject_mode_status}` | `4 bit` |
| `1` | CRC/帧头/标志域/帧头位置状态 | `crc/header/data_type/field_pos` | `{16'h0000, stat_i.crc_error_inject_status, stat_i.header_error_inject_status, stat_i.data_type_error_inject_status, stat_i.field_pos_error_inject_status}` | `4 bit` x4 |
| `2` | 信道编解码错误状态 | `encode_error_inject_status`、`encode_sel_status` | `{24'h000000, stat_i.encode_error_inject_status, stat_i.encode_sel_status}` | `4 bit` + `4 bit` |
| `3` | 实际编码/帧范围/帧计数/大小端状态 | `actual_encode_sel_status/frame_fault_scope_status/frame_count_error_inject_status/endian_error_inject_status` | `{12'h000, stat_i.actual_encode_sel_status, stat_i.frame_fault_scope_status, stat_i.frame_count_error_inject_status, stat_i.endian_error_inject_status}` | `4 bit` x4 |
| `4` | 星间光信号中断状态 | `optical_signal_interrupt_status` | `bool_to_u32(stat_i.optical_signal_interrupt_status)` | `1 bit` |

## COMM_TX_TM_GROUP_FAULT_CFG_C

| 上报字索引 | 标准配置名称 | 关联字段 | 来源表达式 | 字段真实位宽 |
| --- | --- | --- | --- | --- |
| `0` | 空口通信误码注入 | `ber_inject_mode` | `{28'h0000_000, cfg_i.ber_inject_mode}` | `4 bit` |
| `1` | CRC错误 | `crc_error_inject` | `{28'h0000_000, cfg_i.crc_error_inject}` | `4 bit` |
| `2` | 帧头字段合法性检测 | `header_error_inject` | `{28'h0000_000, cfg_i.header_error_inject}` | `4 bit` |
| `3` | 标志域与数据域一致性检测 | `data_type_error_inject` | `{28'h0000_000, cfg_i.data_type_error_inject}` | `4 bit` |
| `4` | 帧头字段位置匹配检测 | `field_pos_error_inject` | `{28'h0000_000, cfg_i.field_pos_error_inject}` | `4 bit` |
| `5` | 信道编解码错误 | `encode_error_inject` | `{28'h0000_000, cfg_i.encode_error_inject}` | `4 bit` |
| `6` | 星间通信数据帧停发检测 | `data_link_break_inject` | `bool_to_u32(cfg_i.data_link_break_inject)` | `1 bit` |
| `7` | 帧类故障生效范围 | `frame_fault_scope` | `{28'h0000_000, cfg_i.frame_fault_scope}` | `4 bit` |
| `8` | 帧计数连续性检测 | `frame_count_error_inject` | `{28'h0000_000, cfg_i.frame_count_error_inject}` | `4 bit` |
| `9` | 数据域大小端错误 | `endian_error_inject` | `{28'h0000_000, cfg_i.endian_error_inject}` | `4 bit` |
| `10` | 星间光信号中断检测 | `optical_signal_interrupt_inject` | `bool_to_u32(cfg_i.optical_signal_interrupt_inject)` | `1 bit` |

## 回读取值

`rate_sel`、`encode_sel`、异常注入参数的取值含义与遥控指令清单一致。`comm_tx_tm_agent` 在接受请求时快照 `cfg/stat`，同一个遥测帧内不会混入请求后的新配置值。
