# comm_tx_block 遥控 UI 字段定义

- module_id：`4'h7`
- 来源：`指令与状态/遥控指令清单/comm_tx_block.md`、`指令与状态/遥控指令具体执行/comm_tx_block.md`
- word 列表示遥控 payload 数据字索引；`-` 表示该命令无 payload。
- `COMM_TX_CMD_GROUP_MAP_C` 是 `COMM_TX_CMD_GROUP_CFG_C` 的兼容别名，只覆盖正常工作配置参数，不覆盖异常注入参数。

## COMM_TX_CMD_GROUP_CFG_C

- group_id：`8'h10`

| 参数原始字段名 | UI显示名称 | word | 索引位宽 | 有符号/无符号 | UI类型 | 参数表格索引 |
| --- | --- | --- | --- | --- | --- | --- |
| `COMM_TX_PARAM_RATE_C` | 发送速率选择 | `0` | `word[7:0]` | 无符号数 | 下拉栏 | [UI_COMM_TX_CMD_GROUP_CFG_C_COMM_TX_PARAM_RATE_C](#ui_comm_tx_cmd_group_cfg_c_comm_tx_param_rate_c) |
| `COMM_TX_PARAM_SCRAMBLE_C` | 扰码使能 | `1` | `word[0]` | 无符号数 | 使能开关 | [UI_COMM_TX_CMD_GROUP_CFG_C_COMM_TX_PARAM_SCRAMBLE_C](#ui_comm_tx_cmd_group_cfg_c_comm_tx_param_scramble_c) |
| `COMM_TX_PARAM_ENCODE_C` | 编码类型选择 | `2` | `word[0]` | 无符号数 | 下拉栏 | [UI_COMM_TX_CMD_GROUP_CFG_C_COMM_TX_PARAM_ENCODE_C](#ui_comm_tx_cmd_group_cfg_c_comm_tx_param_encode_c) |

## COMM_TX_CMD_GROUP_FAULT_C

- group_id：`8'h11`

| 参数原始字段名 | UI显示名称 | word | 索引位宽 | 有符号/无符号 | UI类型 | 参数表格索引 |
| --- | --- | --- | --- | --- | --- | --- |
| `COMM_TX_PARAM_BER_INJECT_C` | 空口通信误码注入 | `0` | `word[3:0]` | 无符号数 | 下拉栏 | [UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_BER_INJECT_C](#ui_comm_tx_cmd_group_fault_c_comm_tx_param_ber_inject_c) |
| `COMM_TX_PARAM_CRC_ERROR_C` | CRC 故障注入控制 | `1` | `word[3:0]` | 无符号数 | 下拉栏 | [UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_CRC_ERROR_C](#ui_comm_tx_cmd_group_fault_c_comm_tx_param_crc_error_c) |
| `COMM_TX_PARAM_HEADER_ERROR_C` | 帧头故障注入控制 | `2` | `word[3:0]` | 无符号数 | 下拉栏 | [UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_HEADER_ERROR_C](#ui_comm_tx_cmd_group_fault_c_comm_tx_param_header_error_c) |
| `COMM_TX_PARAM_DATA_TYPE_ERROR_C` | 数据类型故障注入控制 | `3` | `word[3:0]` | 无符号数 | 下拉栏 | [UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_DATA_TYPE_ERROR_C](#ui_comm_tx_cmd_group_fault_c_comm_tx_param_data_type_error_c) |
| `COMM_TX_PARAM_FIELD_POS_ERROR_C` | 字段位置故障注入控制 | `4` | `word[3:0]` | 无符号数 | 下拉栏 | [UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_FIELD_POS_ERROR_C](#ui_comm_tx_cmd_group_fault_c_comm_tx_param_field_pos_error_c) |
| `COMM_TX_PARAM_ENCODE_ERROR_C` | 编码故障注入控制 | `5` | `word[3:0]` | 无符号数 | 下拉栏 | [UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_ENCODE_ERROR_C](#ui_comm_tx_cmd_group_fault_c_comm_tx_param_encode_error_c) |
| `COMM_TX_PARAM_DATA_LINK_BREAK_C` | 星间通信数据帧停发检测 | `6` | `word[0]` | 无符号数 | 使能开关 | [UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_DATA_LINK_BREAK_C](#ui_comm_tx_cmd_group_fault_c_comm_tx_param_data_link_break_c) |
| `COMM_TX_PARAM_FRAME_FAULT_SCOPE_C` | 帧类故障生效范围 | `7` | `word[3:0]` | 无符号数 | 下拉栏 | [UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_FRAME_FAULT_SCOPE_C](#ui_comm_tx_cmd_group_fault_c_comm_tx_param_frame_fault_scope_c) |
| `COMM_TX_PARAM_FRAME_COUNT_ERROR_C` | 帧计数故障注入控制 | `8` | `word[3:0]` | 无符号数 | 下拉栏 | [UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_FRAME_COUNT_ERROR_C](#ui_comm_tx_cmd_group_fault_c_comm_tx_param_frame_count_error_c) |
| `COMM_TX_PARAM_ENDIAN_ERROR_C` | 数据域大小端错误 | `9` | `word[3:0]` | 无符号数 | 下拉栏 | [UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_ENDIAN_ERROR_C](#ui_comm_tx_cmd_group_fault_c_comm_tx_param_endian_error_c) |
| `COMM_TX_PARAM_OPTICAL_SIGNAL_INTERRUPT_C` | 星间光信号中断 | `10` | `word[0]` | 无符号数 | 使能开关 | [UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_OPTICAL_SIGNAL_INTERRUPT_C](#ui_comm_tx_cmd_group_fault_c_comm_tx_param_optical_signal_interrupt_c) |
| `COMM_TX_PARAM_FRAME_CONTENT_REPEAT_C` | 帧内容重复 | `11` | `word[3:0]` | 无符号数 | 下拉栏 | [UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_FRAME_CONTENT_REPEAT_C](#ui_comm_tx_cmd_group_fault_c_comm_tx_param_frame_content_repeat_c) |

## COMM_TX_CMD_GROUP_PULSE_RESET_C

- group_id：`8'h12`

| 参数原始字段名 | UI显示名称 | word | 索引位宽 | 有符号/无符号 | UI类型 | 参数表格索引 |
| --- | --- | --- | --- | --- | --- | --- |
| `COMM_TX_PARAM_RESET_C` | 发送复位 | `-` | `无 payload` | 无符号数 | 触发按钮 | [UI_COMM_TX_CMD_GROUP_PULSE_RESET_C_COMM_TX_PARAM_RESET_C](#ui_comm_tx_cmd_group_pulse_reset_c_comm_tx_param_reset_c) |

## COMM_TX_CMD_GROUP_PULSE_CLEAR_C

- group_id：`8'h13`

| 参数原始字段名 | UI显示名称 | word | 索引位宽 | 有符号/无符号 | UI类型 | 参数表格索引 |
| --- | --- | --- | --- | --- | --- | --- |
| `COMM_TX_PARAM_COUNT_CLEAR_C` | 计数复位 | `-` | `无 payload` | 无符号数 | 触发按钮 | [UI_COMM_TX_CMD_GROUP_PULSE_CLEAR_C_COMM_TX_PARAM_COUNT_CLEAR_C](#ui_comm_tx_cmd_group_pulse_clear_c_comm_tx_param_count_clear_c) |

## 参数表格

### UI_COMM_TX_CMD_GROUP_CFG_C_COMM_TX_PARAM_RATE_C

- 原始字段：`COMM_TX_PARAM_RATE_C`
- UI名称：发送速率选择
- UI类型：下拉栏
- 数据宽度：`8 bit`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 312M | `8'h00` | 速率选择 312M |
| 625M | `8'h01` | 速率选择 625M |
| 1.25G | `8'h02` | 速率选择 1.25G |
| 2.5G | `8'h03` | 速率选择 2.5G |
| 5G | `8'h04` | 速率选择 5G |
| OOK 20M | `8'h80` | OOK 调制，`rate_sel[7:5]=3'b100` |
| OOK 10M | `8'hA0` | OOK 调制，`rate_sel[7:5]=3'b101` |
| OOK 1M | `8'hC0` | OOK 调制，`rate_sel[7:5]=3'b110` |
| 其它 | `其它编码` | 保留/待确认，软件默认不提供 |

### UI_COMM_TX_CMD_GROUP_CFG_C_COMM_TX_PARAM_SCRAMBLE_C

- 原始字段：`COMM_TX_PARAM_SCRAMBLE_C`
- UI名称：扰码使能
- UI类型：使能开关
- 数据宽度：`1 bit`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 关闭/禁用 | `1'b0` | 扰码使能关闭或禁用 |
| 开启/使能 | `1'b1` | 扰码使能开启或使能 |

### UI_COMM_TX_CMD_GROUP_CFG_C_COMM_TX_PARAM_ENCODE_C

- 原始字段：`COMM_TX_PARAM_ENCODE_C`
- UI名称：编码类型选择
- UI类型：下拉栏
- 数据宽度：`1 bit`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| RS | `1'b0` | 选择 RS 编码/译码 |
| LDPC | `1'b1` | 选择 LDPC 编码；需确认 LDPC DCP/source 绑定和 `LDPC_ENCODE_EN` 参数后实际生效 |

### UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_BER_INJECT_C

- 原始字段：`COMM_TX_PARAM_BER_INJECT_C`
- UI名称：空口通信误码注入
- UI类型：下拉栏
- 数据宽度：`4 bit`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 不注入 | `4'd0` | 不产生空口误码 |
| 少量固定错误 | `4'd1` | 每帧周期少量帧出错；帧内固定非连续偶数拍出错 |
| 少量突发错误 | `4'd2` | 每帧周期少量帧出错；帧内 PN 突发拍数小于 128 |
| 少量连续错误 | `4'd3` | 每帧周期少量帧出错；帧内前 100 拍连续出错 |
| 大量固定错误 | `4'd4` | 每帧周期大量帧出错；帧内固定非连续偶数拍出错 |
| 大量突发错误 | `4'd5` | 每帧周期大量帧出错；帧内 PN 突发拍数小于 128 |
| 大量连续错误 | `4'd6` | 每帧周期大量帧出错；帧内前 100 拍连续出错 |
| 随机固定错误 | `4'd7` | 每帧周期随机个帧出错；帧内固定非连续偶数拍出错 |
| 随机突发错误 | `4'd8` | 每帧周期随机个帧出错；帧内 PN 突发拍数小于 128 |
| 随机连续错误 | `4'd9` | 每帧周期随机个帧出错；帧内前 100 拍连续出错 |
| 保留 | `4'd10 ~ 4'd15` | 软件默认不提供 |

### UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_CRC_ERROR_C

- 原始字段：`COMM_TX_PARAM_CRC_ERROR_C`
- UI名称：CRC 故障注入控制
- UI类型：下拉栏
- 数据宽度：`4 bit`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 不注入 | `4'd0` | CRC 故障注入控制关闭 |
| CRC 取反 | `4'd1` | 注入 CRC 取反错误 |
| 保留 | `4'd2 ~ 4'd15` | 软件默认不提供 |

### UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_HEADER_ERROR_C

- 原始字段：`COMM_TX_PARAM_HEADER_ERROR_C`
- UI名称：帧头故障注入控制
- UI类型：下拉栏
- 数据宽度：`4 bit`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 不注入 | `4'd0` | 帧头故障注入控制关闭 |
| 轻度 1bit | `4'd1` | 帧头轻度 1bit 错误 |
| 中度 4bit | `4'd2` | 帧头中度 4bit 错误 |
| 全反 | `4'd3` | 帧头全反 |
| 第 1/3 字节错误 | `4'd4` | 第 1/3 字节错误 |
| 位反序 | `4'd5` | 32 bit 位反序 |
| 保留 | `4'd6 ~ 4'd15` | 软件默认不提供 |

### UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_DATA_TYPE_ERROR_C

- 原始字段：`COMM_TX_PARAM_DATA_TYPE_ERROR_C`
- UI名称：数据类型故障注入控制
- UI类型：下拉栏
- 数据宽度：`4 bit`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 不注入 | `4'd0` | 数据类型故障注入控制关闭 |
| 字段交换 | `4'd1` | 数据类型字段交换 |
| 保留 | `4'd2 ~ 4'd15` | 软件默认不提供 |

### UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_FIELD_POS_ERROR_C

- 原始字段：`COMM_TX_PARAM_FIELD_POS_ERROR_C`
- UI名称：字段位置故障注入控制
- UI类型：下拉栏
- 数据宽度：`4 bit`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 不注入 | `4'd0` | 字段位置故障注入控制关闭 |
| 帧头后移 | `4'd1` | 帧头插入到第二拍位置 |
| 保留 | `4'd2 ~ 4'd15` | 软件默认不提供 |

### UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_ENCODE_ERROR_C

- 原始字段：`COMM_TX_PARAM_ENCODE_ERROR_C`
- UI名称：编码故障注入控制
- UI类型：下拉栏
- 数据宽度：`4 bit`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 不注入 | `4'd0` | 编码故障注入控制关闭 |
| 强制 RS | `4'd1` | 强制 RS 编码 |
| 强制 LDPC | `4'd2` | 强制 LDPC 编码 |
| 选择取反 | `4'd3` | 编码选择取反 |
| 保留 | `4'd4 ~ 4'd15` | 软件默认不提供 |

### UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_DATA_LINK_BREAK_C

- 原始字段：`COMM_TX_PARAM_DATA_LINK_BREAK_C`
- UI名称：星间通信数据帧停发检测
- UI类型：使能开关
- 数据宽度：`1 bit`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 正常 | `1'b0` | 不注入数据帧停发异常 |
| 星间通信数据帧时停时发 | `1'b1` | 由 PPS 1 s 计时器控制，每 5 s 停发 1 s，停发窗内发送 `5A5A_5A5A` |

### UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_FRAME_FAULT_SCOPE_C

- 原始字段：`COMM_TX_PARAM_FRAME_FAULT_SCOPE_C`
- UI名称：帧类故障生效范围
- UI类型：下拉栏
- 数据宽度：`4 bit`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 不生效 | `4'd0` | 不对帧类异常生效 |
| 全部帧 | `4'd1` | 对全部帧生效 |
| 奇数帧 | `4'd2` | 对奇数帧生效 |
| 偶数帧 | `4'd3` | 对偶数帧生效 |
| 每 16 帧 | `4'd4` | 每 16 帧生效 |
| 前 16 帧 | `4'd5` | 前 16 帧生效 |
| 保留 | `4'd6 ~ 4'd15` | 软件默认不提供 |

### UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_FRAME_COUNT_ERROR_C

- 原始字段：`COMM_TX_PARAM_FRAME_COUNT_ERROR_C`
- UI名称：帧计数故障注入控制
- UI类型：下拉栏
- 数据宽度：`4 bit`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 不注入 | `4'd0` | 帧计数故障注入关闭 |
| 重复 | `4'd1` | 帧计数重复 |
| 跳 2 帧 | `4'd2` | 帧计数跳 2 帧 |
| 每 100 帧回退为 1 | `4'd3` | 每 100 帧回退为 1 |
| 保留 | `4'd4 ~ 4'd15` | 软件默认不提供 |

### UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_ENDIAN_ERROR_C

- 原始字段：`COMM_TX_PARAM_ENDIAN_ERROR_C`
- UI名称：数据域大小端错误
- UI类型：下拉栏
- 数据宽度：`4 bit`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 不注入 | `4'd0` | 字节序故障注入关闭 |
| GT 正序输出 | `4'd1` | 取消 GT 16 bit 反序 |
| 帧头位反序 | `4'd2` | 仅帧头 `1ACFFC1D` 反序 |
| 数据内容位反序 | `4'd3` | 仅帧头前数据内容按 bit 反序 |
| 帧头与数据位反序 | `4'd4` | 帧头和数据内容同时位反序 |
| 保留 | `4'd5 ~ 4'd15` | 软件默认不提供 |

### UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_OPTICAL_SIGNAL_INTERRUPT_C

- 原始字段：`COMM_TX_PARAM_OPTICAL_SIGNAL_INTERRUPT_C`
- UI名称：星间光信号中断
- UI类型：使能开关
- 数据宽度：`1 bit`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 正常 | `1'b0` | 不注入星间光信号中断 |
| 星间光信号中断 | `1'b1` | 跨到激光控制 40 MHz 域后强制发送激光器 `txm_on` 选择为 `0` |

### UI_COMM_TX_CMD_GROUP_FAULT_C_COMM_TX_PARAM_FRAME_CONTENT_REPEAT_C

- 原始字段：`COMM_TX_PARAM_FRAME_CONTENT_REPEAT_C`
- UI名称：帧内容重复
- UI类型：下拉栏
- 数据宽度：`4 bit`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 不注入 | `4'd0` | 帧内容重复接口关闭 |
| 预留使能 | `4'd1` | 当前仅保留遥控/遥测接口，尚未接入数据路径 |
| 保留 | `4'd2 ~ 4'd15` | 软件默认不提供 |

### UI_COMM_TX_CMD_GROUP_PULSE_RESET_C_COMM_TX_PARAM_RESET_C

- 原始字段：`COMM_TX_PARAM_RESET_C`
- UI名称：发送复位
- UI类型：触发按钮
- 数据宽度：`0 bit`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 点击 | `无 payload` | 发送该 group，RTL 产生脉冲；软件不要保持开关状态 |

### UI_COMM_TX_CMD_GROUP_PULSE_CLEAR_C_COMM_TX_PARAM_COUNT_CLEAR_C

- 原始字段：`COMM_TX_PARAM_COUNT_CLEAR_C`
- UI名称：计数复位
- UI类型：触发按钮
- 数据宽度：`0 bit`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 点击 | `无 payload` | 发送该 group，RTL 产生脉冲；软件不要保持开关状态 |
