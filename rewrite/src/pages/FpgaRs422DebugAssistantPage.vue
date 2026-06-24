<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useNotify, usePolling } from '@/shared/composables';
import { formatDateTime } from '@/shared/utils/format';
import { formatWordHex, useFpgaRs422Workspace } from '@/features/fpga-rs422';

type DetailDialogKey = 'frame' | 'decode' | 'telemetry' | 'raw' | 'issues' | 'logs';

interface DecodeRow {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly type: 'header' | 'param';
}

const PAYLOAD_PREVIEW_LIMIT = 6;
const DECODE_PREVIEW_LIMIT = 10;
const TELEMETRY_PREVIEW_LIMIT = 6;
const RAW_PREVIEW_LIMIT = 4;
const ISSUE_PREVIEW_LIMIT = 4;
const LOG_PREVIEW_LIMIT = 6;

const workspace = useFpgaRs422Workspace();
const notify = useNotify();
const polling = usePolling(() => {
  workspace.refreshAll();
}, 500);

const detailDialogKey = ref<DetailDialogKey | null>(null);

const detailDialogVisible = computed({
  get: () => detailDialogKey.value !== null,
  set: (value: boolean) => {
    if (!value) {
      detailDialogKey.value = null;
    }
  },
});

const decodeRows = computed<readonly DecodeRow[]>(() => [
  ...workspace.commandHeaderRows.value.map((row) => ({
    key: row.key,
    label: row.label,
    value: row.value,
    detail: row.detail,
    type: 'header' as const,
  })),
  ...workspace.commandParamRows.value.map((row) => ({
    key: row.key,
    label: row.label,
    value: row.value,
    detail: row.detail,
    type: 'param' as const,
  })),
]);

const frameStats = computed(() => [
  {
    label: '帧长度',
    value: `${workspace.currentFrame.value?.build.bytes.length ?? 0} Byte`,
  },
  {
    label: '校验结果',
    value: workspace.currentFrame.value
      ? formatWordHex(workspace.currentFrame.value.build.checksum)
      : '--',
  },
  {
    label: '字段拆解',
    value: String(decodeRows.value.length),
  },
]);

const frameHexText = computed(() =>
  workspace.currentFrame.value?.build.bytes
    .map((byte) => byte.toString(16).toUpperCase().padStart(2, '0'))
    .join(' ') ?? '--',
);

const payloadPreviewRows = computed(() =>
  workspace.framePayloadRows.value.slice(0, PAYLOAD_PREVIEW_LIMIT),
);

const decodePreviewRows = computed(() =>
  decodeRows.value.slice(0, DECODE_PREVIEW_LIMIT),
);

const telemetryRows = computed(() => workspace.latestTelemetryFieldRows.value);
const telemetryPreviewRows = computed(() =>
  telemetryRows.value.slice(0, TELEMETRY_PREVIEW_LIMIT),
);

const rawPreviewRecords = computed(() =>
  workspace.rawRecords.value.slice(0, RAW_PREVIEW_LIMIT),
);

const issuePreviewMessages = computed(() =>
  workspace.latestIssueMessages.value.slice(0, ISSUE_PREVIEW_LIMIT),
);

const debugLogPreviewRows = computed(() =>
  workspace.activityLogs.value.slice(0, LOG_PREVIEW_LIMIT),
);

const detailDialogMeta = computed(() => {
  switch (detailDialogKey.value) {
    case 'frame':
      return {
        title: '遥控帧预览与发送状态',
        sub: '查看完整字节流、统计信息与 Payload words',
        countText: `${workspace.framePayloadRows.value.length} 个 Payload word`,
      };
    case 'decode':
      return {
        title: '全量字段拆解',
        sub: '查看完整帧结构、字段值、位定义与类型',
        countText: `${decodeRows.value.length} 项字段`,
      };
    case 'telemetry':
      return {
        title: '全量遥测字段',
        sub: '查看完整遥测字段、当前值与位范围说明',
        countText: `${telemetryRows.value.length} 项遥测字段`,
      };
    case 'raw':
      return {
        title: '原始收发记录',
        sub: '查看完整串口 TX/RX 原始数据流',
        countText: `${workspace.rawRecords.value.length} 条原始记录`,
      };
    case 'issues':
      return {
        title: '解析异常详情',
        sub: '查看当前遥测解析过程中收集到的全部异常信息',
        countText: `${workspace.latestIssueMessages.value.length} 条异常`,
      };
    case 'logs':
      return {
        title: '调试日志',
        sub: '查看最近保留的全部串口动作和调试事件',
        countText: `${workspace.activityLogs.value.length} 条日志`,
      };
    default:
      return {
        title: '',
        sub: '',
        countText: '',
      };
  }
});

