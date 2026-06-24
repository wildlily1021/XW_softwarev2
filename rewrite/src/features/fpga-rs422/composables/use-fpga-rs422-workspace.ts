import { computed, ref, watch } from 'vue';
import { useRewriteRuntime } from '@/app/rewriteRuntime';
import type { ConnectionSummary, TransportEventSnapshot } from '@/features/connection';
import {
  FPGA_RS422_CATALOG,
  type FpgaCommandBuildResult,
  type FpgaCommandParamDef,
  type FpgaTelemetryParseResult,
  parseFpgaTelemetryFrame,
  splitFpgaRs422FramesFromStream,
} from '../core';
import {
  createFpgaRs422Service,
  listFpgaCommandGroupOptions,
  listFpgaTelemetryGroupOptions,
  listFpgaModuleOptions,
  mapFpgaHeaderExplanationRows,
  mapFpgaParamExplanationRows,
  mapFpgaTelemetryFieldRows,
  mapFpgaWordRows,
  type SendFpgaCommandResult,
} from '../services';
import { useFpgaCommandDrafts } from './use-fpga-command-drafts';

const DEFAULT_COMMAND_MODULE_KEY = 'adc_rx_block';
const DEFAULT_TELEMETRY_MODULE_KEY = 'comm_rx_block';
const DEFAULT_TELEMETRY_GROUP_KEY = 'runtime';
const MAX_RECENT_TELEMETRY = 40;
const MAX_ACTIVITY_LOGS = 80;
const MAX_RAW_RECORDS = 80;

export interface FpgaWorkspaceTelemetryTrace {
  readonly id: string;
  readonly occurredAt: string;
  readonly connectionId: string;
  readonly result: FpgaTelemetryParseResult;
}

export interface FpgaWorkspaceActivityLog {
  readonly id: string;
  readonly tag: 'TX' | 'RX' | 'SYS' | 'WARN';
  readonly title: string;
  readonly detail: string;
  readonly occurredAt: string;
}

export interface FpgaWorkspaceRawRecord {
  readonly id: string;
  readonly tag: 'TX' | 'RX' | 'SYS';
  readonly content: string;
  readonly occurredAt: string;
}

export interface PreparedCommandFrame {
  readonly moduleKey: string;
  readonly groupKey: string;
  readonly build: FpgaCommandBuildResult;
  readonly paramValues: Record<string, number>;
  readonly occurredAt: string;
}

