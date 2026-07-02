<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRewriteRuntime } from '@/app/rewriteRuntime';
import { useAsyncAction, useNotify, usePolling } from '@/shared/composables';
import type {
  ConnectionResourceCandidate,
  ConnectionSummary,
  TransportConfig,
} from '@/features/connection';
import {
  FPGA_RS422_CATALOG,
  type FpgaCommandParamDef,
  type FpgaTelemetryFieldDef,
} from '@/features/fpga-rs422';
import NewConnectionDialog from '@/features/connection/components/NewConnectionDialog.vue';
import { connectionStatusMap } from '@/features/connection/components/connectionStatusMap';
import { useFpgaRs422Workspace } from '@/features/fpga-rs422';
import StatusBadge from '@/widgets/StatusBadge.vue';

const DEBUG_ONLY_RESULT_KEYS = new Set([
  'coarse_range_value',
  'fine_range_value',
  'ranging_reset_status',
  'manual_reset_status',
  'ook_lock_state',
]);

const MERGED_TELEMETRY_U64_BASE_KEYS = new Set([
  'pre_total_bit_count_sec',
  'pre_dec_err_bits_sec',
  'post_total_bit_count_sec',
  'post_dec_err_bits_sec',
]);

const ui = {
  waitingTelemetry: '\u7b49\u5f85\u9065\u6d4b',
  parseOk: '\u89e3\u6790\u6b63\u5e38',
  parseFail: '\u89e3\u6790\u5f02\u5e38',
  valid: '\u6709\u6548',
  abnormal: '\u5f02\u5e38',
  refreshSerialFailed: '\u5237\u65b0\u4e32\u53e3\u5931\u8d25',
  connectFailed: '\u8fde\u63a5\u5931\u8d25',
  missingSerialConfig: '\u672a\u627e\u5230\u5bf9\u5e94\u7684\u4e32\u53e3\u914d\u7f6e',
  serialConnectFailed: '\u4e32\u53e3\u8fde\u63a5\u5931\u8d25',
  connectedSuffix: '\u5df2\u8fde\u63a5',
  disconnectedSuffix: '\u5df2\u65ad\u5f00',
  disconnectFailed: '\u65ad\u5f00\u5931\u8d25',
  serialDisconnectFailed: '\u4e32\u53e3\u65ad\u5f00\u5931\u8d25',
  removeFailed: '\u79fb\u9664\u5931\u8d25',
  removedSuffix: '\u5df2\u79fb\u9664',
  serialCreatedAndConnected: '\u4e32\u53e3\u5df2\u521b\u5efa\u5e76\u8fde\u63a5',
  createSerialFailed: '\u521b\u5efa\u4e32\u53e3\u5931\u8d25',
  frameGenerated: '\u5df2\u751f\u6210\u9065\u63a7\u5e27',
  generateFailed: '\u751f\u6210\u5931\u8d25',
  sendSuccess: '\u751f\u6210\u5e76\u4e0b\u53d1\u6210\u529f',
  sendFailed: '\u4e0b\u53d1\u5931\u8d25',
  confirmRemoveTitle: '\u786e\u8ba4\u79fb\u9664',
  configTitle: '\u9065\u63a7\u9065\u6d4b\u914d\u7f6e',
  serialConnection: '\u4e32\u53e3\u8fde\u63a5',
  refresh: '\u5237\u65b0',
  createSerial: '\u65b0\u5efa\u4e32\u53e3',
  serialPort: 'RS422 \u4e32\u53e3',
  disconnect: '\u65ad\u5f00',
  connect: '\u8fde\u63a5',
  errorCount: '\u9519\u8bef',
  remove: '\u79fb\u9664',
  noSerialConnection: '\u6682\u65e0\u4e32\u53e3\u8fde\u63a5\uff0c\u8bf7\u5148\u65b0\u5efa\u4e32\u53e3\u5e76\u5b8c\u6210\u8fde\u63a5\u3002',
  module: '\u6a21\u5757',
  command: '\u9065\u63a7\u6307\u4ee4',
  generateFrame: '\u751f\u6210\u9065\u63a7\u5e27',
  sendCurrent: '\u751f\u6210\u5e76\u4e0b\u53d1',
  trigger: '\u89e6\u53d1',
  resultTitle: '\u9065\u6d4b\u89e3\u6790\u4e0e\u6d4b\u8bd5\u7ed3\u679c',
  resultSub: '\u8be6\u7ec6\u5b57\u6bb5\u62c6\u89e3\uff0c\u8fdb\u5165\u8c03\u8bd5\u52a9\u624b\u67e5\u770b',
  telemetryType: '\u9065\u6d4b\u7c7b\u578b',
  resultDataPrefix: '\u6d4b\u8bd5\u7ed3\u679c\u6570\u636e',
  resultItem: '\u9879',
  testItem: '\u6d4b\u8bd5\u9879',
  currentValue: '\u5f53\u524d\u503c',
  noResultData: '\u6682\u65e0\u6d4b\u8bd5\u7ed3\u679c\u6570\u636e',
} as const;

