<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRewriteRuntime } from '@/app/rewriteRuntime';
import { useAsyncAction, useNotify, usePolling } from '@/shared/composables';
import type { ConnectionSummary, TransportEventSnapshot } from '@/features/connection';
import {
  FPGA_RS422_CATALOG,
  createFpgaRs422Service,
  formatWordHex,
  listFpgaCommandGroupOptions,
  listFpgaModuleOptions,
  mapFpgaHeaderExplanationRows,
  mapFpgaParamExplanationRows,
  mapFpgaTelemetryFieldRows,
  mapFpgaWordRows,
  parseFpgaTelemetryFrame,
  splitFpgaRs422FramesFromStream,
  useFpgaCommandDrafts,
  type FpgaCommandParamDef,
  type FpgaTelemetryGroupKey,
  type FpgaTelemetryParseResult,
} from '@/features/fpga-rs422';

const ALL_MODULES = '__all__';
const ALL_TELEMETRY_GROUPS = '__all_telemetry_groups__';
const MAX_RECENT_TELEMETRY = 20;

type TelemetryGroupFilter = typeof ALL_TELEMETRY_GROUPS | FpgaTelemetryGroupKey;

interface TelemetryTrace {
  readonly id: string;
  readonly occurredAt: string;
  readonly connectionId: string;
  readonly result: FpgaTelemetryParseResult;
}

const notify = useNotify();
const { execute, isOperating } = useAsyncAction();
const runtime = useRewriteRuntime();
const connectionService = runtime.features.connectionService;
const fpgaService = createFpgaRs422Service({ writer: connectionService });
const commandDrafts = useFpgaCommandDrafts();

const moduleOptions = listFpgaModuleOptions();
const commandModuleKey = ref(moduleOptions[0]?.value ?? '');
const commandGroupKey = ref('');
const commandParamValues = commandDrafts.values;
const selectedConnectionId = ref<string | null>(null);
const telemetryModuleKey = ref(moduleOptions[0]?.value ?? '');
const telemetryGroupKey = ref<TelemetryGroupFilter>(ALL_TELEMETRY_GROUPS);
const connectionSummaries = ref<readonly ConnectionSummary[]>([]);
const recentTelemetry = ref<TelemetryTrace[]>([]);
const seenTelemetryEventIds = new Set<string>();
let pendingTelemetryBytes: number[] = [];
let telemetrySeq = 0;

const commandModule = computed(() =>
  FPGA_RS422_CATALOG.find((moduleDef) => moduleDef.key === commandModuleKey.value),
);

const commandGroupOptions = computed(() => listFpgaCommandGroupOptions(commandModuleKey.value));