interface WorkspaceState {
  readonly moduleOptions: ReturnType<typeof listFpgaModuleOptions>;
  readonly commandModuleKey: ReturnType<typeof ref<string>>;
  readonly commandGroupKey: ReturnType<typeof ref<string>>;
  readonly telemetryModuleKey: ReturnType<typeof ref<string>>;
  readonly telemetryGroupKey: ReturnType<typeof ref<string>>;
  readonly selectedConnectionId: ReturnType<typeof ref<string | null>>;
  readonly connectionSummaries: ReturnType<typeof ref<readonly ConnectionSummary[]>>;
  readonly commandParamValues: ReturnType<typeof useFpgaCommandDrafts>['values'];
  readonly recentTelemetry: ReturnType<typeof ref<readonly FpgaWorkspaceTelemetryTrace[]>>;
  readonly activityLogs: ReturnType<typeof ref<readonly FpgaWorkspaceActivityLog[]>>;
  readonly rawRecords: ReturnType<typeof ref<readonly FpgaWorkspaceRawRecord[]>>;
  readonly preparedCommand: ReturnType<typeof ref<PreparedCommandFrame | null>>;
  readonly commandGroupOptions: ReturnType<typeof computed<readonly { readonly label: string; readonly value: string }[]>>;
  readonly commandGroup: ReturnType<typeof computed<typeof FPGA_RS422_CATALOG[number]['commandGroups'][number] | undefined>>;
  readonly telemetryGroupOptions: ReturnType<typeof computed<readonly { readonly label: string; readonly value: string }[]>>;
  readonly editableParams: ReturnType<typeof computed<readonly FpgaCommandParamDef[]>>;
  readonly pulseParams: ReturnType<typeof computed<readonly FpgaCommandParamDef[]>>;
  readonly serialConnectionOptions: ReturnType<typeof computed<readonly { readonly label: string; readonly value: string; readonly disable: boolean }[]>>;
  readonly buildResult: ReturnType<typeof computed<FpgaCommandBuildResult | null>>;
  readonly currentFrame: ReturnType<typeof computed<PreparedCommandFrame | null>>;
  readonly displayedTelemetry: ReturnType<typeof computed<readonly FpgaWorkspaceTelemetryTrace[]>>;
  readonly latestTelemetry: ReturnType<typeof computed<FpgaWorkspaceTelemetryTrace | null>>;
  readonly commandPayloadRows: ReturnType<typeof computed<ReturnType<typeof mapFpgaWordRows>>>;
  readonly commandHeaderRows: ReturnType<typeof computed<ReturnType<typeof mapFpgaHeaderExplanationRows>>>;
  readonly commandParamRows: ReturnType<typeof computed<ReturnType<typeof mapFpgaParamExplanationRows>>>;
  readonly framePayloadRows: ReturnType<typeof computed<ReturnType<typeof mapFpgaWordRows>>>;
  readonly latestTelemetryFieldRows: ReturnType<typeof computed<ReturnType<typeof mapFpgaTelemetryFieldRows>>>;
  readonly latestIssueMessages: ReturnType<typeof computed<readonly string[]>>;
  readonly pulseParamLabelsText: ReturnType<typeof computed<string>>;
  readonly commandActionLabel: ReturnType<typeof computed<string>>;
  readonly refreshConnections: () => void;
  readonly refreshTelemetry: () => void;
  readonly refreshAll: () => void;
  readonly setParamValue: (paramKey: string, value: string | number | null | boolean) => void;
  readonly getParamHint: (param: FpgaCommandParamDef) => string;
  readonly getSwitchLabel: (param: FpgaCommandParamDef) => string;
  readonly prepareCurrentFrame: () => FpgaCommandBuildResult | null;
  readonly sendCurrentCommand: () => Promise<SendFpgaCommandResult | null>;
  readonly resendPreparedCommand: () => Promise<SendFpgaCommandResult | null>;
  readonly sendQuickCommand: (moduleKey: string, groupKey: string) => Promise<SendFpgaCommandResult | null>;
  readonly clearLogs: () => void;
  readonly appendSystemLog: (title: string, detail: string) => void;
}

let workspace: WorkspaceState | null = null;

export function useFpgaRs422Workspace(): WorkspaceState {
  const runtime = useRewriteRuntime();
  if (!workspace) {
    workspace = createWorkspace(runtime.features.connectionService);
  }
  return workspace;
}