const $q = useQuasar();
const runtime = useRewriteRuntime();
const connectionService = runtime.features.connectionService;

const workspace = useFpgaRs422Workspace();
const notify = useNotify();
const { execute, isOperating } = useAsyncAction();
const polling = usePolling(() => {
  workspace.refreshAll();
  refreshSerialResources();
}, 500);

const showNewConnectionDialog = ref(false);
const serialResources = ref<readonly ConnectionResourceCandidate[]>([]);

const parseResultValid = computed(
  () => workspace.latestTelemetry.value?.result.valid ?? false,
);

const parseResultText = computed(() => {
  if (!workspace.latestTelemetry.value) return ui.waitingTelemetry;
  return parseResultValid.value ? ui.parseOk : ui.parseFail;
});

const serialConnections = computed(() =>
  workspace.connectionSummaries.value.filter((summary) => summary.kind === 'serial'),
);

const selectedSerialSummary = computed<ConnectionSummary | null>(() =>
  serialConnections.value.find(
    (summary) => summary.connectionId === workspace.selectedConnectionId.value,
  ) ?? null,
);

const telemetryFieldTemplates = computed(() => {
  const moduleDef = FPGA_RS422_CATALOG.find(
    (item) => item.key === workspace.telemetryModuleKey.value,
  );
  const groupDef = moduleDef?.telemetryGroups.find(
    (item) => item.key === workspace.telemetryGroupKey.value,
  );

  return buildTelemetryResultTemplates(groupDef?.fields ?? []);
});

const resultRows = computed(() =>
  telemetryFieldTemplates.value
    .filter((row) => !DEBUG_ONLY_RESULT_KEYS.has(normalizeTelemetryResultKey(row.key)))
    .map((row) => ({
      key: row.key,
      label: row.label,
      value:
        workspace.latestTelemetryFieldRows.value.find((item) => item.key === row.key)?.value
        ?? '-',
    })),
);

const telemetryGroupLabel = computed(() =>
  workspace.telemetryGroupOptions.value.find(
    (option) => option.value === workspace.telemetryGroupKey.value,
  )?.label ?? '--',
);

const commandActionText = computed(() => {
  if (workspace.pulseParams.value.length > 0 && workspace.editableParams.value.length === 0) {
    return workspace.pulseParams.value[0]?.label ?? ui.trigger;
  }

  return ui.sendCurrent;
});

function getParamControl(param: FpgaCommandParamDef): FpgaCommandParamDef['uiControl'] {
  return param.uiControl ?? 'number';
}

function buildTelemetryResultTemplates(
  fields: readonly FpgaTelemetryFieldDef[],
): Array<{ key: string; label: string }> {
  const rows: Array<{ key: string; label: string }> = [];

  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    if (!field) {
      continue;
    }

    const mergedField = createMergedTelemetryTemplate(field, fields[index + 1]);
    if (mergedField) {
      rows.push(mergedField);
      index += 1;
      continue;
    }

    rows.push({
      key: field.key,
      label: field.label,
    });
  }

  return rows;
}

