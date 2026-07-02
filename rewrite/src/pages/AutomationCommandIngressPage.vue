<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRewriteRuntime } from '@/app/rewriteRuntime';
import { useAsyncAction, useNotify, usePolling } from '@/shared/composables';
import { formatDateTime } from '@/shared/utils/format';
import StatusBadge from '@/widgets/StatusBadge.vue';
import { healthStatusMap, linkTestStatusMap, commandResultMap } from '@/features/command-ingress/components/scoeStatusMap';

const ui = {
  title: '指令接入联调',
  subtitle: '稳定版指令接入页面，先解决现有程序中的自动化测试链路可观测和可联调问题。',
  controlTitle: 'SCOE / 测试数据',
  statsTitle: '运行状态',
  commandLogTitle: '最近指令日志',
  sendHexLabel: '测试 HEX',
  connectionLabel: '发送连接',
  sendButton: '发送测试数据',
  clearLog: '清空日志',
  refresh: '刷新',
  noCommands: '当前没有指令日志',
  noConnections: '当前没有可用连接',
  invalidHex: '请先输入 HEX 并选择一个可用连接',
  sent: '测试数据已发送',
  connectUnavailable: '当前实现未开放 SCOE 网络连接配置，先保留状态观察和测试数据发送能力。',
} as const;

const $q = useQuasar();
const notify = useNotify();
const { execute, isOperating } = useAsyncAction();
const runtime = useRewriteRuntime();

const commandIngressService = runtime.features.commandIngressService;
const connectionService = runtime.features.connectionService;

const selectedTarget = ref('');
const hexInput = ref('');

const scoeStatistics = ref(commandIngressService.getScoeStatistics());
const scoeRuntimeStatus = ref(commandIngressService.getScoeRuntimeStatus());
const commandLog = ref(commandIngressService.getCommandLog());
const transportTargets = ref(connectionService.listTransportTargets({ availableOnly: true }));

const targetOptions = computed(() =>
  transportTargets.value.map((target) => ({
    label: `${target.label} · ${target.routeLabel}`,
    value: target.targetId,
  })),
);

const recentCommands = computed(() =>
  [...commandLog.value]
    .slice(-12)
    .reverse(),
);

function refreshData(): void {
  scoeStatistics.value = commandIngressService.getScoeStatistics();
  scoeRuntimeStatus.value = commandIngressService.getScoeRuntimeStatus();
  commandLog.value = commandIngressService.getCommandLog();
  transportTargets.value = connectionService.listTransportTargets({ availableOnly: true });
}

const polling = usePolling(refreshData, 1000);

async function sendTestHex(): Promise<void> {
  if (!hexInput.value.trim() || !selectedTarget.value) {
    notify.warning(ui.invalidHex);
    return;
  }

  const target = transportTargets.value.find((item) => item.targetId === selectedTarget.value);
  if (!target) {
    notify.warning(ui.noConnections);
    return;
  }

  await execute('command-ingress-send-test', async () => {
    await commandIngressService.sendTestData(hexInput.value.trim(), target.connectionId);
    hexInput.value = '';
    notify.success(ui.sent);
  });
}

function clearLog(): void {
  commandIngressService.clearCommandLog();
  refreshData();
}

function showUnavailableMessage(): void {
  $q.notify({
    type: 'info',
    message: ui.connectUnavailable,
  });
}

onMounted(() => {
  refreshData();
  polling.start();
});
</script>