function createWorkspace(
  connectionService: ReturnType<typeof useRewriteRuntime>['features']['connectionService'],
): WorkspaceState {
  const fpgaService = createFpgaRs422Service({ writer: connectionService });
  const drafts = useFpgaCommandDrafts();
  const moduleOptions = listFpgaModuleOptions();

  const commandModuleKey = ref(resolveModuleKey(DEFAULT_COMMAND_MODULE_KEY, moduleOptions));
  const commandGroupKey = ref('');
  const telemetryModuleKey = ref(resolveModuleKey(DEFAULT_TELEMETRY_MODULE_KEY, moduleOptions));
  const telemetryGroupKey = ref(DEFAULT_TELEMETRY_GROUP_KEY);
  const selectedConnectionId = ref<string | null>(null);
  const connectionSummaries = ref<readonly ConnectionSummary[]>([]);
  const recentTelemetry = ref<readonly FpgaWorkspaceTelemetryTrace[]>([]);
  const activityLogs = ref<readonly FpgaWorkspaceActivityLog[]>([]);
  const rawRecords = ref<readonly FpgaWorkspaceRawRecord[]>([]);
  const preparedCommand = ref<PreparedCommandFrame | null>(null);

  const seenEventIds = new Set<string>();
  let pendingTelemetryBytes: number[] = [];
  let telemetrySeq = 0;
  let activitySeq = 0;
  let rawSeq = 0;

  const commandGroupOptions = computed(() => listFpgaCommandGroupOptions(commandModuleKey.value));

  const commandGroup = computed(() =>
    FPGA_RS422_CATALOG
      .find((moduleDef) => moduleDef.key === commandModuleKey.value)
      ?.commandGroups.find((group) => group.key === commandGroupKey.value),
  );

  const telemetryGroupOptions = computed(() =>
    listFpgaTelemetryGroupOptions(telemetryModuleKey.value),
  );

  const editableParams = computed<readonly FpgaCommandParamDef[]>(() =>
    commandGroup.value?.params.filter((param) => param.kind !== 'pulse') ?? [],
  );

  const pulseParams = computed<readonly FpgaCommandParamDef[]>(() =>
    commandGroup.value?.params.filter((param) => param.kind === 'pulse') ?? [],
  );

  const serialConnectionOptions = computed(() =>
    connectionSummaries.value
      .filter((summary) => summary.kind === 'serial')
      .map((summary) => ({
        label: `${summary.label} (${summary.lifecycle})`,
        value: summary.connectionId,
        disable: !summary.available,
      })),
  );

  const buildResult = computed(() => {
    if (!commandModuleKey.value || !commandGroupKey.value) {
      return null;
    }

    return fpgaService.buildCommand({
      moduleKey: commandModuleKey.value,
      groupKey: commandGroupKey.value,
      paramValues: drafts.values.value,
    });
  });

  const currentFrame = computed<PreparedCommandFrame | null>(() => {
    if (preparedCommand.value) {
      return preparedCommand.value;
    }

    if (!buildResult.value) {
      return null;
    }

    return {
      moduleKey: commandModuleKey.value,
      groupKey: commandGroupKey.value,
      build: buildResult.value,
      paramValues: cloneDraftValues(drafts.values.value),
      occurredAt: '',
    };
  });

  const displayedTelemetry = computed(() =>
    recentTelemetry.value.filter(
      (trace) =>
        trace.result.moduleKey === telemetryModuleKey.value
        && trace.result.groupKey === telemetryGroupKey.value,
    ),
  );

  const latestTelemetry = computed(() => displayedTelemetry.value[0] ?? null);
  const latestTelemetryFieldRows = computed(() =>
    latestTelemetry.value ? mapFpgaTelemetryFieldRows(latestTelemetry.value.result) : [],
  );
  const latestIssueMessages = computed(() => latestTelemetry.value?.result.issues.map((issue) => issue.message) ?? []);

  const commandPayloadRows = computed(() =>
    buildResult.value ? mapFpgaWordRows(buildResult.value.payloadWords.slice(1)) : [],
  );
  const commandHeaderRows = computed(() =>
    buildResult.value ? mapFpgaHeaderExplanationRows(buildResult.value.explanations.header) : [],
  );
  const commandParamRows = computed(() =>
    buildResult.value ? mapFpgaParamExplanationRows(buildResult.value.explanations.params) : [],
  );
  const framePayloadRows = computed(() =>
    currentFrame.value ? mapFpgaWordRows(currentFrame.value.build.payloadWords.slice(1)) : [],
  );

  const pulseParamLabelsText = computed(() =>
    pulseParams.value.map((param) => `${param.label} (${param.key})`).join(', '),
  );

  const commandActionLabel = computed(() => {
    if (pulseParams.value.length > 0 && editableParams.value.length === 0) {
      return pulseParams.value.length === 1 ? pulseParams.value[0]!.label : '触发';
    }
    return '生成并下发';
  });

  watch(
    commandModuleKey,
    (nextModuleKey) => {
      const nextOptions = listFpgaCommandGroupOptions(nextModuleKey);
      commandGroupKey.value = nextOptions[0]?.value ?? '';
    },
    { immediate: true },
  );

  watch(
    commandGroupKey,
    () => {
      drafts.loadDraft(commandModuleKey.value, commandGroupKey.value);
    },
    { immediate: true },
  );

  watch(
    telemetryModuleKey,
    (nextModuleKey) => {
      const nextOptions = listFpgaTelemetryGroupOptions(nextModuleKey);
      if (nextOptions.some((option) => option.value === telemetryGroupKey.value)) {
        return;
      }

      telemetryGroupKey.value = nextOptions[0]?.value ?? '';
    },
    { immediate: true },
  );

  function refreshConnections(): void {
    connectionSummaries.value = connectionService.listConnectionSummaries();

    if (selectedConnectionId.value && connectionSummaries.value.some((summary) => summary.connectionId === selectedConnectionId.value)) {
      return;
    }

    selectedConnectionId.value = connectionSummaries.value.find(
      (summary) => summary.kind === 'serial' && summary.available,
    )?.connectionId
      ?? connectionSummaries.value.find((summary) => summary.kind === 'serial')?.connectionId
      ?? null;
  }

  function refreshTelemetry(): void {
    const events = connectionService.listTransportEvents();
    const traces: FpgaWorkspaceTelemetryTrace[] = [];

    for (const event of events) {
      if (seenEventIds.has(event.id)) {
        continue;
      }

      seenEventIds.add(event.id);
      handleEvent(event, traces);
    }

    if (traces.length > 0) {
      recentTelemetry.value = [...traces.reverse(), ...recentTelemetry.value].slice(0, MAX_RECENT_TELEMETRY);
    }
  }

  function refreshAll(): void {
    refreshConnections();
    refreshTelemetry();
  }

  function handleEvent(event: TransportEventSnapshot, traces: FpgaWorkspaceTelemetryTrace[]): void {
    if (event.kind === 'connected') {
      appendActivity('SYS', '连接成功', `${event.connectionId} 已连接`, event.occurredAt);
      return;
    }

    if (event.kind === 'disconnected') {
      appendActivity('SYS', '连接断开', `${event.connectionId} 已断开`, event.occurredAt);
      return;
    }

    if (event.kind === 'error' || event.kind === 'write-failed') {
      const message = event.error?.message ?? '连接层返回错误';
      appendActivity('WARN', '串口异常', message, event.occurredAt);
      appendRaw('SYS', message, event.occurredAt);
      return;
    }

    if (isWriteAcceptedEvent(event)) {
      appendRaw('TX', formatByteStream(event.bytes), event.occurredAt);
      return;
    }

    if (!isDataEvent(event)) {
      return;
    }

    appendRaw('RX', formatByteStream(event.bytes), event.occurredAt);
    pendingTelemetryBytes = [...pendingTelemetryBytes, ...event.bytes];
    const split = splitFpgaRs422FramesFromStream(pendingTelemetryBytes);
    pendingTelemetryBytes = [...split.remainingBytes];

    for (const issue of split.issues) {
      appendActivity('WARN', '串口流同步告警', issue.message, event.occurredAt);
    }

    for (const frame of split.frames) {
      const result = parseFpgaTelemetryFrame(frame.bytes);
      traces.push({
        id: `fpga-tm-${telemetrySeq++}`,
        occurredAt: event.occurredAt,
        connectionId: event.connectionId,
        result,
      });
      appendActivity(
        result.valid ? 'RX' : 'WARN',
        result.valid ? '收到遥测' : '遥测解析异常',
        summarizeTelemetry(result),
        event.occurredAt,
      );
    }
  }

  function setParamValue(paramKey: string, value: string | number | null | boolean): void {
    drafts.setDraftValue(commandModuleKey.value, commandGroupKey.value, paramKey, value);
  }

  function getParamHint(param: FpgaCommandParamDef): string {
    const bitHint = param.bitRange ?? `${param.finalBitWidth} bit`;
    const selectedValue = Number(drafts.values.value[param.key] ?? param.defaultValue ?? 0);
    const note = param.options?.find((option) => option.value === selectedValue)?.note ?? '';
    return note ? `${param.key} · ${bitHint} · ${note}` : `${param.key} · ${bitHint}`;
  }

  function getSwitchLabel(param: FpgaCommandParamDef): string {
    const value = drafts.values.value[param.key] ?? 0;
    return param.options?.find((option) => option.value === value)?.label ?? (value === 0 ? '关闭/禁用' : '开启/使能');
  }

  function prepareCurrentFrame(): FpgaCommandBuildResult | null {
    if (!buildResult.value) {
      return null;
    }

    preparedCommand.value = {
      moduleKey: commandModuleKey.value,
      groupKey: commandGroupKey.value,
      build: buildResult.value,
      paramValues: cloneDraftValues(drafts.values.value),
      occurredAt: new Date().toISOString(),
    };
    appendActivity(
      'TX',
      '生成遥控帧',
      `${resolveCommandGroupLabel(commandModuleKey.value, commandGroupKey.value)}，${buildResult.value.bytes.length} Byte`,
      preparedCommand.value.occurredAt,
    );
    return buildResult.value;
  }

  async function sendCurrentCommand(): Promise<SendFpgaCommandResult | null> {
    if (!commandModuleKey.value || !commandGroupKey.value) {
      return null;
    }

    const result = await fpgaService.sendCommand({
      connectionId: selectedConnectionId.value ?? undefined,
      moduleKey: commandModuleKey.value,
      groupKey: commandGroupKey.value,
      paramValues: drafts.values.value,
    });
    afterSend(result, commandModuleKey.value, commandGroupKey.value, cloneDraftValues(drafts.values.value), buildResult.value, '下发送控');
    return result;
  }

  async function resendPreparedCommand(): Promise<SendFpgaCommandResult | null> {
    if (!preparedCommand.value) {
      return null;
    }

    const result = await fpgaService.sendCommand({
      connectionId: selectedConnectionId.value ?? undefined,
      moduleKey: preparedCommand.value.moduleKey,
      groupKey: preparedCommand.value.groupKey,
      paramValues: preparedCommand.value.paramValues,
    });
    afterSend(result, preparedCommand.value.moduleKey, preparedCommand.value.groupKey, preparedCommand.value.paramValues, preparedCommand.value.build, '重新发送');
    return result;
  }

  async function sendQuickCommand(moduleKey: string, groupKey: string): Promise<SendFpgaCommandResult | null> {
    const build = fpgaService.buildCommand({
      moduleKey,
      groupKey,
      paramValues: {},
    });
    const result = await fpgaService.sendCommand({
      connectionId: selectedConnectionId.value ?? undefined,
      moduleKey,
      groupKey,
      paramValues: {},
    });
    afterSend(result, moduleKey, groupKey, {}, build, resolveCommandGroupLabel(moduleKey, groupKey));
    return result;
  }

  function afterSend(
    result: SendFpgaCommandResult,
    moduleKey: string,
    groupKey: string,
    paramValues: Record<string, number>,
    build: FpgaCommandBuildResult | null,
    title: string,
  ): void {
    if (build?.valid) {
      preparedCommand.value = {
        moduleKey,
        groupKey,
        build,
        paramValues,
        occurredAt: result.timestamp,
      };
    }

    if (result.kind === 'sent') {
      appendActivity('TX', title, `${resolveCommandGroupLabel(moduleKey, groupKey)}，${result.bytesSent} Byte`, result.timestamp);
      return;
    }

    if (result.kind === 'transport-error') {
      appendActivity('WARN', `${title}失败`, result.error.message, result.timestamp);
      return;
    }

    appendActivity('WARN', `${title}失败`, result.issues.map((issue) => issue.message).join('；'), result.timestamp);
  }

  function appendActivity(
    tag: FpgaWorkspaceActivityLog['tag'],
    title: string,
    detail: string,
    occurredAt: string,
  ): void {
    activityLogs.value = [
      {
        id: `fpga-activity-${activitySeq++}`,
        tag,
        title,
        detail,
        occurredAt,
      },
      ...activityLogs.value,
    ].slice(0, MAX_ACTIVITY_LOGS);
  }

  function appendRaw(
    tag: FpgaWorkspaceRawRecord['tag'],
    content: string,
    occurredAt: string,
  ): void {
    rawRecords.value = [
      {
        id: `fpga-raw-${rawSeq++}`,
        tag,
        content,
        occurredAt,
      },
      ...rawRecords.value,
    ].slice(0, MAX_RAW_RECORDS);
  }

  function clearLogs(): void {
    activityLogs.value = [];
    rawRecords.value = [];
  }

  function appendSystemLog(title: string, detail: string): void {
    appendActivity('SYS', title, detail, new Date().toISOString());
  }

  return {
    moduleOptions,
    commandModuleKey,
    commandGroupKey,
    telemetryModuleKey,
    telemetryGroupKey,
    selectedConnectionId,
    connectionSummaries,
    commandParamValues: drafts.values,
    recentTelemetry,
    activityLogs,
    rawRecords,
    preparedCommand,
    commandGroupOptions,
    commandGroup,
    telemetryGroupOptions,
    editableParams,
    pulseParams,
    serialConnectionOptions,
    buildResult,
    currentFrame,
    displayedTelemetry,
    latestTelemetry,
    commandPayloadRows,
    commandHeaderRows,
    commandParamRows,
    framePayloadRows,
    latestTelemetryFieldRows,
    latestIssueMessages,
    pulseParamLabelsText,
    commandActionLabel,
    refreshConnections,
    refreshTelemetry,
    refreshAll,
    setParamValue,
    getParamHint,
    getSwitchLabel,
    prepareCurrentFrame,
    sendCurrentCommand,
    resendPreparedCommand,
    sendQuickCommand,
    clearLogs,
    appendSystemLog,
  };
}