function openDetail(key: DetailDialogKey): void {
  detailDialogKey.value = key;
}

function handleResend(): void {
  void workspace.resendPreparedCommand().then((result) => {
    if (!result) return;
    if (result.kind === 'sent') notify.success('重新发送成功');
    else if (result.kind === 'transport-error') notify.error('重新发送失败', result.error.message);
    else notify.error('重新发送失败', result.issues.map((issue) => issue.message).join('；'));
  });
}

function handlePrepare(): void {
  const build = workspace.prepareCurrentFrame();
  if (build?.valid) notify.success('已生成遥控帧');
  else if (build) notify.error('生成失败', build.issues.map((issue) => issue.message).join('；'));
}

function handleQuickCommand(moduleKey: string, groupKey: string, label: string): void {
  void workspace.sendQuickCommand(moduleKey, groupKey).then((result) => {
    if (!result) return;
    if (result.kind === 'sent') notify.success(`${label} 已执行`);
    else if (result.kind === 'transport-error') notify.error(`${label} 失败`, result.error.message);
    else notify.error(`${label} 失败`, result.issues.map((issue) => issue.message).join('；'));
  });
}

onMounted(() => {
  workspace.refreshAll();
  polling.start();
});
</script>

<template>
  <q-page class="fpga-debug-page">
    <div class="fpga-debug-page__content">
      <div class="fpga-debug-page__shell">
        <section class="fpga-panel fpga-debug-page__left">
          <div class="fpga-panel__header">
            <div class="fpga-panel__heading">
              <div class="fpga-panel__title">遥控帧预览与发送状态</div>
              <div class="fpga-panel__sub">从遥控遥测页生成，在调试助手中集中查看细节</div>
            </div>
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              icon="open_in_full"
              label="显示全部"
              @click="openDetail('frame')"
            />
          </div>

          <div class="fpga-code">{{ frameHexText }}</div>

          <div class="fpga-stat-grid">
            <div v-for="stat in frameStats" :key="stat.label" class="fpga-stat-card">
              <span>{{ stat.label }}</span>
              <strong>{{ stat.value }}</strong>
            </div>
          </div>

          <div class="fpga-action-grid fpga-action-grid--triple">
            <q-btn no-caps outline color="primary" class="fpga-action-btn" label="重新发送" @click="handleResend" />
            <q-btn no-caps outline color="primary" class="fpga-action-btn" label="清空记录" @click="workspace.clearLogs" />
            <q-btn no-caps outline color="primary" class="fpga-action-btn" label="生成遥控帧" @click="handlePrepare" />
          </div>

          <div class="fpga-section-block">
            <div class="fpga-panel__sub">Payload words</div>
            <div v-if="payloadPreviewRows.length > 0" class="fpga-word-list">
              <div v-for="row in payloadPreviewRows" :key="row.key" class="fpga-word-item">
                <span>{{ row.label }}</span>
                <strong>{{ row.value }}</strong>
              </div>
            </div>
            <div v-else class="fpga-empty">当前帧无 Payload words</div>
            <div v-if="workspace.framePayloadRows.value.length > payloadPreviewRows.length" class="fpga-more-hint">
              仅显示前 {{ payloadPreviewRows.length }} 项，点击“显示全部”查看完整内容
            </div>
          </div>

          <div class="fpga-section-block">
            <div class="fpga-panel__sub">快捷调试操作</div>
            <div class="fpga-action-grid fpga-action-grid--double">
              <q-btn no-caps outline color="primary" class="fpga-action-btn" label="链路复位" @click="handleQuickCommand('comm_rx_block', 'COMM_RX_CMD_GROUP_PULSE_RANGE_RST_C', '链路复位')" />
              <q-btn no-caps outline color="primary" class="fpga-action-btn" label="ADC复位" @click="handleQuickCommand('adc_rx_block', 'ADC_RX_CMD_GROUP_PULSE_RESET_C', 'ADC复位')" />
              <q-btn no-caps outline color="primary" class="fpga-action-btn" label="统计清零" @click="handleQuickCommand('comm_rx_block', 'COMM_RX_CMD_GROUP_PULSE_COUNT_CLR_C', '统计清零')" />
              <q-btn no-caps outline color="primary" class="fpga-action-btn" label="遥测轮询" @click="workspace.refreshTelemetry" />
              <q-btn no-caps outline color="primary" class="fpga-action-btn" label="导出日志" @click="workspace.appendSystemLog('导出日志', '已准备导出调试日志')" />
            </div>
          </div>
        </section>

        <section class="fpga-panel fpga-debug-page__center">
          <div class="fpga-panel__header">
            <div class="fpga-panel__heading">
              <div class="fpga-panel__title">全量字段拆解</div>
              <div class="fpga-panel__sub">完整帧结构与参数映射集中查看</div>
            </div>
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              icon="open_in_full"
              label="显示全部"
              @click="openDetail('decode')"
            />
          </div>

          <div class="fpga-table fpga-table--decode">
            <div class="fpga-table__head">
              <span>字段</span>
              <span>字段值</span>
              <span>定义</span>
              <span>类型</span>
            </div>
            <div class="fpga-table__body">
              <div v-if="decodePreviewRows.length === 0" class="fpga-table__empty">当前无可展示字段</div>
              <div v-for="row in decodePreviewRows" :key="row.key" class="fpga-table__row">
                <span>{{ row.label }}</span>
                <span>{{ row.value }}</span>
                <span>{{ row.detail }}</span>
                <span>{{ row.type }}</span>
              </div>
            </div>
          </div>

          <div v-if="decodeRows.length > decodePreviewRows.length" class="fpga-more-hint">
            当前仅显示前 {{ decodePreviewRows.length }} 项字段
          </div>
        </section>

        <section class="fpga-debug-page__right">
          <div class="fpga-panel">
            <div class="fpga-panel__header">
              <div class="fpga-panel__heading">
                <div class="fpga-panel__title">全量遥测字段</div>
                <div class="fpga-panel__sub">超过主页摘要范围的字段集中查看</div>
              </div>
              <q-btn
                flat
                dense
                no-caps
                color="primary"
                icon="open_in_full"
                label="显示全部"
                @click="openDetail('telemetry')"
              />
            </div>

            <div v-if="telemetryPreviewRows.length > 0" class="fpga-summary-list">
              <div v-for="row in telemetryPreviewRows" :key="row.key" class="fpga-summary-item">
                <div class="fpga-summary-item__main">
                  <span class="fpga-summary-item__label">{{ row.label }}</span>
                  <span class="fpga-summary-item__detail">{{ row.detail }}</span>
                </div>
                <strong>{{ row.value }}</strong>
              </div>
            </div>
            <div v-else class="fpga-empty">当前无可展示遥测字段</div>

            <div v-if="telemetryRows.length > telemetryPreviewRows.length" class="fpga-more-hint">
              当前仅显示前 {{ telemetryPreviewRows.length }} 项字段
            </div>
          </div>

          <div class="fpga-panel">
            <div class="fpga-panel__header">
              <div class="fpga-panel__heading">
                <div class="fpga-panel__title">原始收发记录</div>
                <div class="fpga-panel__sub">串口 TX/RX 原始数据流</div>
              </div>
              <q-btn
                flat
                dense
                no-caps
                color="primary"
                icon="open_in_full"
                label="显示全部"
                @click="openDetail('raw')"
              />
            </div>

            <div v-if="rawPreviewRecords.length > 0" class="fpga-record-list">
              <div v-for="record in rawPreviewRecords" :key="record.id" class="fpga-record-item">
                <span class="fpga-record-item__tag">{{ record.tag }}</span>
                <span class="fpga-record-item__content">{{ record.content }}</span>
              </div>
            </div>
            <div v-else class="fpga-empty">当前暂无原始收发记录</div>

            <div v-if="workspace.rawRecords.value.length > rawPreviewRecords.length" class="fpga-more-hint">
              当前仅显示前 {{ rawPreviewRecords.length }} 条记录
            </div>
          </div>

          <div class="fpga-panel">
            <div class="fpga-panel__header">
              <div class="fpga-panel__heading">
                <div class="fpga-panel__title">解析异常详情</div>
                <div class="fpga-panel__sub">若出现长度不匹配、CRC 错误、未知 Group，会在这里看到</div>
              </div>
              <q-btn
                flat
                dense
                no-caps
                color="primary"
                icon="open_in_full"
                label="显示全部"
                @click="openDetail('issues')"
              />
            </div>

            <div v-if="issuePreviewMessages.length > 0" class="fpga-issue-list">
              <div v-for="message in issuePreviewMessages" :key="message" class="fpga-issue-item">{{ message }}</div>
            </div>
            <div v-else class="fpga-empty">当前无解析异常</div>

            <div v-if="workspace.latestIssueMessages.value.length > issuePreviewMessages.length" class="fpga-more-hint">
              当前仅显示前 {{ issuePreviewMessages.length }} 条异常
            </div>
          </div>
        </section>
      </div>

      <section class="fpga-panel fpga-debug-page__bottom">
        <div class="fpga-panel__header">
          <div class="fpga-panel__heading">
            <div class="fpga-panel__title">调试日志</div>
            <div class="fpga-panel__sub">保留最近的串口动作和调试事件</div>
          </div>
          <q-btn
            flat
            dense
            no-caps
            color="primary"
            icon="open_in_full"
            label="显示全部"
            @click="openDetail('logs')"
          />
        </div>

        <div class="fpga-log-list">
          <div v-if="debugLogPreviewRows.length === 0" class="fpga-table__empty">当前暂无调试日志</div>
          <div v-for="log in debugLogPreviewRows" :key="log.id" class="fpga-log-item">
            <span class="fpga-log-item__time">{{ formatDateTime(log.occurredAt) }}</span>
            <span class="fpga-log-item__tag">{{ log.tag }}</span>
            <span class="fpga-log-item__text">{{ log.title }} / {{ log.detail }}</span>
          </div>
        </div>

        <div v-if="workspace.activityLogs.value.length > debugLogPreviewRows.length" class="fpga-more-hint">
          当前仅显示前 {{ debugLogPreviewRows.length }} 条日志
        </div>
      </section>
    </div>

    <q-dialog v-model="detailDialogVisible">
      <q-card class="rw-dialog-xl fpga-detail-dialog">
        <q-card-section class="fpga-detail-dialog__header">
          <div class="fpga-detail-dialog__heading">
            <div class="fpga-panel__title">{{ detailDialogMeta.title }}</div>
            <div class="fpga-panel__sub">{{ detailDialogMeta.sub }}</div>
          </div>
          <div class="fpga-detail-dialog__actions">
            <span class="fpga-detail-dialog__count">{{ detailDialogMeta.countText }}</span>
            <q-btn flat round dense icon="close" aria-label="关闭详情" v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="rw-dialog-scroll-body fpga-detail-dialog__body">
          <template v-if="detailDialogKey === 'frame'">
            <div class="fpga-detail-stack">
              <div class="fpga-detail-section">
                <div class="fpga-detail-section__title">遥控帧字节流</div>
                <div class="fpga-code fpga-code--detail">{{ frameHexText }}</div>
              </div>

              <div class="fpga-detail-section">
                <div class="fpga-detail-section__title">统计信息</div>
                <div class="fpga-stat-grid">
                  <div v-for="stat in frameStats" :key="stat.label" class="fpga-stat-card">
                    <span>{{ stat.label }}</span>
                    <strong>{{ stat.value }}</strong>
                  </div>
                </div>
              </div>

              <div class="fpga-detail-section">
                <div class="fpga-detail-section__title">Payload words</div>
                <div v-if="workspace.framePayloadRows.value.length > 0" class="fpga-word-list">
                  <div v-for="row in workspace.framePayloadRows.value" :key="row.key" class="fpga-word-item">
                    <span>{{ row.label }}</span>
                    <strong>{{ row.value }}</strong>
                  </div>
                </div>
                <div v-else class="fpga-empty">当前帧无 Payload words</div>
              </div>
            </div>
          </template>

          <template v-else-if="detailDialogKey === 'decode'">
            <div class="fpga-table fpga-table--decode fpga-table--detail">
              <div class="fpga-table__head">
                <span>字段</span>
                <span>字段值</span>
                <span>定义</span>
                <span>类型</span>
              </div>
              <div class="fpga-table__body">
                <div v-if="decodeRows.length === 0" class="fpga-table__empty">当前无可展示字段</div>
                <div v-for="row in decodeRows" :key="row.key" class="fpga-table__row">
                  <span>{{ row.label }}</span>
                  <span>{{ row.value }}</span>
                  <span>{{ row.detail }}</span>
                  <span>{{ row.type }}</span>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="detailDialogKey === 'telemetry'">
            <div v-if="telemetryRows.length > 0" class="fpga-summary-list">
              <div v-for="row in telemetryRows" :key="row.key" class="fpga-summary-item">
                <div class="fpga-summary-item__main">
                  <span class="fpga-summary-item__label">{{ row.label }}</span>
                  <span class="fpga-summary-item__detail">{{ row.detail }}</span>
                </div>
                <strong>{{ row.value }}</strong>
              </div>
            </div>
            <div v-else class="fpga-empty">当前无可展示遥测字段</div>
          </template>

          <template v-else-if="detailDialogKey === 'raw'">
            <div v-if="workspace.rawRecords.value.length > 0" class="fpga-record-list">
              <div v-for="record in workspace.rawRecords.value" :key="record.id" class="fpga-record-item fpga-record-item--detail">
                <span class="fpga-record-item__time">{{ formatDateTime(record.occurredAt) }}</span>
                <span class="fpga-record-item__tag">{{ record.tag }}</span>
                <span class="fpga-record-item__content fpga-record-item__content--wrap">{{ record.content }}</span>
              </div>
            </div>
            <div v-else class="fpga-empty">当前暂无原始收发记录</div>
          </template>

          <template v-else-if="detailDialogKey === 'issues'">
            <div v-if="workspace.latestIssueMessages.value.length > 0" class="fpga-issue-list">
              <div v-for="message in workspace.latestIssueMessages.value" :key="message" class="fpga-issue-item">{{ message }}</div>
            </div>
            <div v-else class="fpga-empty">当前无解析异常</div>
          </template>

          <template v-else-if="detailDialogKey === 'logs'">
            <div class="fpga-log-list">
              <div v-if="workspace.activityLogs.value.length === 0" class="fpga-table__empty">当前暂无调试日志</div>
              <div v-for="log in workspace.activityLogs.value" :key="log.id" class="fpga-log-item">
                <span class="fpga-log-item__time">{{ formatDateTime(log.occurredAt) }}</span>
                <span class="fpga-log-item__tag">{{ log.tag }}</span>
                <span class="fpga-log-item__text fpga-log-item__text--wrap">{{ log.title }} / {{ log.detail }}</span>
              </div>
            </div>
          </template>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped lang="scss">