function createMergedTelemetryTemplate(
  highField: FpgaTelemetryFieldDef,
  lowField: FpgaTelemetryFieldDef | undefined,
): { key: string; label: string } | null {
  if (!lowField || highField.signed || lowField.signed) {
    return null;
  }

  const highKey = parseTelemetryWideFieldKey(highField.key);
  const lowKey = parseTelemetryWideFieldKey(lowField.key);
  if (!highKey || !lowKey) {
    return null;
  }

  if (
    highKey.baseKey !== lowKey.baseKey
    || highKey.bitRange !== '63:32'
    || lowKey.bitRange !== '31:0'
    || !MERGED_TELEMETRY_U64_BASE_KEYS.has(highKey.baseKey)
    || lowField.wordIndex !== highField.wordIndex + 1
  ) {
    return null;
  }

  return {
    key: `${highKey.baseKey}[63:0]`,
    label: highField.label,
  };
}

function parseTelemetryWideFieldKey(
  key: string,
): { readonly baseKey: string; readonly bitRange: '63:32' | '31:0' } | null {
  const match = /^(.*)\[(63:32|31:0)\]$/.exec(key);
  if (!match) {
    return null;
  }

  return {
    baseKey: match[1] ?? key,
    bitRange: match[2] as '63:32' | '31:0',
  };
}

function normalizeTelemetryResultKey(key: string): string {
  return key.replace(/\[(?:63:0|63:32|31:0)\]$/, '');
}

function refreshSerialResources(): void {
  void connectionService.discoverResources()
    .then((resources) => {
      serialResources.value = resources.filter((resource) => resource.kind === 'serial');
    })
    .catch((error: unknown) => {
      notify.error(
        ui.refreshSerialFailed,
        error instanceof Error ? error.message : String(error),
      );
    });
}

async function handleConnect(summary: ConnectionSummary): Promise<void> {
  await execute(summary.connectionId, async () => {
    const fact = connectionService.getConnectionFact(summary.connectionId);
    if (!fact) {
      notify.error(ui.connectFailed, ui.missingSerialConfig);
      return;
    }

    const result = await connectionService.connect(fact.config);
    if (result.ok) {
      workspace.selectedConnectionId.value = summary.connectionId;
      workspace.refreshAll();
      refreshSerialResources();
      notify.success(`${summary.label} ${ui.connectedSuffix}`);
      return;
    }

    notify.error(ui.connectFailed, result.error?.message ?? ui.serialConnectFailed);
  });
}

async function handleDisconnect(summary: ConnectionSummary): Promise<void> {
  await execute(summary.connectionId, async () => {
    const result = await connectionService.disconnect(summary.connectionId);
    if (result.ok) {
      workspace.refreshAll();
      refreshSerialResources();
      notify.success(`${summary.label} ${ui.disconnectedSuffix}`);
      return;
    }

    notify.error(ui.disconnectFailed, result.error?.message ?? ui.serialDisconnectFailed);
  });
}

async function handleRemoveSerial(summary: ConnectionSummary): Promise<void> {
  await execute(`remove-${summary.connectionId}`, async () => {
    const result = await connectionService.removeConnection(summary.connectionId);
    if (result.ok) {
      await runtime.persistence.saveConnections();
      workspace.refreshAll();
      refreshSerialResources();
      notify.success(`${summary.label} ${ui.removedSuffix}`);
      return;
    }

    const fallbackMessage = result.validation.issues
      .map((issue) => issue.message)
      .join('; ');
    notify.error(ui.removeFailed, result.error?.message ?? fallbackMessage);
  });
}

async function handleCreate(config: TransportConfig): Promise<void> {
  const result = await connectionService.connect(config);
  if (result.ok) {
    workspace.selectedConnectionId.value = config.id;
    workspace.refreshAll();
    refreshSerialResources();
    notify.success(ui.serialCreatedAndConnected);
    return;
  }

  notify.error(ui.createSerialFailed, result.error?.message ?? ui.createSerialFailed);
}

function handleOpenNewConnection(): void {
  showNewConnectionDialog.value = true;
}

function handleRefreshConnections(): void {
  workspace.refreshAll();
  refreshSerialResources();
}

function prepareFrame(): void {
  const build = workspace.prepareCurrentFrame();
  if (build?.valid) {
    notify.success(ui.frameGenerated);
    return;
  }

  if (build) {
    notify.error(ui.generateFailed, build.issues.map((issue) => issue.message).join('; '));
  }
}