function resolveModuleKey(
  preferredKey: string,
  options: readonly { readonly label: string; readonly value: string }[],
): string {
  return options.find((option) => option.value === preferredKey)?.value ?? options[0]?.value ?? '';
}

function resolveCommandGroupLabel(moduleKey: string, groupKey: string): string {
  return FPGA_RS422_CATALOG
    .find((moduleDef) => moduleDef.key === moduleKey)
    ?.commandGroups.find((group) => group.key === groupKey)
    ?.label ?? groupKey;
}

function cloneDraftValues(values: Readonly<Record<string, number | readonly number[]>>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, Array.isArray(value) ? Number(value[0] ?? 0) : Number(value ?? 0)]),
  );
}

function summarizeTelemetry(result: FpgaTelemetryParseResult): string {
  const moduleLabel = FPGA_RS422_CATALOG.find((moduleDef) => moduleDef.key === result.moduleKey)?.label ?? '未知模块';
  const groupLabel = FPGA_RS422_CATALOG
    .find((moduleDef) => moduleDef.key === result.moduleKey)
    ?.telemetryGroups.find((group) => group.key === result.groupKey)
    ?.label ?? '未知遥测';
  if (result.valid) {
    return `${moduleLabel} / ${groupLabel}`;
  }
  return `${moduleLabel} / ${groupLabel} · ${result.issues[0]?.message ?? '解析异常'}`;
}

function formatByteStream(bytes: readonly number[]): string {
  return bytes.map((byte) => (byte & 0xff).toString(16).toUpperCase().padStart(2, '0')).join(' ');
}

function isDataEvent(
  event: TransportEventSnapshot,
): event is TransportEventSnapshot & { readonly bytes: readonly number[] } {
  return event.kind === 'data' && Array.isArray(event.bytes) && event.bytes.length > 0;
}

function isWriteAcceptedEvent(
  event: TransportEventSnapshot,
): event is TransportEventSnapshot & { readonly bytes: readonly number[] } {
  return event.kind === 'write-accepted' && Array.isArray(event.bytes) && event.bytes.length > 0;
}
