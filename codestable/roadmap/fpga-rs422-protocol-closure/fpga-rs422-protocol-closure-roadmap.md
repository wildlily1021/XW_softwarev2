---
doc_type: roadmap
slug: fpga-rs422-protocol-closure
status: active
created: 2026-06-09
last_reviewed: 2026-06-09
tags: [rewrite, fpga, rs422, protocol, transaction, northbound]
related_requirements: []
related_architecture: [rewrite-target-structure, rewrite-feature-boundaries, rewrite-feature-interaction-matrix]
---

# FPGA RS422 协议与北向闭环改造

## 1. 背景

当前 `2026-06-06-fpga-rs422-console` 已完成独立 FPGA RS422 控制台：页面、catalog、组帧、拆包、发送和遥测解析都已经落在 `rewrite/src/features/fpga-rs422/` 与 `FpgaRs422ConsolePage.vue` 中。它的直接合同明确要求该功能与 SCOE、northbound、result/report 无关，只作为借用上位机软件通过 RS422 给 FPGA 下发指令和解析遥测的 UI 工具。

本 roadmap 承接新的 `待做任务/遥控遥测20260609v2(1)` 文档与外部研究报告。新材料把“指令与状态”和“UI字段定义”拆成两套事实源，补充了中文 UI 名称、控件类型、枚举值、bit 截取、默认帧和遥测回传示例。当前代码仍存在 `catalog.ts` 中模块/指令组 `label: key` 的旧标签来源，且 `sendCommand()` 仍主要是 build + write，不能区分“串口写成功”和“FPGA 执行已确认”。

本 roadmap 的目标是把 FPGA RS422 从“可手工调试的控制台”推进到“可追踪、可测试、可观测、可被 northbound 编排消费的协议闭环”。这里的 northbound 只作为外部协同边界，不把甲方 schema、任务语义或报告交付语义写进 FPGA feature。

## 2. 范围与明确不做

### 本 roadmap 覆盖

- 以 `待做任务/遥控遥测20260609v2(1)` 为最新定义源，建立可追溯的 FPGA RS422 命令/遥测注册表。
- 用注册表替换当前 `label: key` 的 UI 名称来源，并按 UI 字段定义渲染下拉栏、使能开关、数值填写和触发按钮。
- 建立每个模块/命令组的黄金帧 fixture，覆盖组帧、checksum、payload 顺序、bit 截取、遥测拆包和噪声/半帧恢复。
- 在 `fpga-rs422` feature 内增加命令事务服务，把 write outcome 与 execution outcome 分开，提供 reqId、attempt、timeout、retry、expected telemetry 和结果状态。
- 提供 bounded recent frame / transaction read model，供页面、调试和后续 northbound bridge 读取。
- 在 northbound 与 fpga-rs422 之间定义内部桥接端口，使外部任务或控制命令在甲方语义已确认后可调用 FPGA command transaction。

### 明确不做

- 不把 `待做任务/遥控遥测20260609v2(1)` 里的“待确认”枚举、字段或时序写成长期协议。
- 不无版本地把现有 checksum 改成 CRC；CRC 只作为未来协议版本观察项。
- 不把 FPGA RS422 命令写进 Electron main；main 只保留平台 I/O、缓冲、队列和背压。
- 不让页面直接拥有协议事务、任务状态机、串口或网络访问。
- 不把旧 generic frame asset list 作为 FPGA 协议事实源。
- 不重写现有 northbound task/result/report schema，不实现 FTP/HTTP 报告交付闭环。
- 不声明真实 FPGA 硬件、打包态、HTTP/FTP 或甲方闭环已完成；这些只能在对应环境验证后声明。

## 3. 模块拆分（概设）

```text
fpga-rs422-protocol-closure
├── 定义注册表：20260609 文档 → module/group/param/telemetry/UI/golden frame
├── 控制台 UI：中文名、控件类型、参数编辑、帧预览和发送结果展示
├── 南向事务服务：build/write/observe/timeout/retry/trace
├── 观测与故障注入：recent frames、transaction log、噪声/半帧/timeout fixture
└── 北向内部桥：northbound translator/task step → FPGA command transaction port
```

