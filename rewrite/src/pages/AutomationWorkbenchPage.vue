<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRewriteRuntime } from '@/app/rewriteRuntime';
import { useRewritePlatform } from '@/app/useRewritePlatform';
import { usePolling } from '@/shared/composables';
import SummaryMetricGrid from '@/widgets/SummaryMetricGrid.vue';
import StatusBadge from '@/widgets/StatusBadge.vue';
import { connectionStatusMap } from '@/features/connection/components/connectionStatusMap';
import { healthStatusMap, linkTestStatusMap } from '@/features/command-ingress/components/scoeStatusMap';
import { TASK_STATUS_MAP, resolveDisplayStatus } from '@/features/task/components/taskStatusMap';
import ConnectionPage from '@/pages/ConnectionPage.vue';
import FrameListPage from '@/pages/FrameListPage.vue';
import SendPage from '@/pages/SendPage.vue';
import AutomationTasksPage from '@/pages/AutomationTasksPage.vue';
import AutomationCommandIngressPage from '@/pages/AutomationCommandIngressPage.vue';

type AutomationTab =
  | 'overview'
  | 'connections'
  | 'frames'
  | 'send'
  | 'tasks'
  | 'command-ingress';

interface SummaryMetric {
  readonly id: string;
  readonly label: string;
  readonly value: string | number;
  readonly caption?: string;
  readonly icon: string;
}

const TAB_OPTIONS: readonly { value: AutomationTab; label: string; icon: string }[] = [
  { value: 'overview', label: '总览', icon: 'dashboard' },
  { value: 'connections', label: '连接准备', icon: 'link' },
  { value: 'frames', label: '帧定义', icon: 'view_agenda' },
  { value: 'send', label: '发送调试', icon: 'send' },
  { value: 'tasks', label: '任务编排', icon: 'assignment' },
  { value: 'command-ingress', label: '指令接入', icon: 'settings_input_antenna' },
];

const route = useRoute();
const router = useRouter();
const { bridgeInfo } = useRewritePlatform();
const runtime = useRewriteRuntime();

const connectionService = runtime.features.connectionService;
const frameService = runtime.features.frameService;
const taskService = runtime.features.taskService;
const commandIngressService = runtime.features.commandIngressService;
const northboundService = runtime.features.northboundService;

const activeTab = ref<AutomationTab>('overview');

function normalizeTab(value: unknown): AutomationTab {
  const candidate = typeof value === 'string' ? value : 'overview';
  return TAB_OPTIONS.some((option) => option.value === candidate)
    ? (candidate as AutomationTab)
    : 'overview';
}

watch(
  () => route.query.tab,
  (tab) => {
    activeTab.value = normalizeTab(tab);
  },
  { immediate: true },
);

watch(activeTab, (tab) => {
  const current = normalizeTab(route.query.tab);
  if (current === tab) return;
  void router.replace({
    path: '/automation',
    query: tab === 'overview' ? {} : { tab },
  });
});

const bridgeLabel = computed(() => bridgeInfo.value?.name ?? 'desktop bridge pending');

const connectionSummaries = ref(connectionService.listConnectionSummaries());
const taskSnapshot = ref(taskService.getSnapshot());
const scoeStatistics = ref(commandIngressService.getScoeStatistics());
const scoeRuntimeStatus = ref(commandIngressService.getScoeRuntimeStatus());
const northboundSession = ref(northboundService.getSessionStatus());

const activeTaskCount = computed(() =>
  taskSnapshot.value.instances.filter((instance) =>
    instance.lifecycle === 'created' || instance.lifecycle === 'running' || instance.lifecycle === 'paused',
  ).length,
);

const recentTask = computed(() => {
  const instances = [...taskSnapshot.value.instances];
  instances.sort((left, right) => {
    const leftTime = new Date(left.startedAt ?? left.completedAt ?? left.failedAt ?? 0).getTime();
    const rightTime = new Date(right.startedAt ?? right.completedAt ?? right.failedAt ?? 0).getTime();
    return rightTime - leftTime;
  });
  return instances[0] ?? null;
});