const commandGroup = computed(() =>
  commandModule.value?.commandGroups.find((group) => group.key === commandGroupKey.value),
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

const telemetryModuleOptions = computed(() => [
  { label: '全部模块', value: ALL_MODULES },
  ...moduleOptions,
]);

const telemetryGroupOptions = computed<ReadonlyArray<{ readonly label: string; readonly value: TelemetryGroupFilter }>>(() => {
  const options = new Map<TelemetryGroupFilter, string>([
    [ALL_TELEMETRY_GROUPS, '全部类型'],
  ]);

  for (const moduleDef of FPGA_RS422_CATALOG) {
    for (const group of moduleDef.telemetryGroups) {
      if (!options.has(group.key)) {
        options.set(group.key, group.label);
      }
    }
  }

  return [...options.entries()].map(([value, label]) => ({ label, value }));
});

const buildResult = computed(() => {
  if (!commandModuleKey.value || !commandGroupKey.value) {
    return null;
  }

  return fpgaService.buildCommand({
    moduleKey: commandModuleKey.value,
    groupKey: commandGroupKey.value,
    paramValues: commandParamValues.value,
  });
});

const commandBytesText = computed(() =>
  buildResult.value ? formatByteStream(buildResult.value.bytes) : '',
);

const commandPayloadRows = computed(() =>
  buildResult.value ? mapFpgaWordRows(buildResult.value.payloadWords) : [],
);

const commandHeaderRows = computed(() =>
  buildResult.value ? mapFpgaHeaderExplanationRows(buildResult.value.explanations.header) : [],
);

const commandParamRows = computed(() =>
  buildResult.value ? mapFpgaParamExplanationRows(buildResult.value.explanations.params) : [],
);

const displayedTelemetry = computed(() => {
  return recentTelemetry.value.filter(
    (trace) => matchesSelectedTelemetryModule(trace) && matchesSelectedTelemetryGroup(trace),
  );
});

const latestTelemetry = computed(() => displayedTelemetry.value[0] ?? null);

const latestTelemetryFieldRows = computed(() =>
  latestTelemetry.value ? mapFpgaTelemetryFieldRows(latestTelemetry.value.result) : [],
);

const pulseParamLabelsText = computed(() =>
  pulseParams.value.map((param) => `${param.label} (${param.key})`).join(', '),
);

const commandActionLabel = computed(() => {
  if (pulseParams.value.length > 0 && editableParams.value.length === 0) {
    return pulseParams.value.length === 1 ? pulseParams.value[0]!.label : '触发';
  }
  return '下发';
});

const sendDisabled = computed(() =>
  !selectedConnectionId.value || !buildResult.value?.valid || isOperating('fpga-send'),
);

watch(commandModuleKey, () => {
  commandGroupKey.value = commandGroupOptions.value[0]?.value ?? '';
});

watch([commandModuleKey, commandGroupKey], () => {
  loadParamValues();
});

function loadParamValues(): void {
  commandDrafts.loadDraft(commandModuleKey.value, commandGroupKey.value);
}

function setParamValue(paramKey: string, value: string | number | null | boolean): void {
  commandDrafts.setDraftValue(commandModuleKey.value, commandGroupKey.value, paramKey, value);
}

function getParamControl(param: FpgaCommandParamDef): FpgaCommandParamDef['uiControl'] {
  return param.uiControl ?? 'number';
}

function getParamHint(param: FpgaCommandParamDef): string {
  const bitHint = param.bitRange ?? `${param.finalBitWidth} bit`;
  const optionNote = getSelectedOptionNote(param);
  return optionNote ? `${param.key} · ${bitHint} · ${optionNote}` : `${param.key} · ${bitHint}`;
}

function getSelectedOptionNote(param: FpgaCommandParamDef): string {
  const value = Number(commandParamValues.value[param.key] ?? param.defaultValue ?? 0);
  return param.options?.find((option) => option.value === value)?.note ?? '';
}

function getSwitchLabel(param: FpgaCommandParamDef): string {
  const value = commandParamValues.value[param.key] ?? 0;
  return param.options?.find((option) => option.value === value)?.label ?? (value === 0 ? '关闭' : '开启');
}

function refreshConnections(): void {
  connectionSummaries.value = connectionService.listConnectionSummaries();
  if (selectedConnectionId.value) {
    return;
  }

  selectedConnectionId.value = connectionSummaries.value.find(
    (summary) => summary.kind === 'serial' && summary.available,
  )?.connectionId ?? null;
}

function refreshTelemetry(): void {
  const events = connectionService.listTransportEvents();
  const nextTraces: TelemetryTrace[] = [];

  for (const event of events) {
    if (!isParseableDataEvent(event) || seenTelemetryEventIds.has(event.id)) {
      continue;
    }

    seenTelemetryEventIds.add(event.id);
    pendingTelemetryBytes = [...pendingTelemetryBytes, ...event.bytes];
    const split = splitFpgaRs422FramesFromStream(pendingTelemetryBytes);
    pendingTelemetryBytes = [...split.remainingBytes];

    for (const frame of split.frames) {
      nextTraces.push({
        id: `fpga-tm-${telemetrySeq++}`,
        occurredAt: event.occurredAt,
        connectionId: event.connectionId,
        result: parseFpgaTelemetryFrame(frame.bytes),
      });
    }
  }

  if (nextTraces.length > 0) {
    recentTelemetry.value = [...nextTraces.reverse(), ...recentTelemetry.value].slice(0, MAX_RECENT_TELEMETRY);
  }
}

async function sendCommand(): Promise<void> {
  if (!selectedConnectionId.value || !buildResult.value?.valid) {
    return;
  }

  await execute('fpga-send', async () => {
    const result = await fpgaService.sendCommand({
      connectionId: selectedConnectionId.value!,
      moduleKey: commandModuleKey.value,
      groupKey: commandGroupKey.value,
      paramValues: commandParamValues.value,
    });

    if (result.kind === 'sent') {
      notify.success('FPGA 指令已下发');
      return;
    }

    if (result.kind === 'transport-error') {
      notify.error('FPGA 指令下发失败', result.error.message);
      return;
    }

    notify.error('FPGA 指令构建失败', result.issues.map((issue) => issue.message).join('; '));
  });
}

function formatByteStream(bytes: readonly number[]): string {
  return bytes.map((byte) => (byte & 0xff).toString(16).toUpperCase().padStart(2, '0')).join(' ');
}

function formatWordStream(words: readonly number[]): string {
  return words.map(formatWordHex).join(' ');
}

function matchesSelectedTelemetryModule(trace: TelemetryTrace): boolean {
  return telemetryModuleKey.value === ALL_MODULES || trace.result.moduleKey === telemetryModuleKey.value;
}

function matchesSelectedTelemetryGroup(trace: TelemetryTrace): boolean {
  return telemetryGroupKey.value === ALL_TELEMETRY_GROUPS || trace.result.groupKey === telemetryGroupKey.value;
}

function isParseableDataEvent(
  event: TransportEventSnapshot,
): event is TransportEventSnapshot & { readonly bytes: readonly number[] } {
  return event.kind === 'data' && Array.isArray(event.bytes) && event.bytes.length > 0;
}

const polling = usePolling(() => {
  refreshConnections();
  refreshTelemetry();
}, 500);

onMounted(() => {
  if (!commandGroupKey.value) {
    commandGroupKey.value = commandGroupOptions.value[0]?.value ?? '';
  }
  loadParamValues();
  refreshConnections();
  refreshTelemetry();
  polling.start();
});
</script>

<template>
  <q-page class="fpga-rs422-page p-4 min-h-full">
    <section class="fpga-rs422-page__shell gap-4">
      <div class="fpga-rs422-page__panels gap-4">
        <section class="fpga-rs422-panel p-4 gap-4">
          <div class="fpga-rs422-panel__header gap-3">
            <div class="min-w-0">
              <h1 class="fpga-rs422-panel__title">指令下发</h1>
              <div class="fpga-rs422-panel__meta">RS422 / FPGA</div>
            </div>
            <q-select
              v-model="commandModuleKey"
              class="fpga-rs422-panel__module-select"
              dense
              outlined
              emit-value
              map-options
              :options="moduleOptions"
              label="模块"
            />
          </div>

          <div class="grid gap-3">
            <q-select
              v-model="selectedConnectionId"
              dense
              outlined
              emit-value
              map-options
              clearable
              :options="serialConnectionOptions"
              label="RS422 串口"
            />

            <q-select
              v-model="commandGroupKey"
              dense
              outlined
              emit-value
              map-options
              :options="commandGroupOptions"
              label="Group"
            />
          </div>

          <div class="grid gap-2">
            <template v-for="param in editableParams" :key="param.key">
              <q-select
                v-if="getParamControl(param) === 'select'"
                dense
                outlined
                emit-value
                map-options
                :model-value="commandParamValues[param.key] ?? 0"
                :options="param.options ?? []"
                option-label="label"
                option-value="value"
                :label="param.label"
                @update:model-value="setParamValue(param.key, $event)"
              >
                <template #append>
                  <q-badge outline color="primary">{{ param.finalBitWidth }} bit</q-badge>
                </template>
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label v-if="scope.opt.note" caption>{{ scope.opt.note }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template #hint>
                  {{ getParamHint(param) }}
                </template>
              </q-select>

              <div
                v-else-if="getParamControl(param) === 'switch'"
                class="fpga-rs422-param-toggle gap-3"
              >
                <div class="fpga-rs422-param-toggle__text min-w-0">
                  <div class="fpga-rs422-param-toggle__label">{{ param.label }}</div>
                  <div class="fpga-rs422-param-toggle__hint">{{ getParamHint(param) }}</div>
                </div>
                <q-toggle
                  color="primary"
                  :aria-label="param.label"
                  :model-value="Boolean(commandParamValues[param.key] ?? 0)"
                  :label="getSwitchLabel(param)"
                  @update:model-value="setParamValue(param.key, $event)"
                />
              </div>

              <q-input
                v-else
                dense
                outlined
                type="number"
                :model-value="commandParamValues[param.key] ?? 0"
                :label="param.label"
                @update:model-value="setParamValue(param.key, $event)"
              >
                <template #append>
                  <q-badge outline color="primary">{{ param.finalBitWidth }} bit</q-badge>
                </template>
                <template #hint>
                  {{ getParamHint(param) }}
                </template>
              </q-input>
            </template>

            <div v-if="pulseParams.length > 0 && editableParams.length === 0" class="fpga-rs422-panel__empty py-3">
              触发命令：{{ pulseParamLabelsText }}
            </div>
          </div>

          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="send"
            :label="commandActionLabel"
            :loading="isOperating('fpga-send')"
            :disable="sendDisabled"
            @click="sendCommand"
          />

          <section class="fpga-rs422-trace gap-3">
            <div class="fpga-rs422-trace__title">下发预览</div>
            <div class="fpga-rs422-code">{{ commandBytesText || '--' }}</div>

            <div class="fpga-rs422-table">
              <div class="fpga-rs422-table__caption">Payload words</div>
              <div v-for="row in commandPayloadRows" :key="row.key" class="fpga-rs422-row">
                <span>{{ row.label }}</span>
                <code>{{ row.value }}</code>
              </div>
            </div>

            <div class="fpga-rs422-table">
              <div class="fpga-rs422-table__caption">字段解释</div>
              <div v-for="row in commandHeaderRows" :key="row.key" class="fpga-rs422-row">
                <span>{{ row.label }}</span>
                <code>{{ row.value }}</code>
                <span class="fpga-rs422-row__detail">{{ row.detail }}</span>
              </div>
              <div v-for="row in commandParamRows" :key="row.key" class="fpga-rs422-row">
                <span>{{ row.label }}</span>
                <code>{{ row.value }}</code>
                <span class="fpga-rs422-row__detail">{{ row.detail }}</span>
              </div>
            </div>

            <div v-if="buildResult && !buildResult.valid" class="fpga-rs422-issues gap-1">
              <div v-for="issue in buildResult.issues" :key="issue.code + issue.paramKey" class="fpga-rs422-issue">
                {{ issue.message }}
              </div>
            </div>
          </section>
        </section>

        <section class="fpga-rs422-panel p-4 gap-4">
          <div class="fpga-rs422-panel__header gap-3">
            <div class="min-w-0">
              <h1 class="fpga-rs422-panel__title">数据解析</h1>
              <div class="fpga-rs422-panel__meta">最近 {{ recentTelemetry.length }} 条</div>
            </div>
            <div class="fpga-rs422-panel__filters gap-2">
              <q-select
                v-model="telemetryGroupKey"
                class="fpga-rs422-panel__filter-select"
                dense
                outlined
                emit-value
                map-options
                :options="telemetryGroupOptions"
                label="类型"
              />
              <q-select
                v-model="telemetryModuleKey"
                class="fpga-rs422-panel__filter-select"
                dense
                outlined
                emit-value
                map-options
                :options="telemetryModuleOptions"
                label="模块"
              />
            </div>
          </div>

          <div class="flex items-center gap-2">
            <q-btn flat dense round icon="refresh" aria-label="刷新解析" @click="refreshTelemetry" />
            <div class="fpga-rs422-panel__meta">串口 data 事件自动进入解析列表</div>
          </div>

          <section v-if="latestTelemetry" class="fpga-rs422-trace gap-3">
            <div class="fpga-rs422-trace__title">
              {{ latestTelemetry.result.moduleKey ?? 'unknown' }} / {{ latestTelemetry.result.groupKey ?? 'unknown' }}
              <q-badge :color="latestTelemetry.result.valid ? 'positive' : 'negative'">
                {{ latestTelemetry.result.valid ? 'checksum ok' : 'issue' }}
              </q-badge>
            </div>

            <div class="fpga-rs422-code">{{ formatByteStream(latestTelemetry.result.rawBytes) }}</div>

            <div class="fpga-rs422-table">
              <div class="fpga-rs422-table__caption">Payload words</div>
              <div class="fpga-rs422-row">
                <span>payload</span>
                <code>{{ formatWordStream(latestTelemetry.result.payloadWords) || '--' }}</code>
              </div>
              <div class="fpga-rs422-row">
                <span>checksum expected</span>
                <code>{{ formatWordHex(latestTelemetry.result.checksumExpected) }}</code>
              </div>
              <div class="fpga-rs422-row">
                <span>checksum actual</span>
                <code>{{ formatWordHex(latestTelemetry.result.checksumActual) }}</code>
              </div>
            </div>

            <div class="fpga-rs422-table">
              <div class="fpga-rs422-table__caption">字段解释</div>
              <div v-for="row in latestTelemetryFieldRows" :key="row.key" class="fpga-rs422-row">
                <span>{{ row.label }}</span>
                <code>{{ row.value }}</code>
                <span class="fpga-rs422-row__detail">{{ row.detail }}</span>
              </div>
            </div>

            <div v-if="latestTelemetry.result.issues.length > 0" class="fpga-rs422-issues gap-1">
              <div v-for="issue in latestTelemetry.result.issues" :key="issue.code + issue.message" class="fpga-rs422-issue">
                {{ issue.message }}
              </div>
            </div>
          </section>

          <div v-else class="fpga-rs422-panel__empty py-6">
            暂无匹配模块的串口遥测数据
          </div>
        </section>
      </div>
    </section>
  </q-page>
</template>

<style scoped lang="scss">
@use '../css/tokens' as tokens;

.fpga-rs422-page {
  background: var(--rw-color-surface-app);
}

.fpga-rs422-page__shell {
  display: grid;
  margin: 0 auto;
  max-width: var(--rw-size-content-wide);
}

.fpga-rs422-page__panels {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.fpga-rs422-panel {
  background: var(--rw-color-surface-base);
  border: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-panel);
  display: grid;
  min-width: 0;
}

.fpga-rs422-panel__header {
  align-items: start;
  display: flex;
  justify-content: space-between;
}

.fpga-rs422-panel__title {
  color: var(--rw-color-text-primary);
  font-size: var(--rw-font-size-title-md);
  font-weight: var(--rw-font-weight-semibold);
  line-height: var(--rw-line-height-title-md);
  margin: 0;
}

.fpga-rs422-panel__meta,
.fpga-rs422-panel__empty {
  color: var(--rw-color-text-muted);
  font-size: var(--rw-font-size-label);
  line-height: var(--rw-line-height-body);
}

.fpga-rs422-panel__module-select {
  min-width: var(--rw-size-dialog-sm);
}

.fpga-rs422-panel__filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.fpga-rs422-panel__filter-select {
  flex: 1 1 calc(var(--rw-size-dialog-sm) / 2);
  min-width: calc(var(--rw-size-dialog-sm) / 2);
}

.fpga-rs422-param-toggle {
  align-items: center;
  border: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  display: flex;
  justify-content: space-between;
  min-width: 0;
  padding: var(--rw-space-2);
}

.fpga-rs422-param-toggle__text {
  display: grid;
}

.fpga-rs422-param-toggle__label {
  color: var(--rw-color-text-primary);
  font-size: var(--rw-font-size-body);
  line-height: var(--rw-line-height-body);
}

.fpga-rs422-param-toggle__hint {
  color: var(--rw-color-text-muted);
  font-size: var(--rw-font-size-label);
  line-height: var(--rw-line-height-body);
  overflow-wrap: anywhere;
}

.fpga-rs422-trace {
  border-top: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  display: grid;
}

.fpga-rs422-trace__title,
.fpga-rs422-table__caption {
  color: var(--rw-color-text-secondary);
  font-size: var(--rw-font-size-label);
  font-weight: var(--rw-font-weight-semibold);
  line-height: var(--rw-line-height-body);
}

.fpga-rs422-code {
  background: var(--rw-color-surface-selected);
  border: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  color: var(--rw-color-text-default);
  font-family: var(--rw-font-family-mono);
  font-size: var(--rw-font-size-code);
  line-height: var(--rw-line-height-body);
  overflow-wrap: anywhere;
  padding: var(--rw-space-2);
}

.fpga-rs422-table {
  display: grid;
}

.fpga-rs422-row {
  align-items: center;
  border-bottom: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  column-gap: var(--rw-space-2);
  color: var(--rw-color-text-default);
  display: grid;
  font-size: var(--rw-font-size-label);
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) auto;
  line-height: var(--rw-line-height-body);
  padding: var(--rw-space-1) 0;
}

.fpga-rs422-row code {
  color: var(--rw-color-text-primary);
  font-family: var(--rw-font-family-mono);
  min-width: 0;
  overflow-wrap: anywhere;
}

.fpga-rs422-row code:last-child {
  grid-column: 2 / -1;
}

.fpga-rs422-row__detail {
  color: var(--rw-color-text-muted);
  white-space: nowrap;
}

.fpga-rs422-issues {
  color: var(--rw-color-status-danger);
  display: grid;
  font-size: var(--rw-font-size-label);
  line-height: var(--rw-line-height-body);
}

@media (max-width: tokens.rw-breakpoint('page-compact')) {
  .fpga-rs422-page__panels {
    grid-template-columns: 1fr;
  }

  .fpga-rs422-panel__header {
    display: grid;
  }

  .fpga-rs422-panel__module-select {
    min-width: 0;
    width: 100%;
  }

  .fpga-rs422-panel__filters {
    width: 100%;
  }

  .fpga-rs422-panel__filter-select {
    min-width: 0;
    width: 100%;
  }

  .fpga-rs422-param-toggle {
    align-items: stretch;
    display: grid;
  }

  .fpga-rs422-row {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
