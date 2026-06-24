# comm_tx_block 遥控指令清单

## 来源

- 模块目录：`import/rtl_source/comm_tx_block/`
- 遥控包：`import/rtl_source/comm_tx_block/vars/comm_tx_ctrl_pkg.sv`
- module_id：`MODULE_ID_COMM_TX_C = 4'h7`
- 当前有效协议：正常参数配置和异常注入配置分为两个遥控帧；异常状态回显也单独分帧。

## Group 总表

| group | group_id | 参数个数 | 参数 id 范围 | 说明 |
| --- | --- | --- | --- | --- |
| `COMM_TX_CMD_GROUP_CFG_C` | `8'h10` | `GROUP_CFG_PARAM_COUNT_C = 8'd3` | `8'd0`..`8'd2` | 正常工作参数配置 |
| `COMM_TX_CMD_GROUP_FAULT_C` | `8'h11` | `GROUP_FAULT_PARAM_COUNT_C = 8'd11` | `8'd3`..`8'd13` | 异常注入参数配置 |
| `COMM_TX_CMD_GROUP_PULSE_RESET_C` | `8'h12` | `GROUP_RST_PARAM_COUNT_C = 8'd1` | `8'd14` | 通信发送复位脉冲 |
| `COMM_TX_CMD_GROUP_PULSE_CLEAR_C` | `8'h13` | `GROUP_CLR_PARAM_COUNT_C = 8'd1` | `8'd15` | 通信发送计数清零脉冲 |

## 参数总表

| 标准测试用例名称 | 参数名字 | 所属 group | 参数 id | 实现层参数名 | 实现层参数 id | 落地字段 | 位宽 | 默认值 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 发送速率选择 | `COMM_TX_PARAM_RATE_C` | `COMM_TX_CMD_GROUP_CFG_C` | `8'd0` | `COMM_TX_IMPL_RATE_C` | `8'd0` | `cfg_r.rate_sel` | `8 bit` | `RATE_SEL_2P5G_C` |
| 扰码使能 | `COMM_TX_PARAM_SCRAMBLE_C` | `COMM_TX_CMD_GROUP_CFG_C` | `8'd1` | `COMM_TX_IMPL_SCRAMBLE_C` | `8'd1` | `cfg_r.scramble_enable` | `1 bit` | `1'b1` |
| 编码类型选择 | `COMM_TX_PARAM_ENCODE_C` | `COMM_TX_CMD_GROUP_CFG_C` | `8'd2` | `COMM_TX_IMPL_ENCODE_C` | `8'd2` | `cfg_r.encode_sel` | `1 bit` | `COMM_TX_ENCODE_RS_C` |
| 空口通信误码注入 | `COMM_TX_PARAM_BER_INJECT_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd3` | `COMM_TX_IMPL_BER_INJECT_C` | `8'd3` | `cfg_r.ber_inject_mode` | `4 bit` | `COMM_TX_BER_INJECT_NONE_C` |
| CRC错误 | `COMM_TX_PARAM_CRC_ERROR_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd4` | `COMM_TX_IMPL_CRC_ERROR_C` | `8'd4` | `cfg_r.crc_error_inject` | `4 bit` | `COMM_TX_CRC_ERROR_NONE_C` |
| 帧头字段合法性检测 | `COMM_TX_PARAM_HEADER_ERROR_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd5` | `COMM_TX_IMPL_HEADER_ERROR_C` | `8'd5` | `cfg_r.header_error_inject` | `4 bit` | `COMM_TX_HEADER_ERROR_NONE_C` |
| 标志域与数据域一致性检测 | `COMM_TX_PARAM_DATA_TYPE_ERROR_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd6` | `COMM_TX_IMPL_DATA_TYPE_ERROR_C` | `8'd6` | `cfg_r.data_type_error_inject` | `4 bit` | `COMM_TX_DATA_TYPE_ERROR_NONE_C` |
| 帧头字段位置匹配检测 | `COMM_TX_PARAM_FIELD_POS_ERROR_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd7` | `COMM_TX_IMPL_FIELD_POS_ERROR_C` | `8'd7` | `cfg_r.field_pos_error_inject` | `4 bit` | `COMM_TX_FIELD_POS_ERROR_NONE_C` |
| 信道编解码错误 | `COMM_TX_PARAM_ENCODE_ERROR_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd8` | `COMM_TX_IMPL_ENCODE_ERROR_C` | `8'd8` | `cfg_r.encode_error_inject` | `4 bit` | `COMM_TX_ENCODE_ERROR_NONE_C` |
| 星间通信数据帧停发检测 | `COMM_TX_PARAM_DATA_LINK_BREAK_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd9` | `COMM_TX_IMPL_DATA_LINK_BREAK_C` | `8'd9` | `cfg_r.data_link_break_inject` | `1 bit` | `1'b0` |
| 帧类故障生效范围 | `COMM_TX_PARAM_FRAME_FAULT_SCOPE_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd10` | `COMM_TX_IMPL_FRAME_FAULT_SCOPE_C` | `8'd10` | `cfg_r.frame_fault_scope` | `4 bit` | `COMM_TX_FRAME_FAULT_SCOPE_NONE_C` |
| 帧计数连续性检测 | `COMM_TX_PARAM_FRAME_COUNT_ERROR_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd11` | `COMM_TX_IMPL_FRAME_COUNT_ERROR_C` | `8'd11` | `cfg_r.frame_count_error_inject` | `4 bit` | `COMM_TX_FRAME_COUNT_ERROR_NONE_C` |
| 数据域大小端错误 | `COMM_TX_PARAM_ENDIAN_ERROR_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd12` | `COMM_TX_IMPL_ENDIAN_ERROR_C` | `8'd12` | `cfg_r.endian_error_inject` | `4 bit` | `COMM_TX_ENDIAN_ERROR_NONE_C` |
| 星间光信号中断 | `COMM_TX_PARAM_OPTICAL_SIGNAL_INTERRUPT_C` | `COMM_TX_CMD_GROUP_FAULT_C` | `8'd13` | `COMM_TX_IMPL_OPTICAL_SIGNAL_INTERRUPT_C` | `8'd13` | `cfg_r.optical_signal_interrupt_inject` | `1 bit` | `1'b0` |
| 发送复位 | `COMM_TX_PARAM_RESET_C` | `COMM_TX_CMD_GROUP_PULSE_RESET_C` | `8'd14` | `COMM_TX_IMPL_RESET_C` | `8'd14` | `reset_pulse` | `1 cycle pulse` | 不触发 |
| 计数清零 | `COMM_TX_PARAM_COUNT_CLEAR_C` | `COMM_TX_CMD_GROUP_PULSE_CLEAR_C` | `8'd15` | `COMM_TX_IMPL_COUNT_CLEAR_C` | `8'd15` | `count_clear_pulse` | `1 cycle pulse` | 不触发 |