const metrics = computed<SummaryMetric[]>(() => [
  {
    id: 'connections',
    label: '可用连接',
    value: connectionSummaries.value.filter((summary) => summary.lifecycle === 'connected').length,
    caption: `总计 ${connectionSummaries.value.length}`,
    icon: 'router',
  },
  {
    id: 'frames',
    label: '发送帧',
    value: frameService.listFrames({ direction: 'send' }).length,
    caption: `全部帧 ${frameService.listFrames().length}`,
    icon: 'view_agenda',
  },
  {
    id: 'tasks',
    label: '自动化任务',
    value: activeTaskCount.value,
    caption: `累计 ${taskSnapshot.value.statistics.totalCreated} · 完成 ${taskSnapshot.value.statistics.totalCompleted}`,
    icon: 'assignment',
  },
  {
    id: 'ingress',
    label: '接入指令',
    value: scoeStatistics.value.commandReceiveCount,
    caption: `成功 ${scoeStatistics.value.commandSuccessCount} · 失败 ${scoeStatistics.value.commandErrorCount}`,
    icon: 'settings_input_antenna',
  },
]);

function refreshData(): void {
  connectionSummaries.value = connectionService.listConnectionSummaries();
  taskSnapshot.value = taskService.getSnapshot();
  scoeStatistics.value = commandIngressService.getScoeStatistics();
  scoeRuntimeStatus.value = commandIngressService.getScoeRuntimeStatus();
  northboundSession.value = northboundService.getSessionStatus();
}

const polling = usePolling(refreshData, 1200);

onMounted(() => {
  refreshData();
  polling.start();
});
</script>

<template>
  <q-page class="automation-page">
    <div class="automation-page__content">
      <section class="automation-page__hero">
        <div>
          <p class="automation-page__eyebrow">{{ bridgeLabel }}</p>
          <h1 class="automation-page__title">自动化测试</h1>
          <p class="automation-page__subtitle">
            自动化测试不是独立拼接的新系统，而是把连接准备、帧定义、发送调试、任务编排和指令接入收进同一个测试工作区。
          </p>
        </div>
        <q-btn flat round icon="refresh" aria-label="刷新自动化测试" @click="refreshData" />
      </section>

      <q-tabs
        v-model="activeTab"
        dense
        inline-label
        class="automation-page__tabs"
      >
        <q-tab
          v-for="tab in TAB_OPTIONS"
          :key="tab.value"
          :name="tab.value"
          :icon="tab.icon"
          :label="tab.label"
          no-caps
        />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated class="automation-page__panels">
        <q-tab-panel name="overview" class="automation-page__panel automation-page__panel--overview">
          <SummaryMetricGrid :metrics="metrics" />

          <div class="automation-overview-grid">
            <q-card flat bordered class="automation-overview-card">
              <q-card-section class="automation-overview-card__section">
                <div class="automation-overview-card__title">链路准备状态</div>
                <div class="automation-overview-list">
                  <div class="automation-overview-row">
                    <span>连接状态</span>
                    <StatusBadge
                      :status="connectionSummaries.find((summary) => summary.lifecycle === 'connected')?.lifecycle ?? 'disconnected'"
                      :status-map="connectionStatusMap"
                    />
                  </div>
                  <div class="automation-overview-row">
                    <span>发送帧数量</span>
                    <strong>{{ frameService.listFrames({ direction: 'send' }).length }}</strong>
                  </div>
                  <div class="automation-overview-row">
                    <span>接收帧数量</span>
                    <strong>{{ frameService.listFrames({ direction: 'receive' }).length }}</strong>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="automation-overview-card">
              <q-card-section class="automation-overview-card__section">
                <div class="automation-overview-card__title">自动化执行状态</div>
                <div class="automation-overview-list">
                  <div class="automation-overview-row">
                    <span>活动任务</span>
                    <strong>{{ activeTaskCount }}</strong>
                  </div>
                  <div class="automation-overview-row">
                    <span>最近任务</span>
                    <div v-if="recentTask" class="automation-overview-inline">
                      <span>{{ recentTask.definitionRef.name }}</span>
                      <StatusBadge
                        :status="resolveDisplayStatus(recentTask.lifecycle, recentTask.definitionRef)"
                        :status-map="TASK_STATUS_MAP"
                      />
                    </div>
                    <strong v-else>暂无</strong>
                  </div>
                  <div class="automation-overview-row">
                    <span>Northbound 会话</span>
                    <strong>{{ northboundSession.activeTestCases.size }}</strong>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="automation-overview-card">
              <q-card-section class="automation-overview-card__section">
                <div class="automation-overview-card__title">指令接入状态</div>
                <div class="automation-overview-list">
                  <div class="automation-overview-row">
                    <span>健康检查</span>
                    <StatusBadge :status="scoeRuntimeStatus.healthStatus" :status-map="healthStatusMap" />
                  </div>
                  <div class="automation-overview-row">
                    <span>链路测试</span>
                    <StatusBadge :status="scoeRuntimeStatus.linkTestResult" :status-map="linkTestStatusMap" />
                  </div>
                  <div class="automation-overview-row">
                    <span>已接收指令</span>
                    <strong>{{ scoeStatistics.commandReceiveCount }}</strong>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-tab-panel>

        <q-tab-panel name="connections" class="automation-page__panel automation-page__panel--embedded">
          <ConnectionPage />
        </q-tab-panel>

        <q-tab-panel name="frames" class="automation-page__panel automation-page__panel--embedded">
          <FrameListPage />
        </q-tab-panel>

        <q-tab-panel name="send" class="automation-page__panel automation-page__panel--embedded">
          <SendPage />
        </q-tab-panel>

        <q-tab-panel name="tasks" class="automation-page__panel automation-page__panel--embedded">
          <AutomationTasksPage />
        </q-tab-panel>

        <q-tab-panel name="command-ingress" class="automation-page__panel automation-page__panel--embedded">
          <AutomationCommandIngressPage />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