@use '../css/tokens' as tokens;

.fpga-debug-page {
  background: var(--rw-color-surface-app);
  min-height: calc(100vh - 52px);
  padding: var(--rw-space-3);
}

.fpga-debug-page__content {
  display: grid;
  gap: var(--rw-space-3);
  min-height: 100%;
}

.fpga-debug-page__shell {
  align-items: start;
  display: grid;
  gap: var(--rw-space-3);
  grid-template-columns: minmax(280px, 0.92fr) minmax(0, 1.12fr) minmax(280px, 0.96fr);
}

.fpga-debug-page__right {
  display: grid;
  gap: var(--rw-space-3);
}

.fpga-panel {
  background: var(--rw-color-surface-base);
  border: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-panel);
  display: grid;
  gap: var(--rw-space-3);
  min-width: 0;
  overflow: hidden;
  padding: var(--rw-space-3);
}

.fpga-panel__header,
.fpga-detail-dialog__header {
  align-items: start;
  display: flex;
  gap: var(--rw-space-3);
  justify-content: space-between;
}

.fpga-panel__heading {
  display: grid;
  gap: var(--rw-space-1);
  min-width: 0;
}

.fpga-panel__title,
.fpga-detail-section__title {
  color: var(--rw-color-text-primary);
  font-size: var(--rw-font-size-title-sm);
  font-weight: var(--rw-font-weight-semibold);
  line-height: var(--rw-line-height-title-sm);
}