function sendCurrent(): void {
  void execute('fpga-send', async () => {
    const result = await workspace.sendCurrentCommand();
    if (!result) return;

    if (result.kind === 'sent') {
      notify.success(ui.sendSuccess);
      return;
    }

    if (result.kind === 'transport-error') {
      notify.error(ui.sendFailed, result.error.message);
      return;
    }

    notify.error(ui.sendFailed, result.issues.map((issue) => issue.message).join('; '));
  });
}

function confirmRemoveSerial(): void {
  const summary = selectedSerialSummary.value;
  if (!summary) {
    return;
  }

  $q.dialog({
    title: ui.confirmRemoveTitle,
    message: `\u786e\u5b9a\u8981\u79fb\u9664\u4e32\u53e3\u201c${summary.label}\u201d\u5417\uff1f`,
    ok: { label: '\u786e\u5b9a' },
    cancel: { label: '\u53d6\u6d88' },
    persistent: false,
  }).onOk(() => {
    void handleRemoveSerial(summary);
  });
}

watch(
  () => workspace.commandModuleKey.value,
  (moduleKey) => {
    const nextGroupKey = workspace.commandGroupOptions.value[0]?.value ?? '';
    if (workspace.commandGroupKey.value !== nextGroupKey) {
      workspace.commandGroupKey.value = nextGroupKey;
    }

    if (workspace.telemetryModuleKey.value !== moduleKey) {
      workspace.telemetryModuleKey.value = moduleKey;
    }
  },
  { immediate: true },
);

onMounted(() => {
  workspace.refreshAll();
  refreshSerialResources();
  polling.start();
});
</script>

