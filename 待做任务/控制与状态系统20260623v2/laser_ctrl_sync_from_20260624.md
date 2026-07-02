# 激光器部分同步修改说明

## 说明

本次将 `待做任务/指令与状态系统20260624v1` 中激光器 `laser_ctrl_block` 相关的遥测修改，同步到 `待做任务/控制与状态系统20260623v2`。

对比范围仅包含激光器部分：

- `UI字段定义/遥控字段定义/laser_ctrl_block.md`
- `UI字段定义/遥测字段定义/laser_ctrl_block.md`
- `指令与状态/遥控指令清单/laser_ctrl_block.md`
- `指令与状态/遥控指令具体执行/laser_ctrl_block.md`
- `指令与状态/遥测指令清单/laser_ctrl_block.md`
- `指令与状态/遥测状态具体执行/laser_ctrl_block.md`

## 对比结论

遥控相关 3 份文档内容一致，无需修改：

- `UI字段定义/遥控字段定义/laser_ctrl_block.md`
- `指令与状态/遥控指令清单/laser_ctrl_block.md`
- `指令与状态/遥控指令具体执行/laser_ctrl_block.md`

遥测相关 3 份文档存在差异，已按 `20260624v1` 同步更新：

- `UI字段定义/遥测字段定义/laser_ctrl_block.md`
- `指令与状态/遥测指令清单/laser_ctrl_block.md`
- `指令与状态/遥测状态具体执行/laser_ctrl_block.md`

## 实际修改内容

### 1. Runtime 遥测字数量调整

- 原 `TM_RUNTIME_WORDS_C = 23`
- 现 `TM_RUNTIME_WORDS_C = 24`

也就是在激光器 runtime 遥测组尾部新增了 1 个 word。

### 2. 新增遥测字段 `freq_scan_offset_code`

新增字段：

- 字段名：`freq_scan_offset_code`
- word 索引：`23`
- 数据类型：`16 bit` 有符号数

字段含义：

- 当前选中 LO 相对参数包基准的偏移码值
- 语义可理解为：`当前 set - 参数包基准`

### 3. 遥测状态具体执行增加打包表达式

在 `遥测状态具体执行/laser_ctrl_block.md` 中，新增：

```text
word 23 -> {{16{stat_i.freq_scan_offset_code[15]}}, stat_i.freq_scan_offset_code}
```

这表示该字段以 `16 bit` 二补码有符号数形式回传，并做符号扩展到 `32 bit` 遥测字。

### 4. UI 遥测字段定义同步增加显示项

在 `UI字段定义/遥测字段定义/laser_ctrl_block.md` 中，runtime 表新增：

- `freq_scan_offset_code`
- 显示位置：`word 23`
- 位宽：`word[15:0]`
- 类型：有符号数
- UI 类型：显示

## 已修改文件

- [laser_ctrl_block.md](/abs/path/D:/PythonProject/XW_softwarev2-main/XW_softwarev2-main/待做任务/控制与状态系统20260623v2/UI字段定义/遥测字段定义/laser_ctrl_block.md)
- [laser_ctrl_block.md](/abs/path/D:/PythonProject/XW_softwarev2-main/XW_softwarev2-main/待做任务/控制与状态系统20260623v2/指令与状态/遥测指令清单/laser_ctrl_block.md)
- [laser_ctrl_block.md](/abs/path/D:/PythonProject/XW_softwarev2-main/XW_softwarev2-main/待做任务/控制与状态系统20260623v2/指令与状态/遥测状态具体执行/laser_ctrl_block.md)

## 补充说明

本次同步未改动激光器遥控定义，也未扩展到非激光器模块。  
如果你后面希望我继续把 `20260624v1` 里其他模块也按同样方式同步到 `20260623v2`，我可以直接继续批量整理并生成总的差异说明。