### 模块 A · 定义注册表

- **职责**：承载 FPGA RS422 的最新命令、遥测和 UI 元数据。每条 module/group/param/field 都带来源路径，便于回查文档。它只表达协议定义，不执行串口 I/O。
- **承载的子 feature**：`fpga-rs422-20260609-registry`
- **触碰的现有代码 / 模块**：`rewrite/src/features/fpga-rs422/core/catalog.ts`、`protocol.ts`、fixtures/tests；必要时新增 `registry.ts` 或 `command-registry.generated.ts`。

### 模块 B · 控制台 UI

- **职责**：把注册表投影成用户可操作界面：中文模块名/指令名、按控件类型渲染参数、显示 payload/bytes/解释/错误。UI 只调用公开 service，不承载协议计算和事务状态机。
- **承载的子 feature**：`fpga-rs422-ui-registry-refresh`
- **触碰的现有代码 / 模块**：`rewrite/src/pages/FpgaRs422ConsolePage.vue`、`rewrite/src/features/fpga-rs422/services/`、feature components/composables。

### 模块 C · 南向事务服务

- **职责**：将“发送一帧”升级为“执行一条可追踪命令”。它拥有 pending command、attempt、timeout、retry、expected telemetry、结果分类和事务 read model。它不拥有 northbound 对外语义，也不定义 report/result。
- **承载的子 feature**：`fpga-rs422-transaction-service`
- **触碰的现有代码 / 模块**：`rewrite/src/features/fpga-rs422/services/fpga-rs422-service.ts`、新增 transaction service/state、与 connection public API 的写入和读帧输入。

### 模块 D · 观测与故障注入

- **职责**：提供 bounded recent frames、transaction log、解析/噪声/半帧/timeout/retry 的 fixture 与测试入口。它服务于 UI 调试和后续验收，不替代真实硬件验证。
- **承载的子 feature**：`fpga-rs422-observability-fixtures`
- **触碰的现有代码 / 模块**：`features/fpga-rs422/fixtures`、tests、state/selectors、页面日志展示。

### 模块 E · 北向内部桥

- **职责**：在 northbound 已确认外部语义后，将 northbound 内部命令或 task step 翻译成 `FpgaCommandExecutionRequest`。它只做边界转换和调用，不把客户字段写进 `fpga-rs422` core。
- **承载的子 feature**：`fpga-rs422-northbound-bridge`
- **触碰的现有代码 / 模块**：`rewrite/src/features/northbound/` translator/service 或 runtime wiring；`fpga-rs422` 只暴露 command transaction port。

## 4. 模块间接口契约 / 共享协议（架构层详设）

### 4.1 FPGA RS422 定义注册表

**方向**：定义注册表 → UI / command builder / telemetry parser / transaction service
**形式**：feature 内 selector + pure data constants

```typescript
interface FpgaRs422Registry {
  readonly version: '20260609v2';
  readonly sourceRoot: string;
  readonly modules: readonly FpgaRs422ModuleSpec[];
  readonly goldenFrames: readonly FpgaRs422GoldenFrame[];
}

interface FpgaRs422ModuleSpec {
  readonly key: string;
  readonly label: string;
  readonly moduleId: number;
  readonly sourceRefs: readonly string[];
  readonly commandGroups: readonly FpgaCommandGroupSpec[];
  readonly telemetryGroups: readonly FpgaTelemetryGroupSpec[];
}

interface FpgaCommandGroupSpec {
  readonly key: string;
  readonly label: string;
  readonly groupId: number;
  readonly params: readonly FpgaCommandParamSpec[];
  readonly expectedTelemetry?: FpgaTelemetryExpectation;
  readonly sourceRefs: readonly string[];
}

type FpgaUiControlKind = 'select' | 'switch' | 'number' | 'trigger';

interface FpgaCommandParamSpec {
  readonly key: string;
  readonly label: string;
  readonly wordIndex: number | null;
  readonly bitRange: string;
  readonly signed: boolean;
  readonly control: FpgaUiControlKind;
  readonly bitWidth: number;
  readonly defaultValue: number;
  readonly options?: readonly { readonly label: string; readonly value: number; readonly note?: string }[];
  readonly sourceRefs: readonly string[];
}
```