.fpga-panel__sub,
.fpga-detail-dialog__count,
.fpga-more-hint {
  color: var(--rw-color-text-muted);
  font-size: var(--rw-font-size-label);
  line-height: var(--rw-line-height-label);
}

.fpga-section-block,
.fpga-detail-stack,
.fpga-detail-section,
.fpga-stat-grid,
.fpga-action-grid,
.fpga-word-list,
.fpga-summary-list,
.fpga-record-list,
.fpga-issue-list,
.fpga-log-list {
  display: grid;
  gap: var(--rw-space-2);
}

.fpga-code {
  background: var(--rw-color-surface-selected);
  border: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  font-family: monospace;
  font-size: var(--rw-font-size-body);
  line-height: var(--rw-line-height-body);
  min-height: 72px;
  overflow-wrap: anywhere;
  padding: var(--rw-space-2) var(--rw-space-3);
}

.fpga-code--detail {
  min-height: 0;
}

.fpga-stat-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.fpga-action-grid--triple {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.fpga-action-grid--double {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.fpga-action-btn {
  height: 44px;
}

.fpga-stat-card,
.fpga-word-item,
.fpga-summary-item,
.fpga-record-item,
.fpga-issue-item {
  border: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  padding: var(--rw-space-2) var(--rw-space-3);
}

.fpga-stat-card {
  display: grid;
  gap: var(--rw-space-1);
  min-height: 78px;
}

.fpga-stat-card span {
  color: var(--rw-color-text-muted);
  font-size: var(--rw-font-size-label);
  line-height: var(--rw-line-height-label);
}

.fpga-stat-card strong,
.fpga-word-item strong,
.fpga-summary-item strong {
  color: var(--rw-color-text-primary);
  font-size: var(--rw-font-size-title-sm);
  font-weight: var(--rw-font-weight-semibold);
  line-height: var(--rw-line-height-title-sm);
}

.fpga-word-item,
.fpga-summary-item {
  align-items: center;
  display: grid;
  gap: var(--rw-space-2);
}

.fpga-word-item {
  grid-template-columns: minmax(0, 1fr) auto;
}

.fpga-summary-item {
  grid-template-columns: minmax(0, 1fr) auto;
}

.fpga-summary-item__main {
  display: grid;
  gap: var(--rw-space-1);
  min-width: 0;
}

.fpga-summary-item__label {
  color: var(--rw-color-text-primary);
  font-size: var(--rw-font-size-body);
  line-height: var(--rw-line-height-body);
}

.fpga-summary-item__detail {
  color: var(--rw-color-text-muted);
  font-size: var(--rw-font-size-caption);
  line-height: var(--rw-line-height-caption);
}

.fpga-record-item {
  align-items: center;
  display: grid;
  gap: var(--rw-space-2);
  grid-template-columns: 36px minmax(0, 1fr);
}

.fpga-record-item--detail {
  grid-template-columns: 132px 36px minmax(0, 1fr);
}

.fpga-record-item__time,
.fpga-log-item__time,
.fpga-log-item__tag {
  color: var(--rw-color-text-muted);
  font-size: var(--rw-font-size-caption);
  line-height: var(--rw-line-height-caption);
}

.fpga-record-item__tag {
  color: var(--rw-color-text-primary);
  font-size: var(--rw-font-size-label);
  font-weight: var(--rw-font-weight-semibold);
  line-height: var(--rw-line-height-label);
}

.fpga-record-item__content,
.fpga-log-item__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fpga-record-item__content--wrap,
.fpga-log-item__text--wrap {
  overflow-wrap: anywhere;
  text-overflow: initial;
  white-space: normal;
}

.fpga-table {
  border: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  display: grid;
  min-width: 0;
  overflow: hidden;
}

.fpga-table__head,
.fpga-table__row {
  align-items: center;
  display: grid;
  gap: var(--rw-space-2);
  min-height: 42px;
  padding: 0 var(--rw-space-3);
}

.fpga-table--decode .fpga-table__head,
.fpga-table--decode .fpga-table__row {
  grid-template-columns: 1.4fr 1fr 0.96fr 0.72fr;
}

.fpga-table__head {
  background: var(--rw-color-surface-selected);
  color: var(--rw-color-text-muted);
  font-size: var(--rw-font-size-label);
  font-weight: var(--rw-font-weight-semibold);
  line-height: var(--rw-line-height-label);
}

.fpga-table__body {
  max-height: 420px;
  min-height: 0;
  overflow: auto;
}

.fpga-table--detail .fpga-table__body {
  max-height: none;
}

.fpga-table__row,
.fpga-log-item + .fpga-log-item {
  border-top: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
}

.fpga-log-list {
  border: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  gap: 0;
  overflow: hidden;
}

.fpga-log-item {
  align-items: center;
  display: grid;
  gap: var(--rw-space-2);
  grid-template-columns: 132px 44px minmax(0, 1fr);
  min-height: 40px;
  padding: 0 var(--rw-space-3);
}

.fpga-issue-item {
  color: var(--rw-color-status-danger);
  font-size: var(--rw-font-size-label);
  line-height: var(--rw-line-height-label);
}

.fpga-empty,
.fpga-table__empty {
  align-items: center;
  background: var(--rw-color-surface-selected);
  border: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  color: var(--rw-color-text-muted);
  display: flex;
  justify-content: center;
  min-height: 72px;
  padding: var(--rw-space-3);
}

.fpga-table__empty {
  border: 0;
  border-radius: 0;
}

.fpga-detail-dialog {
  overflow: hidden;
}

.fpga-detail-dialog__actions {
  align-items: center;
  display: flex;
  gap: var(--rw-space-2);
}

.fpga-detail-dialog__body {
  display: grid;
  gap: var(--rw-space-3);
}

@media (max-width: tokens.rw-breakpoint('page-narrow')) {
  .fpga-debug-page__shell {
    grid-template-columns: minmax(300px, 0.94fr) minmax(0, 1.06fr);
  }

  .fpga-debug-page__right {
    grid-column: 1 / -1;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: tokens.rw-breakpoint('page-stack')) {
  .fpga-debug-page {
    padding: var(--rw-space-page-compact);
  }

  .fpga-debug-page__shell {
    grid-template-columns: 1fr;
  }

  .fpga-debug-page__right {
    grid-column: auto;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  .fpga-stat-grid,
  .fpga-action-grid--triple {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .fpga-panel__header,
  .fpga-detail-dialog__header {
    display: grid;
  }
}

@media (max-width: tokens.rw-breakpoint('page-compact')) {
  .fpga-stat-grid,
  .fpga-action-grid--triple,
  .fpga-action-grid--double,
  .fpga-debug-page__right {
    grid-template-columns: 1fr;
  }

  .fpga-summary-item,
  .fpga-word-item,
  .fpga-record-item,
  .fpga-record-item--detail,
  .fpga-log-item,
  .fpga-table--decode .fpga-table__head,
  .fpga-table--decode .fpga-table__row {
    grid-template-columns: 1fr;
  }

  .fpga-record-item__content,
  .fpga-log-item__text {
    white-space: normal;
  }
}
</style>
