# comm_tx_block 遥控指令清单

## 来源

- 模块目录：`import/rtl_source/comm_tx_block/`
- 遥控包：`import/rtl_source/comm_tx_block/vars/comm_tx_ctrl_pkg.sv`
- module_id：`MODULE_ID_COMM_TX_C = 4'h7`
- 当前有效协议：正常工作配置与异常注入配置分为两个遥控帧；`COMM_TX_CMD_GROUP_MAP_C` 仅作为 `COMM_TX_CMD_GROUP_CFG_C` 的兼容别名保留。

## Group 总表

| group | group_id | 参数个数 | 参数 id 范围 | 说明 |
| --- | --- | --- | --- | --- |
| `COMM_TX_CMD_GROUP_CFG_C` | `8'h10` | `GROUP_CFG_PARAM_COUNT_C = 8'd3` | `8'd0`..`8'd2` | 正常工作参数配置 |
| `COMM_TX_CMD_GROUP_FAULT_C` | `8'h11` | `GROUP_FAULT_PARAM_COUNT_C = 8'd10` | `8'd3`..`8'd12` | 异常注入参数配置 |
| `COMM_TX_CMD_GROUP_PULSE_RESET_C` | `8'h12` | `GROUP_RST_PARAM_COUNT_C = 8'd1` | `8'd13` | 通信发送复位脉冲 |
| `COMM_TX_CMD_GROUP_PULSE_CLEAR_C` | `8'h13` | `GROUP_CLR_PARAM_COUNT_C = 8'd1` | `8'd14` | 通信发送计数清零脉冲 |

## 参数总表

| 参数名字 | 所属 group | 参数id | 参数类型 | 应用层字数 | 实现层参数名 | 实现层参数id | 落地字段 | 落地位宽 | 默认值 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `COMM_TX_PARAM_RATE_C` | `COMM_TX_CMD_GROUP_CFG_C` | `8'd0` | `PARAM_KIND_VALUE_C` | `WORD_COUNT_SINGLE_C` | `COMM_TX_IMPL_RATE_C` | `8'd0` | `cfg_r.rate_sel` | `8 bit` | `RATE_SEL_2P5G_C` |
| `COMM_TX_PARAM_SCRAMBLE_C` | `COMM_TX_CMD_GROUP_CFG_C` | `8'd1` | `PARAM_KIND_VALUE_C` | `WORD_COUNT_SINGLE_C` | `COMM_TX_IMPL_SCRAMBLE_C` | `8'd1` | `cfg_r.scramble_enable` | `1 bit` | `1'b1` |
| `COMM_TX_PARAM_ENCODE_C` | `COMM_TX_CMD_GROUP_CFG_C` | `8'd2` | `PARAM_KIND_VALUE_C` | `WORD_COUNT_SINGLE_C` | `COMM_TX_IMPL_ENCODE_C` | `8'd2` | `cfg_r.encode_sel` | `1 bit` | `COMM_TX_ENCODE_RS_C` |
| `COMM_TX_PARAM_BER_INJECT_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd3` | `PARAM_KIND_VALUE_C` | `WORD_COUNT_SINGLE_C` | `COMM_TX_IMPL_BER_INJECT_C` | `8'd3` | `cfg_r.ber_inject_mode` | `4 bit` | `COMM_TX_BER_INJECT_NONE_C` |
| `COMM_TX_PARAM_CRC_ERROR_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd4` | `PARAM_KIND_VALUE_C` | `WORD_COUNT_SINGLE_C` | `COMM_TX_IMPL_CRC_ERROR_C` | `8'd4` | `cfg_r.crc_error_inject` | `4 bit` | `COMM_TX_CRC_ERROR_NONE_C` |
| `COMM_TX_PARAM_HEADER_ERROR_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd5` | `PARAM_KIND_VALUE_C` | `WORD_COUNT_SINGLE_C` | `COMM_TX_IMPL_HEADER_ERROR_C` | `8'd5` | `cfg_r.header_error_inject` | `4 bit` | `COMM_TX_HEADER_ERROR_NONE_C` |
| `COMM_TX_PARAM_DATA_TYPE_ERROR_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd6` | `PARAM_KIND_VALUE_C` | `WORD_COUNT_SINGLE_C` | `COMM_TX_IMPL_DATA_TYPE_ERROR_C` | `8'd6` | `cfg_r.data_type_error_inject` | `4 bit` | `COMM_TX_DATA_TYPE_ERROR_NONE_C` |
| `COMM_TX_PARAM_FIELD_POS_ERROR_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd7` | `PARAM_KIND_VALUE_C` | `WORD_COUNT_SINGLE_C` | `COMM_TX_IMPL_FIELD_POS_ERROR_C` | `8'd7` | `cfg_r.field_pos_error_inject` | `4 bit` | `COMM_TX_FIELD_POS_ERROR_NONE_C` |
| `COMM_TX_PARAM_ENCODE_ERROR_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd8` | `PARAM_KIND_VALUE_C` | `WORD_COUNT_SINGLE_C` | `COMM_TX_IMPL_ENCODE_ERROR_C` | `8'd8` | `cfg_r.encode_error_inject` | `4 bit` | `COMM_TX_ENCODE_ERROR_NONE_C` |
| `COMM_TX_PARAM_DATA_LINK_BREAK_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd9` | `PARAM_KIND_VALUE_C` | `WORD_COUNT_SINGLE_C` | `COMM_TX_IMPL_DATA_LINK_BREAK_C` | `8'd9` | `cfg_r.data_link_break_inject` | `1 bit` | `1'b0` |
| `COMM_TX_PARAM_FRAME_FAULT_SCOPE_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd10` | `PARAM_KIND_VALUE_C` | `WORD_COUNT_SINGLE_C` | `COMM_TX_IMPL_FRAME_FAULT_SCOPE_C` | `8'd10` | `cfg_r.frame_fault_scope` | `4 bit` | `COMM_TX_FRAME_FAULT_SCOPE_NONE_C` |
| `COMM_TX_PARAM_FRAME_COUNT_ERROR_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd11` | `PARAM_KIND_VALUE_C` | `WORD_COUNT_SINGLE_C` | `COMM_TX_IMPL_FRAME_COUNT_ERROR_C` | `8'd11` | `cfg_r.frame_count_error_inject` | `4 bit` | `COMM_TX_FRAME_COUNT_ERROR_NONE_C` |
| `COMM_TX_PARAM_ENDIAN_ERROR_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd12` | `PARAM_KIND_VALUE_C` | `WORD_COUNT_SINGLE_C` | `COMM_TX_IMPL_ENDIAN_ERROR_C` | `8'd12` | `cfg_r.endian_error_inject` | `4 bit` | `COMM_TX_ENDIAN_ERROR_NONE_C` |
| `COMM_TX_PARAM_RESET_C` | `COMM_TX_CMD_GROUP_PULSE_RESET_C` | `8'd13` | `PARAM_KIND_PULSE_C` | `WORD_COUNT_ZERO_C` | `COMM_TX_IMPL_RESET_C` | `8'd13` | `reset_pulse` | `1 cycle pulse` | 不触发 |
| `COMM_TX_PARAM_COUNT_CLEAR_C` | `COMM_TX_CMD_GROUP_PULSE_CLEAR_C` | `8'd14` | `PARAM_KIND_PULSE_C` | `WORD_COUNT_ZERO_C` | `COMM_TX_IMPL_COUNT_CLEAR_C` | `8'd14` | `count_clear_pulse` | `1 cycle pulse` | 不触发 |

