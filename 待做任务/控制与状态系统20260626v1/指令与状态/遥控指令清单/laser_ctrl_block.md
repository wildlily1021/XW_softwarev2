# laser_ctrl_block A/B通用遥控指令清单

## 来源

- 通用包：`D:/vivado_project/CZW/CZW_V7_runner_201803/repo_main/import/rtl_source/laser_ctrl_block/vars/laser_ctrl_ctrl_pkg.sv`
- 通用遥控 agent：`D:/vivado_project/CZW/CZW_V7_runner_201803/repo_main/import/rtl_source/laser_ctrl_block/ctrl_tm/laser_ctrl_cmd_agent.sv`
- 参数落地：`D:/vivado_project/CZW/CZW_V7_runner_201803/repo_main/import/rtl_source/laser_ctrl_block/ctrl_tm/laser_ctrl_param_sink.sv`
- module_id：`MODULE_ID_LASER_CTRL_C = 4'h4`

## A/B边界

A/B 版本共用主机侧遥控协议和 `ctrl_tm` agent。A/B 仍然是不同的激光器控制实现版本，差异保留在各自 `laser_ctrl_impl_a.sv`、`laser_ctrl_impl_b.sv` 以及 gdian 实现层。

主机侧不再暴露四个激光器手动温度设置命令：`txm1_set`、`txm2_set`、`lo1_set`、`lo2_set`。发射激光器 `TXM1_set/TXM2_set` 在 RTL 内固定为 `16'h8000`；本振 `LO1_set/LO2_set` 在扫频/卸载接管时由扫频模块给出，未接管时固定为 `16'h8000`。

原有多普勒功能开关和预报多普勒值不再作为主机遥控项。本轮只新增两个主机遥控：扫频使能、卸载使能。

## 有效遥控组

| group | group_id | 参数 | 参数id | 落地字段 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `LASER_CTRL_CMD_GROUP_TXM_ON_C` | `8'h10` | `LASER_PARAM_TXM_ON_C` | `8'd0` | `cfg_r.txm_on` | 发射激光器开关 |
| `LASER_CTRL_CMD_GROUP_LO_ON_C` | `8'h11` | `LASER_PARAM_LO_ON_C` | `8'd1` | `cfg_r.lo_on` | 本振激光器开关 |
| `LASER_CTRL_CMD_GROUP_WAVE_SET_ON_C` | `8'h12` | `LASER_PARAM_WAVE_SET_ON_C` | `8'd2` | `cfg_r.wave_set_on` | 参数包/外部 set 路径请求；参数包恢复和扫频接管时 RTL 会覆盖实际有效值 |
| `LASER_CTRL_CMD_GROUP_TEC_ON1_C` | `8'h13` | `LASER_PARAM_TEC_ON1_C` | `8'd3` | `cfg_r.tec_on1` | TEC1 开关 |
| `LASER_CTRL_CMD_GROUP_TEC_ON2_C` | `8'h14` | `LASER_PARAM_TEC_ON2_C` | `8'd4` | `cfg_r.tec_on2` | TEC2 开关 |
| `LASER_CTRL_CMD_GROUP_MODU_MODE_C` | `8'h15` | `LASER_PARAM_MODU_MODE_C` | `8'd5` | `cfg_r.modu_mode` | 调制模式 |
| `LASER_CTRL_CMD_GROUP_VOL_AUTO_C` | `8'h16` | `LASER_PARAM_VOL_AUTO_C` | `8'd6` | `cfg_r.vol_auto` | 调制开始 |
| `LASER_CTRL_CMD_GROUP_FREQ_SCAN_EN_C` | `8'h30` | `LASER_PARAM_FREQ_SCAN_EN_C` | `8'd7` | `cfg_r.freq_scan_en` | 本振扫频使能 |
| `LASER_CTRL_CMD_GROUP_FREQ_UNLOAD_EN_C` | `8'h31` | `LASER_PARAM_FREQ_UNLOAD_EN_C` | `8'd8` | `cfg_r.freq_unload_en` | 本振卸载使能 |

## 删除或不开放项

| 项 | A/B通用处理 |
| --- | --- |
| `TXM1_SET/TXM2_SET` 主机手动设温 | 删除遥控入口，RTL 固定默认值 |
| `LO1_SET/LO2_SET` 主机手动设温 | 删除遥控入口，由扫频/卸载模块接管或 RTL 固定默认值 |
| `doppler_on` | 不开放遥控，RTL 固定 `0` |
| `doppler_pre` | 不开放遥控，RTL 固定 `0` |
| 手动频率设置 | 本轮不启用，RTL `manual_en_i` 固定 `0` |