@use '../css/tokens' as tokens;

.automation-page {
  background:
    radial-gradient(circle at top right, rgba(15, 118, 110, 0.08), transparent 28%),
    linear-gradient(180deg, var(--rw-color-surface-app) 0%, #f4f7fb 100%);
  min-height: 100%;
  padding: var(--rw-space-4);
}

.automation-page__content {
  display: grid;
  gap: var(--rw-space-4);
  margin: 0 auto;
  max-width: 1480px;
}

.automation-page__hero {
  align-items: start;
  display: flex;
  justify-content: space-between;
  gap: var(--rw-space-4);
}

.automation-page__eyebrow {
  color: var(--rw-color-text-muted);
  font-size: var(--rw-font-size-label);
  margin: 0 0 var(--rw-space-1);
}

.automation-page__title {
  color: var(--rw-color-text-primary);
  font-size: var(--rw-font-size-title-lg);
  font-weight: var(--rw-font-weight-semibold);
  margin: 0;
}

.automation-page__subtitle {
  color: var(--rw-color-text-secondary);
  line-height: var(--rw-line-height-body);
  margin: var(--rw-space-2) 0 0;
  max-width: 840px;
}

.automation-page__tabs {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-panel);
  padding: var(--rw-space-1);
}

.automation-page__panels {
  background: transparent;
}

.automation-page__panel {
  padding: 0;
}

.automation-page__panel--overview {
  display: grid;
  gap: var(--rw-space-4);
}

.automation-page__panel--embedded :deep(.q-page) {
  background: transparent;
  min-height: auto;
  padding: 0;
}

.automation-overview-grid {
  display: grid;
  gap: var(--rw-space-4);
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.automation-overview-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: var(--rw-radius-panel);
}

.automation-overview-card__section {
  display: grid;
  gap: var(--rw-space-3);
}

.automation-overview-card__title {
  color: var(--rw-color-text-primary);
  font-size: var(--rw-font-size-title-sm);
  font-weight: var(--rw-font-weight-semibold);
}

.automation-overview-list {
  display: grid;
  gap: var(--rw-space-2);
}

.automation-overview-row {
  align-items: center;
  background: var(--rw-color-surface-base);
  border: 1px solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  display: flex;
  justify-content: space-between;
  gap: var(--rw-space-2);
  padding: var(--rw-space-3);
}

.automation-overview-inline {
  align-items: center;
  display: flex;
  gap: var(--rw-space-2);
}

@media (max-width: tokens.rw-breakpoint('page-stack')) {
  .automation-page__hero {
    display: grid;
  }

  .automation-overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
