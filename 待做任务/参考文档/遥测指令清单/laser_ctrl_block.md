# laser_ctrl_block 遥测指令清单

## 来源

- 遥测 agent：`D:/vivado_project/CZW/CZW_V7_runner_201803/repo_main/import/rtl_source/laser_ctrl_block/ctrl_tm/laser_ctrl_tm_agent.sv`
- module_id：`MODULE_ID_LASER_CTRL_C = 4'h4`

## Group 总表

### TM_GROUP_RUNTIME_C

| 上报字索引 | 关联字段 | 字段中文名 | 来源表达式 | 字段真实位宽 |
| --- | --- | --- | --- | --- |
| [TM_GROUP_RUNTIME_C_WORD_0](#tm_group_runtime_c_word_0) | `txm1_t_m_out` | 发射1温度 | `{16'h0000, stat_i.txm1_t_m_out}` | `16 bit` |
| [TM_GROUP_RUNTIME_C_WORD_1](#tm_group_runtime_c_word_1) | `txm1_c_m_out` | 发射1状态参数 | `{16'h0000, stat_i.txm1_c_m_out}` | `16 bit` |
| [TM_GROUP_RUNTIME_C_WORD_2](#tm_group_runtime_c_word_2) | `lo1_t_m_out` | 本振1温度 | `{16'h0000, stat_i.lo1_t_m_out}` | `16 bit` |
| [TM_GROUP_RUNTIME_C_WORD_3](#tm_group_runtime_c_word_3) | `lo1_c_m_out` | 本振1状态参数 | `{16'h0000, stat_i.lo1_c_m_out}` | `16 bit` |
| [TM_GROUP_RUNTIME_C_WORD_4](#tm_group_runtime_c_word_4) | `tec1_t_m_out` | TEC1温度 | `{16'h0000, stat_i.tec1_t_m_out}` | `16 bit` |
| [TM_GROUP_RUNTIME_C_WORD_5](#tm_group_runtime_c_word_5) | `tec1_c_2v5_m_out` | TEC1状态参数 | `{16'h0000, stat_i.tec1_c_2v5_m_out}` | `16 bit` |
| [TM_GROUP_RUNTIME_C_WORD_6](#tm_group_runtime_c_word_6) | `mod_pd_yc_out` | 调制器状态参数1 | `{16'h0000, stat_i.mod_pd_yc_out}` | `16 bit` |
| [TM_GROUP_RUNTIME_C_WORD_7](#tm_group_runtime_c_word_7) | `hmc_mod_pd_yc_out` | 调制器状态参数2 | `{16'h0000, stat_i.hmc_mod_pd_yc_out}` | `16 bit` |
| [TM_GROUP_RUNTIME_C_WORD_8](#tm_group_runtime_c_word_8) | `txm2_t_m_out` | 发射2温度 | `{16'h0000, stat_i.txm2_t_m_out}` | `16 bit` |
| [TM_GROUP_RUNTIME_C_WORD_9](#tm_group_runtime_c_word_9) | `txm2_c_m_out` | 发射2状态参数 | `{16'h0000, stat_i.txm2_c_m_out}` | `16 bit` |
| [TM_GROUP_RUNTIME_C_WORD_10](#tm_group_runtime_c_word_10) | `lo2_t_m_out` | 本振2温度 | `{16'h0000, stat_i.lo2_t_m_out}` | `16 bit` |
| [TM_GROUP_RUNTIME_C_WORD_11](#tm_group_runtime_c_word_11) | `lo2_c_m_out` | 本振2状态参数 | `{16'h0000, stat_i.lo2_c_m_out}` | `16 bit` |
| [TM_GROUP_RUNTIME_C_WORD_12](#tm_group_runtime_c_word_12) | `tec2_t_m_out` | TEC2温度 | `{16'h0000, stat_i.tec2_t_m_out}` | `16 bit` |
| [TM_GROUP_RUNTIME_C_WORD_13](#tm_group_runtime_c_word_13) | `tec2_c_2v5_m_out` | TEC2状态参数 | `{16'h0000, stat_i.tec2_c_2v5_m_out}` | `16 bit` |

### TM_GROUP_CFG_C

| 上报字索引 | 关联字段 | 字段中文名 | 来源表达式 | 字段真实位宽 |
| --- | --- | --- | --- | --- |
| [TM_GROUP_CFG_C_WORD_20](#tm_group_cfg_c_word_20) | 无直接字段引用 | 无直接字段引用 | `32'd0` | 无直接字段引用 |

## 上报字说明表

### TM_GROUP_RUNTIME_C_WORD_0

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `0` |
| 来源表达式 | `{16'h0000, stat_i.txm1_t_m_out}` |
| 关联字段 | `txm1_t_m_out` |
| 字段中文名 | 发射1温度 |
| 字段真实位宽 | `16 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_1

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `1` |
| 来源表达式 | `{16'h0000, stat_i.txm1_c_m_out}` |
| 关联字段 | `txm1_c_m_out` |
| 字段中文名 | 发射1状态参数 |
| 字段真实位宽 | `16 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_2

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `2` |
| 来源表达式 | `{16'h0000, stat_i.lo1_t_m_out}` |
| 关联字段 | `lo1_t_m_out` |
| 字段中文名 | 本振1温度 |
| 字段真实位宽 | `16 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_3

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `3` |
| 来源表达式 | `{16'h0000, stat_i.lo1_c_m_out}` |
| 关联字段 | `lo1_c_m_out` |
| 字段中文名 | 本振1状态参数 |
| 字段真实位宽 | `16 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_4

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `4` |
| 来源表达式 | `{16'h0000, stat_i.tec1_t_m_out}` |
| 关联字段 | `tec1_t_m_out` |
| 字段中文名 | TEC1温度 |
| 字段真实位宽 | `16 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_5

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `5` |
| 来源表达式 | `{16'h0000, stat_i.tec1_c_2v5_m_out}` |
| 关联字段 | `tec1_c_2v5_m_out` |
| 字段中文名 | TEC1状态参数 |
| 字段真实位宽 | `16 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_6

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `6` |
| 来源表达式 | `{16'h0000, stat_i.mod_pd_yc_out}` |
| 关联字段 | `mod_pd_yc_out` |
| 字段中文名 | 调制器状态参数1 |
| 字段真实位宽 | `16 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_7

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `7` |
| 来源表达式 | `{16'h0000, stat_i.hmc_mod_pd_yc_out}` |
| 关联字段 | `hmc_mod_pd_yc_out` |
| 字段中文名 | 调制器状态参数2 |
| 字段真实位宽 | `16 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_8

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `8` |
| 来源表达式 | `{16'h0000, stat_i.txm2_t_m_out}` |
| 关联字段 | `txm2_t_m_out` |
| 字段中文名 | 发射2温度 |
| 字段真实位宽 | `16 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_9

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `9` |
| 来源表达式 | `{16'h0000, stat_i.txm2_c_m_out}` |
| 关联字段 | `txm2_c_m_out` |
| 字段中文名 | 发射2状态参数 |
| 字段真实位宽 | `16 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_10

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `10` |
| 来源表达式 | `{16'h0000, stat_i.lo2_t_m_out}` |
| 关联字段 | `lo2_t_m_out` |
| 字段中文名 | 本振2温度 |
| 字段真实位宽 | `16 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_11

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `11` |
| 来源表达式 | `{16'h0000, stat_i.lo2_c_m_out}` |
| 关联字段 | `lo2_c_m_out` |
| 字段中文名 | 本振2状态参数 |
| 字段真实位宽 | `16 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_12

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `12` |
| 来源表达式 | `{16'h0000, stat_i.tec2_t_m_out}` |
| 关联字段 | `tec2_t_m_out` |
| 字段中文名 | TEC2温度 |
| 字段真实位宽 | `16 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_RUNTIME_C_WORD_13

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_RUNTIME_C` |
| group_id | `8'h80` |
| 上报字索引 | `13` |
| 来源表达式 | `{16'h0000, stat_i.tec2_c_2v5_m_out}` |
| 关联字段 | `tec2_c_2v5_m_out` |
| 字段中文名 | TEC2状态参数 |
| 字段真实位宽 | `16 bit` |
| 应用层上报字位宽 | `32 bit` |

### TM_GROUP_CFG_C_WORD_20

| 字段 | 内容 |
| --- | --- |
| 所属group | `TM_GROUP_CFG_C` |
| group_id | `8'h81` |
| 上报字索引 | `20` |
| 来源表达式 | `32'd0` |
| 关联字段 | 无直接字段引用 |
| 字段中文名 | 无直接字段引用 |
| 字段真实位宽 | 无直接字段引用 |
| 应用层上报字位宽 | `32 bit` |