<template>
  <q-page class="fpga-telemetry-page">
    <div class="fpga-telemetry-page__shell">
      <section class="fpga-panel fpga-telemetry-page__config">
        <div>
          <div class="fpga-panel__title">{{ ui.configTitle }}</div>
        </div>

        <div class="fpga-serial-panel">
          <div class="fpga-serial-panel__header">
            <div class="fpga-panel__sub">{{ ui.serialConnection }}</div>
            <div class="fpga-inline-actions">
              <q-btn
                flat
                no-caps
                color="primary"
                icon="o_refresh"
                :label="ui.refresh"
                class="fpga-inline-btn"
                @click="handleRefreshConnections"
              />
              <q-btn
                unelevated
                no-caps
                color="primary"
                icon="add"
                :label="ui.createSerial"
                class="fpga-inline-btn"
                @click="handleOpenNewConnection"
              />
            </div>
          </div>

          <div class="fpga-serial-panel__top">
            <q-select
              v-model="workspace.selectedConnectionId.value"
              dense
              outlined
              emit-value
              map-options
              clearable
              :options="workspace.serialConnectionOptions.value"
              :label="ui.serialPort"
              class="fpga-serial-select"
            />

            <div class="fpga-inline-actions">
              <q-btn
                v-if="selectedSerialSummary && selectedSerialSummary.lifecycle === 'connected'"
                flat
                no-caps
                color="primary"
                :label="ui.disconnect"
                class="fpga-inline-btn"
                :loading="isOperating(selectedSerialSummary.connectionId)"
                :disable="isOperating(selectedSerialSummary.connectionId)"
                @click="handleDisconnect(selectedSerialSummary)"
              />
              <q-btn
                v-else-if="selectedSerialSummary"
                unelevated
                no-caps
                color="primary"
                :label="ui.connect"
                class="fpga-inline-btn"
                :loading="isOperating(selectedSerialSummary.connectionId)"
                :disable="isOperating(selectedSerialSummary.connectionId)"
                @click="handleConnect(selectedSerialSummary)"
              />
            </div>
          </div>

          <div v-if="selectedSerialSummary" class="fpga-serial-card">
            <div class="fpga-serial-card__row">
              <StatusBadge
                :status="selectedSerialSummary.lifecycle"
                :status-map="connectionStatusMap"
              />
              <strong class="fpga-serial-card__name">{{ selectedSerialSummary.label }}</strong>
              <span class="fpga-serial-card__route">{{ selectedSerialSummary.routeLabel }}</span>
            </div>
            <div class="fpga-serial-card__meta">
              <span>RX {{ selectedSerialSummary.rxBytes }}</span>
              <span>TX {{ selectedSerialSummary.txBytes }}</span>
              <span>{{ ui.errorCount }} {{ selectedSerialSummary.errorCount }}</span>
            </div>
            <div class="fpga-serial-card__actions">
              <q-btn
                flat
                dense
                no-caps
                color="negative"
                :label="ui.remove"
                :loading="isOperating(`remove-${selectedSerialSummary.connectionId}`)"
                :disable="isOperating(`remove-${selectedSerialSummary.connectionId}`)"
                @click="confirmRemoveSerial"
              />
            </div>
          </div>

          <div v-else class="fpga-empty-hint">
            {{ ui.noSerialConnection }}
          </div>
        </div>

        <div class="fpga-config-stack">
          <q-select
            v-model="workspace.commandModuleKey.value"
            dense
            outlined
            emit-value
            map-options
            :options="workspace.moduleOptions"
            :label="ui.module"
          />
          <q-select
            :key="workspace.commandModuleKey.value"
            v-model="workspace.commandGroupKey.value"
            dense
            outlined
            emit-value
            map-options
            :options="workspace.commandGroupOptions.value"
            :label="ui.command"
          />
        </div>

        <div class="fpga-config-stack fpga-config-stack--grow">
          <template v-for="param in workspace.editableParams.value" :key="param.key">
            <q-select
              v-if="getParamControl(param) === 'select'"
              dense
              outlined
              emit-value
              map-options
              :model-value="workspace.commandParamValues.value[param.key] ?? 0"
              :options="param.options ?? []"
              option-label="label"
              option-value="value"
              :label="param.label"
              @update:model-value="workspace.setParamValue(param.key, $event)"
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
            </q-select>

            <div
              v-else-if="getParamControl(param) === 'switch'"
              class="fpga-switch-row"
            >
              <div class="fpga-switch-row__text">
                <div class="fpga-switch-row__label">{{ param.label }}</div>
              </div>
              <q-toggle
                color="primary"
                :model-value="Boolean(workspace.commandParamValues.value[param.key] ?? 0)"
                :label="workspace.getSwitchLabel(param)"
                @update:model-value="workspace.setParamValue(param.key, $event)"
              />
            </div>

            <q-input
              v-else
              dense
              outlined
              type="number"
              :model-value="workspace.commandParamValues.value[param.key] ?? 0"
              :label="param.label"
              @update:model-value="workspace.setParamValue(param.key, $event)"
            >
              <template #append>
                <q-badge outline color="primary">{{ param.finalBitWidth }} bit</q-badge>
              </template>
            </q-input>
          </template>

          <div
            v-if="workspace.pulseParams.value.length > 0 && workspace.editableParams.value.length === 0"
            class="fpga-helper"
          >
            {{ workspace.pulseParamLabelsText.value }}
          </div>
        </div>

        <div class="fpga-action-grid fpga-action-grid--double">
          <q-btn
            unelevated
            no-caps
            color="primary"
            :label="ui.generateFrame"
            class="fpga-action-btn"
            @click="prepareFrame"
          />
          <q-btn
            unelevated
            no-caps
            color="primary"
            :label="commandActionText"
            class="fpga-action-btn"
            :loading="isOperating('fpga-send')"
            :disable="isOperating('fpga-send')"
            @click="sendCurrent"
          />
        </div>
      </section>

      <section class="fpga-panel fpga-telemetry-page__result">
        <div class="fpga-result-top">
          <div>
            <div class="fpga-panel__title">{{ ui.resultTitle }}</div>
            <div class="fpga-panel__sub">{{ ui.resultSub }}</div>
          </div>
          <div class="fpga-result-top__meta">
            <div class="fpga-chip" :class="`is-${parseResultValid ? 'positive' : 'negative'}`">
              {{ parseResultText }}
            </div>
          </div>
        </div>

        <q-select
          v-model="workspace.telemetryGroupKey.value"
          :key="workspace.telemetryModuleKey.value"
          dense
          outlined
          emit-value
          map-options
          :options="workspace.telemetryGroupOptions.value"
          :label="ui.telemetryType"
        />

        <div class="fpga-table-panel">
          <div class="fpga-panel__sub">
            {{ ui.resultDataPrefix }} {{ telemetryGroupLabel }} / {{ resultRows.length }} {{ ui.resultItem }}
          </div>
          <div class="fpga-table">
            <div class="fpga-table__head">
              <span>{{ ui.testItem }}</span>
              <span>{{ ui.currentValue }}</span>
            </div>
            <div class="fpga-table__body">
              <template v-if="resultRows.length > 0">
                <div
                  v-for="row in resultRows"
                  :key="row.key"
                  class="fpga-table__row"
                >
                  <span>{{ row.label }}</span>
                  <span>{{ row.value }}</span>
                </div>
              </template>
              <div v-else class="fpga-table__empty">{{ ui.noResultData }}</div>
            </div>
          </div>
        </div>

        <div v-if="workspace.latestIssueMessages.value.length > 0" class="fpga-issue-list">
          <div
            v-for="message in workspace.latestIssueMessages.value"
            :key="message"
            class="fpga-issue-item"
          >
            {{ message }}
          </div>
        </div>
      </section>
    </div>

    <NewConnectionDialog
      v-model="showNewConnectionDialog"
      :resources="serialResources"
      :allowed-kinds="['serial']"
      @create="handleCreate"
      @refresh-resources="refreshSerialResources"
    />
  </q-page>