**约束**：

- `label` 必须来自 `UI字段定义/` 或显式标记“待确认”，不得再默认等于 `key`。
- `groupId`、`moduleId`、payload 顺序、默认帧和 checksum 以 `指令与状态/` 为准。
- registry selector 返回只读快照，不返回内部可变引用。
- 当前阶段可手工维护或生成 TypeScript 常量；若新增生成脚本，脚本输出必须可 review，不读取运行时外部路径。

### 4.2 Command build / telemetry parse

**方向**：registry → fpga-rs422 core
**形式**：纯函数

```typescript
interface BuildFpgaCommandFrameRequest {
  readonly registryVersion?: '20260609v2';
  readonly moduleKey: string;
  readonly groupKey: string;
  readonly values: Readonly<Record<string, number | boolean | string>>;
}

interface FpgaCommandBuildResult {
  readonly valid: boolean;
  readonly bytes: readonly number[];
  readonly frameWords: readonly number[];
  readonly payloadWords: readonly number[];
  readonly checksum: number;
  readonly issues: readonly ValidationIssue[];
}

function buildFpgaCommandFrame(request: BuildFpgaCommandFrameRequest): FpgaCommandBuildResult;
function splitFpgaRs422FramesFromStream(bytes: readonly number[]): FpgaRs422StreamSplitResult;
function parseFpgaTelemetryFrame(bytes: readonly number[], registry: FpgaRs422Registry): FpgaTelemetryParseResult;
```

**约束**：

- checksum、payload length 和 high-byte-first word order 继续兼容当前 `protocol.ts` 与默认帧示例。
- 输入值超过 bitWidth 时必须 validation-error，不能截断后静默发送，除非对应 UI 文档明确要求“写入前截断”且测试覆盖该行为。
- pulse/trigger 命令不得保持开关状态；发送该 group 后立即结束 UI 操作态。

### 4.3 南向命令事务端口

**方向**：UI / northbound bridge / tests → fpga-rs422 transaction service → connection writer + telemetry observer
**形式**：public service

```typescript
type FpgaCommandExecutionSource = 'ui' | 'northbound' | 'test';

interface FpgaCommandExecutionPolicy {
  readonly timeoutMs: number;
  readonly maxRetries: number;
  readonly interFrameGapMs: number;
}

interface FpgaTelemetryExpectation {
  readonly moduleKey: string;
  readonly groupKey: string;
}

interface FpgaCommandExecutionRequest {
  readonly reqId?: string;
  readonly source: FpgaCommandExecutionSource;
  readonly connectionId: string;
  readonly moduleKey: string;
  readonly groupKey: string;
  readonly values: Readonly<Record<string, number | boolean | string>>;
  readonly policy?: Partial<FpgaCommandExecutionPolicy>;
  readonly expectedTelemetry?: FpgaTelemetryExpectation;
}

type FpgaCommandExecutionStatus =
  | 'validation-error'
  | 'transport-error'
  | 'sent-unconfirmed'
  | 'telemetry-observed'
  | 'timeout'
  | 'cancelled';

interface FpgaCommandExecutionResult {
  readonly reqId: string;
  readonly status: FpgaCommandExecutionStatus;
  readonly attempts: number;
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly sentFrame?: FpgaCommandBuildResult;
  readonly matchedTelemetry?: FpgaTelemetryParseResult;
  readonly issues: readonly ValidationIssue[];
}

interface FpgaRs422TransactionService {
  executeCommand(request: FpgaCommandExecutionRequest): Promise<FpgaCommandExecutionResult>;
  ingestTelemetryFrame(frame: FpgaTelemetryParseResult): void;
  getTransactionSnapshot(): FpgaTransactionSnapshot;
}
```