## 取值说明

### 正常工作配置

| 参数 | 写入值 | 说明 |
| --- | --- | --- |
| `rate_sel` | `8'h00/01/02/03/04` | PSK 312M/625M/1.25G/2.5G/5G |
| `rate_sel` | `8'h80/A0/C0` | OOK 20M/10M/1M |
| `encode_sel` | `1'b0` | 选择 RS 编码链路 |
| `encode_sel` | `1'b1` | 选择 LDPC 编码链路 |

### 空口通信误码注入

`ber_inject_mode` 使用 4 bit 编码，标准分类为“每帧周期出错帧数量”乘以“一帧内出错数据拍类型”。当前 RTL 已覆盖完整 3x3 编码：少量按每 16 帧命中 1 帧，大量按每 4 帧命中 3 帧，随机按 PN/LFSR 低位决定本帧是否注入；突发模式每帧锁存 PN 产生的起点和小于 128 拍的突发长度。

| 编码 | 标准名称 | 含义 | 当前 RTL 覆盖 |
| --- | --- | --- | --- |
| `4'd0` | 不注入 | 不产生空口误码 | 已覆盖 |
| `4'd1` | 空口数据少量固定错误 | 每帧周期少量帧出错；帧内固定非连续偶数拍出错 | 已覆盖 |
| `4'd2` | 空口数据少量突发错误 | 每帧周期少量帧出错；帧内 PN 突发拍数小于 128 | 已覆盖 |
| `4'd3` | 空口数据少量连续错误 | 每帧周期少量帧出错；帧内前 100 拍连续出错 | 已覆盖 |
| `4'd4` | 空口数据大量固定错误 | 每帧周期大量帧出错；帧内固定非连续偶数拍出错 | 已覆盖 |
| `4'd5` | 空口数据大量突发错误 | 每帧周期大量帧出错；帧内 PN 突发拍数小于 128 | 已覆盖 |
| `4'd6` | 空口数据大量连续错误 | 每帧周期大量帧出错；帧内前 100 拍连续出错 | 已覆盖 |
| `4'd7` | 空口数据随机固定错误 | 每帧周期随机个帧出错；帧内固定非连续偶数拍出错 | 已覆盖 |
| `4'd8` | 空口数据随机突发错误 | 每帧周期随机个帧出错；帧内 PN 突发拍数小于 128 | 已覆盖 |
| `4'd9` | 空口数据随机连续错误 | 每帧周期随机个帧出错；帧内前 100 拍连续出错 | 已覆盖 |
| `4'd10~15` | 保留 | 软件默认不提供 | 待定义 |

### 异常注入

| 参数 | `0` | 已定义非零值 |
| --- | --- | --- |
| `crc_error_inject` | 不注入 | `1` CRC 错误 |
| `header_error_inject` | 不注入 | `1` 帧头 1ACFFC1D 轻度 1bit 错误，`2` 中度 4bit 错误，`3` 反序/全反，`4` 大量错误，第 1/3 字节错误 |
| `data_type_error_inject` | 不注入 | `1` 标志域空口与有效数据错误填写 |
| `field_pos_error_inject` | 不注入 | `1` 帧头位置与内部字段交换位置，当前按帧头插入第二拍实现 |
| `encode_error_inject` | 不注入 | `1` 强制 RS，`2` 强制 LDPC，`3` RS/LDPC 选择取反 |
| `data_link_break_inject` | 不注入 | `1` 星间通信数据帧时停时发/断链注入，当前发送 `5A5A_5A5A` |
| `frame_fault_scope` | 不对帧类异常生效 | `1` 全部帧，`2` 奇数帧，`3` 偶数帧，`4` 每 16 帧，`5` 前 16 帧 |
| `frame_count_error_inject` | 不注入 | `1` 帧计数重复，`2` 帧计数跳变 2 帧，`3` 每 100 帧回退为 1 |
| `endian_error_inject` | 不注入 | `1` 数据域大小端错误，将输入 GT 的反序数据正序化 |
| `optical_signal_interrupt_inject` | 不注入 | `1` 星间光信号中断，跨到激光控制 40 MHz 域后强制发送激光器 `txm_on` 选择为 `0` |

除数据域大小端错误、帧头位置错误、星间通信数据帧停发/断链、星间光信号中断外，其余涉及帧内容的异常均由 `frame_fault_scope` 控制作用帧范围。
