# adc_rx_block 遥测状态具体执行

说明：以下遥测帧示例统一按“所有上报数据字为 0”计算，不使用模块 `default_cfg()` 的默认配置值。

## TM_GROUP_RUNTIME_C

| 字段 | 内容 |
| --- | --- |
| module_id | `MODULE_ID_ADC_C = 4'h1` |
| group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字数常量 | `TM_RUNTIME_WORDS_C` |
| 上报字数 | `11` |
| 应用层头字 | `121800B0` |
| 校验字 | `2CE7FCFD` |
| 完整字节流 | `1A CF FC 1D 00 00 00 30 12 18 00 B0 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 2C E7 FC FD` |

| 上报字索引 | 来源表达式 | 关联字段 | 字段真实位宽 | 默认值 |
| --- | --- | --- | --- | --- |
| `0` | `bool_to_u32(stat_i.reset_status)` | `reset_status` | `1 bit` | `00000000` |
| `1` | `bool_to_u32(stat_i.power_good_status)` | `power_good_status` | `1 bit` | `00000000` |
| `2` | `bool_to_u32(stat_i.lmx_locked_status)` | `lmx_locked_status` | `1 bit` | `00000000` |
| `3` | `bool_to_u32(stat_i.lmk_locked_status)` | `lmk_locked_status` | `1 bit` | `00000000` |
| `4` | `bool_to_u32(stat_i.data_valid_status)` | `data_valid_status` | `1 bit` | `00000000` |
| `5` | `bool_to_u32(stat_i.board_status[4])` | `board_status[4]` | `1 bit，遥测按低 16 bit 无符号数承载` | `00000000` |
| `6` | `bool_to_u32(stat_i.board_status[3])` | `board_status[3]` | `1 bit，遥测按低 16 bit 无符号数承载` | `00000000` |
| `7` | `bool_to_u32(stat_i.board_status[2])` | `board_status[2]` | `1 bit，遥测按低 16 bit 无符号数承载` | `00000000` |
| `8` | `bool_to_u32(stat_i.board_status[1])` | `board_status[1]` | `1 bit，遥测按低 16 bit 无符号数承载` | `00000000` |
| `9` | `bool_to_u32(stat_i.board_status[0])` | `board_status[0]` | `1 bit，遥测按低 16 bit 无符号数承载` | `00000000` |
| `10` | `stat_i.rx_power_value` | `rx_power_value` | `32 bit` | `00000000` |

| 帧字序号 | 含义 | 32bit 值 |
| --- | --- | --- |
| 0 | RS422 帧头 | `1ACFFC1D` |
| 1 | payload_length_bytes | `00000030` |
| 2 | 应用层头 | `121800B0` |
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
| 14 | checksum | `2CE7FCFD` |

## TM_GROUP_CFG_C

| 字段 | 内容 |
| --- | --- |
| module_id | `MODULE_ID_ADC_C = 4'h1` |
| group | `TM_GROUP_CFG_C` |
| group_id | `8'h81` |
| 上报字数常量 | `TM_CFG_WORDS_C` |
| 上报字数 | `1` |
| 应用层头字 | `12181010` |
| 校验字 | `2CE80C35` |
| 完整字节流 | `1A CF FC 1D 00 00 00 08 12 18 10 10 00 00 00 00 2C E8 0C 35` |

| 上报字索引 | 来源表达式 | 关联字段 | 字段真实位宽 | 默认值 |
| --- | --- | --- | --- | --- |
| `0` | `bool_to_u32(cfg_i.cal_loop_enable)` | `cal_loop_enable` | `1 bit` | `00000000` |

| 帧字序号 | 含义 | 32bit 值 |
| --- | --- | --- |
| 0 | RS422 帧头 | `1ACFFC1D` |
| 1 | payload_length_bytes | `00000008` |
| 2 | 应用层头 | `12181010` |
| 3 | 遥测数据字 0 | `00000000` |
| 4 | checksum | `2CE80C35` |