**约束**：

- `sent-unconfirmed` 表示串口写入成功但没有执行确认，不得在 UI/northbound 文案里说成“FPGA 执行成功”。
- 没有 ACK 协议字段确认前，不新增 `acknowledged` 状态。
- `expectedTelemetry` 命中时才可返回 `telemetry-observed`。
- default policy 可在 feature design 中定初值，但必须可配置或可注入，不能写成硬协议。
- service 依赖通过工厂函数注入 fake writer / fake clock / fake telemetry source，便于 Vitest。

### 4.4 Parsed frame stream 与观测 read model

**方向**：connection/runtime raw bytes → fpga-rs422 parser → transaction service / UI snapshot
**形式**：显式 ingest + selector

```typescript
interface FpgaRecentFrameLogEntry {
  readonly id: string;
  readonly connectionId: string;
  readonly receivedAt: string;
  readonly rawHex: string;
  readonly parseResult: FpgaTelemetryParseResult;
}

interface FpgaTransactionLogEntry {
  readonly reqId: string;
  readonly source: FpgaCommandExecutionSource;
  readonly moduleKey: string;
  readonly groupKey: string;
  readonly status: FpgaCommandExecutionStatus;
  readonly attempts: number;
  readonly startedAt: string;
  readonly finishedAt?: string;
}

interface FpgaTransactionSnapshot {
  readonly pending: readonly FpgaTransactionLogEntry[];
  readonly recent: readonly FpgaTransactionLogEntry[];
  readonly recentFrames: readonly FpgaRecentFrameLogEntry[];
}
```

**约束**：

- recent list 必须有容量上限，默认上限在 feature design 中写明。
- 高频数据不得逐包推动 Vue 响应式；页面只消费节流后的 snapshot。
- runtime 只路由 bytes/frame，不承载 FPGA 协议语义。
- selector 返回只读快照，消费方不得反向修改 feature state。

### 4.5 北向内部桥

**方向**：northbound translator / task step → fpga-rs422 transaction service
**形式**：runtime 装配 + public service call

```typescript
interface FpgaCommandBridgePort {
  executeFpgaCommand(request: FpgaCommandExecutionRequest): Promise<FpgaCommandExecutionResult>;
  getFpgaCommandSnapshot(): FpgaTransactionSnapshot;
}

interface NorthboundFpgaCommandInput {
  readonly reqId: string;
  readonly connectionId: string;
  readonly moduleKey: string;
  readonly groupKey: string;
  readonly values: Readonly<Record<string, number | boolean | string>>;
  readonly deadlineMs?: number;
}
```

**约束**：

- `NorthboundFpgaCommandInput` 是内部映射输入，不是甲方正式 schema。
- northbound 负责把客户请求或 task step 翻译成内部 input；`fpga-rs422` 不 import northbound 类型。
- 如果甲方命令字段、枚举、错误码尚未确认，对外响应只能标记为 blocked/deferred，不能写长期契约。
- northbound 的 result/report/file delivery 仍按既有 northbound/result/report 边界处理，不进入 FPGA feature。

## 5. 子 feature 清单

1. **fpga-rs422-20260609-registry** — 将 20260609 文档落成可追溯 registry，并补齐黄金帧 fixture
   - 所属模块：定义注册表
   - 依赖：无
   - 状态：planned
   - 对应 feature：未启动
   - 备注：必须处理所有“待确认/未标注”字段，不能发明中文名或枚举。