</template>

<style scoped lang="scss">
@use '../css/tokens' as tokens;

.fpga-telemetry-page {
  background: var(--rw-color-surface-app);
  height: calc(100vh - 52px);
  overflow: hidden;
}

.fpga-telemetry-page__shell {
  display: grid;
  gap: var(--rw-space-4);
  grid-template-columns: minmax(400px, 1fr) minmax(0, 1.42fr);
  height: 100%;
  padding: var(--rw-space-3);
  width: 100%;
}

.fpga-panel {
  background: var(--rw-color-surface-base);
  border: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-panel);
  display: grid;
  gap: var(--rw-space-3);
  min-height: 0;
  min-width: 0;
  padding: var(--rw-space-3);
}

.fpga-telemetry-page__config {
  grid-template-rows: auto auto auto 1fr auto;
  overflow: hidden;
}

.fpga-telemetry-page__result {
  grid-template-rows: auto auto minmax(0, 1fr) auto;
}

.fpga-panel__title {
  color: var(--rw-color-text-primary);
  font-size: var(--rw-font-size-title-md);
  font-weight: var(--rw-font-weight-semibold);
}

.fpga-panel__sub {
  color: var(--rw-color-text-muted);
  font-size: var(--rw-font-size-label);
}

.fpga-serial-panel,
.fpga-config-stack,
.fpga-issue-list {
  display: grid;
  gap: var(--rw-space-2);
}

.fpga-serial-panel {
  align-content: start;
  border: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  padding: var(--rw-space-2);
}

.fpga-serial-panel__header,
.fpga-serial-card__row,
.fpga-inline-actions {
  align-items: center;
  display: flex;
  gap: var(--rw-space-2);
}

.fpga-serial-panel__header {
  justify-content: space-between;
}

.fpga-serial-panel__top {
  align-items: center;
  display: grid;
  gap: var(--rw-space-2);
  grid-template-columns: minmax(360px, 1fr) auto;
}

.fpga-inline-actions {
  flex-shrink: 0;
}

.fpga-inline-btn {
  height: 36px;
}

.fpga-serial-select {
  min-width: 0;
  width: 100%;
}

.fpga-serial-card {
  align-items: start;
  align-content: start;
  background: var(--rw-color-surface-selected);
  border-radius: var(--rw-radius-control);
  display: grid;
  gap: 4px var(--rw-space-3);
  grid-template-areas:
    'header actions'
    'meta actions';
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 10px var(--rw-space-3);
}

.fpga-serial-card__row {
  grid-area: header;
  min-width: 0;
}

.fpga-serial-card__name {
  color: var(--rw-color-text-primary);
  font-size: var(--rw-font-size-body);
  font-weight: var(--rw-font-weight-semibold);
}