<template>
  <q-page class="automation-command-page">
    <div class="automation-command-page__content">
      <section class="automation-command-page__hero">
        <div>
          <h1 class="automation-command-page__title">{{ ui.title }}</h1>
          <p class="automation-command-page__subtitle">{{ ui.subtitle }}</p>
        </div>
        <q-btn flat icon="refresh" :label="ui.refresh" @click="refreshData" />
      </section>

      <section class="automation-command-page__grid">
        <q-card flat bordered class="automation-command-panel">
          <q-card-section class="automation-command-panel__section">
            <div class="automation-command-panel__title">{{ ui.controlTitle }}</div>
            <div class="automation-command-panel__actions">
              <q-btn flat color="primary" label="连接能力说明" @click="showUnavailableMessage" />
              <q-btn flat color="negative" :label="ui.clearLog" @click="clearLog" />
            </div>
            <q-select
              v-model="selectedTarget"
              dense
              outlined
              emit-value
              map-options
              :options="targetOptions"
              :label="ui.connectionLabel"
            />
            <q-input
              v-model="hexInput"
              dense
              outlined
              type="textarea"
              autogrow
              :label="ui.sendHexLabel"
            />
            <q-btn
              unelevated
              color="primary"
              :label="ui.sendButton"
              :loading="isOperating('command-ingress-send-test')"
              @click="sendTestHex"
            />
          </q-card-section>
        </q-card>

        <q-card flat bordered class="automation-command-panel">
          <q-card-section class="automation-command-panel__section">
            <div class="automation-command-panel__title">{{ ui.statsTitle }}</div>
            <div class="automation-command-stats">
              <div class="automation-command-stat">
                <span>已接收指令</span>
                <strong>{{ scoeStatistics.commandReceiveCount }}</strong>
              </div>
              <div class="automation-command-stat">
                <span>成功</span>
                <strong>{{ scoeStatistics.commandSuccessCount }}</strong>
              </div>
              <div class="automation-command-stat">
                <span>失败</span>
                <strong>{{ scoeStatistics.commandErrorCount }}</strong>
              </div>
              <div class="automation-command-stat">
                <span>已装载卫星</span>
                <strong>{{ scoeRuntimeStatus.loadedSatelliteId || '--' }}</strong>
              </div>
            </div>
            <div class="automation-command-badges">
              <div class="automation-command-badges__row">
                <span>健康状态</span>
                <StatusBadge :status="scoeRuntimeStatus.healthStatus" :status-map="healthStatusMap" />
              </div>
              <div class="automation-command-badges__row">
                <span>链路测试</span>
                <StatusBadge :status="scoeRuntimeStatus.linkTestResult" :status-map="linkTestStatusMap" />
              </div>
              <div class="automation-command-badges__row">
                <span>帧已装载</span>
                <q-chip dense :color="scoeRuntimeStatus.scoeFramesLoaded ? 'positive' : 'grey-5'" :text-color="scoeRuntimeStatus.scoeFramesLoaded ? 'white' : 'grey-8'">
                  {{ scoeRuntimeStatus.scoeFramesLoaded ? '是' : '否' }}
                </q-chip>
              </div>
              <div class="automation-command-badges__row">
                <span>最后指令码</span>
                <strong>{{ scoeRuntimeStatus.lastCommandCode || '--' }}</strong>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </section>

      <q-card flat bordered class="automation-command-panel">
        <q-card-section class="automation-command-panel__section">
          <div class="automation-command-panel__title">{{ ui.commandLogTitle }}</div>
          <div v-if="recentCommands.length > 0" class="automation-command-log">
            <div v-for="entry in recentCommands" :key="entry.id" class="automation-command-log__item">
              <div class="automation-command-log__main">
                <div class="automation-command-log__title">0x{{ entry.commandCode.toString(16).toUpperCase().padStart(2, '0') }}</div>
                <div class="automation-command-log__meta">
                  <span>{{ formatDateTime(entry.timestamp) }}</span>
                  <span v-if="entry.durationMs !== undefined">{{ entry.durationMs }} ms</span>
                  <span v-if="entry.error">{{ entry.error }}</span>
                </div>
              </div>
              <StatusBadge :status="entry.result" :status-map="commandResultMap" />
            </div>
          </div>
          <div v-else class="automation-command-log__empty">{{ ui.noCommands }}</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
@use '../css/tokens' as tokens;

.automation-command-page {
  background: var(--rw-color-surface-app);
  min-height: 100%;
  padding: var(--rw-space-6);
}

.automation-command-page__content {
  display: grid;
  gap: var(--rw-space-4);
  margin: 0 auto;
  max-width: 1360px;
}

.automation-command-page__hero {
  align-items: start;
  display: flex;
  justify-content: space-between;
  gap: var(--rw-space-4);
}

.automation-command-page__title {
  color: var(--rw-color-text-primary);
  font-size: var(--rw-font-size-title-lg);
  font-weight: var(--rw-font-weight-semibold);
  margin: 0;
}

.automation-command-page__subtitle {
  color: var(--rw-color-text-secondary);
  margin: var(--rw-space-2) 0 0;
}

.automation-command-page__grid {
  display: grid;
  gap: var(--rw-space-4);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.automation-command-panel {
  border-radius: var(--rw-radius-panel);
}

.automation-command-panel__section {
  display: grid;
  gap: var(--rw-space-3);
}

.automation-command-panel__title {
  color: var(--rw-color-text-primary);
  font-size: var(--rw-font-size-title-sm);
  font-weight: var(--rw-font-weight-semibold);
}

.automation-command-panel__actions,
.automation-command-stats,
.automation-command-badges,
.automation-command-log {
  display: grid;
  gap: var(--rw-space-2);
}

.automation-command-panel__actions {
  grid-template-columns: repeat(2, max-content);
}

.automation-command-stats {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.automation-command-stat,
.automation-command-log__item {
  border: 1px solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  padding: var(--rw-space-3);
}

.automation-command-stat span,
.automation-command-log__meta,
.automation-command-log__empty {
  color: var(--rw-color-text-secondary);
  font-size: var(--rw-font-size-caption);
}

.automation-command-stat strong,
.automation-command-log__title {
  color: var(--rw-color-text-primary);
  display: block;
  font-weight: var(--rw-font-weight-semibold);
  margin-top: 4px;
}

.automation-command-badges {
  background: var(--rw-color-surface-base);
  border: 1px solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  padding: var(--rw-space-3);
}

.automation-command-badges__row {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: var(--rw-space-2);
}

.automation-command-log__item {
  align-items: center;
  display: flex;
  gap: var(--rw-space-3);
}

.automation-command-log__main {
  flex: 1;
  min-width: 0;
}

.automation-command-log__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--rw-space-2);
  margin-top: 4px;
}

.automation-command-log__empty {
  align-items: center;
  border: 1px dashed var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  display: flex;
  justify-content: center;
  min-height: 96px;
}

@media (max-width: tokens.rw-breakpoint('page-stack')) {
  .automation-command-page {
    padding: var(--rw-space-4);
  }

  .automation-command-page__hero,
  .automation-command-page__grid {
    display: grid;
  }

  .automation-command-stats {
    grid-template-columns: 1fr;
  }

  .automation-command-log__item {
    align-items: start;
    display: grid;
  }
}
</style>
