# comm_tx_block 遥控指令具体执行

说明：以下 RS422 示例按当前 RTL 有效协议生成。带数据参数默认按 `0` 计算校验；实际写入非零配置后需要重新计算 checksum。

## COMM_TX_CMD_GROUP_CFG_C

| 字段 | 内容 |
| --- | --- |
| module_id | `MODULE_ID_COMM_TX_C = 4'h7` |
| group | `COMM_TX_CMD_GROUP_CFG_C` |
| group_id | `8'h10` |
| group参数个数 | `3` |
| payload数据字数 | `3` |
| payload_length_bytes | `00000010` |
| 应用层头字 | `11710030` |
| 校验字 | `2C40FC5D` |
| 完整字节流 | `1A CF FC 1D 00 00 00 10 11 71 00 30 00 00 00 00 00 00 00 00 00 00 00 00 2C 40 FC 5D` |

| payload字索引 | 参数名 | 参数id | 默认值 |
| --- | --- | --- | --- |
| `0` | `COMM_TX_PARAM_RATE_C` | `8'd0` | `00000000` |
| `1` | `COMM_TX_PARAM_SCRAMBLE_C` | `8'd1` | `00000000` |
| `2` | `COMM_TX_PARAM_ENCODE_C` | `8'd2` | `00000000` |

| 帧字序号 | 含义 | 32bit 值 |
| --- | --- | --- |
| 0 | RS422 帧头 | `1ACFFC1D` |
| 1 | payload_length_bytes | `00000010` |
| 2 | 应用层头 | `11710030` |
| 3 | 参数数据字 0 | `00000000` |
| 4 | 参数数据字 1 | `00000000` |
| 5 | 参数数据字 2 | `00000000` |
| 6 | checksum | `2C40FC5D` |

常用替换：`rate_sel` 可写 `00000003` 表示 PSK 2.5G，`00000080/000000A0/000000C0` 分别表示 OOK 20M/10M/1M；`encode_sel` 可写 `00000000` 表示 RS，`00000001` 表示 LDPC。

## COMM_TX_CMD_GROUP_FAULT_C

| 字段 | 内容 |
| --- | --- |
| module_id | `MODULE_ID_COMM_TX_C = 4'h7` |
| group | `COMM_TX_CMD_GROUP_FAULT_C` |
| group_id | `8'h11` |
| group参数个数 | `12` |
| payload数据字数 | `12` |
| payload_length_bytes | `00000034` |
| 应用层头字 | `117110C0` |
| 校验字 | `2C410D11` |
| 完整字节流 | `1A CF FC 1D 00 00 00 34 11 71 10 C0 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 2C 41 0D 11` |

| payload字索引 | 参数名 | 参数id | 默认值 |
| --- | --- | --- | --- |
| `0` | `COMM_TX_PARAM_BER_INJECT_C` | `8'd3` | `00000000` |
| `1` | `COMM_TX_PARAM_CRC_ERROR_C` | `8'd4` | `00000000` |
| `2` | `COMM_TX_PARAM_HEADER_ERROR_C` | `8'd5` | `00000000` |
| `3` | `COMM_TX_PARAM_DATA_TYPE_ERROR_C` | `8'd6` | `00000000` |
| `4` | `COMM_TX_PARAM_FIELD_POS_ERROR_C` | `8'd7` | `00000000` |
| `5` | `COMM_TX_PARAM_ENCODE_ERROR_C` | `8'd8` | `00000000` |
| `6` | `COMM_TX_PARAM_DATA_LINK_BREAK_C` | `8'd9` | `00000000` |
| `7` | `COMM_TX_PARAM_FRAME_FAULT_SCOPE_C` | `8'd10` | `00000000` |
| `8` | `COMM_TX_PARAM_FRAME_COUNT_ERROR_C` | `8'd11` | `00000000` |
| `9` | `COMM_TX_PARAM_ENDIAN_ERROR_C` | `8'd12` | `00000000` |
| `10` | `COMM_TX_PARAM_OPTICAL_SIGNAL_INTERRUPT_C` | `8'd13` | `00000000` |
| `11` | `COMM_TX_PARAM_FRAME_CONTENT_REPEAT_C` | `8'd16` | `00000000` |

| 帧字序号 | 含义 | 32bit 值 |
| --- | --- | --- |
| 0 | RS422 帧头 | `1ACFFC1D` |
| 1 | payload_length_bytes | `00000034` |
| 2 | 应用层头 | `117110C0` |
| 3..14 | 参数数据字 0..11 | 默认均为 `00000000` |
| 15 | checksum | `2C410D11` |

帧类异常使用 `COMM_TX_PARAM_FRAME_FAULT_SCOPE_C` 控制作用范围。数据域大小端错误、帧头位置异常、星间通信数据帧停发/断链、星间光信号中断不依赖该帧控制使能。

## COMM_TX_CMD_GROUP_PULSE_RESET_C

| 字段 | 内容 |
| --- | --- |
| module_id | `MODULE_ID_COMM_TX_C = 4'h7` |
| group | `COMM_TX_CMD_GROUP_PULSE_RESET_C` |
| group_id | `8'h12` |
| group参数个数 | `1` |
| payload数据字数 | `0` |
| payload_length_bytes | `00000004` |
| 应用层头字 | `11712010` |
| 校验字 | `2C411C31` |
| 完整字节流 | `1A CF FC 1D 00 00 00 04 11 71 20 10 2C 41 1C 31` |

## COMM_TX_CMD_GROUP_PULSE_CLEAR_C

| 字段 | 内容 |
| --- | --- |
| module_id | `MODULE_ID_COMM_TX_C = 4'h7` |
| group | `COMM_TX_CMD_GROUP_PULSE_CLEAR_C` |
| group_id | `8'h13` |
| group参数个数 | `1` |
| payload数据字数 | `0` |
| payload_length_bytes | `00000004` |
| 应用层头字 | `11713010` |
| 校验字 | `2C412C31` |
| 完整字节流 | `1A CF FC 1D 00 00 00 04 11 71 30 10 2C 41 2C 31` |
