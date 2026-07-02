# laser_ctrl_block A/B通用遥控指令具体执行

## 执行链路

1. 主机遥控帧进入 `top_ctrl_status_block` 后按 module_id 分发到 laser_ctrl。
2. `top_laser_ctrl_block_a/b` 通过 `fifo_axis_async_w32` 将命令从 200 MHz 控制域送入 40 MHz 激光控制域。
3. `laser_ctrl_cmd_agent` 使用 `laser_ctrl_ctrl_pkg` 中的命令表解析组号和参数。
4. `laser_ctrl_param_sink` 在 40 MHz 域把允许的参数写入 `cfg_r`。
5. `laser_ctrl_impl_a/b` 读取 `cmd_params_i.cfg.freq_scan_en/freq_unload_en`，作为各自扫频核心的用户使能。

## 新增命令

### 扫频使能

| 字段 | 内容 |
| --- | --- |
| group | `LASER_CTRL_CMD_GROUP_FREQ_SCAN_EN_C` |
| group_id | `8'h30` |
| 参数 | `LASER_PARAM_FREQ_SCAN_EN_C` |
| 参数id | `8'd19` |
| payload | `bit0=1` 开启扫频，`bit0=0` 关闭扫频 |
| 落地寄存器 | `laser_ctrl_param_sink.cfg_r.freq_scan_en` |
| 生效位置 | `laser_ctrl_impl_a/b.freq_scan_user_en_w` |

### 卸载使能

| 字段 | 内容 |
| --- | --- |
| group | `LASER_CTRL_CMD_GROUP_FREQ_UNLOAD_EN_C` |
| group_id | `8'h31` |
| 参数 | `LASER_PARAM_FREQ_UNLOAD_EN_C` |
| 参数id | `8'd20` |
| payload | `bit0=1` 开启卸载，`bit0=0` 关闭卸载 |
| 落地寄存器 | `laser_ctrl_param_sink.cfg_r.freq_unload_en` |
| 生效位置 | `laser_ctrl_impl_a/b.freq_unload_user_en_w` |

## 启动门槛

扫频/卸载不是遥控位写入后立即无条件动作。`laser_ctrl_impl_a/b` 会要求：

- gdian 参数包校验 OK：A 版为 `yc_m195_jz_ok_w=1`，B 版为 `flag_laser_jiaoyan_w=1`。
- 当前本振对应温度稳定：`lo_scan_10s_stable_w=1`。
- 已捕获本套硬件基准：`freq_baseline_ready_r=1`。
- 不处于参数包恢复阶段：`laser_param_recover_r=0`。
- 激光时钟锁定且 40 MHz 未复位。

若请求被禁止，`last_fault_reason` 会记录最近一次禁止原因。

## 删除项说明

`TXM1_SET/TXM2_SET/LO1_SET/LO2_SET` 四个主机手动设温命令在通用 `CMD_GROUP_TABLE_C`、`CMD_PARAM_TABLE_C`、`ACTION_TABLE_C` 中均不存在，`laser_ctrl_param_sink` 也没有这些写分支。即使上位机误发旧 group，当前 A/B 通用协议不会把它落地成温度设定。
