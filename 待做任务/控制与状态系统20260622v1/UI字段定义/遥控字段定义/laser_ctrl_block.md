# laser_ctrl_block A/B通用遥控 UI 字段定义

- module_id：`4'h4`
- 来源：`指令与状态/遥控指令清单/laser_ctrl_block.md`、`指令与状态/遥控指令具体执行/laser_ctrl_block.md`
- word 列表示遥控 payload 数据字索引。
- A/B 共用本遥控 UI 字段；A/B 的硬件实现差异不改变主机侧字段。

## 有效遥控字段

| group | group_id | 参数原始字段名 | UI显示名称 | word | 索引位宽 | 有符号/无符号 | UI类型 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `LASER_CTRL_CMD_GROUP_TXM_ON_C` | `8'h10` | `LASER_PARAM_TXM_ON_C` | 发射激光器开关 | `0` | `word[1:0]` | 无符号数 | 下拉栏 |
| `LASER_CTRL_CMD_GROUP_LO_ON_C` | `8'h11` | `LASER_PARAM_LO_ON_C` | 本振激光器开关 | `0` | `word[1:0]` | 无符号数 | 下拉栏 |
| `LASER_CTRL_CMD_GROUP_WAVE_SET_ON_C` | `8'h12` | `LASER_PARAM_WAVE_SET_ON_C` | 参数包/外部set请求 | `0` | `word[0]` | 无符号数 | 使能开关 |
| `LASER_CTRL_CMD_GROUP_TEC_ON1_C` | `8'h13` | `LASER_PARAM_TEC_ON1_C` | TEC1 开关 | `0` | `word[0]` | 无符号数 | 使能开关 |
| `LASER_CTRL_CMD_GROUP_TEC_ON2_C` | `8'h14` | `LASER_PARAM_TEC_ON2_C` | TEC2 开关 | `0` | `word[0]` | 无符号数 | 使能开关 |
| `LASER_CTRL_CMD_GROUP_MODU_MODE_C` | `8'h15` | `LASER_PARAM_MODU_MODE_C` | 调制模式 | `0` | `word[1:0]` | 无符号数 | 下拉栏 |
| `LASER_CTRL_CMD_GROUP_VOL_AUTO_C` | `8'h16` | `LASER_PARAM_VOL_AUTO_C` | 调制开始 | `0` | `word[0]` | 无符号数 | 使能开关 |
| `LASER_CTRL_CMD_GROUP_FREQ_SCAN_EN_C` | `8'h30` | `LASER_PARAM_FREQ_SCAN_EN_C` | 本振扫频使能 | `0` | `word[0]` | 无符号数 | 使能开关 |
| `LASER_CTRL_CMD_GROUP_FREQ_UNLOAD_EN_C` | `8'h31` | `LASER_PARAM_FREQ_UNLOAD_EN_C` | 本振卸载使能 | `0` | `word[0]` | 无符号数 | 使能开关 |

## 字段取值

### 发射激光器开关 `txm_on`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 关闭 | `2'b00` | TXM1/TXM2 均关闭 |
| TXM1 开 | `2'b01` | 打开 TXM1 |
| TXM2 开 | `2'b10` | 打开 TXM2 |

### 本振激光器开关 `lo_on`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 关闭 | `2'b00` | LO1/LO2 均关闭 |
| LO1 开 | `2'b01` | 打开 LO1 |
| LO2 开 | `2'b10` | 打开 LO2 |

### 参数包/外部set请求 `wave_set_on`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 参数包 | `1'b0` | 请求使用 gdian 内部参数包/默认温度路径 |
| 外部set | `1'b1` | 请求使用外部 set 路径；实际输出还受参数包恢复和 10s 温度稳定门控 |

### 调制模式 `modu_mode`

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| OOK | `2'd0` | 调制模式编码 OOK |
| BPSK | `2'd1` | 调制模式编码 BPSK |
| QPSK | `2'd2` | 调制模式编码 QPSK |

### 单 bit 使能项

`tec_on1`、`tec_on2`、`vol_auto`、`freq_scan_en`、`freq_unload_en` 均使用 `word[0]`：

| UI字段/选项 | 协议写入值 | 说明 |
| --- | --- | --- |
| 关闭/禁用 | `1'b0` | 对应功能关闭 |
| 开启/使能 | `1'b1` | 对应功能开启 |

## 不开放 UI 入口

| 旧字段 | 当前处理 |
| --- | --- |
| `TXM1_SET/TXM2_SET` | 不作为主机遥控，RTL 固定默认值 |
| `LO1_SET/LO2_SET` | 不作为主机遥控，由扫频/卸载模块接管或 RTL 固定默认值 |
| `doppler_on/doppler_pre` | 不作为主机遥控，RTL 固定关闭/0 |
| 手动频率设置 | 本轮不启用，RTL `manual_en_i` 固定 `0` |