2. **fpga-rs422-ui-registry-refresh** — 控制台按 registry 显示中文模块/指令/参数和控件类型
   - 所属模块：控制台 UI
   - 依赖：`fpga-rs422-20260609-registry`
   - 状态：planned
   - 对应 feature：未启动
   - 备注：本条是最小闭环，完成后可演示“中文选择 → 按控件填值 → 构帧 → 串口写入 → trace 展示”。

3. **fpga-rs422-transaction-service** — 增加 reqId、pending、timeout、retry、expected telemetry 和结果分类
   - 所属模块：南向事务服务
   - 依赖：`fpga-rs422-20260609-registry`
   - 状态：planned
   - 对应 feature：未启动
   - 备注：不得把 `writer.write()` 成功称为执行成功；无确认机制时返回 `sent-unconfirmed`。

4. **fpga-rs422-observability-fixtures** — 增加 recent frame / transaction snapshot、故障注入和解析回归测试
   - 所属模块：观测与故障注入
   - 依赖：`fpga-rs422-20260609-registry`, `fpga-rs422-transaction-service`
   - 状态：planned
   - 对应 feature：未启动
   - 备注：覆盖粘包、半帧、噪声、bad checksum、unknown module/group、timeout/retry。

5. **fpga-rs422-northbound-bridge** — 在 northbound 与 FPGA transaction port 之间建立内部桥接
   - 所属模块：北向内部桥
   - 依赖：`fpga-rs422-transaction-service`, `fpga-rs422-observability-fixtures`
   - 状态：planned
   - 对应 feature：未启动
   - 备注：仅在 northbound 命令语义已确认后进入 design；甲方 schema 不确认则本项 blocked。

**最小闭环**：第 2 条 `fpga-rs422-ui-registry-refresh` 完成后，用户可在现有 FPGA RS422 控制台看到 20260609 中文定义，按文档控件填写参数，生成与黄金帧一致的字节流，并通过现有 connection 写入串口；此时仍只声明“静态/fixture/UI 手工闭环”，不声明 FPGA 执行成功。

## 6. 排期思路

先做 registry 是为了避免 UI、事务层和 northbound bridge 各自重新解释文档；registry 同时给黄金帧、UI 控件和 expectedTelemetry 提供单一事实源。

第二条刷新 UI 是最小用户价值：可以立即消除英文 raw key 和旧文档不一致问题，也能验证 registry 形状是否适合页面消费。

第三、四条再做事务和观测，是因为事务需要稳定的 registry 与 parser 作为输入；故障注入要覆盖事务边界，而不是只测 build/write。

最后才接 northbound bridge，因为 northbound 现有 feature 已有 task/result/HTTP MVP，且外部客户 schema、命令语义、错误码、报告交付仍不能由 FPGA feature 自行决定。

## 7. 观察项

- `codestable/compound/2026-05-07-runtime-next-phase-global-planning.md` 在当前工作区未命中；若后续补回，需要复核本 roadmap 是否与全局波次规划冲突。
- 当前 `connection-service.ts` 已有 `getReconnectStatus()` 实现；后续只需评估 transaction UI 是否消费该状态，不把它作为本 roadmap 的首要修复。
- 如果 20260609 默认帧与当前 `protocol.ts` 公式冲突，registry feature 必须 blocked 并回到协议事实确认。
- 若真实 FPGA 不提供 ACK，只能用 expected telemetry 做软确认；没有匹配遥测时，事务结果保持 `sent-unconfirmed` 或 `timeout`。
- northbound bridge 需要客户或上游 feature 确认命令入口形式。缺少正式 schema/枚举/错误码时，审查结论必须是 `blocked` 或 `pass-with-known-gaps`，不能 `pass`。

## 8. 变更日志

- 2026-06-09：根据外部研究报告、`待做任务/遥控遥测20260609v1(1)` 文档、现有 FPGA console design 和重写边界护栏初始起草。
- 2026-06-09：同步 `待做任务/遥控遥测20260609v2(1)` 为当前定义源，纳入 comm_rx `ook_lock_state` 以及 OOK/LDPC 选项说明增量。