.fpga-serial-card__route,
.fpga-serial-card__meta,
.fpga-empty-hint {
  color: var(--rw-color-text-muted);
  font-size: var(--rw-font-size-caption);
}

.fpga-serial-card__route {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fpga-serial-card__meta {
  display: flex;
  gap: var(--rw-space-2);
  grid-area: meta;
}

.fpga-serial-card__actions {
  display: flex;
  grid-area: actions;
  justify-content: flex-end;
  align-self: start;
}

.fpga-empty-hint {
  align-items: center;
  display: flex;
  min-height: 72px;
}

.fpga-config-stack--grow {
  align-content: start;
  min-height: 0;
  overflow: auto;
  padding-bottom: var(--rw-space-2);
  padding-right: 4px;
}

.fpga-switch-row {
  align-items: center;
  border: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  display: flex;
  gap: var(--rw-space-3);
  justify-content: space-between;
  padding: var(--rw-space-2) var(--rw-space-3);
}

.fpga-switch-row__text {
  display: grid;
  gap: 4px;
}

.fpga-switch-row__label {
  color: var(--rw-color-text-primary);
  font-size: var(--rw-font-size-body);
  font-weight: var(--rw-font-weight-semibold);
}

.fpga-helper {
  align-items: center;
  background: var(--rw-color-surface-selected);
  border: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  color: var(--rw-color-text-muted);
  display: flex;
  min-height: 48px;
  padding: 0 var(--rw-space-3);
}

.fpga-action-grid {
  display: grid;
  gap: var(--rw-space-2);
}

.fpga-action-grid--double {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.fpga-action-btn {
  height: 48px;
}

.fpga-table-panel {
  align-content: start;
  display: grid;
  gap: var(--rw-space-2);
  min-height: 0;
}

.fpga-result-top {
  align-items: start;
  display: flex;
  gap: var(--rw-space-3);
  justify-content: space-between;
}

.fpga-result-top__meta {
  display: grid;
  gap: var(--rw-space-2);
  grid-auto-flow: column;
}

.fpga-chip {
  align-items: center;
  border: 1px solid var(--rw-color-border-subtle);
  border-radius: 999px;
  display: flex;
  min-height: 40px;
  padding: 0 var(--rw-space-3);
  white-space: nowrap;
}

.fpga-chip.is-positive {
  background: var(--rw-color-surface-positive);
}

.fpga-chip.is-negative {
  background: var(--rw-color-surface-negative);
}

.fpga-table {
  align-content: start;
  border: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  display: grid;
  min-height: 0;
  overflow: hidden;
}

.fpga-table__body {
  min-height: 0;
  overflow: auto;
}

.fpga-table__head,
.fpga-table__row {
  align-items: center;
  display: grid;
  gap: var(--rw-space-2);
  grid-template-columns: 1.7fr 1fr;
  min-height: 42px;
  padding: 0 var(--rw-space-3);
}

.fpga-table__head {
  background: var(--rw-color-surface-selected);
  color: var(--rw-color-text-muted);
  font-weight: var(--rw-font-weight-semibold);
}

.fpga-table__row,
.fpga-table__empty {
  border-top: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
}

.fpga-table__empty {
  align-items: center;
  color: var(--rw-color-text-muted);
  display: flex;
  justify-content: center;
  min-height: 72px;
  padding: 0 var(--rw-space-3);
}

.fpga-issue-list {
  border: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  padding: var(--rw-space-2) var(--rw-space-3);
}

.fpga-issue-item {
  color: var(--rw-color-status-danger);
  font-size: var(--rw-font-size-caption);
}

@media (max-width: tokens.rw-breakpoint('page-compact')) {
  .fpga-telemetry-page {
    height: auto;
    overflow: auto;
  }

  .fpga-telemetry-page__shell {
    grid-template-columns: 1fr;
    height: auto;
  }

  .fpga-action-grid--double {
    grid-template-columns: 1fr;
  }

  .fpga-result-top,
  .fpga-serial-panel__header,
  .fpga-serial-panel__top {
    display: grid;
  }

  .fpga-result-top__meta,
  .fpga-inline-actions {
    grid-auto-flow: row;
  }
}
</style>