## 取值说明

### RATE

| 常量 | 写入值 | 说明 |
| --- | --- | --- |
| `RATE_SEL_PSK_312M_C` | `8'h00` | PSK 312M |
| `RATE_SEL_PSK_625M_C` | `8'h01` | PSK 625M |
| `RATE_SEL_PSK_1P25G_C` | `8'h02` | PSK 1.25G |
| `RATE_SEL_PSK_2P5G_C` | `8'h03` | PSK 2.5G，上电默认 |
| `RATE_SEL_PSK_5G_C` | `8'h04` | PSK 5G |
| `RATE_SEL_OOK_20M_C` | `8'h80` | OOK 20M |
| `RATE_SEL_OOK_10M_C` | `8'hA0` | OOK 10M |
| `RATE_SEL_OOK_1M_C` | `8'hC0` | OOK 1M |

### ENCODE

| 常量 | 写入值 | 说明 |
| --- | --- | --- |
| `COMM_TX_ENCODE_RS_C` | `1'b0` | 选择 RS 编码链路，上电默认 |
| `COMM_TX_ENCODE_LDPC_C` | `1'b1` | 选择 LDPC 编码链路 |

### 异常注入

| 参数 | `4'd0` | 其他当前 RTL 已定义值 |
| --- | --- | --- |
| `COMM_TX_PARAM_BER_INJECT_C` | 不注入 | `1` 轻量误码，`2` 大量误码，`3` 随机误码 |
| `COMM_TX_PARAM_CRC_ERROR_C` | 不注入 | `1` CRC 取反 |
| `COMM_TX_PARAM_HEADER_ERROR_C` | 不注入 | `1` 轻度 1bit，`2` 中度 4bit，`3` 全反，`4` 第 1/3 字节错误 |
| `COMM_TX_PARAM_DATA_TYPE_ERROR_C` | 不注入 | `1` 数据类型字段交换 |
| `COMM_TX_PARAM_FIELD_POS_ERROR_C` | 不注入 | `1` 帧头插入到第二拍位置 |
| `COMM_TX_PARAM_ENCODE_ERROR_C` | 不注入 | `1` 强制 RS，`2` 强制 LDPC，`3` 选择取反 |
| `COMM_TX_PARAM_FRAME_FAULT_SCOPE_C` | 不对帧类异常生效 | `1` 全部帧，`2` 奇数帧，`3` 偶数帧，`4` 每 16 帧，`5` 前 16 帧 |
| `COMM_TX_PARAM_FRAME_COUNT_ERROR_C` | 不注入 | `1` 重复，`2` 跳 2 帧，`3` 每 100 帧回退为 1 |
| `COMM_TX_PARAM_ENDIAN_ERROR_C` | 不注入 | `1` GT 输入反序数据正序化 |

`COMM_TX_PARAM_DATA_LINK_BREAK_C` 为 1bit 使能，`0` 表示不注入，`1` 表示链路断开注入。
