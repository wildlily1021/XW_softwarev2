# comm_rx_block 主机指令具体执行

说明：以下帧按当前 RTL 协议的有效组帧展开，不再把多参数组误写成单参数单帧。所有带数据的参数默认按 `0` 取值计算校验。

## COMM_RX_CMD_GROUP_MAP_C

| 字段 | 内容 |
| --- | --- |
| 模块 | `comm_rx_block` |
| module_id | `MODULE_ID_COMM_RX_C = 4'h8` |
| group | `COMM_RX_CMD_GROUP_MAP_C` |
| group_id | `8'h10` |
| group参数个数 | `7` |
| 默认payload数据字数 | `7` |
| 应用层头字 | `11810070` |
| 校验字 | `2C50FCAD` |
| 完整字节流 | `1A CF FC 1D 00 00 00 20 11 81 00 70 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 2C 50 FC AD` |

| payload字索引 | 参数名 | 参数组内字索引 | 默认值 |
| --- | --- | --- | --- |
| `0` | `COMM_RX_PARAM_RATE_C` | `0` | `00000000` |
| `1` | `COMM_RX_PARAM_DECODE_C` | `0` | `00000000` |
| `2` | `COMM_RX_PARAM_DESCRAMBLE_C` | `0` | `00000000` |
| `3` | `COMM_RX_PARAM_FILTER_C` | `0` | `00000000` |
| `4` | `COMM_RX_PARAM_LOOP_BW_C` | `0` | `00000000` |
| `5` | `COMM_RX_PARAM_TIMING_FILTER_C` | `0` | `00000000` |
| `6` | `COMM_RX_PARAM_AUTO_RESET_C` | `0` | `00000000` |

| 帧字序号 | 含义 | 32bit 值 |
| --- | --- | --- |
| 0 | RS422 帧头 | `1ACFFC1D` |
| 1 | payload_length_bytes | `00000020` |
| 2 | 应用层头 | `11810070` |
| 3 | 参数数据字 0 | `00000000` |
| 4 | 参数数据字 1 | `00000000` |
| 5 | 参数数据字 2 | `00000000` |
| 6 | 参数数据字 3 | `00000000` |
| 7 | 参数数据字 4 | `00000000` |
| 8 | 参数数据字 5 | `00000000` |
| 9 | 参数数据字 6 | `00000000` |
| 10 | checksum | `2C50FCAD` |

## COMM_RX_CMD_GROUP_VALUE_C

| 字段 | 内容 |
| --- | --- |
| 模块 | `comm_rx_block` |
| module_id | `MODULE_ID_COMM_RX_C = 4'h8` |
| group | `COMM_RX_CMD_GROUP_VALUE_C` |
| group_id | `8'h11` |
| group参数个数 | `3` |
| 默认payload数据字数 | `3` |
| 应用层头字 | `11811030` |
| 校验字 | `2C510C5D` |
| 完整字节流 | `1A CF FC 1D 00 00 00 10 11 81 10 30 00 00 00 00 00 00 00 00 00 00 00 00 2C 51 0C 5D` |

| payload字索引 | 参数名 | 参数组内字索引 | 默认值 |
| --- | --- | --- | --- |
| `0` | `COMM_RX_PARAM_SYNC_CORR_PEAK_TH_C` | `0` | `00000000` |
| `1` | `COMM_RX_PARAM_LOCK_TH_C` | `0` | `00000000` |
| `2` | `COMM_RX_PARAM_UNLOCK_TH_C` | `0` | `00000000` |

| 帧字序号 | 含义 | 32bit 值 |
| --- | --- | --- |
| 0 | RS422 帧头 | `1ACFFC1D` |
| 1 | payload_length_bytes | `00000010` |
| 2 | 应用层头 | `11811030` |
| 3 | 参数数据字 0 | `00000000` |
| 4 | 参数数据字 1 | `00000000` |
| 5 | 参数数据字 2 | `00000000` |
| 6 | checksum | `2C510C5D` |

## COMM_RX_CMD_GROUP_PULSE_RANGE_RST_C

| 字段 | 内容 |
| --- | --- |
| 模块 | `comm_rx_block` |
| module_id | `MODULE_ID_COMM_RX_C = 4'h8` |
| group | `COMM_RX_CMD_GROUP_PULSE_RANGE_RST_C` |
| group_id | `8'h12` |
| group参数个数 | `1` |
| 默认payload数据字数 | `0` |
| 应用层头字 | `11812010` |
| 校验字 | `2C511C31` |
| 完整字节流 | `1A CF FC 1D 00 00 00 04 11 81 20 10 2C 51 1C 31` |

| payload字索引 | 参数名 | 参数组内字索引 | 默认值 |
| --- | --- | --- | --- |
| `-` | `COMM_RX_PARAM_RANGE_RESET_C` | `-` | `无payload字` |

| 帧字序号 | 含义 | 32bit 值 |
| --- | --- | --- |
| 0 | RS422 帧头 | `1ACFFC1D` |
| 1 | payload_length_bytes | `00000004` |
| 2 | 应用层头 | `11812010` |
| 3 | checksum | `2C511C31` |

## COMM_RX_CMD_GROUP_PULSE_COUNT_CLR_C

| 字段 | 内容 |
| --- | --- |
| 模块 | `comm_rx_block` |
| module_id | `MODULE_ID_COMM_RX_C = 4'h8` |
| group | `COMM_RX_CMD_GROUP_PULSE_COUNT_CLR_C` |
| group_id | `8'h13` |
| group参数个数 | `1` |
| 默认payload数据字数 | `0` |
| 应用层头字 | `11813010` |
| 校验字 | `2C512C31` |
| 完整字节流 | `1A CF FC 1D 00 00 00 04 11 81 30 10 2C 51 2C 31` |

| payload字索引 | 参数名 | 参数组内字索引 | 默认值 |
| --- | --- | --- | --- |
| `-` | `COMM_RX_PARAM_COUNT_CLEAR_C` | `-` | `无payload字` |

| 帧字序号 | 含义 | 32bit 值 |
| --- | --- | --- |
| 0 | RS422 帧头 | `1ACFFC1D` |
| 1 | payload_length_bytes | `00000004` |
| 2 | 应用层头 | `11813010` |
| 3 | checksum | `2C512C31` |

## COMM_RX_CMD_GROUP_PULSE_MANUAL_RST_C

| 字段 | 内容 |
| --- | --- |
| 模块 | `comm_rx_block` |
| module_id | `MODULE_ID_COMM_RX_C = 4'h8` |
| group | `COMM_RX_CMD_GROUP_PULSE_MANUAL_RST_C` |
| group_id | `8'h14` |
| group参数个数 | `1` |
| 默认payload数据字数 | `0` |
| 应用层头字 | `11814010` |
| 校验字 | `2C513C31` |
| 完整字节流 | `1A CF FC 1D 00 00 00 04 11 81 40 10 2C 51 3C 31` |

| payload字索引 | 参数名 | 参数组内字索引 | 默认值 |
| --- | --- | --- | --- |
| `-` | `COMM_RX_PARAM_MANUAL_RESET_C` | `-` | `无payload字` |

| 帧字序号 | 含义 | 32bit 值 |
| --- | --- | --- |
| 0 | RS422 帧头 | `1ACFFC1D` |
| 1 | payload_length_bytes | `00000004` |
| 2 | 应用层头 | `11814010` |
| 3 | checksum | `2C513C31` |
